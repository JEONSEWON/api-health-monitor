"""
Analytics routes for monitors
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from typing import List, Dict, Any
from datetime import datetime, timedelta
from uuid import UUID

from app.database import get_db
from app.models import User, Monitor, Check
from app.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview")
def get_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get analytics overview for all user's monitors
    """
    # Get all user's monitors
    monitors = db.query(Monitor).filter(Monitor.user_id == current_user.id).all()
    
    if not monitors:
        return {
            "total_monitors": 0,
            "active_monitors": 0,
            "overall_uptime": 100.0,
            "total_checks_24h": 0,
            "monitors_up": 0,
            "monitors_down": 0,
            "monitors_degraded": 0
        }
    
    monitor_ids = [m.id for m in monitors]
    
    # Count active monitors
    active_count = sum(1 for m in monitors if m.is_active)
    
    # Status counts
    status_counts = {
        "up": sum(1 for m in monitors if m.last_status == "up"),
        "down": sum(1 for m in monitors if m.last_status == "down"),
        "degraded": sum(1 for m in monitors if m.last_status == "degraded"),
    }
    
    # Get checks from last 24 hours
    since = datetime.utcnow() - timedelta(hours=24)
    
    checks_24h = db.query(Check).filter(
        Check.monitor_id.in_(monitor_ids),
        Check.checked_at >= since
    ).all()
    
    # Calculate overall uptime
    if checks_24h:
        up_count = sum(1 for c in checks_24h if c.status == "up")
        overall_uptime = round((up_count / len(checks_24h)) * 100, 2)
    else:
        overall_uptime = 100.0
    
    return {
        "total_monitors": len(monitors),
        "active_monitors": active_count,
        "overall_uptime": overall_uptime,
        "total_checks_24h": len(checks_24h),
        "monitors_up": status_counts["up"],
        "monitors_down": status_counts["down"],
        "monitors_degraded": status_counts["degraded"]
    }


@router.get("/monitors/{monitor_id}")
def get_monitor_analytics(
    monitor_id: str,
    days: int = Query(30, ge=1, le=90),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed analytics for a specific monitor
    """
    # Verify ownership
    monitor = db.query(Monitor).filter(
        Monitor.id == monitor_id,
        Monitor.user_id == current_user.id
    ).first()
    
    if not monitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitor not found"
        )
    
    since = datetime.utcnow() - timedelta(days=days)
    
    # Get all checks in period
    checks = db.query(Check).filter(
        Check.monitor_id == monitor.id,
        Check.checked_at >= since
    ).all()
    
    if not checks:
        return {
            "monitor_id": str(monitor.id),
            "period_days": days,
            "total_checks": 0,
            "uptime_percentage": 100.0,
            "avg_response_time": 0,
            "min_response_time": 0,
            "max_response_time": 0,
            "incidents": 0,
            "total_downtime_seconds": 0
        }
    
    # Calculate metrics
    total_checks = len(checks)
    up_checks = sum(1 for c in checks if c.status == "up")
    uptime = round((up_checks / total_checks) * 100, 2)
    
    # Response time stats (only successful checks)
    response_times = [c.response_time for c in checks if c.response_time is not None]
    
    if response_times:
        avg_response = int(sum(response_times) / len(response_times))
        min_response = min(response_times)
        max_response = max(response_times)
    else:
        avg_response = min_response = max_response = 0
    
    # Count incidents (consecutive down/degraded checks)
    incidents = 0
    in_incident = False
    total_downtime = 0
    incident_start = None
    
    sorted_checks = sorted(checks, key=lambda c: c.checked_at)
    
    for i, check in enumerate(sorted_checks):
        if check.status in ["down", "degraded"] and not in_incident:
            in_incident = True
            incident_start = check.checked_at
            incidents += 1
        elif check.status == "up" and in_incident:
            in_incident = False
            if incident_start:
                downtime = (check.checked_at - incident_start).total_seconds()
                total_downtime += downtime
            incident_start = None
    
    # If still in incident
    if in_incident and incident_start:
        downtime = (datetime.utcnow() - incident_start).total_seconds()
        total_downtime += downtime
    
    # Daily breakdown
    daily_stats = []
    for day_offset in range(days):
        day = datetime.utcnow() - timedelta(days=day_offset)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        day_checks = [c for c in checks if day_start <= c.checked_at < day_end]
        
        if day_checks:
            day_up = sum(1 for c in day_checks if c.status == "up")
            day_uptime = round((day_up / len(day_checks)) * 100, 1)
            
            day_response_times = [c.response_time for c in day_checks if c.response_time]
            day_avg_response = int(sum(day_response_times) / len(day_response_times)) if day_response_times else 0
        else:
            day_uptime = None
            day_avg_response = None
        
        daily_stats.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "uptime": day_uptime,
            "avg_response_time": day_avg_response,
            "checks": len(day_checks)
        })
    
    daily_stats.reverse()  # Oldest to newest
    
    return {
        "monitor_id": str(monitor.id),
        "monitor_name": monitor.name,
        "period_days": days,
        "total_checks": total_checks,
        "uptime_percentage": uptime,
        "avg_response_time": avg_response,
        "min_response_time": min_response,
        "max_response_time": max_response,
        "incidents": incidents,
        "total_downtime_seconds": int(total_downtime),
        "daily": daily_stats
    }


@router.get("/incidents")
def get_all_incidents(
    days: int = Query(7, ge=1, le=30),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all incidents across all user's monitors
    """
    # Get all user's monitors
    monitor_ids = [m.id for m in db.query(Monitor).filter(Monitor.user_id == current_user.id).all()]
    
    if not monitor_ids:
        return {"incidents": []}
    
    since = datetime.utcnow() - timedelta(days=days)
    
    # Get all checks
    checks = db.query(Check).filter(
        Check.monitor_id.in_(monitor_ids),
        Check.checked_at >= since
    ).order_by(Check.monitor_id, Check.checked_at).all()
    
    # Group by monitor
    monitors_checks = {}
    for check in checks:
        if check.monitor_id not in monitors_checks:
            monitors_checks[check.monitor_id] = []
        monitors_checks[check.monitor_id].append(check)
    
    # Find incidents for each monitor
    all_incidents = []
    
    for monitor_id, monitor_checks in monitors_checks.items():
        monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()
        
        in_incident = False
        incident_start = None
        incident_status = None
        
        for check in monitor_checks:
            if check.status in ["down", "degraded"] and not in_incident:
                in_incident = True
                incident_start = check.checked_at
                incident_status = check.status
            elif check.status == "up" and in_incident:
                in_incident = False
                duration = int((check.checked_at - incident_start).total_seconds())
                
                all_incidents.append({
                    "monitor_id": str(monitor.id),
                    "monitor_name": monitor.name,
                    "status": incident_status,
                    "started_at": incident_start.isoformat(),
                    "resolved_at": check.checked_at.isoformat(),
                    "duration_seconds": duration,
                    "ongoing": False
                })
                
                incident_start = None
                incident_status = None
        
        # If still in incident
        if in_incident and incident_start:
            duration = int((datetime.utcnow() - incident_start).total_seconds())
            all_incidents.append({
                "monitor_id": str(monitor.id),
                "monitor_name": monitor.name,
                "status": incident_status,
                "started_at": incident_start.isoformat(),
                "resolved_at": None,
                "duration_seconds": duration,
                "ongoing": True
            })
    
    # Sort by start time (newest first)
    all_incidents.sort(key=lambda x: x["started_at"], reverse=True)
    
    return {
        "period_days": days,
        "total_incidents": len(all_incidents),
        "ongoing_incidents": sum(1 for i in all_incidents if i["ongoing"]),
        "incidents": all_incidents
    }
