# LemonSqueezy Setup Guide

Complete guide to configure LemonSqueezy payment integration.

---

## 📋 Prerequisites

- LemonSqueezy account (created earlier)
- Store created

---

## 🏪 Step 1: Create Products

### 1. Go to LemonSqueezy Dashboard

```
https://app.lemonsqueezy.com/
→ Products → New Product
```

### 2. Create 3 Products

#### Product 1: Starter Plan
```
Name: API Health Monitor - Starter
Price: $5/month
Billing: Subscription (monthly)
Description: 20 monitors, 1-minute intervals
```

#### Product 2: Pro Plan
```
Name: API Health Monitor - Pro
Price: $15/month
Billing: Subscription (monthly)
Description: 100 monitors, 30-second intervals, team sharing
```

#### Product 3: Business Plan
```
Name: API Health Monitor - Business
Price: $49/month
Billing: Subscription (monthly)
Description: Unlimited monitors, 10-second intervals, API access
```

### 3. Get Variant IDs

After creating products:
```
1. Click on each product
2. Go to "Variants" tab
3. Copy the Variant ID (looks like: 123456)
```

---

## 🔑 Step 2: Get API Key

### 1. API Keys

```
Dashboard → Settings → API
→ Create API Key
→ Name: "API Health Monitor Backend"
→ Copy the key (starts with: lmsq_)
```

### 2. Store ID

```
Dashboard → Settings → General
→ Copy Store ID
```

---

## 🔐 Step 3: Configure Webhook

### 1. Create Webhook

```
Dashboard → Settings → Webhooks
→ Create Webhook
→ URL: https://your-api-domain.com/api/subscription/webhooks/lemonsqueezy
→ Secret: (generate a random string)
→ Events: Select all subscription events:
   ✅ subscription_created
   ✅ subscription_updated
   ✅ subscription_cancelled
   ✅ subscription_resumed
   ✅ subscription_expired
```

### 2. Generate Webhook Secret

```bash
# On your machine
openssl rand -hex 32
```

---

## ⚙️ Step 4: Update Backend Config

### 1. Update `.env`

```bash
# LemonSqueezy
LEMONSQUEEZY_API_KEY=lmsq_xxxxxxxxxxxxx
LEMONSQUEEZY_STORE_ID=12345
LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret-from-step-3
```

### 2. Update `app/lemonsqueezy.py`

Replace variant IDs:

```python
PLAN_VARIANTS = {
    "starter": "123456",    # ← Your Starter variant ID
    "pro": "123457",        # ← Your Pro variant ID
    "business": "123458"    # ← Your Business variant ID
}
```

---

## 🧪 Step 5: Test Integration

### 1. Test Checkout

```bash
# Login first
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}

# Get access token, then:
POST /api/subscription/checkout
Authorization: Bearer <token>
{
  "plan": "starter"
}

# Response:
{
  "checkout_url": "https://apihealth.lemonsqueezy.com/checkout/...",
  "plan": "starter"
}
```

### 2. Complete Test Purchase

```
1. Open checkout_url in browser
2. Use LemonSqueezy test card:
   Card: 4242 4242 4242 4242
   Expiry: Any future date
   CVC: Any 3 digits
3. Complete checkout
4. Wait for webhook (check logs)
5. Verify subscription in database
```

### 3. Test Webhook (Local Development)

Use ngrok to expose local server:

```bash
# Install ngrok
# https://ngrok.com/

# Run ngrok
ngrok http 8000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update LemonSqueezy webhook URL to:
# https://abc123.ngrok.io/api/subscription/webhooks/lemonsqueezy
```

---

## 📊 Step 6: Verify Everything Works

### Checklist:

- [ ] Products created in LemonSqueezy
- [ ] Variant IDs updated in code
- [ ] API key configured
- [ ] Webhook configured with correct URL
- [ ] Webhook secret set in .env
- [ ] Test checkout successful
- [ ] Webhook received and processed
- [ ] User plan upgraded in database
- [ ] Monitor limits enforced

---

## 🎯 API Endpoints

### Get Current Subscription

```bash
GET /api/subscription
Authorization: Bearer <token>
```

### Create Checkout (Upgrade)

```bash
POST /api/subscription/checkout
Authorization: Bearer <token>
{
  "plan": "pro"  # starter, pro, or business
}
```

### Cancel Subscription

```bash
POST /api/subscription/cancel
Authorization: Bearer <token>
```

---

## 🔍 Debugging

### Check Logs

```bash
# Backend logs
python -m app.main

# Look for:
"📥 Webhook received: subscription_created"
"✅ Subscription created for user..."
```

### Check Database

```sql
SELECT * FROM subscriptions;
SELECT * FROM users;  -- Check 'plan' column
```

### LemonSqueezy Dashboard

```
Dashboard → Customers
→ Find your test customer
→ Check subscription status
```

### Webhook Logs

```
Dashboard → Settings → Webhooks
→ Click on your webhook
→ View "Recent deliveries"
→ Check response status (should be 200)
```

---

## 🚨 Troubleshooting

### Webhook not receiving?

1. Check URL is correct (HTTPS, publicly accessible)
2. Check webhook secret matches
3. Check signature verification
4. Use ngrok for local testing

### Checkout not working?

1. Verify API key is correct
2. Check variant IDs are correct
3. Check store ID is correct
4. Look for errors in backend logs

### Subscription not updating user?

1. Check webhook is being received
2. Verify custom_data includes user_id
3. Check database for subscription record
4. Look for errors in webhook handler

---

## 💡 Tips

- **Test Mode**: LemonSqueezy has test/live modes. Use test mode during development.
- **Webhooks**: Always verify webhook signatures for security.
- **Retry Logic**: Webhooks may be sent multiple times. Handle idempotently.
- **Logging**: Log all webhook events for debugging.

---

## 🔄 Plan Changes

Users can upgrade/downgrade:

```bash
# Upgrade from starter to pro
POST /api/subscription/checkout
{
  "plan": "pro"
}

# User completes checkout
# Old subscription cancelled
# New subscription created
# Plan updated automatically via webhook
```

---

## 📈 Production Checklist

Before going live:

- [ ] Switch from test mode to live mode in LemonSqueezy
- [ ] Update API key to live key
- [ ] Update webhook URL to production domain
- [ ] Test live checkout with real card
- [ ] Set up email notifications for failed payments
- [ ] Monitor webhook delivery status
- [ ] Set up error alerting (e.g., Sentry)

---

Need help? Check LemonSqueezy docs: https://docs.lemonsqueezy.com/
