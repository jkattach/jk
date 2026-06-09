# 착착(Chakchak) 플랫폼 + 링크잇 세미딜러 포털 — 통합 핸드오프 문서

작성일: 2026-06-09  
레포: `jkattach/jk`  
브랜치: `claude/create-semi-dealer-page-Yx8pg` (PR #3, draft)

---

## 1. 프로젝트 구조

```
jk/
├── linkit-web/          React + Vite — 세미딜러 포털 (기존 운영 중)
├── chakchak/            Next.js 14 + TS — 착착 플랫폼 (신규, P1 W1 완료)
├── .github/
│   └── workflows/
│       └── deploy-chakchak.yml   Vercel 자동배포 워크플로우
└── HANDOFF.md
```

---

## 2. 착착(Chakchak) 플랫폼

### 2-1. 개요
중장비 어태치먼트(브레이커·크러셔·버킷 등) **역경매 플랫폼**.  
소비자가 견적 1회 요청 → 대리점들이 경쟁 입찰 → 소비자가 최저가 선택.

### 2-2. 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS |
| 백엔드 | Supabase (Auth + DB + Realtime + RLS) |
| 인증 | Google OAuth + Kakao Custom OIDC |
| 알림 | Telegram Bot + Web Push |
| 배포 | Vercel (Root Directory: `chakchak`) |

### 2-3. RBAC — 6개 역할

| 역할 | 포털 진입점 |
|------|------------|
| `customer` | `/` |
| `dealer` | `/dealer/auctions` |
| `semi_dealer` | `/semi/sales` |
| `installer` | `/installer/auctions` |
| `internal_staff` | `/staff/dashboard` |
| `admin` | `/admin/users` |

로그인 후 `lib/auth/rbac.ts`의 `requireAuth()` → 역할별 홈으로 자동 리다이렉트.

### 2-4. 파일 구조 (P1 W1 완료분)

```
chakchak/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                      홈 (카탈로그 + 역경매 소개)
│   │   ├── login/page.tsx                Google + Kakao 로그인
│   │   ├── signup/partner/page.tsx       파트너 가입신청
│   │   └── catalog/attachment/
│   │       ├── page.tsx                  카탈로그 목록
│   │       └── [id]/page.tsx             제품 상세
│   ├── (dealer)/dealer/auctions/
│   │   ├── page.tsx                      오픈 경매 리스트
│   │   └── [id]/page.tsx                 묶음 입찰 폼
│   ├── (semi)/semi/
│   │   ├── sales/page.tsx                세미딜러 판매관리
│   │   └── install-auctions/new/page.tsx 장착경매 발주
│   ├── (installer)/installer/auctions/
│   │   └── page.tsx                      장착자 입찰
│   ├── (staff)/staff/matching-queue/
│   │   └── page.tsx                      매칭큐 (가중치 알고리즘)
│   ├── (admin)/admin/approvals/
│   │   └── page.tsx                      파트너 가입 승인
│   └── auth/callback/route.ts            OAuth 콜백 핸들러
├── db/
│   ├── migrations/
│   │   ├── 20260608_init.sql             14개 테이블 + 10종 ENUM DDL
│   │   └── 20260609_rls.sql              RLS 4종 정책
│   └── seed.ts                           시드 12계정 + 어태치먼트 10종
├── lib/
│   ├── auth/rbac.ts                      requireAuth(), ROLE_HOME
│   ├── domain/
│   │   ├── quote.ts                      경매 자동연장 로직
│   │   └── matching.ts                   가중치 매칭 알고리즘
│   ├── notifications/telegram.ts         텔레그램 봇 연동
│   └── supabase/
│       ├── client.ts                     브라우저용 클라이언트
│       ├── server.ts                     서버 컴포넌트용 클라이언트
│       └── admin.ts                      서비스 롤 클라이언트
└── vercel.json                           Vercel 빌드 설정
```

### 2-5. DB 스키마 (14개 테이블)

| 그룹 | 테이블 |
|------|--------|
| 사용자 | `users`, `partner_profiles`, `user_approvals` |
| 카탈로그 | `categories`, `attachments`, `compatibility` |
| 공급망 | `suppliers`, `supplier_attachments` |
| 거래 | `quote_requests`, `quote_bids`, `install_auctions`, `quote_selections` |
| 알림·후기 | `notification_preferences`, `notifications`, `reviews` |

RLS: 사용자 본인 데이터만 / partner_profiles 본인+관리자 / 입찰 입찰자+요청자 / 승인 관리자만

### 2-6. 거래 트랙

**트랙 A (대리점 묶음)**: 소비자 견적요청 → 대리점 본체+장착 묶음 입찰 → 소비자 선택 → 수수료 3%

**트랙 B (세미딜러 발주)**: 세미딜러 본체 직판 → 장착경매 발주 → 장착자 입찰 → 수수료 5% 양방향

### 2-7. 매칭 알고리즘

```
score = 0.40 × 지역일치 + 0.30 × 평점 + 0.20 × 응답속도 + 0.10 × 가격
```

`lib/domain/matching.ts` → `score()` 함수 구현 완료.

### 2-8. 시드 계정 (테스트용)

| 이메일 | 비밀번호 | 역할 |
|--------|---------|------|
| admin@test.com | admin1234 | admin |
| staff@test.com | staff1234 | internal_staff |
| dealer1@test.com | dealer1234 | dealer |
| dealer2@test.com | dealer1234 | dealer |
| semi1@test.com | semi1234 | semi_dealer |
| semi2@test.com | semi1234 | semi_dealer |
| install1@test.com | install1234 | installer |
| install2@test.com | install1234 | installer |
| customer1@test.com | cust1234 | customer |
| customer2@test.com | cust1234 | customer |

### 2-9. 환경변수 (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
NEXT_PUBLIC_FEE_RATE_TRACK_A=0.03
NEXT_PUBLIC_FEE_RATE_TRACK_B=0.05
NEXT_PUBLIC_APP_URL=https://chakchak.vercel.app
```

### 2-10. 로컬 실행

```bash
cd chakchak
npm install
npm run dev
# http://localhost:3000
```

### 2-11. Supabase 초기화

```bash
# Supabase 대시보드 SQL 에디터에서 순서대로 실행:
# 1. db/migrations/20260608_init.sql
# 2. db/migrations/20260609_rls.sql
# 3. npm run seed
```

### 2-12. Vercel 배포

Vercel 대시보드에서 새 프로젝트 생성:
1. Import `jkattach/jk`
2. **Root Directory**: `chakchak`
3. Framework: Next.js (자동 감지)
4. 환경변수 입력 후 Deploy

자동배포 워크플로우: `.github/workflows/deploy-chakchak.yml`  
트리거: `main` 브랜치에 `chakchak/**` 경로 push 시

필요한 GitHub Secrets:
- `VERCEL_TOKEN` → vercel.com/account/tokens
- `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` → Vercel 프로젝트 생성 후 `.vercel/project.json`
- Supabase 키 3종 + 기타 환경변수

### 2-13. 남은 구현 로드맵

| 단계 | 내용 | 기간 |
|------|------|------|
| P1 W2 | 카탈로그 UI 완성 | 1주 |
| P1 W3 | 파트너 가입·관리자 승인 플로우 | 1주 |
| P2 W4–W6 | 트랙 A 견적 4단계 + 딜러 입찰 | 3주 |
| P3 W7–W9 | 트랙 B 세미딜러 발주 + 매칭 | 3주 |
| P4 W10–W12 | 정산·후기·관리자 대시보드 | 3주 |

---

## 3. 링크잇 세미딜러 포털 (linkit-web)

### 3-1. 개요
링크잇의 비공개 파트너(세미딜러) 전용 발주 포털.  
배포 URL: https://link-iota-seven.vercel.app/semi-dealer

### 3-2. 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | React 19 + Vite |
| 라우팅 | React Router v7 |
| 스타일 | Tailwind CSS v3 |
| 인증 | localStorage 기반 (백엔드 미연동) |
| 배포 | Vercel (link-iota-seven.vercel.app) |

### 3-3. 파일 구조

```
linkit-web/
├── src/
│   ├── App.jsx
│   └── pages/semi-dealer/
│       ├── SemiDealerLanding.jsx    로그인 (/semi-dealer)
│       ├── SemiDealerApply.jsx      가입신청 (/semi-dealer/apply)
│       └── SemiDealerDashboard.jsx  대시보드 (/semi-dealer/dashboard)
├── public/
│   ├── pagemap.html                 전체 페이지트리 (37페이지, 6그룹)
│   └── 통합명부_v5.html             딜러 연락처 160+건 (5탭)
└── vercel.json                      SPA rewrite
```

### 3-4. 테스트 계정

| 전화번호 | 비밀번호 |
|---------|---------|
| `9652` | `9652` |

### 3-5. 인증 구조

```
가입: localStorage['sd_users'] 에 저장
로그인: SEED 계정 + sd_users 합쳐서 비교 → sd_session 저장
대시보드: sd_session 없으면 리다이렉트
```

### 3-6. 대시보드 탭

| 탭 | 내용 |
|----|------|
| 홈 | 프로필, 이달 통계, 최근 주문 |
| 소개링크 | 레퍼럴 링크 목록 (MOCK) |
| 주문 | 주문 현황 (MOCK) |
| 설정 | 프로필, 로그아웃 |

### 3-7. 남은 TODO

| 항목 | 우선순위 |
|------|---------|
| Supabase 연동 (실데이터) | 높음 → P4에서 착착으로 통합 예정 |
| 통합명부 v5 → `/admin/suppliers` 이전 | 낮음 (P4) |

---

## 4. Git 이력

| 커밋 | 내용 |
|------|------|
| `3a1cd4b` | ci: Vercel 자동배포 워크플로우 + vercel.json 추가 |
| `04fc330` | feat: 착착 P1 W1 — Next.js 14 앱 신규 생성 |
| `41e0422` | docs: 전체 페이지맵 HTML 추가 |
| `46ebe5d` | docs: 세미딜러 핸드오프 문서 |
| `d2ca542` | chore: 테스트계정 9652/9652 변경 |

브랜치: `claude/create-semi-dealer-page-Yx8pg`  
PR: https://github.com/jkattach/jk/pull/3 (Draft)

---

## 5. 로컬 실행 요약

```bash
# 링크잇 세미딜러 포털
cd linkit-web && npm install && npm run dev
# → http://localhost:5173/semi-dealer

# 착착 플랫폼
cd chakchak && npm install && npm run dev
# → http://localhost:3000
```
