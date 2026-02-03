# Architecture Design

## 시스템 아키텍처

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       │ HTTPS
       ▼
┌─────────────┐
│   Vercel    │
│  (Next.js)  │
└──────┬──────┘
       │
       │ API
       ▼
┌─────────────────────────────────┐
│        Railway                   │
│  ┌──────────────────────────┐  │
│  │   FastAPI Backend        │  │
│  │   - REST API             │  │
│  │   - WebSocket Server     │  │
│  │   - Auth (JWT)           │  │
│  └──────────┬───────────────┘  │
│             │                   │
│  ┌──────────▼───────────────┐  │
│  │   PostgreSQL Database    │  │
│  │   - Users                │  │
│  │   - Monitors             │  │
│  │   - Checks               │  │
│  │   - Alerts               │  │
│  │   - Subscriptions        │  │
│  └──────────────────────────┘  │
│                                  │
│  ┌──────────────────────────┐  │
│  │   Redis                  │  │
│  │   - Cache                │  │
│  │   - Session              │  │
│  │   - Celery Broker        │  │
│  └──────────┬───────────────┘  │
│             │                   │
│  ┌──────────▼───────────────┐  │
│  │   Celery Workers         │  │
│  │   - Monitor Checker      │  │
│  │   - Alert Sender         │  │
│  │   - Report Generator     │  │
│  └──────────────────────────┘  │
└─────────────────────────────────┘
       │
       ▼
┌─────────────┐
│   Stripe    │
│  (Payment)  │
└─────────────┘
```

---

## 데이터베이스 스키마

### Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    plan VARCHAR(20) DEFAULT 'free', -- free, starter, pro, business
    stripe_customer_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Monitors
```sql
CREATE TABLE monitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(2048) NOT NULL,
    method VARCHAR(10) DEFAULT 'GET', -- GET, POST, PUT, DELETE
    interval INTEGER DEFAULT 300, -- seconds (5분)
    timeout INTEGER DEFAULT 30, -- seconds
    headers JSONB, -- custom headers
    body TEXT, -- for POST/PUT
    expected_status INTEGER DEFAULT 200,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_monitors_user_id ON monitors(user_id);
CREATE INDEX idx_monitors_is_active ON monitors(is_active);
```

### Checks
```sql
CREATE TABLE checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monitor_id UUID REFERENCES monitors(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL, -- up, down, degraded
    status_code INTEGER,
    response_time INTEGER, -- milliseconds
    error_message TEXT,
    checked_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_checks_monitor_id ON checks(monitor_id);
CREATE INDEX idx_checks_checked_at ON checks(checked_at);
```

### Alert_Channels
```sql
CREATE TABLE alert_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- email, slack, telegram, discord, webhook
    config JSONB NOT NULL, -- channel-specific config
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Monitor_Alert_Channels (Many-to-Many)
```sql
CREATE TABLE monitor_alert_channels (
    monitor_id UUID REFERENCES monitors(id) ON DELETE CASCADE,
    alert_channel_id UUID REFERENCES alert_channels(id) ON DELETE CASCADE,
    PRIMARY KEY (monitor_id, alert_channel_id)
);
```

### Subscriptions
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(100) UNIQUE,
    plan VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL, -- active, canceled, past_due
    current_period_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## API 엔드포인트

### Auth
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 유저 정보

### Monitors
- `GET /api/monitors` - 모니터 목록
- `POST /api/monitors` - 모니터 생성
- `GET /api/monitors/:id` - 모니터 상세
- `PUT /api/monitors/:id` - 모니터 수정
- `DELETE /api/monitors/:id` - 모니터 삭제
- `GET /api/monitors/:id/checks` - 체크 히스토리

### Alert Channels
- `GET /api/alert-channels` - 알림 채널 목록
- `POST /api/alert-channels` - 알림 채널 생성
- `PUT /api/alert-channels/:id` - 알림 채널 수정
- `DELETE /api/alert-channels/:id` - 알림 채널 삭제

### Subscriptions
- `GET /api/subscription` - 구독 정보
- `POST /api/subscription/checkout` - 결제 시작
- `POST /api/subscription/cancel` - 구독 취소
- `POST /api/webhooks/stripe` - Stripe 웹훅

### Public
- `GET /api/public/status/:monitor_id` - 공개 상태 페이지

---

## Celery 작업

### Periodic Tasks

#### check_monitors (매분 실행)
```python
@celery.task
def check_monitors():
    """
    현재 시각에 체크해야 할 모니터들을 찾아서 체크
    """
    now = int(time.time())
    monitors = Monitor.query.filter(
        Monitor.is_active == True,
        Monitor.next_check_at <= now
    ).all()
    
    for monitor in monitors:
        check_single_monitor.delay(monitor.id)
```

#### check_single_monitor (개별 모니터 체크)
```python
@celery.task
def check_single_monitor(monitor_id):
    """
    1. HTTP 요청
    2. 응답 확인
    3. DB 저장
    4. 상태 변경 시 알림 발송
    """
    monitor = Monitor.get(monitor_id)
    
    try:
        start = time.time()
        response = requests.request(
            method=monitor.method,
            url=monitor.url,
            timeout=monitor.timeout,
            headers=monitor.headers
        )
        response_time = int((time.time() - start) * 1000)
        
        # 상태 판정
        if response.status_code == monitor.expected_status:
            status = 'up'
        else:
            status = 'degraded'
            
        # DB 저장
        check = Check.create(
            monitor_id=monitor.id,
            status=status,
            status_code=response.status_code,
            response_time=response_time
        )
        
        # 상태 변경 감지
        if monitor.last_status != status:
            send_alerts.delay(monitor.id, status)
            
    except Exception as e:
        # 다운 상태
        check = Check.create(
            monitor_id=monitor.id,
            status='down',
            error_message=str(e)
        )
        
        if monitor.last_status != 'down':
            send_alerts.delay(monitor.id, 'down')
```

#### send_alerts (알림 발송)
```python
@celery.task
def send_alerts(monitor_id, status):
    """
    해당 모니터의 모든 알림 채널로 메시지 발송
    """
    monitor = Monitor.get(monitor_id)
    channels = monitor.alert_channels
    
    for channel in channels:
        if channel.type == 'email':
            send_email_alert(channel, monitor, status)
        elif channel.type == 'slack':
            send_slack_alert(channel, monitor, status)
        elif channel.type == 'telegram':
            send_telegram_alert(channel, monitor, status)
        # ...
```

---

## 보안

### Authentication
- JWT 토큰 (Access + Refresh)
- Access Token: 15분 유효
- Refresh Token: 7일 유효
- HttpOnly 쿠키 저장

### Authorization
- 각 리소스에 대한 소유권 검증
- Plan 별 리소스 제한 (monitors 개수, interval 등)

### Rate Limiting
- IP 기반: 100 requests/분
- User 기반: 1000 requests/시간
- Stripe webhook: IP 화이트리스트

---

## 성능 최적화

### Caching
- User 정보: 5분 캐싱
- Monitor 목록: 1분 캐싱
- Check 통계: 10분 캐싱

### Database Indexing
- monitors(user_id, is_active)
- checks(monitor_id, checked_at)
- 복합 인덱스 활용

### Connection Pooling
- PostgreSQL: 최대 20 connections
- Redis: 최대 50 connections

---

## 확장성

### Horizontal Scaling
- FastAPI: Stateless, 여러 인스턴스 실행 가능
- Celery Workers: 부하에 따라 Worker 수 조절
- PostgreSQL: Read Replica 추가 가능

### Monitoring
- 자기 자신을 모니터링 (Dogfooding)
- 에러 로깅: Sentry
- 메트릭: 자체 대시보드
