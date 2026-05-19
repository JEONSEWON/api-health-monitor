"""
Alert Channel management routes: CRUD operations for alert channels
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database import get_db
from app.limiter import limiter
from app.models import User, AlertChannel, Monitor
from app.ai.analyzer import _is_blocked_url
from app.audit import log_action
from app.schemas import (
    AlertChannelCreate,
    AlertChannelUpdate,
    AlertChannelResponse,
    MessageResponse
)
from app.auth import get_current_user
from app.routers.monitors import get_effective_owner_id

router = APIRouter(prefix="/alert-channels", tags=["Alert Channels"])


def validate_channel_config(channel_type: str, config: dict) -> None:
    """Validate alert channel configuration based on type"""
    if channel_type == "email":
        if "email" not in config:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email channel requires 'email' in config"
            )
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
        if _is_blocked_url(config["url"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Webhook URL must be a public internet address"
            )
        headers = config.get("headers", {})
        if not isinstance(headers, dict):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Webhook headers must be a key-value object"
            )
        for k, v in headers.items():
            if not isinstance(k, str) or not isinstance(v, str):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Webhook header keys and values must be strings"
                )
            if "\n" in k or "\r" in k or "\n" in v or "\r" in v:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Webhook header contains invalid characters"
                )


@router.get("/", response_model=List[AlertChannelResponse])
def list_alert_channels(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all alert channels for the current user"""
    channels = db.query(AlertChannel).filter(
        AlertChannel.user_id == current_user.id
    ).all()
    return channels


@router.post("/", response_model=AlertChannelResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
def create_alert_channel(
    request: Request,
    channel_data: AlertChannelCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new alert channel"""
    validate_channel_config(channel_data.type, channel_data.config)
    new_channel = AlertChannel(
        user_id=current_user.id,
        type=channel_data.type,
        config=channel_data.config
    )
    db.add(new_channel)
    db.commit()
    db.refresh(new_channel)
    log_action(db, str(current_user.id), "alert_channel.create", "alert_channel",
               str(new_channel.id), {"type": channel_data.type})
    return new_channel


@router.post("/{channel_id}/test", response_model=MessageResponse)
@limiter.limit("10/minute")
def test_alert_channel(
    request: Request,
    channel_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a test alert to the specified channel"""
    from app.alerts import (
        send_email_alert,
        send_slack_alert,
        send_telegram_alert,
        send_discord_alert,
        send_webhook_alert,
    )

    channel = db.query(AlertChannel).filter(
        AlertChannel.id == channel_id,
        AlertChannel.user_id == current_user.id
    ).first()

    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert channel not found"
        )

    monitor_name = "CheckAPI Test"
    monitor_url = "https://checkapi.io"
    new_status = "up"
    old_status = "down"

    try:
        success = False
        if channel.type == "email":
            success = send_email_alert(channel.config, monitor_name, monitor_url, new_status, old_status)
        elif channel.type == "slack":
            success = send_slack_alert(channel.config, monitor_name, monitor_url, new_status, old_status)
        elif channel.type == "telegram":
            success = send_telegram_alert(channel.config, monitor_name, monitor_url, new_status, old_status)
        elif channel.type == "discord":
            success = send_discord_alert(channel.config, monitor_name, monitor_url, new_status, old_status)
        elif channel.type == "webhook":
            success = send_webhook_alert(channel.config, monitor_name, monitor_url, new_status, old_status, channel_id)

        if success:
            return {"message": "Test alert sent successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send test alert"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error sending test alert: {str(e)}"
        )


@router.get("/{channel_id}", response_model=AlertChannelResponse)
def get_alert_channel(
    channel_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific alert channel"""
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
    channel_id: str,
    channel_data: AlertChannelUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an alert channel"""
    channel = db.query(AlertChannel).filter(
        AlertChannel.id == channel_id,
        AlertChannel.user_id == current_user.id
    ).first()
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert channel not found"
        )
    update_data = channel_data.model_dump(exclude_unset=True)
    if "config" in update_data:
        validate_channel_config(channel.type, update_data["config"])
    for field, value in update_data.items():
        setattr(channel, field, value)
    db.commit()
    db.refresh(channel)
    return channel


@router.delete("/{channel_id}", response_model=MessageResponse)
def delete_alert_channel(
    channel_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an alert channel"""
    channel = db.query(AlertChannel).filter(
        AlertChannel.id == channel_id,
        AlertChannel.user_id == current_user.id
    ).first()
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert channel not found"
        )
    channel_type = channel.type
    db.delete(channel)
    db.commit()
    log_action(db, str(current_user.id), "alert_channel.delete", "alert_channel",
               channel_id, {"type": channel_type})
    return {"message": "Alert channel deleted successfully"}


@router.post("/{channel_id}/attach/{monitor_id}", response_model=MessageResponse)
def attach_channel_to_monitor(
    channel_id: str,
    monitor_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Attach an alert channel to a monitor"""
    owner_id = get_effective_owner_id(current_user, db)
    channel = db.query(AlertChannel).filter(
        AlertChannel.id == channel_id,
        AlertChannel.user_id == owner_id
    ).first()
    monitor = db.query(Monitor).filter(
        Monitor.id == monitor_id,
        Monitor.user_id == owner_id
    ).first()
    if not channel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert channel not found")
    if not monitor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Monitor not found")
    if channel not in monitor.alert_channels:
        monitor.alert_channels.append(channel)
        db.commit()
    return {"message": "Alert channel attached to monitor"}


@router.post("/{channel_id}/detach/{monitor_id}", response_model=MessageResponse)
def detach_channel_from_monitor(
    channel_id: str,
    monitor_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Detach an alert channel from a monitor"""
    owner_id = get_effective_owner_id(current_user, db)
    channel = db.query(AlertChannel).filter(
        AlertChannel.id == channel_id,
        AlertChannel.user_id == owner_id
    ).first()
    monitor = db.query(Monitor).filter(
        Monitor.id == monitor_id,
        Monitor.user_id == owner_id
    ).first()
    if not channel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert channel not found")
    if not monitor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Monitor not found")
    if channel in monitor.alert_channels:
        monitor.alert_channels.remove(channel)
        db.commit()
    return {"message": "Alert channel detached from monitor"}
