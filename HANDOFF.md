# 링크잇 세미딜러 포털 — 핸드오프 문서

작성일: 2026-06-04  
레포: `jkattach/jk`  
브랜치: `claude/create-semi-dealer-page-Yx8pg` → main에 병합됨  
배포 URL: https://link-iota-seven.vercel.app/semi-dealer

---

## 1. 프로젝트 개요

링크잇의 **비공개 파트너(세미딜러) 전용 발주 포털**.  
외부에 노출되지 않는 별도 경로(`/semi-dealer`)로 접근하며, 일반 앱 네비게이션(BottomNav)과 완전히 분리되어 있다.

---

## 2. 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | React 19 + Vite |
| 라우팅 | React Router v7 |
| 스타일 | Tailwind CSS v3 |
| 상태관리 | React useState / localStorage |
| 인증 | localStorage 기반 (백엔드 미연동) |
| 배포 | Vercel (SPA 라우팅: vercel.json rewrite) |
| 패키지 | @supabase/supabase-js 설치됨 (미연동) |

---

## 3. 파일 구조

```
linkit-web/
├── src/
│   ├── App.jsx                          # 라우트 등록, 세미딜러 레이아웃 분기
│   └── pages/
│       └── semi-dealer/
│           ├── SemiDealerLanding.jsx    # 로그인 페이지 (/semi-dealer)
│           ├── SemiDealerApply.jsx      # 가입 신청 폼 (/semi-dealer/apply)
│           └── SemiDealerDashboard.jsx  # 파트너 대시보드 (/semi-dealer/dashboard)
└── vercel.json                          # SPA 라우팅 rewrite
```

---

## 4. 화면별 설명

### 4-1. 로그인 (`/semi-dealer`)
- 전화번호 + 비밀번호 입력
- 인증 방식: localStorage `sd_users` 배열에서 일치하는 계정 탐색
- 시드 계정(코드 내 하드코딩): `9652` / `9652`
- 로그인 성공 시 `sd_session`에 사용자 정보 저장 → `/semi-dealer/dashboard` 이동

### 4-2. 가입 신청 (`/semi-dealer/apply`)
- 필드: 이름(필수), 전화번호(필수), 비밀번호(필수, 6자+), 비밀번호 확인, 활동 지역, **별명**(선택), 메모(선택)
- 제출 시 `sd_users` localStorage 배열에 추가
- 중복 전화번호 차단
- 실제 승인 흐름 없음 (TODO: Supabase 연동)

### 4-3. 대시보드 (`/semi-dealer/dashboard`)
- 세션 없으면 로그인 페이지로 자동 리다이렉트
- 탭 4개: **홈 / 소개링크 / 주문 / 설정**

| 탭 | 내용 |
|----|------|
| 홈 | 프로필 카드(실제 이름 표시), 이달 소개 통계, 최근 주문, 소개 링크 미리보기 |
| 소개링크 | `linkit.kr/ref/{code}` 형태 레퍼럴 링크 목록, 클릭/전환 수, 복사 버튼 |
| 주문 | 주문 목록 (접수대기 / 처리중 / 배송완료) |
| 설정 | 프로필, 계정 메뉴, 로그아웃 |

> **주문·소개링크 데이터는 현재 MOCK 데이터.** 실제 API 연동 필요.

---

## 5. 인증 구조 (현재)

```
가입 신청
  └─ localStorage['sd_users'] 에 { name, phone, password, region, nickname, joinedAt } 저장

로그인
  └─ SEED 계정 + sd_users 합쳐서 phone+password 비교
  └─ 일치 시 localStorage['sd_session'] 저장

대시보드
  └─ sd_session 없으면 /semi-dealer 리다이렉트
  └─ sd_session.name 으로 실제 이름 표시

로그아웃
  └─ sd_session 삭제
```

---

## 6. 테스트 계정

| 전화번호 | 비밀번호 |
|---------|---------|
| `9652` | `9652` |

---

## 7. 디자인 토큰

| 역할 | 값 |
|------|----|
| 메인 오렌지 | `#F97316` (Tailwind `orange-500`) |
| 배경 | `#F9FAFB` (Tailwind `gray-50`) |
| 텍스트 기본 | `#111827` (Tailwind `gray-900`) |
| 보조 텍스트 | `#9CA3AF` (Tailwind `gray-400`) |

---

## 8. 남은 TODO

| 항목 | 우선순위 |
|------|---------|
| Supabase 연동 (가입/로그인/주문/링크 실데이터) | 높음 |
| 관리자 승인 후 로그인 활성화 흐름 | 높음 |
| 주문 신청 폼 (대시보드 주문 탭 → 실제 제출) | 중간 |
| 소개링크 실 클릭/전환 트래킹 | 중간 |
| 비밀번호 분실 처리 | 낮음 |
| PWA / 홈 화면 추가 안내 | 낮음 |

---

## 9. 로컬 실행

```bash
cd linkit-web
npm install
npm run dev
# http://localhost:5173/semi-dealer
```

## 10. 배포

Vercel에 `linkit-web` 디렉토리가 루트로 연결됨.  
`main` 브랜치 push 시 자동 배포.
