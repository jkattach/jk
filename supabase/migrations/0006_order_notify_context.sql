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
