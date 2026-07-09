-- 수산 회전링크 판매 관리 시스템 — DB 전체 셋업 스크립트
-- 새 Supabase 프로젝트의 SQL Editor에서 이 파일 전체를 한 번 실행하면 됩니다.
-- (migrations 0001~0007을 순서대로 합친 파일)

-- ============================================================
-- 0001_core_schema_profiles.sql
-- ============================================================
-- 0001: enums, profiles, auto-create trigger, RLS helper functions
-- (적용됨: susan-sales / pdpcvosydbxgzfactjty — MCP apply_migration "core_schema_profiles")

create type public.user_role as enum ('admin', 'seller', 'installer');
create type public.user_status as enum ('pending', 'active', 'suspended');
create type public.quote_status as enum ('draft', 'sent', 'viewed', 'confirmed', 'expired', 'canceled');
create type public.order_status as enum (
  'purchase_confirmed', 'approved', 'shipping_scheduled',
  'install_scheduled', 'installed', 'docs_delivered', 'canceled'
);
create type public.notification_status as enum ('queued', 'sent', 'failed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'seller',
  status public.user_status not null default 'pending',
  name text not null default '',
  phone text,
  email text,
  org_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS 헬퍼: profiles 정책 안에서 profiles를 직접 서브쿼리하면 무한 재귀 → security definer 함수로 우회
create function public.get_my_role() returns public.user_role
language sql stable security definer set search_path = public as
$$ select role from public.profiles where id = auth.uid() $$;

create function public.get_my_status() returns public.user_status
language sql stable security definer set search_path = public as
$$ select status from public.profiles where id = auth.uid() $$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists(
     select 1 from public.profiles
     where id = auth.uid() and role = 'admin' and status = 'active'
   ) $$;

create function public.is_active_user() returns boolean
language sql stable security definer set search_path = public as
$$ select exists(
     select 1 from public.profiles
     where id = auth.uid() and status = 'active'
   ) $$;

alter table public.profiles enable row level security;

create policy "admin full access on profiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "users read own profile"
  on public.profiles for select
  using (id = auth.uid());

-- 본인 프로필 수정 가능하되 role/status 자가 변경 금지
create policy "users update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = public.get_my_role()
    and status = public.get_my_status()
  );

-- ============================================================
-- 0002_products_and_storage.sql
-- ============================================================
-- 0002: products, product_images, product-images storage bucket
-- (적용됨: MCP apply_migration "products_and_storage")

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  model_code text unique,
  description text,
  specs jsonb not null default '{}'::jsonb,
  price numeric(12,0) not null default 0,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index idx_product_images_product on public.product_images(product_id);

alter table public.products enable row level security;
alter table public.product_images enable row level security;

-- 제품 소개는 공개 페이지 → anon 포함 모두 활성 제품 조회 가능
create policy "anyone reads active products"
  on public.products for select
  using (is_active = true or public.is_admin());

create policy "admin manages products"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "anyone reads product images"
  on public.product_images for select
  using (true);

create policy "admin manages product images"
  on public.product_images for all
  using (public.is_admin())
  with check (public.is_admin());

-- Storage: 제품 이미지 버킷 (public read)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "admin uploads product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "admin updates product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

create policy "admin deletes product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

create policy "public reads product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- ============================================================
-- 0003_customers_quotes.sql
-- ============================================================
-- 0003: customers, vehicles, quotes, quote_items
-- (적용됨: MCP apply_migration "customers_quotes")

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  name text not null,
  phone text,
  email text,
  company_name text,
  business_reg_no text,
  address text,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

create index idx_customers_owner on public.customers(owner_id);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  plate_no text,
  vin text,
  model text,
  year int,
  memo text,
  created_at timestamptz not null default now()
);

create index idx_vehicles_customer on public.vehicles(customer_id);

-- 견적 번호: 전역 시퀀스 + 날짜 프리픽스 (Q-20260706-0001)
create sequence public.quote_no_seq;

create function public.next_quote_no() returns text
language sql volatile as
$$ select 'Q-' || to_char(now() at time zone 'Asia/Seoul', 'YYYYMMDD') || '-'
          || lpad(nextval('public.quote_no_seq')::text, 4, '0') $$;

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_no text not null unique default public.next_quote_no(),
  seller_id uuid not null references public.profiles(id),
  customer_id uuid references public.customers(id),
  customer_snapshot jsonb not null default '{}'::jsonb,
  status public.quote_status not null default 'draft',
  share_token uuid not null unique default gen_random_uuid(),
  valid_until date,
  subtotal numeric(12,0) not null default 0,
  vat numeric(12,0) not null default 0,
  total numeric(12,0) not null default 0,
  notes text,
  sent_at timestamptz,
  viewed_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_quotes_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

create index idx_quotes_seller on public.quotes(seller_id);
create index idx_quotes_status on public.quotes(status);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  product_id uuid references public.products(id),
  item_name text not null,
  unit_price numeric(12,0) not null default 0,
  qty int not null default 1,
  amount numeric(12,0) not null default 0,
  sort_order int not null default 0
);

create index idx_quote_items_quote on public.quote_items(quote_id);

-- RLS
alter table public.customers enable row level security;
alter table public.vehicles enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;

create policy "admin full on customers" on public.customers
  for all using (public.is_admin()) with check (public.is_admin());
create policy "seller manages own customers" on public.customers
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "admin full on vehicles" on public.vehicles
  for all using (public.is_admin()) with check (public.is_admin());
create policy "seller manages own customers vehicles" on public.vehicles
  for all using (
    exists (select 1 from public.customers c where c.id = customer_id and c.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.customers c where c.id = customer_id and c.owner_id = auth.uid())
  );

create policy "admin full on quotes" on public.quotes
  for all using (public.is_admin()) with check (public.is_admin());
create policy "seller reads own quotes" on public.quotes
  for select using (seller_id = auth.uid());
create policy "seller creates own quotes" on public.quotes
  for insert with check (seller_id = auth.uid());
-- 확정(confirmed) 이후에는 판매자가 수정 불가
create policy "seller updates own open quotes" on public.quotes
  for update using (
    seller_id = auth.uid() and status in ('draft', 'sent', 'viewed')
  ) with check (seller_id = auth.uid());
create policy "seller deletes own draft quotes" on public.quotes
  for delete using (seller_id = auth.uid() and status = 'draft');

create policy "admin full on quote_items" on public.quote_items
  for all using (public.is_admin()) with check (public.is_admin());
create policy "seller reads own quote items" on public.quote_items
  for select using (
    exists (select 1 from public.quotes q where q.id = quote_id and q.seller_id = auth.uid())
  );
create policy "seller writes own open quote items" on public.quote_items
  for all using (
    exists (select 1 from public.quotes q
            where q.id = quote_id and q.seller_id = auth.uid()
              and q.status in ('draft', 'sent', 'viewed'))
  ) with check (
    exists (select 1 from public.quotes q
            where q.id = quote_id and q.seller_id = auth.uid()
              and q.status in ('draft', 'sent', 'viewed'))
  );

-- ============================================================
-- 0004_orders_workflow_notifications.sql
-- ============================================================
-- 0004: orders, order_status_history, notifications, 상태 머신 RPC
-- (적용됨: MCP apply_migration "orders_workflow_notifications")

create sequence public.order_no_seq;

create function public.next_order_no() returns text
language sql volatile as
$$ select 'O-' || to_char(now() at time zone 'Asia/Seoul', 'YYYYMMDD') || '-'
          || lpad(nextval('public.order_no_seq')::text, 4, '0') $$;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique default public.next_order_no(),
  quote_id uuid not null unique references public.quotes(id),
  seller_id uuid not null references public.profiles(id),
  installer_id uuid references public.profiles(id),
  customer_id uuid references public.customers(id),
  vehicle_id uuid references public.vehicles(id),
  status public.order_status not null default 'purchase_confirmed',
  ship_date date,
  install_date date,
  install_location text,
  installed_at timestamptz,
  docs_delivered_at timestamptz,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create index idx_orders_seller on public.orders(seller_id);
create index idx_orders_installer on public.orders(installer_id);
create index idx_orders_status on public.orders(status);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  changed_by uuid references public.profiles(id),
  note text,
  created_at timestamptz not null default now()
);

create index idx_order_history_order on public.order_status_history(order_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  recipient_email text not null,
  recipient_profile_id uuid references public.profiles(id),
  quote_id uuid references public.quotes(id),
  order_id uuid references public.orders(id),
  payload jsonb not null default '{}'::jsonb,
  status public.notification_status not null default 'queued',
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.orders enable row level security;
alter table public.order_status_history enable row level security;
alter table public.notifications enable row level security;

create policy "admin full on orders" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());
create policy "seller reads own orders" on public.orders
  for select using (seller_id = auth.uid());
create policy "installer reads assigned orders" on public.orders
  for select using (installer_id = auth.uid());

create policy "admin full on order history" on public.order_status_history
  for all using (public.is_admin()) with check (public.is_admin());
create policy "related users read order history" on public.order_status_history
  for select using (
    exists (select 1 from public.orders o
            where o.id = order_id
              and (o.seller_id = auth.uid() or o.installer_id = auth.uid()))
  );

create policy "admin full on notifications" on public.notifications
  for all using (public.is_admin()) with check (public.is_admin());
create policy "recipient reads own notifications" on public.notifications
  for select using (recipient_profile_id = auth.uid());
create policy "active users log notifications" on public.notifications
  for insert with check (public.is_active_user());

-- 장착자: 배정된 주문의 고객 정보 조회 허용
create policy "installer reads assigned order customers" on public.customers
  for select using (
    exists (select 1 from public.orders o
            where o.customer_id = customers.id and o.installer_id = auth.uid())
  );

-- 장착자: 배정된 주문의 견적/품목 조회 허용 (장착 내용 확인용)
create policy "installer reads assigned order quotes" on public.quotes
  for select using (
    exists (select 1 from public.orders o
            where o.quote_id = quotes.id and o.installer_id = auth.uid())
  );
create policy "installer reads assigned order quote items" on public.quote_items
  for select using (
    exists (select 1 from public.orders o
            where o.quote_id = quote_items.quote_id and o.installer_id = auth.uid())
  );

-- 견적 확정 → 주문 생성 (공개 페이지에서 토큰으로 호출, security definer)
create function public.confirm_quote(p_token uuid)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_quote public.quotes%rowtype;
  v_order_id uuid;
begin
  select * into v_quote from public.quotes where share_token = p_token for update;
  if not found then
    raise exception 'QUOTE_NOT_FOUND';
  end if;
  if v_quote.status = 'confirmed' then
    select id into v_order_id from public.orders where quote_id = v_quote.id;
    return v_order_id; -- 이미 확정됨 (멱등)
  end if;
  if v_quote.status not in ('sent', 'viewed') then
    raise exception 'QUOTE_NOT_CONFIRMABLE';
  end if;
  if v_quote.valid_until is not null and v_quote.valid_until < (now() at time zone 'Asia/Seoul')::date then
    raise exception 'QUOTE_EXPIRED';
  end if;

  update public.quotes
     set status = 'confirmed', confirmed_at = now()
   where id = v_quote.id;

  insert into public.orders (quote_id, seller_id, customer_id)
  values (v_quote.id, v_quote.seller_id, v_quote.customer_id)
  returning id into v_order_id;

  insert into public.order_status_history (order_id, from_status, to_status, changed_by, note)
  values (v_order_id, null, 'purchase_confirmed', null, '고객 견적 확정');

  return v_order_id;
end;
$$;

-- 상태 전이 단일 진입점
create function public.advance_order_status(
  p_order_id uuid,
  p_next public.order_status,
  p_note text default null,
  p_extra jsonb default '{}'::jsonb
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders%rowtype;
  v_uid uuid := auth.uid();
  v_is_admin boolean := public.is_admin();
  v_allowed boolean := false;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  -- 전이 규칙 + 권한
  if v_is_admin then
    v_allowed :=
      (v_order.status = 'purchase_confirmed' and p_next = 'approved')
      or (v_order.status = 'approved' and p_next = 'shipping_scheduled')
      or (v_order.status = 'shipping_scheduled' and p_next = 'install_scheduled')
      or (v_order.status = 'install_scheduled' and p_next = 'installed')
      or (v_order.status = 'installed' and p_next = 'docs_delivered')
      or (v_order.status not in ('docs_delivered', 'canceled') and p_next = 'canceled');
  elsif v_order.installer_id = v_uid then
    v_allowed := (v_order.status = 'install_scheduled' and p_next = 'installed');
  end if;

  if not v_allowed then
    raise exception 'TRANSITION_NOT_ALLOWED: % -> %', v_order.status, p_next;
  end if;

  -- 전이별 필수 필드
  if p_next = 'shipping_scheduled' then
    if p_extra->>'ship_date' is null then
      raise exception 'SHIP_DATE_REQUIRED';
    end if;
    update public.orders set ship_date = (p_extra->>'ship_date')::date where id = p_order_id;
  elsif p_next = 'install_scheduled' then
    if p_extra->>'install_date' is null or p_extra->>'installer_id' is null then
      raise exception 'INSTALL_DATE_AND_INSTALLER_REQUIRED';
    end if;
    if not exists (select 1 from public.profiles
                   where id = (p_extra->>'installer_id')::uuid
                     and role = 'installer' and status = 'active') then
      raise exception 'INVALID_INSTALLER';
    end if;
    update public.orders
       set install_date = (p_extra->>'install_date')::date,
           installer_id = (p_extra->>'installer_id')::uuid,
           install_location = p_extra->>'install_location'
     where id = p_order_id;
  elsif p_next = 'installed' then
    update public.orders set installed_at = now() where id = p_order_id;
  elsif p_next = 'docs_delivered' then
    update public.orders set docs_delivered_at = now() where id = p_order_id;
  end if;

  update public.orders set status = p_next where id = p_order_id;

  insert into public.order_status_history (order_id, from_status, to_status, changed_by, note)
  values (p_order_id, v_order.status, p_next, v_uid, p_note);
end;
$$;

-- ============================================================
-- 0005_quote_public_rpcs.sql
-- ============================================================
-- 0005: 견적 공개 열람/알림용 security definer RPC
-- (적용됨: MCP apply_migration "quote_public_rpcs")
-- 공개 페이지(/q/[token])가 service role 키 없이 anon 클라이언트로 동작하게 한다.

-- 토큰으로 견적 열람 (+ 최초 열람 시 viewed 마킹)
create function public.get_quote_by_token(p_token uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_quote public.quotes%rowtype;
  v_result jsonb;
begin
  select * into v_quote from public.quotes where share_token = p_token;
  if not found then
    return null;
  end if;

  -- draft는 아직 공개 전
  if v_quote.status = 'draft' then
    return null;
  end if;

  if v_quote.status = 'sent' then
    update public.quotes
       set status = 'viewed', viewed_at = coalesce(viewed_at, now())
     where id = v_quote.id;
    v_quote.status := 'viewed';
    v_quote.viewed_at := coalesce(v_quote.viewed_at, now());
  end if;

  select jsonb_build_object(
    'quote', jsonb_build_object(
      'id', v_quote.id,
      'quote_no', v_quote.quote_no,
      'status', v_quote.status,
      'customer_snapshot', v_quote.customer_snapshot,
      'valid_until', v_quote.valid_until,
      'subtotal', v_quote.subtotal,
      'vat', v_quote.vat,
      'total', v_quote.total,
      'notes', v_quote.notes,
      'created_at', v_quote.created_at,
      'confirmed_at', v_quote.confirmed_at
    ),
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', qi.id, 'item_name', qi.item_name, 'unit_price', qi.unit_price,
        'qty', qi.qty, 'amount', qi.amount
      ) order by qi.sort_order)
      from public.quote_items qi where qi.quote_id = v_quote.id
    ), '[]'::jsonb),
    'seller', (
      select jsonb_build_object('name', p.name, 'org_name', p.org_name, 'phone', p.phone)
      from public.profiles p where p.id = v_quote.seller_id
    )
  ) into v_result;

  return v_result;
end;
$$;

-- 알림 수신자 조회 (견적 확정 시: 관리자 전원 + 담당 판매자)
create function public.quote_notify_context(p_token uuid)
returns jsonb
language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'quote_id', q.id,
    'quote_no', q.quote_no,
    'total', q.total,
    'customer_snapshot', q.customer_snapshot,
    'seller', (select jsonb_build_object('id', p.id, 'name', p.name, 'email', p.email)
               from public.profiles p where p.id = q.seller_id),
    'admins', coalesce((
      select jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name, 'email', p.email))
      from public.profiles p
      where p.role = 'admin' and p.status = 'active' and p.email is not null
    ), '[]'::jsonb)
  )
  from public.quotes q where q.share_token = p_token
$$;

-- 알림 로그 기록 (anon 확정 플로우 등 RLS 제약과 무관하게 기록)
create function public.log_notification(
  p_type text,
  p_email text,
  p_profile uuid default null,
  p_quote uuid default null,
  p_order uuid default null,
  p_payload jsonb default '{}'::jsonb,
  p_status public.notification_status default 'queued',
  p_error text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  insert into public.notifications
    (type, recipient_email, recipient_profile_id, quote_id, order_id, payload, status, error, sent_at)
  values
    (p_type, p_email, p_profile, p_quote, p_order, p_payload, p_status, p_error,
     case when p_status = 'sent' then now() else null end)
  returning id into v_id;
  return v_id;
end;
$$;

-- ============================================================
-- 0006_order_notify_context.sql
-- ============================================================
-- 0006: 주문 상태 전이 알림용 수신자/컨텍스트 조회 (장착자 등 제한된 역할도 알림 발송 가능하도록 definer)
-- (적용됨: MCP apply_migration "order_notify_context")
create function public.order_notify_context(p_order_id uuid)
returns jsonb
language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'order_no', o.order_no,
    'status', o.status,
    'ship_date', o.ship_date,
    'install_date', o.install_date,
    'install_location', o.install_location,
    'quote_no', q.quote_no,
    'total', q.total,
    'customer_name', coalesce(q.customer_snapshot->>'name', c.name),
    'customer_phone', coalesce(q.customer_snapshot->>'phone', c.phone),
    'seller', (select jsonb_build_object('id', p.id, 'name', p.name, 'email', p.email, 'phone', p.phone)
               from public.profiles p where p.id = o.seller_id),
    'installer', (select jsonb_build_object('id', p.id, 'name', p.name, 'email', p.email, 'phone', p.phone)
                  from public.profiles p where p.id = o.installer_id),
    'admins', coalesce((
      select jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name, 'email', p.email))
      from public.profiles p
      where p.role = 'admin' and p.status = 'active' and p.email is not null
    ), '[]'::jsonb)
  )
  from public.orders o
  join public.quotes q on q.id = o.quote_id
  left join public.customers c on c.id = o.customer_id
  where o.id = p_order_id
    and (public.is_admin() or o.seller_id = auth.uid() or o.installer_id = auth.uid())
$$;

-- ============================================================
-- 0007_security_hardening.sql
-- ============================================================
-- 0007: 보안 강화 (advisor 경고 반영)
-- (적용됨: MCP apply_migration "security_hardening")

-- 1) search_path 고정
alter function public.next_quote_no() set search_path = public;
alter function public.next_order_no() set search_path = public;
alter function public.set_updated_at() set search_path = public;

-- 2) public 버킷은 오브젝트 URL 접근에 select 정책이 불필요 — 목록 노출 방지 위해 제거
drop policy "public reads product images" on storage.objects;

-- 3) RPC 실행 권한 정리
-- 트리거 전용 함수는 REST로 호출 불가하게
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.set_updated_at() from anon, authenticated;

-- 인증 사용자 전용 함수에서 anon 제거
revoke execute on function public.advance_order_status(uuid, public.order_status, text, jsonb) from anon;
revoke execute on function public.order_notify_context(uuid) from anon;
revoke execute on function public.get_my_role() from anon;
revoke execute on function public.get_my_status() from anon;
revoke execute on function public.is_active_user() from anon;
-- is_admin은 RLS 정책 평가에 필요하므로 유지

-- 견적 공개 플로우(anon 유지): confirm_quote, get_quote_by_token, quote_notify_context, log_notification

-- 4) log_notification 남용 방지: 참조 무결성 검증 (quote/order 중 하나는 실제 존재해야 함)
create or replace function public.log_notification(
  p_type text,
  p_email text,
  p_profile uuid default null,
  p_quote uuid default null,
  p_order uuid default null,
  p_payload jsonb default '{}'::jsonb,
  p_status public.notification_status default 'queued',
  p_error text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  if p_quote is null and p_order is null then
    raise exception 'NOTIFICATION_REF_REQUIRED';
  end if;
  if p_quote is not null and not exists (select 1 from public.quotes where id = p_quote) then
    raise exception 'INVALID_QUOTE_REF';
  end if;
  if p_order is not null and not exists (select 1 from public.orders where id = p_order) then
    raise exception 'INVALID_ORDER_REF';
  end if;

  insert into public.notifications
    (type, recipient_email, recipient_profile_id, quote_id, order_id, payload, status, error, sent_at)
  values
    (p_type, p_email, p_profile, p_quote, p_order, p_payload, p_status, p_error,
     case when p_status = 'sent' then now() else null end)
  returning id into v_id;
  return v_id;
end;
$$;


-- ============================================================
-- 0008_chakchak_marketplace.sql
-- ============================================================

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
