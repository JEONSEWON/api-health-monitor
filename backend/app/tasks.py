"""
Celery tasks for monitoring and alerts
"""

import time
import requests
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.celery_app import celery_app
from app.database import SessionLocal, init_db
from app.models import Monitor, Check

# Initialize database tables on worker startup
init_db()


def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()


@celery_app.task(name="app.tasks.check_monitors")
def check_monitors():
    """
    Periodic task: Find monitors that need checking and schedule individual checks
    Runs every minute
    """
    db = SessionLocal()
    
    try:
        now = datetime.utcnow()
        
        # Find monitors that need checking
        monitors = db.query(Monitor).filter(
            Monitor.is_active == True,
            Monitor.next_check_at <= now
        ).all()
        
        print(f"[{now}] Found {len(monitors)} monitors to check")
        
        # Schedule individual check for each monitor
        for monitor in monitors:
            check_single_monitor.delay(str(monitor.id))
        
        return {"scheduled": len(monitors)}
        
    finally:
        db.close()


@celery_app.task(name="app.tasks.check_single_monitor")
def check_single_monitor(monitor_id: str):
    """
    Check a single monitor
    1. Make HTTP request
    2. Record result
    3. Update monitor status
    4. Send alerts if status changed
    """
    db = SessionLocal()
    
    try:
        monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()
        
        if not monitor:
            print(f"Monitor {monitor_id} not found")
            return
        
        print(f"Checking monitor: {monitor.name} ({monitor.url})")
        
        # Prepare request
        headers = monitor.headers or {}
        
        # Perform health check
        try:
            start_time = time.time()
            
            response = requests.request(
                method=monitor.method,
                url=monitor.url,
                headers=headers,
                data=monitor.body if monitor.method in ["POST", "PUT", "PATCH"] else None,
                timeout=monitor.timeout,
                allow_redirects=True
            )
            
            response_time_ms = int((time.time() - start_time) * 1000)
            
            # Determine status
            if response.status_code == monitor.expected_status:
                status = "up"
                error_message = None
            else:
                status = "degraded"
                error_message = f"Expected status {monitor.expected_status}, got {response.status_code}"
            
            # Create check record
            check = Check(
                monitor_id=monitor.id,
                status=status,
                status_code=response.status_code,
                response_time=response_time_ms,
                error_message=error_message,
                checked_at=datetime.utcnow()
            )
            
        except requests.exceptions.Timeout:
            # Timeout error
            status = "down"
            check = Check(
                monitor_id=monitor.id,
                status=status,
                error_message=f"Request timed out after {monitor.timeout} seconds",
                checked_at=datetime.utcnow()
            )
            
        except requests.exceptions.ConnectionError as e:
            # Connection error
            status = "down"
            check = Check(
                monitor_id=monitor.id,
                status=status,
                error_message=f"Connection error: {str(e)[:200]}",
                checked_at=datetime.utcnow()
            )
            
        except Exception as e:
            # Other errors
            status = "down"
            check = Check(
                monitor_id=monitor.id,
                status=status,
                error_message=f"Error: {str(e)[:200]}",
                checked_at=datetime.utcnow()
            )
        
        # Save check
        db.add(check)
        
        # Update monitor
        previous_status = monitor.last_status
        monitor.last_status = status
        monitor.last_checked_at = datetime.utcnow()
        monitor.next_check_at = datetime.utcnow() + timedelta(seconds=monitor.interval)
        
        db.commit()
        
        # Send alerts if status changed
        if previous_status and previous_status != status:
            print(f"Status changed: {previous_status} -> {status}")
            send_alerts.delay(str(monitor.id), status, previous_status)
        
        print(f"✓ Check completed: {monitor.name} - {status}")
        
        return {
            "monitor_id": str(monitor.id),
            "status": status,
            "response_time": getattr(check, 'response_time', None)
        }
        
    finally:
        db.close()


@celery_app.task(name="app.tasks.send_alerts")
def send_alerts(monitor_id: str, new_status: str, old_status: str):
    """
    Send alerts when monitor status changes
    """
    from app.alerts import (
        send_email_alert,
        send_slack_alert,
        send_telegram_alert,
        send_discord_alert,
        send_webhook_alert
    )
    
    db = SessionLocal()
    
    try:
        monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()
        
        if not monitor:
            return
        
        print(f"🚨 ALERT: {monitor.name} changed from {old_status} to {new_status}")
        
        # Get alert channels for this monitor
        alert_channels = monitor.alert_channels
        
        sent_count = 0
        
        for channel in alert_channels:
            if not channel.is_active:
                continue
            
            try:
                success = False
                
                if channel.type == "email":
                    success = send_email_alert(
                        channel.config, monitor.name, monitor.url,
                        new_status, old_status
                    )
                
                elif channel.type == "slack":
                    success = send_slack_alert(
                        channel.config, monitor.name, monitor.url,
                        new_status, old_status
                    )
                
                elif channel.type == "telegram":
                    success = send_telegram_alert(
                        channel.config, monitor.name, monitor.url,
                        new_status, old_status
                    )
                
                elif channel.type == "discord":
                    success = send_discord_alert(
                        channel.config, monitor.name, monitor.url,
                        new_status, old_status
                    )
                
                elif channel.type == "webhook":
                    success = send_webhook_alert(
                        channel.config, monitor.name, monitor.url,
                        new_status, old_status, str(monitor.id)
                    )
                
                if success:
                    sent_count += 1
                    
            except Exception as e:
                print(f"❌ Failed to send {channel.type} alert: {str(e)}")
        
        print(f"✅ Sent {sent_count}/{len(alert_channels)} alerts")
        
        return {
            "monitor_id": str(monitor.id),
            "alert_sent": sent_count > 0,
            "channels": len(alert_channels),
            "sent": sent_count
        }
        
    finally:
        db.close()


@celery_app.task(name="app.tasks.cleanup_old_checks")
def cleanup_old_checks():
    """
    Clean up old check records (older than 30 days)
    Runs daily at 3 AM
    """
    db = SessionLocal()
    
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=30)
        
        deleted = db.query(Check).filter(
            Check.checked_at < cutoff_date
        ).delete()
        
        db.commit()
        
        print(f"Cleaned up {deleted} old checks")
        
        return {"deleted": deleted}
        
    finally:
        db.close()
