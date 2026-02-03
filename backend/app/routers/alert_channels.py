"""
Alert Channel management routes: CRUD operations for alert channels
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.models import User, AlertChannel, Monitor
from app.schemas import (
    AlertChannelCreate,
    AlertChannelUpdate,
    AlertChannelResponse,
    MessageResponse
)
from app.auth import get_current_user

router = APIRouter(prefix="/alert-channels", tags=["Alert Channels"])


def validate_channel_config(channel_type: str, config: dict) -> None:
    """Validate alert channel configuration based on type"""
    
    if channel_type == "email":
        if "email" not in config:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email channel requires 'email' in config"
            )
        # Basic email validation
        if "@" not in config["email"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email address"
            )
    
    elif channel_type == "slack":
        if "webhook_url" not in config:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Slack channel requires 'webhook_url' in config"
            )
        if not config["webhook_url"].startswith("https://hooks.slack.com/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Slack webhook URL"
            )
    
    elif channel_type == "telegram":
        if "chat_id" not in config or "bot_token" not in config:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Telegram channel requires 'chat_id' and 'bot_token' in config"
            )
    
    elif channel_type == "discord":
        if "webhook_url" not in config:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Discord channel requires 'webhook_url' in config"
            )
        if not config["webhook_url"].startswith("https://discord.com/api/webhooks/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Discord webhook URL"
            )
    
    elif channel_type == "webhook":
        if "url" not in config:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Webhook channel requires 'url' in config"
            )
        if not config["url"].startswith(("http://", "https://")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid webhook URL"
            )


@router.get("/", response_model=List[AlertChannelResponse])
def list_alert_channels(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all alert channels for the current user
    """
    channels = db.query(AlertChannel).filter(
        AlertChannel.user_id == current_user.id
    ).all()
    
    return channels


@router.post("/", response_model=AlertChannelResponse, status_code=status.HTTP_201_CREATED)
def create_alert_channel(
    channel_data: AlertChannelCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new alert channel
    """
    # Validate config
    validate_channel_config(channel_data.type, channel_data.config)
    
    # Create channel
    new_channel = AlertChannel(
        user_id=current_user.id,
        type=channel_data.type,
        config=channel_data.config
    )
    
    db.add(new_channel)
    db.commit()
    db.refresh(new_channel)
    
    return new_channel


@router.get("/{channel_id}", response_model=AlertChannelResponse)
def get_alert_channel(
    channel_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific alert channel
    """
    channel = db.query(AlertChannel).filter(
        AlertChannel.id == channel_id,
        AlertChannel.user_id == current_user.id
    ).first()
    
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert channel not found"
        )
    
    return channel


@router.put("/{channel_id}", response_model=AlertChannelResponse)
def update_alert_channel(
    channel_id: UUID,
    channel_data: AlertChannelUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an alert channel
    """
    channel = db.query(AlertChannel).filter(
        AlertChannel.id == channel_id,
        AlertChannel.user_id == current_user.id
    ).first()
    
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert channel not found"
        )
    
    # Update fields
    update_data = channel_data.model_dump(exclude_unset=True)
    
    # Validate config if being updated
    if "config" in update_data:
        validate_channel_config(channel.type, update_data["config"])
    
    for field, value in update_data.items():
        setattr(channel, field, value)
    
    db.commit()
    db.refresh(channel)
    
    return channel


@router.delete("/{channel_id}", response_model=MessageResponse)
def delete_alert_channel(
    channel_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an alert channel
    """
    channel = db.query(AlertChannel).filter(
        AlertChannel.id == channel_id,
        AlertChannel.user_id == current_user.id
    ).first()
    
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert channel not found"
        )
    
    db.delete(channel)
    db.commit()
    
    return {"message": "Alert channel deleted successfully"}


@router.post("/{channel_id}/attach/{monitor_id}", response_model=MessageResponse)
def attach_channel_to_monitor(
    channel_id: UUID,
    monitor_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Attach an alert channel to a monitor
    """
    # Verify ownership of both
    channel = db.query(AlertChannel).filter(
        AlertChannel.id == channel_id,
        AlertChannel.user_id == current_user.id
    ).first()
    
    monitor = db.query(Monitor).filter(
        Monitor.id == monitor_id,
        Monitor.user_id == current_user.id
    ).first()
    
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert channel not found"
        )
    
    if not monitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitor not found"
        )
    
    # Attach
    if channel not in monitor.alert_channels:
        monitor.alert_channels.append(channel)
        db.commit()
    
    return {"message": "Alert channel attached to monitor"}


@router.post("/{channel_id}/detach/{monitor_id}", response_model=MessageResponse)
def detach_channel_from_monitor(
    channel_id: UUID,
    monitor_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Detach an alert channel from a monitor
    """
    # Verify ownership of both
    channel = db.query(AlertChannel).filter(
        AlertChannel.id == channel_id,
        AlertChannel.user_id == current_user.id
    ).first()
    
    monitor = db.query(Monitor).filter(
        Monitor.id == monitor_id,
        Monitor.user_id == current_user.id
    ).first()
    
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert channel not found"
        )
    
    if not monitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monitor not found"
        )
    
    # Detach
    if channel in monitor.alert_channels:
        monitor.alert_channels.remove(channel)
        db.commit()
    
    return {"message": "Alert channel detached from monitor"}
