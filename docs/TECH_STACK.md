# 기술 스택 상세

## 왜 이 기술들을 선택했나?

---

## 백엔드: FastAPI (Python)

### 장점
✅ **빠른 개발 속도** - Flask보다 생산성 높음  
✅ **자동 문서화** - Swagger UI 자동 생성  
✅ **타입 힌팅** - Pydantic으로 데이터 검증  
✅ **비동기 지원** - 고성능 필요한 부분에 활용  
✅ **생태계** - Python 라이브러리 풍부

### 대안 비교
| 기술 | 장점 | 단점 |
|------|------|------|
| **FastAPI** | 빠른 개발, 자동 문서 | - |
| Node.js/Express | JS 생태계 | 타입 안전성 약함 |
| Go | 성능 최고 | 개발 속도 느림 |
| Django | 기능 많음 | 무겁고 복잡 |

→ **결정: FastAPI** (개발 속도 + 성능 균형)

---

## 프론트엔드: Next.js 14

### 장점
✅ **SEO 최적화** - SSR/SSG 지원  
✅ **App Router** - 최신 React 패턴  
✅ **Vercel 배포** - 원클릭 배포  
✅ **TypeScript** - 타입 안전성  
✅ **성능** - 자동 최적화

### 대안 비교
| 기술 | 장점 | 단점 |
|------|------|------|
| **Next.js** | SEO, 성능, DX | - |
| Vite + React | 빠른 빌드 | SEO 약함 |
| SvelteKit | 경량 | 생태계 작음 |
| Remix | 현대적 | 러닝커브 |

→ **결정: Next.js** (SEO + 생태계 + Vercel)

---

## 데이터베이스: PostgreSQL

### 장점
✅ **안정성** - 프로덕션 검증됨  
✅ **JSONB** - 유연한 데이터 저장  
✅ **확장성** - 대용량 처리 가능  
✅ **무료** - 오픈소스

### 대안 비교
| 기술 | 장점 | 단점 |
|------|------|------|
| **PostgreSQL** | 안정성, 기능 | - |
| MySQL | 대중적 | JSONB 약함 |
| MongoDB | 유연함 | 트랜잭션 약함 |
| SQLite | 간단 | 동시성 약함 |

→ **결정: PostgreSQL** (안정성 + JSONB)

---

## 캐싱/큐: Redis

### 장점
✅ **빠름** - 인메모리 DB  
✅ **다목적** - 캐시 + 세션 + 큐  
✅ **Celery 호환** - Task queue로 사용  
✅ **간단함** - 설정 쉬움

---

## Task Queue: Celery

### 장점
✅ **Python 네이티브** - FastAPI와 통합 쉬움  
✅ **스케줄링** - Cron 같은 주기 작업  
✅ **확장성** - Worker 수평 확장  
✅ **모니터링** - Flower로 모니터링

### 대안 비교
| 기술 | 장점 | 단점 |
|------|------|------|
| **Celery** | 성숙함, 기능 많음 | - |
| Bull (Node.js) | 간단 | Python 아님 |
| RQ | 더 간단 | 기능 적음 |

→ **결정: Celery** (검증됨 + 기능)

---

## UI: Tailwind + shadcn/ui

### 장점
✅ **빠른 개발** - Utility-first CSS  
✅ **모던 디자인** - 2024년 트렌드  
✅ **컴포넌트** - shadcn/ui로 Copy-paste  
✅ **일관성** - 디자인 시스템

### shadcn/ui 특징
- Radix UI 기반 (접근성 좋음)
- 복사해서 사용 (의존성 아님)
- 커스터마이징 쉬움

---

## 결제: Stripe

### 장점
✅ **검증됨** - 세계 1위 결제  
✅ **개발자 친화적** - API 깔끔  
✅ **자동 청구** - 구독 자동 관리  
✅ **다국어** - 글로벌 지원

### 수수료
- 2.9% + $0.30 per transaction
- 월 거래액 $10,000 기준 → 수수료 $320

---

## 호스팅: Railway + Vercel

### Railway (백엔드)
✅ **간단함** - Heroku보다 쉬움  
✅ **저렴함** - $5/월부터  
✅ **PostgreSQL 포함** - 추가 비용 없음  
✅ **자동 배포** - GitHub 연동

### Vercel (프론트엔드)
✅ **무료** - Hobby plan 충분  
✅ **글로벌 CDN** - 전세계 빠름  
✅ **자동 배포** - Git push만  
✅ **Next.js 최적화** - 완벽 호환

### 대안 비교
| 서비스 | 가격 | 장점 | 단점 |
|--------|------|------|------|
| **Railway** | $5/월~ | 간단, PostgreSQL 포함 | - |
| Render | $7/월~ | 안정적 | 더 비쌈 |
| Fly.io | $5/월~ | 글로벌 | 설정 복잡 |
| AWS | 복잡 | 모든 기능 | 비싸고 복잡 |

---

## 비용 계산 (유저 500명 기준)

### 인프라 비용
- **Railway**: $20/월 (Pro plan)
- **Vercel**: $0 (Hobby plan)
- **합계**: $20/월

### 변동 비용
- **Stripe**: 거래액의 2.9%
  - 500명 × $10/월 = $5,000
  - 수수료: $145/월

### 총 비용
- **$165/월** (수익 $5,000 기준)
- **수익률: 97%** 🎉

---

## 개발 환경

### 필수 설치
```bash
# Python 3.11+
python --version

# Node.js 18+
node --version

# PostgreSQL 15+
psql --version

# Redis
redis-cli --version
```

### VS Code 익스텐션
- Python
- Pylance
- Prettier
- Tailwind CSS IntelliSense
- ES7+ React/Redux snippets

---

## CI/CD

### GitHub Actions
```yaml
# .github/workflows/deploy.yml

- 백엔드: Railway 자동 배포
- 프론트엔드: Vercel 자동 배포
- 테스트: pytest 자동 실행
```

---

## 모니터링

### 자체 모니터링 (Dogfooding)
- API 엔드포인트를 자기 서비스로 모니터링
- 문제 발생 시 텔레그램 알림

### 로깅
- FastAPI: structlog
- 레벨: ERROR 이상만 저장

### 에러 추적
- Sentry (선택사항, 나중에 추가)

---

## 보안

### 인증
- JWT (Access + Refresh Token)
- bcrypt (비밀번호 해싱)

### HTTPS
- Railway: 자동 HTTPS
- Vercel: 자동 HTTPS

### 환경 변수
```bash
# .env (절대 커밋하지 않음)
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
STRIPE_SECRET_KEY=
```

---

## 확장 계획

### Phase 1 (MVP)
- 기본 모니터링
- 이메일 알림
- Stripe 결제

### Phase 2 (3개월 후)
- Slack/Discord/Telegram 알림
- Public status page
- CLI 도구

### Phase 3 (6개월 후)
- 팀 기능
- API access
- Advanced analytics

---

## 개발 시작 전 체크리스트

- [ ] GitHub 레포지토리 생성
- [ ] Railway 계정 생성
- [ ] Vercel 계정 생성
- [ ] Stripe 계정 생성
- [ ] 도메인 구매 (선택사항)
- [ ] 로컬 환경 설정 (Python, Node.js, PostgreSQL, Redis)

---

다음 단계: 백엔드 개발 시작! 🚀
