"""
Celery tasks for monitoring and alerts
"""

import time
import ssl
import socket
import requests
from datetime import datetime, timedelta
from urllib.parse import urlparse
from sqlalchemy.orm import Session

from app.celery_app import celery_app
from app.database import SessionLocal, init_db
from app.models import Monitor, Check, User

# Data retention days per plan
RETENTION_DAYS = {
    "free": 7,
    "starter": 30,
    "pro": 90,
    "business": 365,
}

def check_ssl_expiry(url: str):
    """Returns SSL certificate expiry datetime. None if not HTTPS or error."""
    try:
        parsed = urlparse(url)
        if parsed.scheme != "https":
            return None
        hostname = parsed.hostname
        port = parsed.port or 443
        ctx = ssl.create_default_context()
        conn = ctx.wrap_socket(
            socket.create_connection((hostname, port), timeout=10),
            server_hostname=hostname
        )
        cert = conn.getpeercert()
        conn.close()
        expiry_str = cert["notAfter"]
        return datetime.strptime(expiry_str, "%b %d %H:%M:%S %Y %Z")
    except Exception as e:
        print(f"[SSL] check error for {url}: {e}")
        return None


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
            
            # Determine status - step 1: status code check
            if response.status_code == monitor.expected_status:
                status = "up"
                error_message = None
            else:
                status = "degraded"
                error_message = f"Expected status {monitor.expected_status}, got {response.status_code}"

            # Step 2: keyword check in response body (only if status code passed)
            if status == "up" and monitor.keyword:
                try:
                    body_text = response.text
                    keyword_found = monitor.keyword in body_text
                    if monitor.keyword_present and not keyword_found:
                        status = "degraded"
                        error_message = f"Keyword '{monitor.keyword}' not found in response body"
                    elif not monitor.keyword_present and keyword_found:
                        status = "degraded"
                        error_message = f"Keyword '{monitor.keyword}' found in response body (expected absent)"
                except Exception as e:
                    print(f"Keyword check error: {e}")
            
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


@celery_app.task(name="app.tasks.check_ssl_certificates")
def check_ssl_certificates():
    """
    Daily task: check SSL expiry for all active HTTPS monitors.
    Alerts if certificate expires within ssl_expiry_days.
    """
    from app.alerts import (
        send_email_alert, send_slack_alert, send_telegram_alert,
        send_discord_alert, send_webhook_alert
    )
    db = SessionLocal()
    try:
        monitors = db.query(Monitor).filter(
            Monitor.is_active == True,
            Monitor.ssl_check == True,
        ).all()

        https_monitors = [m for m in monitors if m.url.startswith("https://")]
        print(f"[SSL] Checking {len(https_monitors)} HTTPS monitors")

        for monitor in https_monitors:
            expiry_dt = check_ssl_expiry(monitor.url)
            if expiry_dt is None:
                continue

            monitor.ssl_expires_at = expiry_dt
            monitor.ssl_last_checked = datetime.utcnow()
            days_left = (expiry_dt - datetime.utcnow()).days
            print(f"[SSL] {monitor.name}: {days_left} days left")

            if days_left <= monitor.ssl_expiry_days:
                print(f"[SSL] ALERT: {monitor.name} expires in {days_left} days")
                label = monitor.name + " [SSL]"
                msg_new = "expires in " + str(days_left) + " days"
                msg_old = "valid"
                for channel in monitor.alert_channels:
                    if not channel.is_active:
                        continue
                    try:
                        if channel.type == "email":
                            send_email_alert(channel.config, label, monitor.url, msg_new, msg_old)
                        elif channel.type == "slack":
                            send_slack_alert(channel.config, label, monitor.url, msg_new, msg_old)
                        elif channel.type == "telegram":
                            send_telegram_alert(channel.config, label, monitor.url, msg_new, msg_old)
                        elif channel.type == "discord":
                            send_discord_alert(channel.config, label, monitor.url, msg_new, msg_old)
                        elif channel.type == "webhook":
                            send_webhook_alert(channel.config, label, monitor.url, msg_new, msg_old, str(monitor.id))
                    except Exception as e:
                        print(f"[SSL] alert error: {e}")

        db.commit()
        return {"checked": len(https_monitors)}
    finally:
        db.close()


@celery_app.task(name="app.tasks.cleanup_old_checks")
def cleanup_old_checks():
    """
    Clean up old check records based on user plan retention policy.
    Runs daily at 3 AM.

    Retention policy:
        free     ->  7 days
        starter  -> 30 days
        pro      -> 90 days
        business -> 365 days
    """
    db = SessionLocal()

    try:
        total_deleted = 0

        for plan, days in RETENTION_DAYS.items():
            cutoff_date = datetime.utcnow() - timedelta(days=days)

            user_ids = [
                u.id for u in db.query(User.id).filter(User.plan == plan).all()
            ]
            if not user_ids:
                continue

            monitor_ids = [
                m.id for m in db.query(Monitor.id).filter(
                    Monitor.user_id.in_(user_ids)
                ).all()
            ]
            if not monitor_ids:
                continue

            deleted = db.query(Check).filter(
                Check.monitor_id.in_(monitor_ids),
                Check.checked_at < cutoff_date
            ).delete(synchronize_session=False)

            total_deleted += deleted
            print(f"[cleanup] {plan} plan: deleted {deleted} checks older than {days} days")

        db.commit()
        print(f"[cleanup] Total deleted: {total_deleted} checks")

        return {"deleted": total_deleted}

    finally:
        db.close()
