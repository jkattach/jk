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
