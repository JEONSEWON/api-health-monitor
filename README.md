# 🚀 API Health Monitor

> **Monitor your APIs 24/7 with instant alerts**  
> Simple, powerful, and affordable API monitoring for developers and teams.

[![Website](https://img.shields.io/badge/Website-checkapi.io-green)](https://checkapi.io)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688.svg)](https://fastapi.tiangolo.com)
[![Built with Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)

---

## 📖 Overview

API Health Monitor is a full-stack SaaS application that monitors your APIs and websites 24/7, sending instant alerts when something goes wrong.

**🌐 Live Demo:** [https://checkapi.io](https://checkapi.io)

**🤖 Built with AI:** This entire project was built in 6 weeks using [OpenClaw](https://openclaw.com) - an AI coding assistant that actually executes code, deploys to production, and manages the entire development workflow. What would normally take 3-4 months was completed in 6 weeks thanks to AI-assisted development.

### ✨ Key Features

- 🔄 **Automatic Health Checks** - Monitor APIs every 1-5 minutes
- 📬 **Multi-Channel Alerts** - Email, Slack, Telegram, Discord, Webhook
- 📊 **Real-Time Analytics** - Uptime tracking, response times, incident logs
- 🌍 **Public Status Pages** - Share your API status with customers
- 💳 **Built-in Payments** - LemonSqueezy subscription management
- 🎨 **Modern UI** - Clean dashboard built with Next.js 14 & Tailwind CSS

---

## 🎯 Why API Health Monitor?

| Feature | API Health Monitor | Pingdom | UptimeRobot |
|---------|-------------------|---------|-------------|
| **Price** | $5-15/month | $15-75/month | $8-60/month |
| **Setup Time** | < 60 seconds | 5+ minutes | 3+ minutes |
| **UI/UX** | Modern (2024) | Outdated | Basic |
| **Open Source** | ✅ Yes | ❌ No | ❌ No |
| **Alert Channels** | 5 | 3 | 4 |

**🎯 50% cheaper. 10x faster setup. Modern design.**

---

## 🚀 Tech Stack

### Backend
- **Framework:** FastAPI (Python 3.12)
- **Database:** SQLite (Production: Railway Volume)
- **Cache & Queue:** Redis
- **Task Queue:** Celery + Beat
- **ORM:** SQLAlchemy
- **Auth:** JWT (RS256)
- **Payment:** LemonSqueezy

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **HTTP Client:** Axios with auto token refresh
- **UI Components:** Custom components

### Infrastructure
- **Frontend:** Vercel (Edge Network)
- **Backend:** Railway (API + Worker)
- **Database:** Railway SQLite Volume
- **Redis:** Railway Redis
- **Domain:** checkapi.io
- **Monitoring:** Self-hosted (dogfooding!)

---

## 📦 Project Structure

```
api-health-monitor/
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── routers/      # API routes
│   │   ├── models.py     # SQLAlchemy models
│   │   ├── schemas.py    # Pydantic schemas
│   │   ├── auth.py       # JWT authentication
│   │   ├── tasks.py      # Celery tasks
│   │   ├── alerts.py     # Alert integrations
│   │   └── lemonsqueezy.py # Payment integration
│   └── requirements.txt
├── frontend/             # Next.js frontend
│   ├── app/             # App Router pages
│   ├── components/      # React components
│   ├── lib/            # Utilities & API client
│   └── package.json
└── docs/               # Documentation
```

---

## 🎨 Screenshots

> *Screenshots will be added here*

### Landing Page
![Landing](./screenshots/landing.png)

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Monitor Details
![Monitor](./screenshots/monitor-detail.png)

### Alert Channels
![Alerts](./screenshots/alerts.png)

---

## 💰 Pricing

| Plan | Price | Monitors | Check Interval | Features |
|------|-------|----------|----------------|----------|
| **Free** | $0 | 3 | 5 minutes | Email alerts, Public status page |
| **Starter** | $5/month | 20 | 1 minute | All alert channels, Analytics |
| **Pro** | $15/month | 100 | 30 seconds | Team sharing, Priority support |
| **Business** | $49/month | Unlimited | 10 seconds | Custom features, SLA |

**🎁 Free plan available. No credit card required.**

---

## 🔧 Features in Detail

### 1. Monitoring
- ✅ HTTP/HTTPS endpoints
- ✅ GET, POST, PUT, DELETE methods
- ✅ Custom headers & body
- ✅ Response time tracking
- ✅ Status code validation
- ✅ Automatic retries

### 2. Alerts
- ✅ **Email** - via SendGrid
- ✅ **Slack** - Webhook integration
- ✅ **Telegram** - Bot alerts
- ✅ **Discord** - Webhook alerts
- ✅ **Custom Webhook** - POST JSON

### 3. Analytics
- ✅ Uptime percentage (24h, 7d, 30d, 90d)
- ✅ Average response time
- ✅ Total checks & incidents
- ✅ Daily uptime history (90 days)
- ✅ Response time trends

### 4. Public Status Page
- ✅ Real-time status display
- ✅ Uptime history
- ✅ Incident timeline
- ✅ Custom domain support (coming soon)
- ✅ No authentication required

### 5. Subscription Management
- ✅ LemonSqueezy checkout
- ✅ Automatic plan upgrades
- ✅ Webhook processing
- ✅ Plan limits enforcement
- ✅ Subscription cancellation

---

## 🛠️ Development

### Prerequisites
- Python 3.12+
- Node.js 18+
- Redis
- Git

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
python -m app.database

# Run backend
uvicorn app.main:app --reload

# Run Celery worker (separate terminal)
celery -A app.celery_app worker --loglevel=info

# Run Celery beat (separate terminal)
celery -A app.celery_app beat --loglevel=info
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local
# Edit .env.local with your API URL

# Run development server
npm run dev
```

Visit:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🚢 Deployment

### Backend (Railway)

1. Create new project on [Railway](https://railway.app)
2. Add PostgreSQL plugin (or use SQLite)
3. Add Redis plugin
4. Connect GitHub repo
5. Add environment variables
6. Create Worker service (same repo, different start command)
7. Deploy!

**Backend Start Command:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Worker Start Command:**
```bash
celery -A app.celery_app worker --beat --loglevel=info --concurrency=2
```

### Frontend (Vercel)

1. Import project on [Vercel](https://vercel.com)
2. Select `frontend` as root directory
3. Add environment variables
4. Deploy!

---

## 📚 API Documentation

Full API documentation is available at `/docs` endpoint (Swagger UI).

### Quick Start

```bash
# Register
curl -X POST https://api-health-monitor-production.up.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'

# Login
curl -X POST https://api-health-monitor-production.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Create Monitor
curl -X POST https://api-health-monitor-production.up.railway.app/api/v1/monitors/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My API",
    "url": "https://api.example.com/health",
    "method": "GET",
    "interval": 300,
    "timeout": 30,
    "expected_status": 200
  }'
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [OpenClaw](https://openclaw.com/) - AI coding assistant that made this project possible in 6 weeks
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Next.js](https://nextjs.org/) - React framework
- [LemonSqueezy](https://lemonsqueezy.com/) - Payment processing
- [Railway](https://railway.app/) - Backend hosting
- [Vercel](https://vercel.com/) - Frontend hosting

---

## 📧 Contact

- **Website:** [https://checkapi.io](https://checkapi.io)
- **Email:** support@checkapi.io
- **Twitter:** [@checkapi_io](https://twitter.com/checkapi_io)

---

**Built with ❤️ by indie hackers, for indie hackers.**

**🌟 Star this repo if you find it useful!**
