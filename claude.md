# CheckAPI — API Health Monitor
**Live:** https://checkapi.io  
**Backend API:** https://api-health-monitor-production.up.railway.app  
**GitHub:** https://github.com/JEONSEWON/CheckAPI  
**Solo dev:** Sewon Jeon (@imwon_dev) / Axiom Technologies, Seoul 🇰🇷

---

## 프로젝트 구조
api-health-monitor/
├── backend/          # FastAPI 앱
├── frontend/         # Next.js 14
├── design/           # 디자인 파일
├── docs/             # 문서
├── memory/           # 컨텍스트 메모리
└── CLAUDE.md

---

## 기술 스택

### Backend (Python 30.2%)
- **Framework:** FastAPI
- **Task Queue:** Celery + Celery Beat
- **DB:** PostgreSQL (Railway)
- **Cache/Broker:** Redis (Railway)
- **ORM:** SQLAlchemy
- **Auth:** JWT (access + refresh token)
- **Payment:** LemonSqueezy (웹훅 처리 포함)
- **Email:** Resend (이전: SendGrid → 마이그레이션 완료)

### Frontend (TypeScript 66%)
- **Framework:** Next.js 14 App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand
- **HTTP:** Axios (auto token refresh)

### Deployment
- **Backend + Worker + Redis + PostgreSQL:** Railway
- **Frontend:** Vercel (main push → 자동 배포)
- **DNS:** Cloudflare
- **Domain:** checkapi.io

---

## 플랜 구조

| Plan     | Price    | Monitors  | Interval | History | Team         |
|----------|----------|-----------|----------|---------|--------------|
| Free     | $0/mo    | 10        | 5min     | 30 days | ❌           |
| Starter  | $5/mo    | 20        | 1min     | 30 days | ❌           |
| Pro      | $15/mo   | 100       | 30sec    | 90 days | ✅ (5명)     |
| Business | $49/mo   | Unlimited | 10sec    | 1 year  | ✅ (무제한)  |

연간 결제 20% 할인 토글 구현됨.

---

## 완료된 기능 (Production Ready)

### 모니터링
- HTTP/HTTPS (GET/POST/PUT/DELETE/PATCH)
- Custom Headers & Body
- Status Code Validation
- **Silent Failure Detection** ← 핵심 차별점
  - Keyword match (present/absent)
  - Regex pattern matching
  - JSON Path assertions (최대 10개)
  - Header assertion (Content-Type 등)
- SSL Certificate Expiry Alerts (만료 14일 전)
- Response Time Tracking (ms)
- Uptime Calculation (24h / 7d / 30d)
- Heartbeat / Cron Monitoring

### 알림 (5채널 — 모든 플랜 포함)
- Email / Slack / Telegram / Discord / Custom Webhook

### 대시보드 & 분석
- 실시간 모니터 상태
- Response time 차트
- Incident history & timeline
- Public Status Page (`/status/{id}`, 90일 uptime 차트)
- SLA Report (Pro/Business)

### 팀 & 접근제어
- 팀원 이메일 초대
- API Key 관리 (Business 플랜)

### 결제
- LemonSqueezy 연동 (checkout, webhook, subscription, cancel)
- 월/연간 토글

### 백그라운드 잡
- Celery Worker (모니터 주기적 체크)
- Celery Beat (스케줄링)
- 매일 오전 9시: SSL 만료 체크
- 매일 오전 3시: 오래된 데이터 정리

### 기타
- Maintenance Window (알림 억제, 체크는 계속)
- 회원가입 후 자동 로그인
- JWT auto refresh

---

## API 규모
- **Endpoints:** 34개
- **DB Models:** 6개 (User, Monitor, Check, AlertChannel, Subscription, ...)
- **Celery Tasks:** 4개
- **Frontend Pages:** 8개 (Landing, Login, Register, Dashboard, Monitor Detail, Alerts, Analytics, Settings)
- **총 코드:** ~8,000+ LOC
- **Commits:** 205개

---

## 핵심 차별점 (마케팅)
1. **Silent Failure Detection** — HTTP 200이지만 응답 바디가 깨진 경우 감지
2. **Free for Commercial Use** — UptimeRobot과 달리 상업적 제한 없음
3. **무료 플랜에 모든 알림 채널 포함** (Webhook 포함)
4. **모던 UI** + JSON Path assertions

---

## 개발 규칙 (Windows PowerShell)

### 파일 수정 방식
모든 파일 수정은 Python 패치 스크립트로 작성. PowerShell 직접 수정 금지.

패치 스크립트 실행 형식:
Copy-Item "$env:USERPROFILE\Downloads\patch_xxx.py" "C:\home\jeon\api-health-monitor" ; cd C:\home\jeon\api-health-monitor ; python patch_xxx.py

### PowerShell 주의사항
- `&&` 미지원 → `;` 사용
- `head` / `grep` 미지원 → `Get-Content -TotalCount` / `Select-String` 사용
- 대괄호 포함 경로 → `-LiteralPath` 플래그 필요
- `replace()` 실패 시 → `f.readlines()`로 라인 번호 기반 교체

### Git 규칙
패치 성공 후 즉시:
```bash
git add -A ; git commit -m "feat: ..." ; git push
```
**`git push` 반드시 포함** (누락 시 Vercel 자동 배포 안 됨)

### DB 마이그레이션
```powershell
$env:DATABASE_URL="postgresql://..." ; python migrate.py
```

---

## 테스트 계정
- **User ID:** `56b65d9e-fb33-472d-9730-655c82090e67`

---

## 남은 작업 (미결)
- [ ] HN / Reddit 카르마 확보 후 게시
- [ ] Celery 워커 큐 처리 시간 측정 → 알림 속도 차별화
- [ ] 온보딩 체크리스트 (신규 사용자 전환율 개선)

---

## 행동 지침 (Karpathy Rules)

### 1. 코딩 전에 먼저 생각하기
- 가정이 있으면 명시적으로 진술하고 확인 요청
- 여러 해석이 가능하면 모두 제시하고 조용히 선택하지 말 것
- 모호한 부분은 추측하지 말고 반드시 질문

### 2. 단순성 우선
- 요청한 것 이상의 기능을 추가하지 않기
- 불필요한 추상화, 예외 처리, 유연성 제거
- 더 단순하게 쓸 수 있으면 다시 작성

### 3. 외과적 변경
- 요청한 부분만 수정
- 기존 코드 스타일 유지
- 관련 없는 코드 정리, 리팩토링 자제
- 자신의 변경으로 불필요해진 것만 삭제

### 4. 목표 중심 실행
- 성공 기준을 먼저 명확히 정의
- 단계별로 검증하면서 진행
- 테스트 없이 "됐을 것"이라고 가정하지 말 것