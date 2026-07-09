# 작업 핸드오프 — 착착 마켓플레이스 (2026-07-10)

다음 작업자는(Claude Code 포함) 이 문서와 `CLAUDE.md`, `README.md`를 먼저 읽을 것.

## 완료된 작업

로컬 커밋 `6942b5f` — "착착 마켓플레이스: 소비자 견적 요청 + 딜러 경쟁입찰"

기존 수산 회전링크 판매 관리 시스템(판매자가 견적 발송) 앞단에, 소비자 요청 → 딜러 경쟁입찰 → 소비자 선택 레이어를 추가했다.

| 영역 | 내용 |
|---|---|
| DB | `supabase/migrations/0008_chakchak_marketplace.sql` — `quote_requests`, `bids` 테이블, RLS, 공개 RPC(`create_quote_request`, `get_request_by_token`, `select_bid_by_token`), 딜러 RPC(`list_open_requests`, `get_request_for_seller`, `bid_notify_context`), `log_notification`에 `p_request` 추가(드롭 후 재생성), `notifications.request_id` 컬럼. `setup.sql`에도 동일 반영 |
| 서버 액션 | `src/server/actions/requests.ts` — createRequest / placeBid / withdrawBid / selectBidByToken (이메일 알림 포함) |
| 소비자 페이지 | `/` 착착 랜딩(개편), `/request` 요청 등록(비로그인), `/r/[token]` 입찰 비교·선택 |
| 딜러 페이지 | `/board` 오픈 요청 보드, `/board/[id]` 상세·입찰 폼. app-shell 네비에 "요청 보드" 추가 (admin/seller) |
| 타입 | `src/types/database.ts` 수동 갱신 (Supabase MCP 사용 가능해지면 `generate_typescript_types`로 재생성 권장) |
| 검증 | `tsc --noEmit` 통과, ESLint 통과. 프로덕션 빌드는 이 환경의 node_modules가 Windows용이라 미실행 — 로컬에서 `npm run build` 확인 필요 |

## 핵심 설계 결정

1. 소비자 연락처는 낙찰 전까지 딜러에게 비공개 (RLS로 직접 select 차단, 마스킹된 definer RPC 경유). 플랫폼 우회 방지 = 수수료 모델의 전제.
2. 낙찰 시 해당 고객을 낙찰 딜러의 `customers`에 자동 등록 → 기존 견적→주문→장착 파이프라인으로 연결.
3. 요청당 딜러 1입찰(unique), 요청 오픈 중에만 수정·철회·재제출 가능.
4. `next.config.ts`에 `distDir: process.env.NEXT_DIST_DIR || ".next"` 추가 (샌드박스 빌드용, 무해).

## 다음 작업자가 해야 할 일 (순서대로)

1. **DB 마이그레이션 적용**: Supabase MCP `apply_migration`으로 `0008_chakchak_marketplace.sql` 적용, 또는 대시보드 SQL Editor에서 실행. 미적용 시 신규 페이지 전부 동작 안 함.
2. **GitHub 푸시**: 원격 저장소 없음. `gh repo create <이름> --private --source . --push` 또는 remote 추가 후 push.
3. **로컬 빌드 확인**: `npm run build` 1회.
4. **Vercel 배포**: README "남은 수동 설정" 참고 (GitHub Pages 불가 — 서버 필요). `NEXT_PUBLIC_SITE_URL` 설정해야 이메일 내 링크가 올바름.
5. **테스트 시나리오**: 비로그인으로 `/request` 등록 → seller 계정으로 `/board` 입찰 → 발급된 `/r/[token]`에서 선택 → 딜러 화면에 고객 연락처 표시 + `customers` 자동 등록 확인.

## 미구현 / 알려진 한계

- 입찰 마감일(`bid_deadline`) 컬럼은 있으나 자동 만료(expired) 처리 미구현 (pg_cron 후보)
- 요청 등록 rate limit 없음 (스팸 방지 필요 시 캡차/제한 추가)
- 관리자용 요청 관리 화면 없음 (취소 처리는 현재 SQL로만 가능)
- 수수료(매칭 1건 4만원) 청구·정산 기능은 사업계획 단계 — 미구현
- 2차 범위(기존): 캘린더, D-1 알림, 카카오 알림톡, 구조변경 서류 업로드

## 세션 중 특이사항

- 폴더 동기화 문제로 `.git/index`가 일시 손상 → 복구 완료 (`git fsck` 정상). `.git` 내 dangling blob 몇 개는 무해.
- `.gitignore`에 `/tmp/` 추가됨 (샌드박스 빌드 잔여물 방지).
