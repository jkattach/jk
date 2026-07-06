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
