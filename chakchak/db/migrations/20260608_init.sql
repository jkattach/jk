-- ─────────────────────────────────────────────
-- 1. ENUM 정의
-- ─────────────────────────────────────────────
create type user_role as enum (
  'customer','dealer','semi_dealer','installer','internal_staff','admin'
);
create type approval_status as enum ('pending','approved','rejected');
create type user_status as enum ('active','suspended','deleted');
create type quote_status as enum ('open','closed','confirmed','cancelled','expired');
create type bidder_role as enum ('dealer','installer','internal_staff');
create type bid_scope as enum ('bundle','install_only');
create type bid_status as enum ('active','withdrawn','won','lost');
create type supplier_type as enum ('internal','external');
create type install_stage as enum ('pool','public');
create type notif_channel as enum ('telegram','push','email');

-- ─────────────────────────────────────────────
-- 2. 사용자 그룹
-- ─────────────────────────────────────────────
create table users (
  id              uuid primary key default gen_random_uuid(),
  role            user_role not null,
  email           text unique,
  phone           text,
  display_name    text,
  oauth_provider  text,                       -- 'google'|'kakao'|null
  status          user_status not null default 'active',
  created_at      timestamptz not null default now()
);

create table partner_profiles (
  user_id          uuid primary key references users(id) on delete cascade,
  business_name    text not null,
  region_sido      text,
  region_sigungu   text,
  license_url      text,
  tier             smallint not null default 1,   -- 1~5
  rating           numeric(3,2) not null default 0,
  response_speed   integer not null default 0,    -- 평균 응답 분
  created_at       timestamptz not null default now()
);

create table user_approvals (
  id            uuid primary key default gen_random_uuid(),
  requester_id  uuid not null references users(id) on delete cascade,
  approver_id   uuid references users(id),
  target_role   user_role not null,
  status        approval_status not null default 'pending',
  docs_url      text,
  reason        text,
  decided_at    timestamptz,
  created_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 3. 카탈로그
-- ─────────────────────────────────────────────
create table categories (
  id         serial primary key,
  parent_id  integer references categories(id),
  name       text not null,
  slug       text unique not null,
  sort_order smallint not null default 0
);

create table suppliers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  type       supplier_type not null,
  verified   boolean not null default false,
  contact    text,
  created_at timestamptz not null default now()
);

create table attachments (
  id             uuid primary key default gen_random_uuid(),
  category_id    integer not null references categories(id),
  supplier_id    uuid references suppliers(id),
  brand          text not null,
  model_code     text not null,
  display_name   text not null,
  list_price     bigint,            -- NULL = '문의가'
  dealer_price   bigint,            -- 본사 단일 도매가
  spec_json      jsonb not null default '{}',
  status         text not null default 'active',
  created_at     timestamptz not null default now(),
  unique (brand, model_code)
);

create table compatibility (
  id             bigserial primary key,
  attachment_id  uuid not null references attachments(id) on delete cascade,
  ton_min        numeric(4,1) not null,
  ton_max        numeric(4,1) not null,
  note           text
);

create table supplier_attachments (
  supplier_id    uuid not null references suppliers(id) on delete cascade,
  attachment_id  uuid not null references attachments(id) on delete cascade,
  approved_at    timestamptz,
  approver_id    uuid references users(id),
  primary key (supplier_id, attachment_id)
);

-- ─────────────────────────────────────────────
-- 4. 거래 - 트랙 A
-- ─────────────────────────────────────────────
create table quote_requests (
  id                  uuid primary key default gen_random_uuid(),
  customer_id         uuid not null references users(id),
  attachment_id       uuid not null references attachments(id),
  region_sido         text not null,
  region_sigungu      text,
  options_json        jsonb not null default '{}',
  notes               text,
  auction_hours       smallint not null check (auction_hours in (24,48,72)),
  status              quote_status not null default 'open',
  expires_at          timestamptz not null,
  auto_extended_count smallint not null default 0,
  created_at          timestamptz not null default now()
);
create index on quote_requests(status, expires_at);

create table quote_bids (
  id            uuid primary key default gen_random_uuid(),
  request_id    uuid not null references quote_requests(id) on delete cascade,
  bidder_id     uuid not null references users(id),
  bidder_role   bidder_role not null,
  bid_scope     bid_scope not null default 'bundle',
  price         bigint not null,             -- 본체+장착 합계 (트랙 A는 묶음 강제)
  install_price bigint,                       -- 트랙 B 분리시 장착비
  discount_rate numeric(4,2) not null default 0,
  eta_days      smallint,
  message       text,
  status        bid_status not null default 'active',
  created_at    timestamptz not null default now()
);
create index on quote_bids(request_id, status);

-- ─────────────────────────────────────────────
-- 5. 거래 - 트랙 B (장착경매)
-- ─────────────────────────────────────────────
create table install_auctions (
  id                  uuid primary key default gen_random_uuid(),
  semi_dealer_id      uuid not null references users(id),
  customer_id         uuid not null references users(id),
  attachment_id       uuid not null references attachments(id),
  region_sido         text not null,
  region_sigungu      text,
  recommended_pool    uuid[] not null default '{}',  -- 추천 장착자 id 배열
  stage               install_stage not null default 'pool',
  consumer_price      bigint not null,    -- 세미딜러가 고객에게 청구할 본체 소비자가
  status              quote_status not null default 'open',
  expires_at          timestamptz not null,
  auto_extended_count smallint not null default 0,
  created_at          timestamptz not null default now()
);
create index on install_auctions(stage, status, expires_at);

-- ─────────────────────────────────────────────
-- 6. 낙찰/정산
-- ─────────────────────────────────────────────
create table quote_selections (
  id                  uuid primary key default gen_random_uuid(),
  request_id          uuid references quote_requests(id),
  install_auction_id  uuid references install_auctions(id),
  supplier_bid_id     uuid references quote_bids(id),
  installer_bid_id    uuid references quote_bids(id),
  total_price         bigint not null,
  platform_fee        bigint not null,
  fee_rate            numeric(4,3) not null,    -- 0.03 or 0.05
  confirmed_at        timestamptz not null default now(),
  check (request_id is not null or install_auction_id is not null)
);

-- ─────────────────────────────────────────────
-- 7. 알림 · 후기
-- ─────────────────────────────────────────────
create table notification_preferences (
  user_id   uuid not null references users(id) on delete cascade,
  channel   notif_channel not null,
  priority  smallint not null default 1,    -- 1=주채널 2=보조
  enabled   boolean not null default true,
  primary key (user_id, channel)
);

create table notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  event_type  text not null,
  payload     jsonb not null default '{}',
  sent_via    notif_channel,
  sent_at     timestamptz,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index on notifications(user_id, read_at);

create table reviews (
  id              uuid primary key default gen_random_uuid(),
  selection_id    uuid not null references quote_selections(id) on delete cascade,
  reviewer_id     uuid not null references users(id),
  target_user_id  uuid not null references users(id),
  score           smallint not null check (score between 1 and 5),
  body            text,
  created_at      timestamptz not null default now()
);
