-- 0008: 착착 마켓플레이스 — 소비자 견적 요청 + 딜러 경쟁입찰
-- 소비자(비로그인)가 요청을 올리면 딜러(seller)가 입찰하고, 소비자가 토큰 링크로 비교·선택한다.
-- 핵심 원칙: 소비자 연락처는 낙찰된 딜러에게만 공개 (순수 중개 모델의 전제)

-- ── enums ────────────────────────────────────────────────
create type public.request_status as enum ('open', 'closed', 'canceled', 'expired');
create type public.bid_status as enum ('submitted', 'selected', 'not_selected', 'withdrawn');

-- ── 요청 번호: R-YYYYMMDD-0001 ──────────────────────────
create sequence public.request_no_seq;

create function public.next_request_no() returns text
language sql volatile set search_path = public as
$$ select 'R-' || to_char(now() at time zone 'Asia/Seoul', 'YYYYMMDD') || '-'
          || lpad(nextval('public.request_no_seq')::text, 4, '0') $$;

-- ── 테이블 ───────────────────────────────────────────────
create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  request_no text not null unique default public.next_request_no(),
  share_token uuid not null unique default gen_random_uuid(),
  status public.request_status not null default 'open',
  -- 소비자 정보 (낙찰 전 딜러에게 비공개)
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  -- 요청 내용 (딜러에게 공개)
  region text not null,
  excavator_model text,
  item_name text not null,
  product_id uuid references public.products(id),
  details text,
  desired_date date,
  bid_deadline date,
  selected_bid_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_quote_requests_updated_at
  before update on public.quote_requests
  for each row execute function public.set_updated_at();

create index idx_quote_requests_status on public.quote_requests(status);

create table public.bids (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.quote_requests(id) on delete cascade,
  seller_id uuid not null references public.profiles(id),
  price numeric(12,0) not null check (price > 0),
  install_included boolean not null default true,
  valid_until date,
  message text,
  status public.bid_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (request_id, seller_id) -- 요청당 딜러 1입찰 (수정으로 갱신)
);

create trigger trg_bids_updated_at
  before update on public.bids
  for each row execute function public.set_updated_at();

create index idx_bids_request on public.bids(request_id);
create index idx_bids_seller on public.bids(seller_id);

alter table public.quote_requests
  add constraint fk_quote_requests_selected_bid
  foreign key (selected_bid_id) references public.bids(id);

-- notifications: 요청 참조 추가
alter table public.notifications
  add column request_id uuid references public.quote_requests(id);

-- ── RLS ──────────────────────────────────────────────────
alter table public.quote_requests enable row level security;
alter table public.bids enable row level security;

-- quote_requests: 관리자만 직접 접근. 딜러는 연락처 마스킹된 RPC 경유, 소비자는 토큰 RPC 경유.
create policy "admin full on quote_requests" on public.quote_requests
  for all using (public.is_admin()) with check (public.is_admin());

-- RLS 정책용 헬퍼 (bids insert 정책에서 quote_requests를 직접 서브쿼리하면 RLS에 막힘)
create function public.request_is_open(p_request uuid) returns boolean
language sql stable security definer set search_path = public as
$$ select exists(
     select 1 from public.quote_requests
     where id = p_request and status = 'open'
   ) $$;

create policy "admin full on bids" on public.bids
  for all using (public.is_admin()) with check (public.is_admin());
create policy "seller reads own bids" on public.bids
  for select using (seller_id = auth.uid());
create policy "seller bids on open requests" on public.bids
  for insert with check (
    seller_id = auth.uid()
    and public.is_active_user()
    and public.get_my_role() = 'seller'
    and public.request_is_open(request_id)
  );
-- 요청이 열려있는 동안 가격 갱신·철회·재제출 가능. 낙찰/유찰 후엔 불가.
create policy "seller updates own open bids" on public.bids
  for update using (
    seller_id = auth.uid()
    and status in ('submitted', 'withdrawn')
    and public.request_is_open(request_id)
  )
  with check (seller_id = auth.uid() and status in ('submitted', 'withdrawn'));

-- ── 공개 RPC (anon, 소비자용) ────────────────────────────

-- 1) 요청 생성 → 토큰 반환 (+ 관리자 알림용 컨텍스트)
create function public.create_quote_request(
  p_name text,
  p_phone text,
  p_region text,
  p_item_name text,
  p_email text default null,
  p_excavator_model text default null,
  p_details text default null,
  p_desired_date date default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_row public.quote_requests%rowtype;
begin
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_phone), '') = ''
     or coalesce(trim(p_region), '') = '' or coalesce(trim(p_item_name), '') = '' then
    raise exception 'REQUIRED_FIELDS_MISSING';
  end if;
  if length(p_name) > 50 or length(p_phone) > 30 or length(p_region) > 100
     or length(p_item_name) > 100 or length(coalesce(p_email, '')) > 200
     or length(coalesce(p_excavator_model, '')) > 100 or length(coalesce(p_details, '')) > 2000 then
    raise exception 'FIELD_TOO_LONG';
  end if;

  insert into public.quote_requests
    (customer_name, customer_phone, customer_email, region, excavator_model, item_name, details, desired_date)
  values
    (trim(p_name), trim(p_phone), nullif(trim(coalesce(p_email, '')), ''),
     trim(p_region), nullif(trim(coalesce(p_excavator_model, '')), ''),
     trim(p_item_name), nullif(trim(coalesce(p_details, '')), ''), p_desired_date)
  returning * into v_row;

  return jsonb_build_object(
    'id', v_row.id,
    'request_no', v_row.request_no,
    'share_token', v_row.share_token,
    'admins', coalesce((
      select jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name, 'email', p.email))
      from public.profiles p
      where p.role = 'admin' and p.status = 'active' and p.email is not null
    ), '[]'::jsonb)
  );
end;
$$;

-- 2) 토큰으로 요청 + 입찰 목록 조회 (딜러 연락처는 낙찰 건만 공개)
create function public.get_request_by_token(p_token uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_row public.quote_requests%rowtype;
begin
  select * into v_row from public.quote_requests where share_token = p_token;
  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'request', jsonb_build_object(
      'id', v_row.id,
      'request_no', v_row.request_no,
      'status', v_row.status,
      'customer_name', v_row.customer_name,
      'region', v_row.region,
      'excavator_model', v_row.excavator_model,
      'item_name', v_row.item_name,
      'details', v_row.details,
      'desired_date', v_row.desired_date,
      'selected_bid_id', v_row.selected_bid_id,
      'created_at', v_row.created_at
    ),
    'bids', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', b.id,
        'price', b.price,
        'install_included', b.install_included,
        'valid_until', b.valid_until,
        'message', b.message,
        'status', b.status,
        'seller_org', coalesce(nullif(p.org_name, ''), p.name),
        'seller_phone', case when b.status = 'selected' then p.phone end,
        'seller_name', case when b.status = 'selected' then p.name end,
        'created_at', b.created_at
      ) order by b.price asc, b.created_at asc)
      from public.bids b
      join public.profiles p on p.id = b.seller_id
      where b.request_id = v_row.id and b.status <> 'withdrawn'
    ), '[]'::jsonb)
  );
end;
$$;

-- 3) 입찰 선택(낙찰) — 멱등. 낙찰 딜러에게 고객 자동 등록 + 알림 컨텍스트 반환
create function public.select_bid_by_token(p_token uuid, p_bid uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_req public.quote_requests%rowtype;
  v_bid public.bids%rowtype;
  v_seller public.profiles%rowtype;
begin
  select * into v_req from public.quote_requests where share_token = p_token for update;
  if not found then
    raise exception 'REQUEST_NOT_FOUND';
  end if;

  -- 이미 같은 입찰로 확정된 경우 멱등 처리
  if v_req.status = 'closed' and v_req.selected_bid_id = p_bid then
    select * into v_bid from public.bids where id = p_bid;
    select * into v_seller from public.profiles where id = v_bid.seller_id;
    return jsonb_build_object(
      'request_no', v_req.request_no,
      'already', true,
      'seller', jsonb_build_object('name', v_seller.name, 'org_name', v_seller.org_name,
                                   'phone', v_seller.phone, 'email', v_seller.email),
      'price', v_bid.price,
      'admins', '[]'::jsonb
    );
  end if;

  if v_req.status <> 'open' then
    raise exception 'REQUEST_NOT_OPEN';
  end if;

  select * into v_bid from public.bids
   where id = p_bid and request_id = v_req.id and status = 'submitted'
   for update;
  if not found then
    raise exception 'BID_NOT_SELECTABLE';
  end if;

  update public.bids set status = 'selected' where id = v_bid.id;
  update public.bids set status = 'not_selected'
   where request_id = v_req.id and id <> v_bid.id and status = 'submitted';
  update public.quote_requests
     set status = 'closed', selected_bid_id = v_bid.id
   where id = v_req.id;

  -- 낙찰 딜러의 고객 목록에 자동 등록 → 기존 견적·주문 파이프라인으로 연결
  insert into public.customers (owner_id, name, phone, email, memo)
  values (v_bid.seller_id, v_req.customer_name, v_req.customer_phone, v_req.customer_email,
          '착착 요청 ' || v_req.request_no || ' 낙찰 고객');

  select * into v_seller from public.profiles where id = v_bid.seller_id;

  return jsonb_build_object(
    'request_id', v_req.id,
    'request_no', v_req.request_no,
    'item_name', v_req.item_name,
    'region', v_req.region,
    'price', v_bid.price,
    'already', false,
    'seller', jsonb_build_object('id', v_seller.id, 'name', v_seller.name,
                                 'org_name', v_seller.org_name,
                                 'phone', v_seller.phone, 'email', v_seller.email),
    'admins', coalesce((
      select jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name, 'email', p.email))
      from public.profiles p
      where p.role = 'admin' and p.status = 'active' and p.email is not null
    ), '[]'::jsonb)
  );
end;
$$;

-- ── 딜러용 RPC (authenticated) ───────────────────────────

-- 오픈 요청 보드 (연락처 제외, 입찰 현황 요약 포함)
create function public.list_open_requests() returns jsonb
language sql stable security definer set search_path = public as $$
  select case
    when not (public.is_active_user() and public.get_my_role() in ('seller', 'admin')) then null
    else coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', r.id,
        'request_no', r.request_no,
        'region', r.region,
        'excavator_model', r.excavator_model,
        'item_name', r.item_name,
        'details', r.details,
        'desired_date', r.desired_date,
        'created_at', r.created_at,
        'bid_count', (select count(*) from public.bids b
                      where b.request_id = r.id and b.status <> 'withdrawn'),
        'lowest_price', (select min(b.price) from public.bids b
                         where b.request_id = r.id and b.status <> 'withdrawn'),
        'my_bid', (select jsonb_build_object('id', b.id, 'price', b.price, 'status', b.status)
                   from public.bids b
                   where b.request_id = r.id and b.seller_id = auth.uid())
      ) order by r.created_at desc)
      from public.quote_requests r
      where r.status = 'open'
    ), '[]'::jsonb)
  end
$$;

-- 요청 상세 (오픈 요청이거나 내가 입찰한 요청만. 내 입찰이 낙찰됐으면 연락처 공개)
create function public.get_request_for_seller(p_request uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_row public.quote_requests%rowtype;
  v_my_bid public.bids%rowtype;
begin
  if not (public.is_active_user() and public.get_my_role() in ('seller', 'admin')) then
    return null;
  end if;

  select * into v_row from public.quote_requests where id = p_request;
  if not found then
    return null;
  end if;

  select * into v_my_bid from public.bids
   where request_id = v_row.id and seller_id = auth.uid();

  if v_row.status <> 'open' and v_my_bid.id is null and not public.is_admin() then
    return null;
  end if;

  return jsonb_build_object(
    'id', v_row.id,
    'request_no', v_row.request_no,
    'status', v_row.status,
    'region', v_row.region,
    'excavator_model', v_row.excavator_model,
    'item_name', v_row.item_name,
    'details', v_row.details,
    'desired_date', v_row.desired_date,
    'created_at', v_row.created_at,
    'bid_count', (select count(*) from public.bids b
                  where b.request_id = v_row.id and b.status <> 'withdrawn'),
    'lowest_price', (select min(b.price) from public.bids b
                     where b.request_id = v_row.id and b.status <> 'withdrawn'),
    'my_bid', case when v_my_bid.id is null then null else
      jsonb_build_object('id', v_my_bid.id, 'price', v_my_bid.price,
                         'install_included', v_my_bid.install_included,
                         'valid_until', v_my_bid.valid_until,
                         'message', v_my_bid.message, 'status', v_my_bid.status) end,
    'customer', case when v_my_bid.status = 'selected' or public.is_admin() then
      jsonb_build_object('name', v_row.customer_name, 'phone', v_row.customer_phone,
                         'email', v_row.customer_email) end
  );
end;
$$;

-- 입찰 알림 컨텍스트 (내가 입찰한 요청의 소비자 이메일 — 새 입찰 알림 발송용)
create function public.bid_notify_context(p_request uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'request_no', r.request_no,
    'share_token', r.share_token,
    'item_name', r.item_name,
    'customer_name', r.customer_name,
    'customer_email', r.customer_email
  )
  from public.quote_requests r
  where r.id = p_request
    and exists (select 1 from public.bids b
                where b.request_id = r.id and b.seller_id = auth.uid())
$$;

-- ── log_notification: request 참조 지원 (drop 후 재생성 — 오버로드 중복 방지) ──
drop function public.log_notification(text, text, uuid, uuid, uuid, jsonb, public.notification_status, text);

create function public.log_notification(
  p_type text,
  p_email text,
  p_profile uuid default null,
  p_quote uuid default null,
  p_order uuid default null,
  p_payload jsonb default '{}'::jsonb,
  p_status public.notification_status default 'queued',
  p_error text default null,
  p_request uuid default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  if p_quote is null and p_order is null and p_request is null then
    raise exception 'NOTIFICATION_REF_REQUIRED';
  end if;
  if p_quote is not null and not exists (select 1 from public.quotes where id = p_quote) then
    raise exception 'INVALID_QUOTE_REF';
  end if;
  if p_order is not null and not exists (select 1 from public.orders where id = p_order) then
    raise exception 'INVALID_ORDER_REF';
  end if;
  if p_request is not null and not exists (select 1 from public.quote_requests where id = p_request) then
    raise exception 'INVALID_REQUEST_REF';
  end if;

  insert into public.notifications
    (type, recipient_email, recipient_profile_id, quote_id, order_id, request_id, payload, status, error, sent_at)
  values
    (p_type, p_email, p_profile, p_quote, p_order, p_request, p_payload, p_status, p_error,
     case when p_status = 'sent' then now() else null end)
  returning id into v_id;
  return v_id;
end;
$$;

-- ── 실행 권한 정리 ───────────────────────────────────────
-- 공개(anon 허용): create_quote_request, get_request_by_token, select_bid_by_token, log_notification
revoke execute on function public.list_open_requests() from anon;
revoke execute on function public.get_request_for_seller(uuid) from anon;
revoke execute on function public.bid_notify_context(uuid) from anon;
revoke execute on function public.next_request_no() from anon, authenticated;
