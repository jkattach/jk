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
