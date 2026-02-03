"""
Alert sending utilities for different channels
"""

import requests
from typing import Dict, Any
from datetime import datetime

from app.config import get_settings

settings = get_settings()


def send_email_alert(channel_config: Dict[str, Any], monitor_name: str, monitor_url: str, 
                     new_status: str, old_status: str) -> bool:
    """
    Send email alert using SendGrid
    """
    if not settings.SENDGRID_API_KEY:
        print("⚠️  SendGrid API key not configured")
        return False
    
    email = channel_config.get("email")
    if not email:
        return False
    
    try:
        # SendGrid API
        url = "https://api.sendgrid.com/v3/mail/send"
        
        # Status emoji
        status_emoji = {
            "up": "✅",
            "down": "🔴",
            "degraded": "⚠️"
        }
        
        # Email content
        subject = f"{status_emoji.get(new_status, '🔔')} {monitor_name} is {new_status.upper()}"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2 style="color: {'#16a34a' if new_status == 'up' else '#dc2626'};">
                {status_emoji.get(new_status, '🔔')} Monitor Status Changed
            </h2>
            <p><strong>Monitor:</strong> {monitor_name}</p>
            <p><strong>URL:</strong> <a href="{monitor_url}">{monitor_url}</a></p>
            <p><strong>Status:</strong> {old_status.upper()} → <strong>{new_status.upper()}</strong></p>
            <p><strong>Time:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
            <hr>
            <p style="font-size: 12px; color: #666;">
                Sent by API Health Monitor
            </p>
        </body>
        </html>
        """
        
        payload = {
            "personalizations": [{
                "to": [{"email": email}],
                "subject": subject
            }],
            "from": {
                "email": settings.FROM_EMAIL,
                "name": "API Health Monitor"
            },
            "content": [{
                "type": "text/html",
                "value": html_content
            }]
        }
        
        headers = {
            "Authorization": f"Bearer {settings.SENDGRID_API_KEY}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        
        if response.status_code == 202:
            print(f"✉️  Email sent to {email}")
            return True
        else:
            print(f"❌ Email failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Email error: {str(e)}")
        return False


def send_slack_alert(channel_config: Dict[str, Any], monitor_name: str, monitor_url: str,
                     new_status: str, old_status: str) -> bool:
    """
    Send Slack alert using webhook
    """
    webhook_url = channel_config.get("webhook_url")
    if not webhook_url:
        return False
    
    try:
        # Status color
        color = {
            "up": "#16a34a",  # green
            "down": "#dc2626",  # red
            "degraded": "#f59e0b"  # yellow
        }
        
        # Slack message
        payload = {
            "text": f"Monitor Status Changed: {monitor_name}",
            "attachments": [{
                "color": color.get(new_status, "#6b7280"),
                "fields": [
                    {
                        "title": "Monitor",
                        "value": monitor_name,
                        "short": True
                    },
                    {
                        "title": "Status",
                        "value": f"{old_status.upper()} → *{new_status.upper()}*",
                        "short": True
                    },
                    {
                        "title": "URL",
                        "value": monitor_url,
                        "short": False
                    },
                    {
                        "title": "Time",
                        "value": datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC'),
                        "short": True
                    }
                ]
            }]
        }
        
        response = requests.post(webhook_url, json=payload, timeout=10)
        
        if response.status_code == 200:
            print(f"💬 Slack alert sent")
            return True
        else:
            print(f"❌ Slack failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Slack error: {str(e)}")
        return False


def send_telegram_alert(channel_config: Dict[str, Any], monitor_name: str, monitor_url: str,
                        new_status: str, old_status: str) -> bool:
    """
    Send Telegram alert using bot API
    """
    chat_id = channel_config.get("chat_id")
    bot_token = channel_config.get("bot_token")
    
    if not chat_id or not bot_token:
        return False
    
    try:
        # Status emoji
        status_emoji = {
            "up": "✅",
            "down": "🔴",
            "degraded": "⚠️"
        }
        
        # Message
        message = f"""
{status_emoji.get(new_status, '🔔')} *Monitor Status Changed*

*Monitor:* {monitor_name}
*URL:* {monitor_url}
*Status:* {old_status.upper()} → *{new_status.upper()}*
*Time:* {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}
"""
        
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        
        payload = {
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "Markdown"
        }
        
        response = requests.post(url, json=payload, timeout=10)
        
        if response.status_code == 200:
            print(f"✈️  Telegram alert sent")
            return True
        else:
            print(f"❌ Telegram failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Telegram error: {str(e)}")
        return False


def send_discord_alert(channel_config: Dict[str, Any], monitor_name: str, monitor_url: str,
                       new_status: str, old_status: str) -> bool:
    """
    Send Discord alert using webhook
    """
    webhook_url = channel_config.get("webhook_url")
    if not webhook_url:
        return False
    
    try:
        # Status color (decimal)
        color = {
            "up": 1356954,  # green
            "down": 14423100,  # red
            "degraded": 16098571  # yellow
        }
        
        # Discord embed
        payload = {
            "embeds": [{
                "title": "🔔 Monitor Status Changed",
                "color": color.get(new_status, 7119450),
                "fields": [
                    {
                        "name": "Monitor",
                        "value": monitor_name,
                        "inline": True
                    },
                    {
                        "name": "Status",
                        "value": f"{old_status.upper()} → **{new_status.upper()}**",
                        "inline": True
                    },
                    {
                        "name": "URL",
                        "value": monitor_url,
                        "inline": False
                    }
                ],
                "timestamp": datetime.utcnow().isoformat()
            }]
        }
        
        response = requests.post(webhook_url, json=payload, timeout=10)
        
        if response.status_code == 204:
            print(f"🎮 Discord alert sent")
            return True
        else:
            print(f"❌ Discord failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Discord error: {str(e)}")
        return False


def send_webhook_alert(channel_config: Dict[str, Any], monitor_name: str, monitor_url: str,
                       new_status: str, old_status: str, monitor_id: str) -> bool:
    """
    Send webhook alert (custom HTTP POST)
    """
    webhook_url = channel_config.get("url")
    if not webhook_url:
        return False
    
    try:
        # Webhook payload
        payload = {
            "event": "status_changed",
            "monitor": {
                "id": monitor_id,
                "name": monitor_name,
                "url": monitor_url
            },
            "status": {
                "old": old_status,
                "new": new_status
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Custom headers if provided
        headers = channel_config.get("headers", {})
        headers["Content-Type"] = "application/json"
        
        response = requests.post(webhook_url, json=payload, headers=headers, timeout=10)
        
        if 200 <= response.status_code < 300:
            print(f"🔗 Webhook alert sent")
            return True
        else:
            print(f"❌ Webhook failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Webhook error: {str(e)}")
        return False
