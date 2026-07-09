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
