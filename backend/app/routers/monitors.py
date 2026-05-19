"""
Monitor management routes: CRUD operations for monitors
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from datetime import datetime, timedelta
from uuid import UUID

from app.database import get_db
from app.limiter import limiter
from app.models import User, Monitor, Check, TeamMember
from app.schemas import (
    MonitorCreate,
    MonitorUpdate,
    MonitorResponse,
    CheckResponse,
    CheckListResponse,
    MessageResponse
)
from app.auth import get_current_user, _get_user_by_api_key as get_user_by_api_key
from app.audit import log_action

def get_current_user_flexible(
    request: Request,
    db: Session = Depends(get_db)
):
    """JWT 토큰 또는 API 키로 인증"""
    api_key = request.headers.get("X-API-Key")
    if api_key:
        user = get_user_by_api_key(api_key, db)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid API key")
        if user.plan != "business":
            raise HTTPException(status_code=403, detail="API access requires Business plan")
        return user
    # JWT 토큰 인증
    from app.auth import get_current_user
    from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    token = auth[7:]
    from app.auth import decode_token as verify_token
    from app.models import User
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


router = APIRouter(prefix="/monitors", tags=["Monitors"])


def get_effective_owner_id(current_user: User, db: Session) -> str:
    """팀 멤버인 경우 오너의 user_id 반환, 아니면 본인 id 반환"""
    membership = db.query(TeamMember).filter(
        TeamMember.member_id == current_user.id,
        TeamMember.status == "active"
    ).first()
    return membership.owner_id if membership else current_user.id


def get_effective_owner(current_user: User, db: Session) -> User:
    """팀 멤버인 경우 오너 User 객체 반환"""
    owner_id = get_effective_owner_id(current_user, db)
    if owner_id != current_user.id:
        owner = db.query(User).filter(User.id == owner_id).first()
        if not owner:
            raise HTTPException(status_code=404, detail="Team owner not found")
        return owner
    return current_user


# Plan limits
PLAN_LIMITS = {
    "free":     {"max_monitors": 5,   "min_interval": 300, "history_hours": 720},    # 30 days (intentionally 5, not 10 — paid conversion strategy)
    "starter":  {"max_monitors": 20,  "min_interval": 60,  "history_hours": 720},    # 30 days
    "pro":      {"max_monitors": 100, "min_interval": 30,  "history_hours": 2160},   # 90 days
    "business": {"max_monitors": -1,  "min_interval": 10,  "history_hours": 8760},   # 365 days
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
    current_user: User = Depends(get_current_user_flexible),
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    """
    Get all monitors for the current user
    """
    owner_id = get_effective_owner_id(current_user, db)
    monitors = (
        db.query(Monitor)
        .filter(Monitor.user_id == owner_id)
        .order_by(desc(Monitor.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return monitors


@router.post("/", response_model=MonitorResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_monitor(
    request: Request,
    monitor_data: MonitorCreate,
    current_user: User = Depends(get_current_user_flexible),
    db: Session = Depends(get_db)
):
    """
    Create a new monitor
    """
    # Lock the effective owner row to prevent TOCTOU race condition.
    # Team members are checked against the owner's plan and monitor count.
    owner_id = get_effective_owner_id(current_user, db)
    locked_user = db.query(User).filter(User.id == owner_id).with_for_update().first()
    if not locked_user:
        raise HTTPException(status_code=404, detail="User not found")
    check_plan_limits(locked_user, db, creating_new=True)

    # Validate interval
    validate_interval(locked_user, monitor_data.interval)

    # Create monitor (always under owner's ID so team members' monitors are visible)
    new_monitor = Monitor(
        user_id=locked_user.id,
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

    log_action(db, str(current_user.id), "monitor.create", "monitor", str(new_monitor.id),
               {"name": new_monitor.name, "url": str(monitor_data.url), "interval": new_monitor.interval})

    return new_monitor


@router.get("/{monitor_id}", response_model=MonitorResponse)
def get_monitor(
    monitor_id: str,
    current_user: User = Depends(get_current_user_flexible),
    db: Session = Depends(get_db)
):
    """
    Get a specific monitor by ID
    """
    owner_id = get_effective_owner_id(current_user, db)
    monitor = db.query(Monitor).filter(
        Monitor.id == monitor_id,
        Monitor.user_id == owner_id
    ).first()
    
    if not monitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitor not found"
        )
    
    return monitor


@router.put("/{monitor_id}", response_model=MonitorResponse)
def update_monitor(
    monitor_id: str,
    monitor_data: MonitorUpdate,
    current_user: User = Depends(get_current_user_flexible),
    db: Session = Depends(get_db)
):
    """
    Update a monitor
    """
    owner = get_effective_owner(current_user, db)
    monitor = db.query(Monitor).filter(
        Monitor.id == monitor_id,
        Monitor.user_id == owner.id
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
        validate_interval(owner, update_data["interval"])
    
    # Convert URL to string if present
    if "url" in update_data:
        update_data["url"] = str(update_data["url"])
    
    for field, value in update_data.items():
        setattr(monitor, field, value)
    
    monitor.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(monitor)

    log_action(db, str(current_user.id), "monitor.update", "monitor", str(monitor.id),
               {k: v for k, v in update_data.items() if k in ("name", "url", "interval", "is_active")})

    return monitor


@router.delete("/{monitor_id}", response_model=MessageResponse)
def delete_monitor(
    monitor_id: str,
    current_user: User = Depends(get_current_user_flexible),
    db: Session = Depends(get_db)
):
    """
    Delete a monitor
    """
    owner_id = get_effective_owner_id(current_user, db)
    monitor = db.query(Monitor).filter(
        Monitor.id == monitor_id,
        Monitor.user_id == owner_id
    ).first()
    
    if not monitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitor not found"
        )
    
    monitor_name = monitor.name
    monitor_url = monitor.url
    db.delete(monitor)
    db.commit()

    log_action(db, str(current_user.id), "monitor.delete", "monitor", monitor_id,
               {"name": monitor_name, "url": monitor_url})

    return {"message": "Monitor deleted successfully"}


@router.get("/{monitor_id}/checks", response_model=CheckListResponse)
def get_monitor_checks(
    monitor_id: str,
    current_user: User = Depends(get_current_user_flexible),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    hours: int = Query(None, ge=1),
    cursor: str = Query(None, description="ISO datetime cursor for keyset pagination (before this timestamp)")
):
    """
    Get check history for a monitor
    """
    # Verify monitor ownership (team members see owner's monitors)
    owner = get_effective_owner(current_user, db)
    monitor = db.query(Monitor).filter(
        Monitor.id == monitor_id,
        Monitor.user_id == owner.id
    ).first()

    if not monitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitor not found"
        )

    # Apply plan-based history limit (use owner's plan for team members)
    limits = PLAN_LIMITS.get(owner.plan, PLAN_LIMITS["free"])
    max_hours = limits["history_hours"]
    if hours is None or hours > max_hours:
        hours = max_hours
    # Get checks from last N hours
    since = datetime.utcnow() - timedelta(hours=hours)

    base_filter = [
        Check.monitor_id == monitor_id,
        Check.checked_at >= since,
    ]

    # Keyset pagination: if cursor provided, skip offset scan
    if cursor:
        try:
            cursor_dt = datetime.fromisoformat(cursor)
            base_filter.append(Check.checked_at < cursor_dt)
        except ValueError:
            pass  # Invalid cursor — ignore, fall back to first page

    total = db.query(Check).filter(*base_filter).count()

    checks = (
        db.query(Check)
        .filter(*base_filter)
        .order_by(desc(Check.checked_at))
        .limit(page_size)
        .all()
    )

    next_cursor = checks[-1].checked_at.isoformat() if len(checks) == page_size else None

    return {
        "checks": checks,
        "total": total,
        "page": page,
        "page_size": page_size,
        "next_cursor": next_cursor,
    }


@router.post("/{monitor_id}/toggle")
def toggle_monitor(
    monitor_id: str,
    body: dict,
    current_user: User = Depends(get_current_user_flexible),
    db: Session = Depends(get_db)
):
    owner_id = get_effective_owner_id(current_user, db)
    monitor = db.query(Monitor).filter(
        Monitor.id == monitor_id,
        Monitor.user_id == owner_id
    ).first()

    if not monitor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Monitor not found")

    enabled = body.get("enabled", True)
    monitor.is_active = enabled
    monitor.updated_at = datetime.utcnow()
    if enabled:
        monitor.next_check_at = datetime.utcnow()

    db.commit()
    return {"message": "Monitor updated", "is_active": enabled}


@router.post("/{monitor_id}/pause", response_model=MessageResponse)
def pause_monitor(
    monitor_id: str,
    current_user: User = Depends(get_current_user_flexible),
    db: Session = Depends(get_db)
):
    """
    Pause a monitor (set is_active to False)
    """
    owner_id = get_effective_owner_id(current_user, db)
    monitor = db.query(Monitor).filter(
        Monitor.id == monitor_id,
        Monitor.user_id == owner_id
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
    monitor_id: str,
    current_user: User = Depends(get_current_user_flexible),
    db: Session = Depends(get_db)
):
    """
    Resume a paused monitor (set is_active to True)
    """
    owner_id = get_effective_owner_id(current_user, db)
    monitor = db.query(Monitor).filter(
        Monitor.id == monitor_id,
        Monitor.user_id == owner_id
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


@router.put("/{monitor_id}/custom-domain")
def set_custom_domain(
    monitor_id: str,
    payload: dict,
    current_user: User = Depends(get_current_user_flexible),
    db: Session = Depends(get_db)
):
    """Set or clear the custom domain for a monitor's status page (Pro/Business only)."""
    owner = get_effective_owner(current_user, db)
    if owner.plan not in ("pro", "business"):
        raise HTTPException(status_code=403, detail="Custom domain requires Pro or Business plan")

    monitor = db.query(Monitor).filter(
        Monitor.id == monitor_id,
        Monitor.user_id == owner.id
    ).first()
    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found")

    domain = (payload.get("custom_domain") or "").strip().lower() or None

    if domain:
        # Check uniqueness with row lock to prevent race condition
        conflict = db.query(Monitor).filter(
            Monitor.custom_domain == domain,
            Monitor.id != monitor_id
        ).with_for_update().first()
        if conflict:
            raise HTTPException(status_code=409, detail="Domain already in use by another monitor")

    monitor.custom_domain = domain
    monitor.updated_at = datetime.utcnow()
    db.commit()

    return {"custom_domain": monitor.custom_domain}


@router.get("/{monitor_id}/custom-domain")
def get_custom_domain(
    monitor_id: str,
    current_user: User = Depends(get_current_user_flexible),
    db: Session = Depends(get_db)
):
    owner = get_effective_owner(current_user, db)
    monitor = db.query(Monitor).filter(
        Monitor.id == monitor_id,
        Monitor.user_id == owner.id
    ).first()
    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found")
    return {"custom_domain": monitor.custom_domain}