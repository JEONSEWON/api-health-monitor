# Railway 배포 가이드

## 🚀 Railway 백엔드 배포

### 1. Railway 프로젝트 생성

```
1. railway.app 접속
2. GitHub로 로그인
3. "New Project" 클릭
4. "Deploy from GitHub repo" 선택
5. api-health-monitor 레포 선택
6. "Add variables" 클릭
```

---

### 2. 환경 변수 설정

Railway 대시보드에서 다음 환경 변수 추가:

```bash
# 필수
DATABASE_URL=sqlite:///./api_monitor.db
REDIS_URL=${{REDIS_URL}}
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this

# 선택 (나중에 추가 가능)
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=
SENDGRID_API_KEY=
FROM_EMAIL=noreply@yourdomain.com

# 자동 설정됨
PORT=${{PORT}}
```

**중요:**
- `JWT_SECRET_KEY`는 랜덤한 긴 문자열로 변경하세요
- `DATABASE_URL`은 SQLite로 시작 (나중에 PostgreSQL로 변경 가능)

---

### 3. Redis 추가

```
1. Railway 프로젝트 내에서
2. "New" → "Database" → "Add Redis"
3. Redis가 자동으로 연결됨
4. ${{REDIS_URL}} 변수가 자동 생성됨
```

---

### 4. Root Directory 설정

Railway는 프로젝트 루트를 보므로 설정 필요:

```
1. Settings 탭
2. "Root Directory" → backend 입력
3. Save
```

---

### 5. 배포 시작

```
1. "Deploy" 버튼 클릭
2. 빌드 로그 확인
3. 성공하면 URL 생성됨
   예: https://api-health-monitor-production.up.railway.app
```

---

### 6. 확인

배포된 URL 접속:
```
https://your-project.up.railway.app/
```

응답:
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "timestamp": "..."
}
```

API 문서:
```
https://your-project.up.railway.app/docs
```

---

## ✅ 체크리스트

- [ ] Railway 계정 생성
- [ ] GitHub 연동
- [ ] 프로젝트 생성
- [ ] 환경 변수 설정
- [ ] Redis 추가
- [ ] Root Directory 설정
- [ ] 배포 성공
- [ ] URL 확인

---

## 🔧 트러블슈팅

### 빌드 실패
```bash
# requirements.txt 확인
# Python 버전 확인 (runtime.txt)
```

### 서버 시작 실패
```bash
# 로그 확인
# 환경 변수 확인
# DATABASE_URL 확인
```

### Redis 연결 실패
```bash
# Redis 서비스 추가 확인
# ${{REDIS_URL}} 변수 확인
```

---

## 💰 비용

**무료 플랜:**
- $5 무료 크레딧/월
- 소규모 프로젝트에 충분

**예상 비용:**
- 처음 몇 달: 무료
- 이후: ~$5-10/월

---

다음: Vercel 프론트엔드 배포
