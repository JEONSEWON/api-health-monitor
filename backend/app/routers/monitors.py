"""
Monitor management routes: CRUD operations for monitors
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import datetime, timedelta
from uuid import UUID

from app.database import get_db
from app.models import User, Monitor, Check
from app.schemas import (
    MonitorCreate,
    MonitorUpdate,
    MonitorResponse,
    CheckResponse,
    CheckListResponse,
    MessageResponse
)
from app.auth import get_current_user

router = APIRouter(prefix="/monitors", tags=["Monitors"])


# Plan limits
PLAN_LIMITS = {
    "free": {"max_monitors": 3, "min_interval": 300},  # 5 minutes
    "starter": {"max_monitors": 20, "min_interval": 60},  # 1 minute
    "pro": {"max_monitors": 100, "min_interval": 30},  # 30 seconds
    "business": {"max_monitors": -1, "min_interval": 10},  # unlimited, 10 seconds
}


def check_plan_limits(user: User, db: Session, creating_new: bool = False) -> None:
    """Check if user has reached their plan limits"""
    limits = PLAN_LIMITS.get(user.plan, PLAN_LIMITS["free"])
    
    if creating_new and limits["max_monitors"] > 0:
        current_count = db.query(Monitor).filter(Monitor.user_id == user.id).count()
        if current_count >= limits["max_monitors"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Monitor limit reached for {user.plan} plan. Upgrade to add more monitors."
            )


def validate_interval(user: User, interval: int) -> None:
    """Validate interval based on user's plan"""
    limits = PLAN_LIMITS.get(user.plan, PLAN_LIMITS["free"])
    
    if interval < limits["min_interval"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Minimum interval for {user.plan} plan is {limits['min_interval']} seconds. Upgrade for faster checks."
        )


@router.get("/", response_model=List[MonitorResponse])
def list_monitors(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    """
    Get all monitors for the current user
    """
    monitors = (
        db.query(Monitor)
        .filter(Monitor.user_id == current_user.id)
        .order_by(desc(Monitor.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return monitors


@router.post("/", response_model=MonitorResponse, status_code=status.HTTP_201_CREATED)
def create_monitor(
    monitor_data: MonitorCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new monitor
    """
    # Check plan limits
    check_plan_limits(current_user, db, creating_new=True)
    
    # Validate interval
    validate_interval(current_user, monitor_data.interval)
    
    # Create monitor
    new_monitor = Monitor(
        user_id=current_user.id,
        name=monitor_data.name,
        url=str(monitor_data.url),
        method=monitor_data.method,
        interval=monitor_data.interval,
        timeout=monitor_data.timeout,
        headers=monitor_data.headers,
        body=monitor_data.body,
        expected_status=monitor_data.expected_status,
        next_check_at=datetime.utcnow()  # Check immediately
    )
    
    db.add(new_monitor)
    db.commit()
    db.refresh(new_monitor)
    
    return new_monitor


@router.get("/{monitor_id}", response_model=MonitorResponse)
def get_monitor(
    monitor_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific monitor by ID
    """
    monitor = db.query(Monitor).filter(
        Monitor.id == monitor_id,
        Monitor.user_id == current_user.id
    ).first()
    
    if not monitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitor not found"
        )
    
    return monitor


@router.put("/{monitor_id}", response_model=MonitorResponse)
def update_monitor(
    monitor_id: UUID,
    monitor_data: MonitorUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a monitor
    """
    monitor = db.query(Monitor).filter(
        Monitor.id == monitor_id,
        Monitor.user_id == current_user.id
    ).first()
    
    if not monitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitor not found"
        )
    
    # Update fields
    update_data = monitor_data.model_dump(exclude_unset=True)
    
    # Validate interval if being updated
    if "interval" in update_data:
        validate_interval(current_user, update_data["interval"])
    
    # Convert URL to string if present
    if "url" in update_data:
        update_data["url"] = str(update_data["url"])
    
    for field, value in update_data.items():
        setattr(monitor, field, value)
    
    monitor.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(monitor)
    
    return monitor


@router.delete("/{monitor_id}", response_model=MessageResponse)
def delete_monitor(
    monitor_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a monitor
    """
    monitor = db.query(Monitor).filter(
        Monitor.id == monitor_id,
        Monitor.user_id == current_user.id
    ).first()
    
    if not monitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitor not found"
        )
    
    db.delete(monitor)
    db.commit()
    
    return {"message": "Monitor deleted successfully"}


@router.get("/{monitor_id}/checks", response_model=CheckListResponse)
def get_monitor_checks(
    monitor_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    hours: int = Query(24, ge=1, le=168)  # Last 24 hours by default, max 7 days
):
    """
    Get check history for a monitor
    """
    # Verify monitor ownership
    monitor = db.query(Monitor).filter(
        Monitor.id == monitor_id,
        Monitor.user_id == current_user.id
    ).first()
    
    if not monitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitor not found"
        )
    
    # Get checks from last N hours
    since = datetime.utcnow() - timedelta(hours=hours)
    
    # Count total
    total = db.query(Check).filter(
        Check.monitor_id == monitor_id,
        Check.checked_at >= since
    ).count()
    
    # Get paginated checks
    checks = (
        db.query(Check)
        .filter(
            Check.monitor_id == monitor_id,
            Check.checked_at >= since
        )
        .order_by(desc(Check.checked_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    
    return {
        "checks": checks,
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.post("/{monitor_id}/pause", response_model=MessageResponse)
def pause_monitor(
    monitor_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Pause a monitor (set is_active to False)
    """
    monitor = db.query(Monitor).filter(
        Monitor.id == monitor_id,
        Monitor.user_id == current_user.id
    ).first()
    
    if not monitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitor not found"
        )
    
    monitor.is_active = False
    monitor.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Monitor paused"}


@router.post("/{monitor_id}/resume", response_model=MessageResponse)
def resume_monitor(
    monitor_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Resume a paused monitor (set is_active to True)
    """
    monitor = db.query(Monitor).filter(
        Monitor.id == monitor_id,
        Monitor.user_id == current_user.id
    ).first()
    
    if not monitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitor not found"
        )
    
    monitor.is_active = True
    monitor.next_check_at = datetime.utcnow()  # Check immediately
    monitor.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Monitor resumed"}
