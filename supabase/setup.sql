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

