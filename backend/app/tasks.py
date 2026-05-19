"""
Celery tasks for monitoring and alerts
"""

import re
import time
import ssl
import socket
import requests
from datetime import datetime, timedelta
from urllib.parse import urlparse
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.celery_app import celery_app
from app.database import SessionLocal, init_db
from app.models import Monitor, Check, User

# Data retention days per plan
RETENTION_DAYS = {
    "free": 30,
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
        # Strip trailing timezone label (e.g. " GMT") before parsing — %Z is unreliable
        expiry_no_tz = expiry_str.rsplit(" ", 1)[0]
        return datetime.strptime(expiry_no_tz, "%b %d %H:%M:%S %Y")
    except Exception as e:
        print(f"[SSL] check error for {url}: {e}")
        return None


# Initialize database tables on worker startup
init_db()



@celery_app.task(name="app.tasks.check_monitors")
def check_monitors():
    """
    Periodic task: Find monitors that need checking and schedule individual checks.
    Uses row-level locking (SKIP LOCKED) to prevent multiple workers from picking
    up the same monitors simultaneously.
    """
    db = SessionLocal()

    try:
        now = datetime.utcnow()

        # Atomically claim monitors with row-level lock + advance next_check_at
        # so concurrent workers skip them.
        monitors = db.query(Monitor).filter(
            Monitor.is_active == True,
            or_(Monitor.next_check_at == None, Monitor.next_check_at <= now)
        ).with_for_update(skip_locked=True).all()

        monitor_ids = []
        for monitor in monitors:
            # Advance next_check_at so other workers won't re-pick this monitor
            monitor.next_check_at = now + timedelta(seconds=monitor.interval)
            monitor_ids.append(str(monitor.id))

        db.commit()

        print(f"[{now}] Claimed {len(monitor_ids)} monitors to check")

        for monitor_id in monitor_ids:
            check_single_monitor.delay(monitor_id)

        return {"scheduled": len(monitor_ids)}

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
        monitor = db.query(Monitor).filter(
            Monitor.id == monitor_id
        ).with_for_update(skip_locked=True).first()

        if not monitor:
            # Another worker is processing this monitor — skip
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

            # Step 2: assertions check (keyword/regex/jsonpath)
            has_assertions = False
            if status == "up":
                try:
                    from app.models import MonitorAssertion
                    from app.routers.assertions import run_assertions
                    assertions = db.query(MonitorAssertion).filter(
                        MonitorAssertion.monitor_id == monitor.id,
                        MonitorAssertion.is_active == True
                    ).order_by(MonitorAssertion.order).all()

                    if assertions:
                        has_assertions = True
                        result = run_assertions(response.text, assertions, dict(response.headers))
                        if not result["passed"]:
                            status = "degraded"
                            failed = [r for r in result["results"] if not r["passed"]]
                            if failed:
                                f = failed[0]
                                error_message = f"Assertion failed: {f['path']} {f['operator']} {f['expected']} (got: {f['actual']})"
                            else:
                                error_message = "Assertion failed"
                except Exception as e:
                    print(f"Assertion check error: {e}")

            # Step 2b: legacy keyword/regex check (only if no assertions defined)
            if status == "up" and monitor.keyword and not has_assertions:
                try:
                    body_text = response.text
                    use_regex = getattr(monitor, 'use_regex', False)
                    if use_regex:
                        try:
                            keyword_found = bool(re.search(monitor.keyword, body_text))
                            pattern_label = f"Pattern '{monitor.keyword}'"
                        except re.error as regex_err:
                            keyword_found = False
                            pattern_label = f"Invalid regex '{monitor.keyword}'"
                    else:
                        keyword_found = monitor.keyword in body_text
                        pattern_label = f"Keyword '{monitor.keyword}'"
                    if monitor.keyword_present and not keyword_found:
                        status = "degraded"
                        error_message = f"{pattern_label} not found in response body"
                    elif not monitor.keyword_present and keyword_found:
                        status = "degraded"
                        error_message = f"{pattern_label} found in response body (expected absent)"
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

        # Track consecutive failures for alert threshold
        threshold = monitor.alert_threshold or 1
        if status in ("down", "degraded"):
            monitor.consecutive_failures = (monitor.consecutive_failures or 0) + 1
        else:
            monitor.consecutive_failures = 0

        db.commit()

        # AI analysis for failed/degraded checks
        ai_analysis = None
        if status in ("down", "degraded"):
            from app.ai.analyzer import analyze_incident
            ai_analysis = analyze_incident(
                monitor_name=monitor.name,
                monitor_url=monitor.url,
                status=status,
                status_code=getattr(check, "status_code", None),
                response_time=getattr(check, "response_time", None),
                error_message=getattr(check, "error_message", None),
            )
            if ai_analysis:
                check.ai_analysis = ai_analysis
                db.commit()

        # Alert logic:
        # - Recovery (any → up): always alert immediately, reset alert_sent flag
        # - Failure: alert only when threshold is first reached AND no alert sent yet for this incident
        if status == "up" and previous_status and previous_status != "up":
            print(f"Recovery: {previous_status} -> up")
            monitor.alert_sent = False
            db.commit()
            send_alerts.delay(str(monitor.id), status, previous_status)
        elif status != "up" and monitor.consecutive_failures >= threshold and not monitor.alert_sent:
            print(f"Threshold reached ({threshold}): {previous_status} -> {status}")
            monitor.alert_sent = True
            db.commit()
            send_alerts.delay(str(monitor.id), status, previous_status or status, ai_analysis)
        
        print(f"✓ Check completed: {monitor.name} - {status}")
        
        return {
            "monitor_id": str(monitor.id),
            "status": status,
            "response_time": getattr(check, 'response_time', None)
        }
        
    finally:
        db.close()



def is_in_maintenance(monitor, db) -> bool:
    """Check if monitor is currently in an active maintenance window"""
    from app.models import MaintenanceWindow
    from datetime import datetime, timezone
    from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

    now_utc = datetime.utcnow()

    # Get all active maintenance windows for this monitor or user
    windows = db.query(MaintenanceWindow).filter(
        MaintenanceWindow.user_id == monitor.user_id,
        MaintenanceWindow.is_active == True
    ).all()

    for window in windows:
        # Check if window applies to this monitor (empty = all monitors)
        if window.monitors and monitor not in window.monitors:
            continue

        # Convert now to window timezone
        try:
            tz = ZoneInfo(window.timezone)
            now_local = datetime.now(tz)
        except ZoneInfoNotFoundError:
            now_local = now_utc.replace(tzinfo=timezone.utc)

        current_time = now_local.strftime("%H:%M")
        current_weekday = now_local.weekday()  # 0=Mon
        current_day = now_local.day

        in_time_range = window.start_time <= current_time <= window.end_time

        if not in_time_range:
            continue

        if window.repeat_type == "daily":
            return True
        elif window.repeat_type == "weekly" and window.weekday == current_weekday:
            return True
        elif window.repeat_type == "monthly" and window.day_of_month == current_day:
            return True
        elif window.repeat_type == "once":
            if window.start_date and window.end_date:
                if window.start_date <= now_utc <= window.end_date:
                    return True

    return False


class AlertDeliveryError(Exception):
    pass


@celery_app.task(
    name="app.tasks.send_channel_alert",
    bind=True,
    autoretry_for=(AlertDeliveryError,),
    retry_backoff=True,
    retry_backoff_max=300,
    max_retries=4,
    default_retry_delay=60,
    ignore_result=True,
)
def send_channel_alert(self, channel_type: str, channel_config: dict,
                       monitor_name: str, monitor_url: str,
                       new_status: str, old_status: str, monitor_id: str,
                       ai_analysis: dict = None):
    """Send a single alert channel with exponential backoff retry (max 4 retries)."""
    from app.alerts import (
        send_email_alert, send_slack_alert, send_telegram_alert,
        send_discord_alert, send_webhook_alert,
    )

    if channel_type == "email":
        success = send_email_alert(channel_config, monitor_name, monitor_url, new_status, old_status, ai_analysis)
    elif channel_type == "slack":
        success = send_slack_alert(channel_config, monitor_name, monitor_url, new_status, old_status, ai_analysis)
    elif channel_type == "telegram":
        success = send_telegram_alert(channel_config, monitor_name, monitor_url, new_status, old_status, ai_analysis)
    elif channel_type == "discord":
        success = send_discord_alert(channel_config, monitor_name, monitor_url, new_status, old_status, ai_analysis)
    elif channel_type == "webhook":
        success = send_webhook_alert(channel_config, monitor_name, monitor_url, new_status, old_status, monitor_id, ai_analysis)
    else:
        return

    if not success:
        attempt = self.request.retries + 1
        print(f"⚠️  {channel_type} alert failed (attempt {attempt}/5), will retry")
        raise AlertDeliveryError(f"{channel_type} delivery failed")


@celery_app.task(name="app.tasks.send_alerts")
def send_alerts(monitor_id: str, new_status: str, old_status: str, ai_analysis: dict = None):
    """
    Send alerts when monitor status changes.
    Dispatches each channel as a separate retryable task.
    """
    db = SessionLocal()

    try:
        monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()

        if not monitor:
            return

        if is_in_maintenance(monitor, db):
            print(f"🔕 ALERT SUPPRESSED (maintenance window): {monitor.name} {old_status} -> {new_status}")
            return

        print(f"🚨 ALERT: {monitor.name} changed from {old_status} to {new_status}")

        alert_channels = monitor.alert_channels
        dispatched = 0

        for channel in alert_channels:
            if not channel.is_active:
                continue
            send_channel_alert.delay(
                channel.type,
                channel.config,
                monitor.name,
                monitor.url,
                new_status,
                old_status,
                str(monitor.id),
                ai_analysis,
            )
            dispatched += 1

        print(f"📤 Dispatched {dispatched} alert tasks for {monitor.name}")

        return {
            "monitor_id": str(monitor.id),
            "dispatched": dispatched,
        }

    finally:
        db.close()


@celery_app.task(name="app.tasks.check_ssl_certificates")
def check_ssl_certificates():
    """
    Daily task: check SSL expiry for all active HTTPS monitors.
    Alerts if certificate expires within ssl_expiry_days.
    """
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
                    send_channel_alert.delay(
                        channel.type, channel.config,
                        label, monitor.url,
                        msg_new, msg_old,
                        str(monitor.id),
                    )

        db.commit()
        return {"checked": len(https_monitors)}
    finally:
        db.close()




@celery_app.task(name="app.tasks.check_heartbeat_monitors")
def check_heartbeat_monitors():
    """
    Check heartbeat monitors for missing pings.
    Runs every minute.
    """
    from datetime import timedelta
    db = SessionLocal()
    try:
        from app.models import Monitor
        monitors = db.query(Monitor).filter(
            Monitor.monitor_type == "heartbeat",
            Monitor.is_active == True,
        ).all()

        alerted = 0
        for monitor in monitors:
            if not monitor.last_ping_at:
                continue  # Never pinged yet — stay pending

            interval = monitor.heartbeat_interval or 5
            grace = monitor.heartbeat_grace or 5
            threshold_minutes = interval + grace

            now = datetime.utcnow()
            elapsed = (now - monitor.last_ping_at).total_seconds() / 60

            if elapsed > threshold_minutes:
                if monitor.last_status not in ("down", None):
                    previous_status = monitor.last_status
                    monitor.last_status = "down"
                    monitor.last_checked_at = now
                    monitor.updated_at = now

                    # Record failed check
                    from app.models import Check
                    check = Check(
                        monitor_id=str(monitor.id),
                        status="down",
                        status_code=None,
                        response_time=None,
                        error_message=f"No ping received in {elapsed:.0f}m (expected every {interval}m + {grace}m grace)",
                        checked_at=now,
                    )
                    db.add(check)
                    db.commit()

                    send_alerts.delay(str(monitor.id), "down", previous_status or "pending")
                    alerted += 1

        return {"checked": len(monitors), "alerted": alerted}
    finally:
        db.close()

@celery_app.task(name="app.tasks.cleanup_old_checks")
def cleanup_old_checks():
    """
    Clean up old check records based on user plan retention policy.
    Runs daily at 3 AM.

    Retention policy:
        free     -> 30 days
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


@celery_app.task(name="app.tasks.send_monthly_sla_reports")
def send_monthly_sla_reports():
    """
    Monthly task (1st of each month, 9 AM UTC):
    Send SLA report emails to all Pro/Business users.
    """
    from app.alerts import send_sla_report_email
    from app.models import AlertChannel

    db = SessionLocal()
    try:
        now = datetime.utcnow()

        # Last month's range
        first_of_this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month_end = first_of_this_month - timedelta(seconds=1)
        last_month_start = last_month_end.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_label = last_month_start.strftime("%B %Y")

        users = db.query(User).filter(User.plan.in_(["pro", "business"]), User.is_active == True).all()
        print(f"[sla-report] Sending to {len(users)} Pro/Business users for {month_label}")

        sent = 0
        for user in users:
            monitors = db.query(Monitor).filter(
                Monitor.user_id == user.id,
                Monitor.is_active == True,
            ).all()

            if not monitors:
                continue

            monitors_data = []
            for monitor in monitors:
                checks = db.query(Check).filter(
                    Check.monitor_id == monitor.id,
                    Check.checked_at >= last_month_start,
                    Check.checked_at <= last_month_end,
                ).all()

                if not checks:
                    continue

                total = len(checks)
                up_count = sum(1 for c in checks if c.status == "up")
                uptime_pct = round((up_count / total) * 100, 3)

                downtime_seconds = 0
                in_incident = False
                incident_start = None
                incidents = 0

                for c in sorted(checks, key=lambda x: x.checked_at):
                    if c.status in ["down", "degraded"] and not in_incident:
                        in_incident = True
                        incident_start = c.checked_at
                        incidents += 1
                    elif c.status == "up" and in_incident:
                        in_incident = False
                        if incident_start:
                            downtime_seconds += (c.checked_at - incident_start).total_seconds()

                if in_incident and incident_start:
                    downtime_seconds += (last_month_end - incident_start).total_seconds()

                response_times = [c.response_time for c in checks if c.response_time]
                avg_response = int(sum(response_times) / len(response_times)) if response_times else 0

                monitors_data.append({
                    "name": monitor.name,
                    "url": monitor.url,
                    "uptime_percentage": uptime_pct,
                    "downtime_minutes": round(downtime_seconds / 60, 1),
                    "incidents": incidents,
                    "avg_response_time": avg_response,
                })

            if not monitors_data:
                continue

            ok = send_sla_report_email(
                user_email=user.email,
                user_name=user.name or "",
                month_label=month_label,
                monitors_data=monitors_data,
            )
            if ok:
                sent += 1

        print(f"[sla-report] Done — sent {sent}/{len(users)} reports")
        return {"sent": sent, "total_users": len(users)}

    finally:
        db.close()
