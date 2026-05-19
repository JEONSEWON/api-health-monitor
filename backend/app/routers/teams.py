"""
Team collaboration routes
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid, secrets

from app.database import get_db
from app.limiter import limiter
from app.models import User, TeamMember, Monitor
from app.auth import get_current_user
from app.schemas import MessageResponse

router = APIRouter(prefix="/teams", tags=["Teams"])

# Plans that allow team features
TEAM_PLANS = {"pro", "business"}


def require_team_plan(user: User):
    if user.plan not in TEAM_PLANS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Team collaboration requires Pro or Business plan."
        )


# ── helpers ──────────────────────────────────────────────

def get_effective_user_id(current_user: User, db: Session) -> str:
    """
    Returns the owner_id to use for data queries.
    If current_user is a team member, returns their owner's id.
    Otherwise returns current_user.id.
    """
    membership = db.query(TeamMember).filter(
        TeamMember.member_id == current_user.id,
        TeamMember.status == "active"
    ).first()
    return membership.owner_id if membership else current_user.id


# ── endpoints ────────────────────────────────────────────

@router.get("/members")
def list_members(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all team members for the current owner."""
    require_team_plan(current_user)
    members = db.query(TeamMember).filter(
        TeamMember.owner_id == current_user.id
    ).all()
    return [
        {
            "id": m.id,
            "invited_email": m.invited_email,
            "role": m.role,
            "status": m.status,
            "created_at": m.created_at,
            "accepted_at": m.accepted_at,
        }
        for m in members
    ]


@router.post("/invite")
@limiter.limit("10/minute")
def invite_member(
    request: Request,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Invite a new team member by email."""
    require_team_plan(current_user)

    email = payload.get("email", "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required.")

    # Prevent duplicate invite
    existing = db.query(TeamMember).filter(
        TeamMember.owner_id == current_user.id,
        TeamMember.invited_email == email
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="This email has already been invited.")

    # Pro: max 5 members, Business: unlimited
    if current_user.plan == "pro":
        count = db.query(TeamMember).filter(TeamMember.owner_id == current_user.id, TeamMember.status == "accepted").count()
        if count >= 5:
            raise HTTPException(status_code=400, detail="Pro plan allows up to 5 team members.")

    token = secrets.token_urlsafe(32)
    member = TeamMember(
        owner_id=current_user.id,
        invited_email=email,
        role="member",
        status="pending",
        invite_token=token,
    )
    db.add(member)
    db.commit()
    db.refresh(member)

    # Send invite email
    try:
        from app.alerts import send_team_invite_email
        send_team_invite_email(
            invited_email=email,
            inviter_name=current_user.name or current_user.email,
            invite_url=f"https://checkapi.io/invite?token={token}",
        )
    except Exception as e:
        print(f"[TEAM] invite email error: {e}")

    return {"message": f"Invitation sent to {email}", "invite_token": token}


@router.post("/accept")
def accept_invite(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Accept a team invitation using a token."""
    token = payload.get("token", "").strip()
    if not token:
        raise HTTPException(status_code=400, detail="Token is required.")

    invite = db.query(TeamMember).filter(
        TeamMember.invite_token == token,
        TeamMember.status == "pending"
    ).first()

    if not invite:
        raise HTTPException(status_code=404, detail="Invalid or expired invitation.")

    if invite.invited_email != current_user.email:
        raise HTTPException(status_code=403, detail="This invitation is for a different email.")

    invite.member_id = current_user.id
    invite.status = "active"
    invite.accepted_at = datetime.utcnow()
    invite.invite_token = None
    db.commit()

    return {"message": "You have joined the team successfully."}


@router.delete("/members/{member_id}")
def remove_member(
    member_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a team member."""
    require_team_plan(current_user)

    member = db.query(TeamMember).filter(
        TeamMember.id == member_id,
        TeamMember.owner_id == current_user.id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found.")

    db.delete(member)
    db.commit()
    return {"message": "Member removed."}


@router.get("/my-team")
def get_my_team_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get team context for the current user (owner or member)."""
    membership = db.query(TeamMember).filter(
        TeamMember.member_id == current_user.id,
        TeamMember.status == "active"
    ).first()

    if membership:
        owner = db.query(User).filter(User.id == membership.owner_id).first()
        return {
            "role": "member",
            "owner_email": owner.email if owner else None,
            "owner_name": owner.name if owner else None,
        }

    return {"role": "owner", "owner_email": None, "owner_name": None}
