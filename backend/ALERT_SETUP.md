# Alert Channel Setup Guide

How to configure different alert channels.

---

## 📧 Email (SendGrid)

### 1. Get SendGrid API Key

```
1. Go to https://sendgrid.com/
2. Sign up (free tier: 100 emails/day)
3. Settings → API Keys → Create API Key
4. Give it "Full Access"
5. Copy the key (starts with SG.)
```

### 2. Configure

```bash
# In .env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
```

### 3. Create Alert Channel (API)

```bash
POST /api/alert-channels
{
  "type": "email",
  "config": {
    "email": "you@example.com"
  }
}
```

---

## 💬 Slack

### 1. Create Slack Webhook

```
1. Go to https://api.slack.com/apps
2. Create New App → From scratch
3. Incoming Webhooks → Activate
4. Add New Webhook to Workspace
5. Select channel
6. Copy webhook URL
```

### 2. Create Alert Channel (API)

```bash
POST /api/alert-channels
{
  "type": "slack",
  "config": {
    "webhook_url": "https://hooks.slack.com/services/T00/B00/XXXX"
  }
}
```

---

## ✈️ Telegram

### 1. Create Telegram Bot

```
1. Open Telegram
2. Search for @BotFather
3. Send /newbot
4. Follow instructions
5. Copy bot token
```

### 2. Get Chat ID

```
1. Add bot to your channel/group
2. Send a message
3. Go to: https://api.telegram.org/bot<TOKEN>/getUpdates
4. Find "chat":{"id": XXXXXX}
5. Copy chat ID
```

### 3. Create Alert Channel (API)

```bash
POST /api/alert-channels
{
  "type": "telegram",
  "config": {
    "bot_token": "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz",
    "chat_id": "-1001234567890"
  }
}
```

---

## 🎮 Discord

### 1. Create Discord Webhook

```
1. Open Discord
2. Server Settings → Integrations
3. Webhooks → New Webhook
4. Choose channel
5. Copy webhook URL
```

### 2. Create Alert Channel (API)

```bash
POST /api/alert-channels
{
  "type": "discord",
  "config": {
    "webhook_url": "https://discord.com/api/webhooks/123/abc"
  }
}
```

---

## 🔗 Custom Webhook

Send alerts to your own server.

### 1. Create Alert Channel (API)

```bash
POST /api/alert-channels
{
  "type": "webhook",
  "config": {
    "url": "https://yourserver.com/webhook",
    "headers": {
      "Authorization": "Bearer your-token"
    }
  }
}
```

### 2. Webhook Payload

Your server will receive:

```json
{
  "event": "status_changed",
  "monitor": {
    "id": "uuid",
    "name": "My API",
    "url": "https://api.example.com"
  },
  "status": {
    "old": "up",
    "new": "down"
  },
  "timestamp": "2026-02-03T16:45:00Z"
}
```

---

## 🔗 Attach Channel to Monitor

After creating a channel, attach it to monitors:

```bash
POST /api/alert-channels/{channel_id}/attach/{monitor_id}
```

---

## 🧪 Test Alerts

To test if your alerts work:

1. Create a monitor with a fake URL (will be "down")
2. Attach your alert channel
3. Wait 1 minute
4. Check if you received alert!

Example test monitor:

```bash
POST /api/monitors
{
  "name": "Test Monitor",
  "url": "https://thisurldoesnotexist12345.com",
  "interval": 60
}
```

---

## 💡 Tips

- **Email**: Free tier limit is 100/day
- **Slack**: Create dedicated #alerts channel
- **Telegram**: Use a group for team alerts
- **Discord**: Use a dedicated channel
- **Webhook**: Return 2xx status code for success

---

## 🚨 Troubleshooting

### Email not sending?
- Check SendGrid API key is correct
- Verify FROM_EMAIL is set
- Check SendGrid dashboard for errors

### Slack not working?
- Verify webhook URL starts with `https://hooks.slack.com/`
- Test webhook with curl
- Check channel permissions

### Telegram not working?
- Verify bot token is correct
- Make sure bot is in the chat/channel
- Chat ID must be correct (negative for groups)

### Discord not working?
- Webhook URL must start with `https://discord.com/api/webhooks/`
- Check webhook hasn't been deleted

---

Need help? Open an issue on GitHub!
