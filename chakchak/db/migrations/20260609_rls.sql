-- 모든 테이블 RLS ON
alter table users                     enable row level security;
alter table partner_profiles          enable row level security;
alter table user_approvals            enable row level security;
alter table quote_requests            enable row level security;
alter table quote_bids                enable row level security;
alter table install_auctions          enable row level security;
alter table quote_selections          enable row level security;
alter table notifications             enable row level security;
alter table reviews                   enable row level security;

-- 헬퍼: 현재 사용자 role 조회
create or replace function auth_role() returns user_role
language sql stable as $$
  select role from users where id = auth.uid()
$$;

-- ─── 정책 1. 본인 데이터 (users, partner_profiles, notifications)
create policy "users_self_select" on users
  for select using (id = auth.uid() or auth_role() = 'admin');
create policy "partner_self_rw" on partner_profiles
  for all using (user_id = auth.uid() or auth_role() in ('admin','internal_staff'));
create policy "notif_self_rw" on notifications
  for all using (user_id = auth.uid());

-- ─── 정책 2. 견적 요청 (소비자=본인, 대리점/장착자=오픈 상태만 SELECT)
create policy "quote_req_owner" on quote_requests
  for all using (customer_id = auth.uid() or auth_role() in ('admin','internal_staff'));
create policy "quote_req_open_for_bidders" on quote_requests
  for select using (
    status = 'open'
    and auth_role() in ('dealer','installer')
  );

-- ─── 정책 3. 입찰 (입찰자=본인 입찰, 요청자=자기 요청에 달린 모든 입찰)
create policy "bid_self_rw" on quote_bids
  for all using (
    bidder_id = auth.uid()
    or exists (
      select 1 from quote_requests qr
      where qr.id = quote_bids.request_id and qr.customer_id = auth.uid()
    )
    or auth_role() in ('admin','internal_staff')
  );

-- ─── 정책 4. 장착경매 (세미딜러=본인 발주, 추천풀 장착자=SELECT, 공개단계는 모든 장착자)
create policy "install_auction_owner" on install_auctions
  for all using (
    semi_dealer_id = auth.uid()
    or auth_role() in ('admin','internal_staff')
  );
create policy "install_auction_pool_visible" on install_auctions
  for select using (
    auth_role() = 'installer'
    and (
      stage = 'public'
      or auth.uid() = any(recommended_pool)
    )
  );
create policy "install_auction_customer_view" on install_auctions
  for select using (customer_id = auth.uid());
