@AGENTS.md

# 수산 회전링크 판매 관리 시스템

특장차 부품(회전링크) 판매·장착 관리 반응형 웹앱. 전체 개요·역할·남은 수동 설정은 [README.md](README.md) 참고.

## 스택 / 환경

- Next.js 16 (App Router, TS, Turbopack) + Tailwind v4 + shadcn/ui + Supabase + Resend
- Supabase 프로젝트: **susan-sales** (`pdpcvosydbxgzfactjty`, ap-northeast-2) — DB는 클라우드에 있고 `.env.local`로 접속 (이 파일은 git에 없음, 별도 전달 필요)
- 미들웨어는 Next 16 컨벤션인 `src/proxy.ts` 사용 (middleware.ts 아님)

## 주의: shadcn/ui 신버전 (Base UI 기반, Radix 아님)

- `asChild` 없음 → `<Button nativeButton={false} render={<Link href="..."/>}>라벨</Button>`
- `form` 컴포넌트는 `field`로 대체됨
- Select는 폼 제출용 hidden input을 렌더링함

## DB 마이그레이션 방식

- Supabase MCP `apply_migration`으로 적용 후 같은 SQL을 `supabase/migrations/000N_*.sql`에 사본 기록 (supabase CLI 미사용)
- 스키마 변경 시 `generate_typescript_types`로 `src/types/database.ts` 재생성
- MCP가 없는 환경이면: 마이그레이션 SQL을 Supabase 대시보드 SQL Editor에서 실행

## 새 Supabase 프로젝트로 시작하기 (환경 이전 시)

1. 새 프로젝트 생성 (서울 리전 권장) → `supabase/setup.sql` 전체를 SQL Editor에서 1회 실행
2. `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` 교체
3. `next.config.ts`의 images hostname을 새 프로젝트 도메인으로 교체
4. 이메일 가입 → SQL로 첫 관리자 지정: `update profiles set role='admin', status='active' where email='...'`

## 아키텍처 핵심

- 데이터 변경은 전부 Server Actions (`src/server/actions/`)
- 주문 상태 전이의 진실의 원천은 DB 함수 `advance_order_status()` (권한·전이 규칙·이력을 한 트랜잭션으로). `src/lib/workflow.ts`는 UI용 미러
- 견적 공개 페이지 `/q/[token]`은 service role 키 없이 definer RPC(`get_quote_by_token`, `confirm_quote`)로 동작
- RLS: 관리자 전체 / 판매자·장착자는 본인 관련 데이터만. profiles 정책에서 profiles를 직접 서브쿼리하면 무한 재귀 → 반드시 `is_admin()` 등 security definer 헬퍼 사용
- 이메일: `src/lib/email.ts` — RESEND_API_KEY 없으면 발송 생략하고 notifications에 queued 기록

## 테스트 계정 (개발용, 비밀번호 test1234)

`admin@susan.test` / `seller@susan.test` / `installer@susan.test`
(SQL로 직접 만든 계정 — auth.users의 token 컬럼들을 ''로 채워야 로그인 가능. 운영 전 삭제)

## 2차 범위 (미구현)

캘린더·.ics, 장착일 D-1 사전 알림(pg_cron), 카카오 알림톡, 구조변경 서류 업로드·재발급 수수료 (`modification_documents` 테이블은 미생성)
