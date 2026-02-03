"""
Public routes (no authentication required)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Dict, Any
from datetime import datetime, timedelta
from uuid import UUID

from app.database import get_db
from app.models import Monitor, Check

router = APIRouter(prefix="/public", tags=["Public"])


def calculate_uptime(monitor_id: UUID, hours: int, db: Session) -> float:
    """Calculate uptime percentage for a monitor"""
    since = datetime.utcnow() - timedelta(hours=hours)
    
    # Get all checks in time period
    checks = db.query(Check).filter(
        Check.monitor_id == monitor_id,
        Check.checked_at >= since
    ).all()
    
    if not checks:
        return 100.0
    
    # Count up checks
    up_count = sum(1 for check in checks if check.status == "up")
    total_count = len(checks)
    
    return round((up_count / total_count) * 100, 2)


def get_average_response_time(monitor_id: UUID, hours: int, db: Session) -> int:
    """Get average response time for a monitor (in milliseconds)"""
    since = datetime.utcnow() - timedelta(hours=hours)
    
    avg = db.query(func.avg(Check.response_time)).filter(
        Check.monitor_id == monitor_id,
        Check.checked_at >= since,
        Check.response_time.isnot(None)
    ).scalar()
    
    return int(avg) if avg else 0


def get_incidents(monitor_id: UUID, hours: int, db: Session) -> List[Dict[str, Any]]:
    """Get recent incidents (status changes to down/degraded)"""
    since = datetime.utcnow() - timedelta(hours=hours)
    
    # Get all checks in reverse chronological order
    checks = db.query(Check).filter(
        Check.monitor_id == monitor_id,
        Check.checked_at >= since
    ).order_by(Check.checked_at).all()
    
    incidents = []
    in_incident = False
    current_incident = None
    
    for i, check in enumerate(checks):
        if check.status in ["down", "degraded"] and not in_incident:
            # Start of incident
            in_incident = True
            current_incident = {
                "started_at": check.checked_at,
                "status": check.status,
                "error_message": check.error_message
            }
        
        elif check.status == "up" and in_incident:
            # End of incident
            in_incident = False
            if current_incident:
                current_incident["resolved_at"] = check.checked_at
                current_incident["duration_seconds"] = int(
                    (check.checked_at - current_incident["started_at"]).total_seconds()
                )
                incidents.append(current_incident)
                current_incident = None
    
    # If still in incident
    if in_incident and current_incident:
        current_incident["resolved_at"] = None
        current_incident["duration_seconds"] = int(
            (datetime.utcnow() - current_incident["started_at"]).total_seconds()
        )
        current_incident["ongoing"] = True
        incidents.append(current_incident)
    
    return incidents[:10]  # Last 10 incidents


@router.get("/status/{monitor_id}")
def get_public_status(monitor_id: UUID, db: Session = Depends(get_db)):
    """
    Get public status page data for a monitor
    No authentication required - anyone can view
    """
    monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()
    
    if not monitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitor not found"
        )
    
    # Calculate uptime for different periods
    uptime_24h = calculate_uptime(monitor.id, 24, db)
    uptime_7d = calculate_uptime(monitor.id, 24 * 7, db)
    uptime_30d = calculate_uptime(monitor.id, 24 * 30, db)
    
    # Get average response time
    avg_response_time = get_average_response_time(monitor.id, 24, db)
    
    # Get recent incidents
    incidents = get_incidents(monitor.id, 24 * 7, db)  # Last 7 days
    
    # Get current status
    current_status = monitor.last_status or "unknown"
    
    # Get last 90 days of daily uptime (for chart)
    daily_stats = []
    for days_ago in range(90, -1, -1):
        date = datetime.utcnow() - timedelta(days=days_ago)
        date_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        date_end = date_start + timedelta(days=1)
        
        # Get checks for this day
        day_checks = db.query(Check).filter(
            Check.monitor_id == monitor.id,
            Check.checked_at >= date_start,
            Check.checked_at < date_end
        ).all()
        
        if day_checks:
            up_count = sum(1 for c in day_checks if c.status == "up")
            uptime = round((up_count / len(day_checks)) * 100, 1)
        else:
            uptime = None  # No data
        
        daily_stats.append({
            "date": date_start.strftime("%Y-%m-%d"),
            "uptime": uptime
        })
    
    return {
        "monitor": {
            "id": str(monitor.id),
            "name": monitor.name,
            "url": monitor.url
        },
        "status": {
            "current": current_status,
            "last_checked": monitor.last_checked_at.isoformat() if monitor.last_checked_at else None
        },
        "uptime": {
            "24h": uptime_24h,
            "7d": uptime_7d,
            "30d": uptime_30d
        },
        "performance": {
            "avg_response_time_ms": avg_response_time
        },
        "incidents": incidents,
        "history": {
            "daily": daily_stats
        }
    }


@router.get("/status/{monitor_id}/badge")
def get_status_badge(monitor_id: UUID, db: Session = Depends(get_db)):
    """
    Get status badge data (for embedding in README, etc.)
    Returns simple data for badge generation
    """
    monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()
    
    if not monitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitor not found"
        )
    
    uptime = calculate_uptime(monitor.id, 24 * 30, db)  # 30 days
    status = monitor.last_status or "unknown"
    
    # Badge colors
    color_map = {
        "up": "brightgreen",
        "degraded": "yellow",
        "down": "red",
        "unknown": "lightgrey"
    }
    
    return {
        "schemaVersion": 1,
        "label": monitor.name,
        "message": f"{uptime}% uptime",
        "color": color_map.get(status, "lightgrey"),
        "status": status
    }


@router.get("/status/{monitor_id}/history")
def get_check_history(
    monitor_id: UUID,
    hours: int = 24,
    db: Session = Depends(get_db)
):
    """
    Get check history for charting
    Returns time-series data of response times and status
    """
    monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()
    
    if not monitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitor not found"
        )
    
    since = datetime.utcnow() - timedelta(hours=hours)
    
    checks = db.query(Check).filter(
        Check.monitor_id == monitor.id,
        Check.checked_at >= since
    ).order_by(Check.checked_at).all()
    
    history = [{
        "timestamp": check.checked_at.isoformat(),
        "status": check.status,
        "response_time": check.response_time,
        "status_code": check.status_code
    } for check in checks]
    
    return {
        "monitor_id": str(monitor.id),
        "period_hours": hours,
        "data_points": len(history),
        "history": history
    }
