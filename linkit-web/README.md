# 수산 회전링크 판매 관리 시스템

회전링크 제품 소개, 견적서 링크 발송, 구매 확정~장착 완료 워크플로우, 역할별 대시보드를 제공하는 반응형 웹앱.

- **스택**: Next.js 16 (App Router, TS) · Supabase (Postgres/Auth/Storage) · Tailwind v4 + shadcn/ui · Resend
- **Supabase 프로젝트**: `susan-sales` (`pdpcvosydbxgzfactjty`, ap-northeast-2)

## 실행

```bash
npm install
npm run dev   # http://localhost:3000
```

`.env.local` 필요 (`.env.example` 참고):

| 변수 | 설명 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 프로젝트 접속 정보 (설정됨) |
| `SUPABASE_SERVICE_ROLE_KEY` | 대시보드 > Settings > API Keys에서 복사. 현재 필수 아님(공개 견적은 definer RPC 사용) |
| `RESEND_API_KEY` | resend.com API 키. 없으면 이메일은 발송 생략되고 notifications에 queued로 기록 |
| `NEXT_PUBLIC_SITE_URL` | 배포 도메인 (링크 생성용) |

## 역할과 흐름

- **관리자(admin)**: 회원 승인·역할 부여, 제품 관리, 전체 데이터 조회, 주문 승인/일정 확정
- **판매자(seller)**: 본인 고객·견적·주문만 조회, 견적 작성·링크 발송
- **장착자(installer)**: 배정된 주문 조회, 장착 완료 체크 (모바일 최적화)

판매 흐름: 견적 작성 → 링크 발송(`/q/[token]`, 비로그인 열람) → 고객 구매 확정 → 주문 자동 생성 → 본사 승인 → 출하 일정 → 장착 일정·작업자 확정 → 장착 완료 → 구조변경 서류 전달. 상태 전이는 DB 함수 `advance_order_status()`가 단일 진입점(권한·전이 규칙·이력 기록)이며 단계별 이메일이 발송됩니다.

테스트 계정(개발용, 비밀번호 `test1234`): `admin@susan.test`, `seller@susan.test`, `installer@susan.test`

## 남은 수동 설정 (운영 전 필수)

1. **Google OAuth**: GCP Console에서 OAuth 클라이언트 생성 → 리다이렉트 URI `https://pdpcvosydbxgzfactjty.supabase.co/auth/v1/callback` 등록 → Supabase 대시보드 > Auth > Providers > Google에 ID/Secret 입력
2. **카카오 OAuth**: Kakao Developers 앱 생성, 카카오 로그인 활성화 + 위 리다이렉트 URI 등록, Supabase > Auth > Providers > Kakao에 REST API 키/Secret 입력. **이메일 필수 동의를 위해 비즈 앱 전환(사업자번호 인증) 필요 — 심사에 수일 소요되므로 미리 신청**
3. **Resend**: API 키 발급 + 회사 도메인 SPF/DKIM 등록 후 `RESEND_API_KEY`, `EMAIL_FROM` 설정
4. **Vercel 배포**: 저장소 연결, 환경변수 등록, 배포 후 Supabase > Auth > URL Configuration에 배포 도메인 추가 (미설정 시 OAuth가 localhost로 리다이렉트됨)
5. **Supabase Auth**: Leaked password protection 활성화 권장 (대시보드 > Auth > Settings)
6. **첫 관리자**: 실계정 가입 후 SQL로 `update profiles set role='admin', status='active' where email='...'`
7. 운영 전 테스트 계정(@susan.test) 및 테스트 데이터 삭제

## 구조 메모

- `supabase/migrations/` — 적용된 스키마 기록 (0001~0007). RLS: 관리자 전체, 판매자/장착자는 본인 관련 데이터만
- `src/lib/workflow.ts` — 상태 전이 UI 맵 (진실의 원천은 DB 함수)
- `src/server/actions/` — 모든 데이터 변경 (Server Actions)
- 공개 견적 페이지는 `get_quote_by_token` definer RPC 사용 — service role 키 불필요, noindex 처리됨

## 2차 범위 (예정)

캘린더 뷰·.ics 저장, 장착일 D-1 사전 알림(pg_cron + Edge Function), 카카오 알림톡, 구조변경 서류(사업자·차량등록증 업로드), 서류 재발급 + 수수료 청구
