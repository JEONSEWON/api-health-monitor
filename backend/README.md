# API Health Monitor - Backend

FastAPI backend for API Health Monitor SaaS.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Setup Database

```bash
# Install PostgreSQL locally or use Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=api_health_monitor -p 5432:5432 -d postgres:15

# Update .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/api_health_monitor
```

### 4. Setup Redis

```bash
# Install Redis locally or use Docker
docker run --name redis -p 6379:6379 -d redis:7

# Update .env
REDIS_URL=redis://localhost:6379/0
```

### 5. Run Server

```bash
cd backend
python -m app.main
```

Server will start at: http://localhost:8000

- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app
│   ├── config.py         # Settings
│   ├── database.py       # DB connection
│   ├── models.py         # SQLAlchemy models
│   ├── schemas.py        # Pydantic schemas
│   ├── auth.py           # Auth utilities
│   └── routers/          # API routes
│       ├── __init__.py
│       └── auth.py       # Auth endpoints
├── tests/                # Tests (TODO)
├── requirements.txt      # Dependencies
├── .env.example          # Example environment
└── README.md
```

## 🔐 Authentication

### Register

```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Login

```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer"
}
```

### Get Current User

```bash
GET /api/auth/me
Authorization: Bearer <access_token>
```

## 📊 Database Models

- **User**: User accounts
- **Monitor**: URLs/APIs to monitor
- **Check**: Health check results
- **AlertChannel**: Notification channels
- **Subscription**: Payment subscriptions

## 🛠️ Development

### Run with auto-reload

```bash
uvicorn app.main:app --reload
```

### Create migration (Alembic - TODO)

```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Run tests (TODO)

```bash
pytest
```

## 🚀 Run Celery Worker

Celery handles background tasks (health checks, alerts).

### Terminal 1: Run FastAPI

```bash
cd backend
python -m app.main
```

### Terminal 2: Run Celery Worker & Beat

```bash
cd backend
./run_celery.sh
```

Or manually:

```bash
# Worker
celery -A app.celery_app worker --loglevel=info

# Beat (scheduler) - in another terminal
celery -A app.celery_app beat --loglevel=info
```

---

## 📝 TODO

- [x] Monitor CRUD endpoints ✅
- [x] Celery worker setup ✅
- [x] Health check logic ✅
- [ ] Alert channel endpoints
- [ ] Alert sending logic (Email, Slack, etc.)
- [ ] LemonSqueezy integration
- [ ] Email notifications
- [ ] Unit tests
- [ ] Integration tests

## 🔗 API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Monitors ✅
- `GET /api/monitors` - List monitors
- `POST /api/monitors` - Create monitor
- `GET /api/monitors/:id` - Get monitor
- `PUT /api/monitors/:id` - Update monitor
- `DELETE /api/monitors/:id` - Delete monitor
- `GET /api/monitors/:id/checks` - Get check history
- `POST /api/monitors/:id/pause` - Pause monitor
- `POST /api/monitors/:id/resume` - Resume monitor

### Alert Channels (TODO)
- `GET /api/alert-channels` - List channels
- `POST /api/alert-channels` - Create channel
- `PUT /api/alert-channels/:id` - Update channel
- `DELETE /api/alert-channels/:id` - Delete channel

## 🌐 Environment Variables

See `.env.example` for all configuration options.

Key variables:
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `JWT_SECRET_KEY` - Secret for JWT tokens
- `LEMONSQUEEZY_API_KEY` - LemonSqueezy API key
- `SENDGRID_API_KEY` - SendGrid for emails

## 📦 Deployment

### Railway

1. Create new project on Railway
2. Add PostgreSQL and Redis services
3. Connect GitHub repo
4. Set environment variables
5. Deploy!

Railway will auto-detect requirements.txt and run the app.

---

Built with ❤️ using FastAPI
