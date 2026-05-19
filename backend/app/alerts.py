"""
Alert sending utilities for different channels
"""

import requests
from typing import Dict, Any, Optional
from datetime import datetime

from app.config import get_settings

settings = get_settings()


def _build_email_ai_block(ai_analysis: Optional[Dict[str, Any]]) -> str:
    if not ai_analysis:
        return ""
    summary = ai_analysis.get("summary", "")
    causes = ai_analysis.get("possible_causes", [])
    actions = ai_analysis.get("recommended_actions", [])
    causes_html = "".join(f"<li>{c}</li>" for c in causes)
    actions_html = "".join(f"<li>{a}</li>" for a in actions)
    return f"""
    <div style="background:#fef9c3;border:1px solid #fde047;border-radius:6px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 8px 0;font-weight:bold;color:#854d0e;">🤖 AI Analysis</p>
        <p style="margin:0 0 8px 0;color:#1c1917;">{summary}</p>
        {"<p style='margin:4px 0;color:#6b7280;font-size:13px;'><strong>Possible causes:</strong></p><ul style='margin:4px 0 8px 0;padding-left:18px;color:#1c1917;font-size:13px;'>" + causes_html + "</ul>" if causes else ""}
        {"<p style='margin:4px 0;color:#6b7280;font-size:13px;'><strong>Recommended actions:</strong></p><ul style='margin:4px 0 0 0;padding-left:18px;color:#1c1917;font-size:13px;'>" + actions_html + "</ul>" if actions else ""}
    </div>"""


def send_email_alert(channel_config: Dict[str, Any], monitor_name: str, monitor_url: str,
                     new_status: str, old_status: str, ai_analysis: Dict[str, Any] = None) -> bool:
    """
    Send email alert using Resend
    """
    resend_api_key = settings.RESEND_API_KEY
    if not resend_api_key:
        print("⚠️  Resend API key not configured")
        return False

    email = channel_config.get("email")
    if not email:
        return False

    try:
        status_emoji = {"up": "✅", "down": "🔴", "degraded": "⚠️"}
        subject = f"{status_emoji.get(new_status, '🔔')} {monitor_name} is {new_status.upper()}"
        status_color = "#16a34a" if new_status == "up" else "#dc2626"

        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: {status_color}; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0;">{status_emoji.get(new_status, "🔔")} Monitor Status Changed</h2>
            </div>
            <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; color: #6b7280;">Monitor</td><td style="padding: 8px 0; font-weight: bold;">{monitor_name}</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280;">URL</td><td style="padding: 8px 0;"><a href="{monitor_url}" style="color: #16a34a;">{monitor_url}</a></td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280;">Status</td><td style="padding: 8px 0;">{old_status.upper()} → <strong style="color: {status_color};">{new_status.upper()}</strong></td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280;">Time</td><td style="padding: 8px 0;">{datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")}</td></tr>
                </table>
                {_build_email_ai_block(ai_analysis)}
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                    Sent by <a href="https://checkapi.io" style="color: #16a34a;">CheckAPI</a>
                </p>
            </div>
        </body>
        </html>
        """

        response = requests.post(
            "https://api.resend.com/emails",
            json={
                "from": "CheckAPI <noreply@checkapi.io>",
                "to": [email],
                "subject": subject,
                "html": html_content,
            },
            headers={
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json"
            },
            timeout=10
        )

        if response.status_code == 200:
            print(f"✉️  Email sent to {email}")
            return True
        else:
            print(f"❌ Email failed: {response.status_code} - {response.text}")
            return False

    except Exception as e:
        print(f"❌ Email error: {str(e)}")
        return False
def send_welcome_email(user_email: str, user_name: str) -> bool:
    """Send welcome email to new user after signup"""
    resend_api_key = settings.RESEND_API_KEY
    if not resend_api_key:
        print("⚠️  Resend API key not configured")
        return False

    name = user_name or user_email.split("@")[0]
    dashboard_url = f"{settings.FRONTEND_URL}/dashboard"

    try:
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
            <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <div style="background: #16a34a; padding: 32px 24px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to CheckAPI</h1>
                    <p style="color: #bbf7d0; margin: 8px 0 0; font-size: 15px;">Your API monitoring starts now</p>
                </div>
                <div style="padding: 32px 24px;">
                    <p style="color: #374151; font-size: 16px; margin-top: 0;">Hey {name} 👋</p>
                    <p style="color: #6b7280; line-height: 1.6;">
                        Thanks for signing up. CheckAPI monitors your APIs and alerts you the moment something goes wrong —
                        including silent failures where your endpoint returns 200 OK but the response is broken.
                    </p>

                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                        <p style="color: #15803d; font-weight: bold; margin: 0 0 12px;">Get started in 30 seconds:</p>
                        <ol style="color: #374151; line-height: 2; margin: 0; padding-left: 20px;">
                            <li>Paste your API URL</li>
                            <li>Set expected status code (usually 200)</li>
                            <li>Optionally add a keyword to detect silent failures</li>
                        </ol>
                    </div>

                    <div style="text-align: center; margin: 32px 0;">
                        <a href="{dashboard_url}"
                           style="background: #16a34a; color: white; padding: 14px 36px; border-radius: 8px;
                                  text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                            Add Your First Monitor →
                        </a>
                    </div>

                    <p style="color: #9ca3af; font-size: 13px; text-align: center; margin: 0;">
                        Free plan includes 5 monitors, all 5 alert channels, and no commercial restrictions.
                    </p>
                </div>
                <div style="background: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                        <a href="https://checkapi.io" style="color: #16a34a;">CheckAPI</a> · Built by Sewon Jeon
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

        response = requests.post(
            "https://api.resend.com/emails",
            json={
                "from": "Axiom Technologies for CheckAPI <axiomtech@checkapi.io>",
                "to": [user_email],
                "subject": "Welcome to CheckAPI — add your first monitor",
                "html": html_content,
            },
            headers={
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json"
            },
            timeout=10
        )

        if response.status_code == 200:
            print(f"✉️  Welcome email sent to {user_email}")
            return True
        else:
            print(f"❌ Welcome email failed: {response.status_code} - {response.text}")
            return False

    except Exception as e:
        print(f"❌ Welcome email error: {str(e)}")
        return False


def send_team_invite_email(invited_email: str, inviter_name: str, invite_url: str) -> bool:
    """
    Send team invitation email using Resend
    """
    resend_api_key = settings.RESEND_API_KEY
    if not resend_api_key:
        print("⚠️  Resend API key not configured")
        return False

    try:
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #16a34a; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0;">👥 You've been invited to a team</h2>
            </div>
            <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
                <p style="color: #374151; font-size: 16px; margin-top: 0;">
                    <strong>{inviter_name}</strong> has invited you to join their team on CheckAPI.
                </p>
                <p style="color: #6b7280;">
                    Click the button below to accept the invitation and start collaborating.
                </p>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="{invite_url}"
                       style="background: #16a34a; color: white; padding: 12px 32px; border-radius: 6px;
                              text-decoration: none; font-weight: bold; font-size: 15px;">
                        Accept Invitation
                    </a>
                </div>
                <p style="color: #9ca3af; font-size: 13px;">
                    Or copy this link: <a href="{invite_url}" style="color: #16a34a;">{invite_url}</a>
                </p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                    Sent by <a href="https://checkapi.io" style="color: #16a34a;">CheckAPI</a> ·
                    If you weren't expecting this, you can ignore this email.
                </p>
            </div>
        </body>
        </html>
        """

        response = requests.post(
            "https://api.resend.com/emails",
            json={
                "from": "CheckAPI <noreply@checkapi.io>",
                "to": [invited_email],
                "subject": f"👥 {inviter_name} invited you to join their CheckAPI team",
                "html": html_content,
            },
            headers={
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json"
            },
            timeout=10
        )

        if response.status_code == 200:
            print(f"✉️  Team invite email sent to {invited_email}")
            return True
        else:
            print(f"❌ Team invite email failed: {response.status_code} - {response.text}")
            return False

    except Exception as e:
        print(f"❌ Team invite email error: {str(e)}")
        return False


def send_slack_alert(channel_config: Dict[str, Any], monitor_name: str, monitor_url: str,
                     new_status: str, old_status: str, ai_analysis: Dict[str, Any] = None) -> bool:
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

        if ai_analysis and ai_analysis.get("summary"):
            causes = " / ".join(ai_analysis.get("possible_causes", []))
            actions = " / ".join(ai_analysis.get("recommended_actions", []))
            ai_text = f"*{ai_analysis['summary']}*"
            if causes:
                ai_text += f"\n• Causes: {causes}"
            if actions:
                ai_text += f"\n• Actions: {actions}"
            payload["attachments"].append({
                "color": "#fde047",
                "fields": [{"title": "🤖 AI Analysis", "value": ai_text, "short": False}],
            })

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
                        new_status: str, old_status: str, ai_analysis: Dict[str, Any] = None) -> bool:
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

        ai_block = ""
        if ai_analysis and ai_analysis.get("summary"):
            causes = " / ".join(ai_analysis.get("possible_causes", []))
            actions = " / ".join(ai_analysis.get("recommended_actions", []))
            ai_block = f"\n\n🤖 *AI Analysis*\n{ai_analysis['summary']}"
            if causes:
                ai_block += f"\n• Causes: {causes}"
            if actions:
                ai_block += f"\n• Actions: {actions}"

        # Message
        message = f"""
{status_emoji.get(new_status, '🔔')} *Monitor Status Changed*

*Monitor:* {monitor_name}
*URL:* {monitor_url}
*Status:* {old_status.upper()} → *{new_status.upper()}*
*Time:* {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}{ai_block}
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
                       new_status: str, old_status: str, ai_analysis: Dict[str, Any] = None) -> bool:
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

        embeds = [{
            "title": "🔔 Monitor Status Changed",
            "color": color.get(new_status, 7119450),
            "fields": [
                {"name": "Monitor", "value": monitor_name, "inline": True},
                {"name": "Status", "value": f"{old_status.upper()} → **{new_status.upper()}**", "inline": True},
                {"name": "URL", "value": monitor_url, "inline": False},
            ],
            "timestamp": datetime.utcnow().isoformat()
        }]

        if ai_analysis and ai_analysis.get("summary"):
            causes = " / ".join(ai_analysis.get("possible_causes", []))
            actions = " / ".join(ai_analysis.get("recommended_actions", []))
            ai_value = ai_analysis["summary"]
            if causes:
                ai_value += f"\n• Causes: {causes}"
            if actions:
                ai_value += f"\n• Actions: {actions}"
            embeds.append({
                "title": "🤖 AI Analysis",
                "color": 16763904,  # gold
                "description": ai_value,
            })

        # Discord embed
        payload = {"embeds": embeds}
        
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


def send_sla_report_email(
    user_email: str,
    user_name: str,
    month_label: str,
    monitors_data: list,
) -> bool:
    """
    Send monthly SLA report email.
    monitors_data: list of dicts with keys:
      name, url, uptime_percentage, downtime_minutes, incidents, avg_response_time
    """
    resend_api_key = settings.RESEND_API_KEY
    if not resend_api_key:
        print("⚠️  Resend API key not configured")
        return False

    name = user_name or user_email.split("@")[0]
    dashboard_url = f"{settings.FRONTEND_URL}/dashboard/analytics"

    def uptime_color(pct):
        if pct is None:
            return "#9ca3af"
        if pct >= 99.9:
            return "#16a34a"
        if pct >= 99.0:
            return "#d97706"
        return "#dc2626"

    def uptime_badge(pct):
        if pct is None:
            return '<span style="color:#9ca3af;">—</span>'
        color = uptime_color(pct)
        return f'<span style="color:{color};font-weight:bold;">{pct:.3f}%</span>'

    rows_html = ""
    for m in monitors_data:
        pct = m.get("uptime_percentage")
        rows_html += f"""
        <tr style="border-bottom:1px solid #f3f4f6;">
          <td style="padding:12px 8px;color:#111827;font-weight:500;">{m['name']}</td>
          <td style="padding:12px 8px;text-align:center;">{uptime_badge(pct)}</td>
          <td style="padding:12px 8px;text-align:center;color:#374151;">{m.get('downtime_minutes', 0):.1f} min</td>
          <td style="padding:12px 8px;text-align:center;color:#374151;">{m.get('incidents', 0)}</td>
          <td style="padding:12px 8px;text-align:center;color:#374151;">{m.get('avg_response_time', 0)} ms</td>
        </tr>"""

    valid = [m for m in monitors_data if m.get("uptime_percentage") is not None]
    overall = round(sum(m["uptime_percentage"] for m in valid) / len(valid), 3) if valid else None
    overall_html = uptime_badge(overall)

    try:
        html_content = f"""
        <html>
        <body style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:20px;background:#f9fafb;">
          <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

            <div style="background:#16a34a;padding:28px 28px 24px;text-align:center;">
              <h1 style="color:white;margin:0;font-size:22px;">📊 Monthly SLA Report</h1>
              <p style="color:#bbf7d0;margin:6px 0 0;font-size:14px;">{month_label}</p>
            </div>

            <div style="padding:28px;">
              <p style="color:#374151;margin-top:0;">Hey {name},</p>
              <p style="color:#6b7280;line-height:1.6;">
                Here's your API uptime summary for <strong>{month_label}</strong>.
                Overall uptime across all monitors: {overall_html}
              </p>

              <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
                <thead>
                  <tr style="background:#f9fafb;border-bottom:2px solid #e5e7eb;">
                    <th style="padding:10px 8px;text-align:left;color:#6b7280;font-weight:600;">Monitor</th>
                    <th style="padding:10px 8px;text-align:center;color:#6b7280;font-weight:600;">Uptime</th>
                    <th style="padding:10px 8px;text-align:center;color:#6b7280;font-weight:600;">Downtime</th>
                    <th style="padding:10px 8px;text-align:center;color:#6b7280;font-weight:600;">Incidents</th>
                    <th style="padding:10px 8px;text-align:center;color:#6b7280;font-weight:600;">Avg Response</th>
                  </tr>
                </thead>
                <tbody>{rows_html}</tbody>
              </table>

              <div style="text-align:center;margin:28px 0 8px;">
                <a href="{dashboard_url}"
                   style="background:#16a34a;color:white;padding:12px 28px;border-radius:8px;
                          text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;">
                  View Full Analytics →
                </a>
              </div>
            </div>

            <div style="background:#f9fafb;padding:16px 28px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="font-size:12px;color:#9ca3af;margin:0;">
                <a href="https://checkapi.io" style="color:#16a34a;">CheckAPI</a> ·
                You're receiving this as a Pro/Business plan member.
              </p>
            </div>
          </div>
        </body>
        </html>
        """

        response = requests.post(
            "https://api.resend.com/emails",
            json={
                "from": "CheckAPI Reports <noreply@checkapi.io>",
                "to": [user_email],
                "subject": f"📊 Your SLA Report — {month_label}",
                "html": html_content,
            },
            headers={
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json",
            },
            timeout=10,
        )

        if response.status_code == 200:
            print(f"✉️  SLA report sent to {user_email}")
            return True
        else:
            print(f"❌ SLA report email failed: {response.status_code} - {response.text}")
            return False

    except Exception as e:
        print(f"❌ SLA report email error: {e}")
        return False


def send_webhook_alert(channel_config: Dict[str, Any], monitor_name: str, monitor_url: str,
                       new_status: str, old_status: str, monitor_id: str,
                       ai_analysis: Dict[str, Any] = None) -> bool:
    """
    Send webhook alert (custom HTTP POST)
    """
    import hashlib
    webhook_url = channel_config.get("url")
    if not webhook_url:
        return False

    try:
        now = datetime.utcnow()
        # Idempotency key: hash of monitor_id + status transition + 5-minute time bucket.
        # Retries within the same 5-minute window carry the same key so receivers can deduplicate.
        time_bucket = now.strftime("%Y%m%d%H") + str(now.minute // 5)
        idempotency_key = hashlib.sha256(
            f"{monitor_id}:{old_status}:{new_status}:{time_bucket}".encode()
        ).hexdigest()[:32]

        # Webhook payload
        payload = {
            "event": "status_changed",
            "idempotency_key": idempotency_key,
            "monitor": {
                "id": monitor_id,
                "name": monitor_name,
                "url": monitor_url
            },
            "status": {
                "old": old_status,
                "new": new_status
            },
            "timestamp": now.isoformat(),
            "ai_analysis": ai_analysis,
        }

        # Custom headers if provided
        headers = channel_config.get("headers", {})
        headers["Content-Type"] = "application/json"
        headers["X-CheckAPI-Idempotency-Key"] = idempotency_key
        
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
