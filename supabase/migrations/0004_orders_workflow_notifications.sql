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
