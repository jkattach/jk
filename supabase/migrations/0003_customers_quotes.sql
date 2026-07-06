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
