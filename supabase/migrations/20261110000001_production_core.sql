-- ============================================================
-- SOUQ production core migration
-- Idempotent: safe to re-run. Applies on top of supabase/schema.sql
-- ============================================================

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

-- ------------------------------------------------------------
-- 0. Wipe demo data (platform must run on real data only)
-- ------------------------------------------------------------
delete from public.reviews;
delete from public.orders;
delete from public.products;
delete from public.vendors;
delete from public.wallet_transactions;
delete from public.referrals;
delete from public.coupons;

-- ------------------------------------------------------------
-- 1. Extra columns on existing tables
-- ------------------------------------------------------------
alter table public.vendors  alter column verified set default false;
alter table public.products add column if not exists stock_qty int not null default 0 check (stock_qty >= 0);
alter table public.products add column if not exists is_active boolean not null default true;
alter table public.products add column if not exists updated_at timestamptz not null default now();
alter table public.vendors  add column if not exists status text not null default 'pending' check (status in ('pending','approved','suspended'));
alter table public.orders   add column if not exists shipping_fee numeric(12,2) not null default 0;
alter table public.orders   add column if not exists coupon_code text;
alter table public.orders   add column if not exists notes text;
alter table public.orders   add column if not exists payment_gateway text;
alter table public.orders   alter column total set default 0;

-- ------------------------------------------------------------
-- 2. New tables
-- ------------------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  vendor_id text references public.vendors(id) on delete set null,
  title text not null,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  line_total numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  full_name text not null,
  phone text not null,
  city text not null,
  district text,
  street text,
  building text,
  postal_code text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_gateways (
  code text primary key check (code in ('moyasar','hyperpay','tap','stripe','cod','wallet')),
  name text not null,
  enabled boolean not null default false,
  mode text not null default 'sandbox' check (mode in ('sandbox','live')),
  public_config jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  gateway text not null references public.payment_gateways(code),
  amount numeric(12,2) not null,
  currency text not null default 'SAR',
  status text not null default 'pending' check (status in ('pending','authorized','paid','failed','refunded')),
  gateway_ref text,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (gateway, gateway_ref)
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique references public.orders(id) on delete cascade,
  invoice_number text not null unique,
  uuid_zatca uuid not null default gen_random_uuid(),
  subtotal numeric(12,2) not null,
  vat numeric(12,2) not null,
  total numeric(12,2) not null,
  issued_at timestamptz not null default now(),
  zatca_status text not null default 'pending' check (zatca_status in ('pending','reported','rejected')),
  qr_payload text
);

create table if not exists public.vendor_payouts (
  id uuid primary key default gen_random_uuid(),
  vendor_id text not null references public.vendors(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending','paid','rejected')),
  note text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  entity text,
  entity_id text,
  meta jsonb,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. Indexes
-- ------------------------------------------------------------
create index if not exists idx_products_vendor on public.products(vendor_id);
create index if not exists idx_products_category_slug on public.products(category_slug);
create index if not exists idx_products_active on public.products(is_active) where is_active;
create index if not exists idx_reviews_product on public.reviews(product_id);
create index if not exists idx_reviews_user on public.reviews(user_id);
create index if not exists idx_orders_user on public.orders(user_id, created_at desc);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_items_vendor on public.order_items(vendor_id);
create index if not exists idx_order_items_product on public.order_items(product_id);
create index if not exists idx_addresses_user on public.addresses(user_id);
create index if not exists idx_notifications_user on public.notifications(user_id, is_read);
create index if not exists idx_payments_order on public.payments(order_id);
create index if not exists idx_payments_user on public.payments(user_id);
create index if not exists idx_wallet_tx_wallet on public.wallet_transactions(wallet_id, created_at desc);
create index if not exists idx_vendors_owner on public.vendors(owner_id);
create index if not exists idx_referrals_referrer on public.referrals(referrer_id);
create index if not exists idx_referrals_referred on public.referrals(referred_id);
create index if not exists idx_payouts_vendor on public.vendor_payouts(vendor_id);
create index if not exists idx_categories_parent on public.categories(parent_id);

-- ------------------------------------------------------------
-- 4. Helper functions (private schema, not exposed by the Data API)
-- ------------------------------------------------------------
create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;

create or replace function private.my_vendor_ids()
returns setof text language sql stable security definer set search_path = ''
as $$
  select id from public.vendors where owner_id = (select auth.uid()) and status = 'approved';
$$;

create or replace function private.touch_updated_at()
returns trigger language plpgsql set search_path = ''
as $$ begin new.updated_at = now(); return new; end; $$;

create or replace function private.guard_profile_update()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and not private.is_admin() then
    if new.role is distinct from old.role then
      raise exception 'role cannot be changed';
    end if;
  end if;
  new.updated_at = now();
  return new;
end; $$;

create or replace function private.guard_vendor_update()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and not private.is_admin() then
    if new.verified is distinct from old.verified
       or new.status is distinct from old.status
       or new.owner_id is distinct from old.owner_id then
      raise exception 'only admins can change vendor verification, status or owner';
    end if;
  end if;
  return new;
end; $$;

create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.phone, 'customer')
  on conflict (id) do nothing;
  insert into public.wallets (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end; $$;

-- keep public.is_admin()/is_vendor() out of the exposed schema
-- CASCADE only removes the old policies that referenced them; all policies are recreated below
drop function if exists public.is_admin() cascade;
drop function if exists public.is_vendor() cascade;

-- triggers
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

drop trigger if exists trg_profile_guard on public.profiles;
create trigger trg_profile_guard before update on public.profiles
  for each row execute function private.guard_profile_update();

drop trigger if exists trg_vendor_guard on public.vendors;
create trigger trg_vendor_guard before update on public.vendors
  for each row execute function private.guard_vendor_update();

drop trigger if exists trg_products_touch on public.products;
create trigger trg_products_touch before update on public.products
  for each row execute function private.touch_updated_at();
drop trigger if exists trg_orders_touch on public.orders;
create trigger trg_orders_touch before update on public.orders
  for each row execute function private.touch_updated_at();
drop trigger if exists trg_wallets_touch on public.wallets;
create trigger trg_wallets_touch before update on public.wallets
  for each row execute function private.touch_updated_at();
drop trigger if exists trg_payments_touch on public.payments;
create trigger trg_payments_touch before update on public.payments
  for each row execute function private.touch_updated_at();

-- backfill profiles/wallets for existing auth users
insert into public.profiles (id, email, full_name, role)
select u.id, u.email, coalesce(u.raw_user_meta_data ->> 'full_name',''), 'customer'
from auth.users u on conflict (id) do nothing;
insert into public.wallets (user_id) select id from auth.users on conflict (user_id) do nothing;

-- ------------------------------------------------------------
-- 5. RLS: enable everywhere, drop all old policies, recreate
-- ------------------------------------------------------------
do $$
declare r record;
begin
  for r in select schemaname, tablename, policyname from pg_policies where schemaname = 'public' loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

alter table public.profiles enable row level security;
alter table public.vendors enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.reviews enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.coupons enable row level security;
alter table public.referrals enable row level security;
alter table public.addresses enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.notifications enable row level security;
alter table public.payment_gateways enable row level security;
alter table public.payments enable row level security;
alter table public.invoices enable row level security;
alter table public.vendor_payouts enable row level security;
alter table public.app_settings enable row level security;
alter table public.audit_log enable row level security;

-- profiles
create policy profiles_select on public.profiles for select to authenticated
  using ((select auth.uid()) = id or private.is_admin());
create policy profiles_update on public.profiles for update to authenticated
  using ((select auth.uid()) = id or private.is_admin())
  with check ((select auth.uid()) = id or private.is_admin());

-- categories
create policy categories_read on public.categories for select to anon, authenticated using (true);
create policy categories_admin_ins on public.categories for insert to authenticated with check (private.is_admin());
create policy categories_admin_upd on public.categories for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy categories_admin_del on public.categories for delete to authenticated using (private.is_admin());

-- vendors
create policy vendors_read on public.vendors for select to anon, authenticated
  using (status = 'approved' or owner_id = (select auth.uid()) or private.is_admin());
create policy vendors_apply on public.vendors for insert to authenticated
  with check (owner_id = (select auth.uid()) and verified = false and status = 'pending');
create policy vendors_update on public.vendors for update to authenticated
  using (owner_id = (select auth.uid()) or private.is_admin())
  with check (owner_id = (select auth.uid()) or private.is_admin());
create policy vendors_delete on public.vendors for delete to authenticated using (private.is_admin());

-- products
create policy products_read on public.products for select to anon, authenticated
  using (is_active or vendor_id in (select private.my_vendor_ids()) or private.is_admin());
create policy products_ins on public.products for insert to authenticated
  with check (vendor_id in (select private.my_vendor_ids()) or private.is_admin());
create policy products_upd on public.products for update to authenticated
  using (vendor_id in (select private.my_vendor_ids()) or private.is_admin())
  with check (vendor_id in (select private.my_vendor_ids()) or private.is_admin());
create policy products_del on public.products for delete to authenticated
  using (vendor_id in (select private.my_vendor_ids()) or private.is_admin());

-- reviews: only buyers of delivered orders may review
create policy reviews_read on public.reviews for select to anon, authenticated using (true);
create policy reviews_ins on public.reviews for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.order_items oi join public.orders o on o.id = oi.order_id
      where oi.product_id = reviews.product_id and o.user_id = (select auth.uid()) and o.status = 'delivered'
    )
  );
create policy reviews_upd on public.reviews for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy reviews_del on public.reviews for delete to authenticated
  using (user_id = (select auth.uid()) or private.is_admin());

-- orders & items: reads only; writes go through server RPC (service_role)
create policy orders_read on public.orders for select to authenticated
  using (
    user_id = (select auth.uid()) or private.is_admin()
    or exists (select 1 from public.order_items oi where oi.order_id = orders.id and oi.vendor_id in (select private.my_vendor_ids()))
  );
create policy orders_admin_upd on public.orders for update to authenticated
  using (private.is_admin()) with check (private.is_admin());

create policy order_items_read on public.order_items for select to authenticated
  using (
    private.is_admin()
    or vendor_id in (select private.my_vendor_ids())
    or exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = (select auth.uid()))
  );

-- wallets, transactions, payments, invoices: read-own, writes server-only
create policy wallets_read on public.wallets for select to authenticated
  using (user_id = (select auth.uid()) or private.is_admin());
create policy wallet_tx_read on public.wallet_transactions for select to authenticated
  using (private.is_admin() or wallet_id in (select id from public.wallets where user_id = (select auth.uid())));
create policy payments_read on public.payments for select to authenticated
  using (user_id = (select auth.uid()) or private.is_admin());
create policy invoices_read on public.invoices for select to authenticated
  using (private.is_admin() or exists (select 1 from public.orders o where o.id = invoices.order_id and o.user_id = (select auth.uid())));

-- coupons
create policy coupons_read on public.coupons for select to anon, authenticated
  using ((is_active and (expires_at is null or expires_at > now())) or private.is_admin());
create policy coupons_admin_ins on public.coupons for insert to authenticated with check (private.is_admin());
create policy coupons_admin_upd on public.coupons for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy coupons_admin_del on public.coupons for delete to authenticated using (private.is_admin());

-- referrals
create policy referrals_read on public.referrals for select to authenticated
  using (referrer_id = (select auth.uid()) or referred_id = (select auth.uid()) or private.is_admin());
create policy referrals_ins on public.referrals for insert to authenticated
  with check (referrer_id = (select auth.uid()) and referred_id is null and commission = 0 and status = 'pending');

-- owner-only tables
create policy addresses_all on public.addresses for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy cart_all on public.cart_items for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy wishlist_all on public.wishlists for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy notif_read on public.notifications for select to authenticated
  using (user_id = (select auth.uid()) or private.is_admin());
create policy notif_upd on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy notif_del on public.notifications for delete to authenticated
  using (user_id = (select auth.uid()));

-- payment gateways & settings
create policy gateways_read on public.payment_gateways for select to anon, authenticated
  using (enabled or private.is_admin());
create policy gateways_admin_ins on public.payment_gateways for insert to authenticated with check (private.is_admin());
create policy gateways_admin_upd on public.payment_gateways for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy gateways_admin_del on public.payment_gateways for delete to authenticated using (private.is_admin());
create policy settings_read on public.app_settings for select to anon, authenticated using (true);
create policy settings_admin_ins on public.app_settings for insert to authenticated with check (private.is_admin());
create policy settings_admin_upd on public.app_settings for update to authenticated using (private.is_admin()) with check (private.is_admin());

-- payouts
create policy payouts_read on public.vendor_payouts for select to authenticated
  using (private.is_admin() or vendor_id in (select private.my_vendor_ids()));
create policy payouts_req on public.vendor_payouts for insert to authenticated
  with check (vendor_id in (select private.my_vendor_ids()) and status = 'pending');
create policy payouts_admin_upd on public.vendor_payouts for update to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- audit log
create policy audit_read on public.audit_log for select to authenticated using (private.is_admin());

-- ------------------------------------------------------------
-- 6. Table privileges (explicit; RLS still decides rows)
-- ------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;
grant select on public.categories, public.vendors, public.products, public.reviews,
  public.coupons, public.payment_gateways, public.app_settings to anon;
grant select, insert, update, delete on public.categories, public.vendors, public.products,
  public.reviews, public.coupons, public.payment_gateways, public.addresses, public.cart_items,
  public.wishlists, public.notifications to authenticated;
grant select, update on public.profiles, public.orders, public.vendor_payouts to authenticated;
grant insert on public.vendor_payouts, public.referrals to authenticated;
grant select on public.referrals, public.order_items, public.wallets, public.wallet_transactions,
  public.payments, public.invoices, public.audit_log to authenticated;
grant select, insert, update on public.app_settings to authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
revoke execute on all functions in schema private from public;
grant execute on function private.is_admin(), private.my_vendor_ids() to anon, authenticated, service_role;

-- ------------------------------------------------------------
-- 7. Server-only RPCs (callable by service_role only)
-- ------------------------------------------------------------
create or replace function public.create_order_secure(
  p_user uuid, p_items jsonb, p_address jsonb, p_gateway text, p_coupon text default null
) returns text language plpgsql security definer set search_path = '' as $$
declare
  v_order_id text;
  v_item jsonb;
  v_prod record;
  v_qty int;
  v_subtotal numeric(12,2) := 0;
  v_discount numeric(12,2) := 0;
  v_shipping numeric(12,2) := 0;
  v_vat_rate numeric := 0.15;
  v_free_over numeric := 200;
  v_flat numeric := 25;
  v_tax numeric(12,2);
  v_total numeric(12,2);
  v_cp record;
  v_wallet record;
begin
  if p_user is null then raise exception 'user required'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'cart is empty'; end if;
  if not exists (select 1 from public.payment_gateways where code = p_gateway and enabled) then
    raise exception 'payment method not available';
  end if;

  select coalesce((value #>> '{}')::numeric, 0.15) into v_vat_rate from public.app_settings where key = 'vat_rate';
  select coalesce((value #>> '{}')::numeric, 200) into v_free_over from public.app_settings where key = 'free_shipping_threshold';
  select coalesce((value #>> '{}')::numeric, 25) into v_flat from public.app_settings where key = 'shipping_flat';
  v_vat_rate := coalesce(v_vat_rate, 0.15); v_free_over := coalesce(v_free_over, 200); v_flat := coalesce(v_flat, 25);

  insert into public.orders (user_id, items, total, status, payment_status, payment_method, payment_gateway, shipping_address)
  values (p_user, '[]'::jsonb, 0, 'pending', 'pending', p_gateway, p_gateway, p_address)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item ->> 'quantity')::int;
    if v_qty is null or v_qty <= 0 then raise exception 'invalid quantity'; end if;
    select id, title, price, vendor_id into v_prod from public.products where id = v_item ->> 'product_id' and is_active for update;
    if not found then raise exception 'product not found: %', v_item ->> 'product_id'; end if;
    update public.products set stock_qty = stock_qty - v_qty where id = v_prod.id and stock_qty >= v_qty;
    if not found then raise exception 'insufficient stock for %', v_prod.title; end if;
    insert into public.order_items (order_id, product_id, vendor_id, title, unit_price, quantity, line_total)
    values (v_order_id, v_prod.id, v_prod.vendor_id, v_prod.title, v_prod.price, v_qty, v_prod.price * v_qty);
    v_subtotal := v_subtotal + v_prod.price * v_qty;
  end loop;

  if p_coupon is not null and p_coupon <> '' then
    select * into v_cp from public.coupons
      where upper(code) = upper(p_coupon) and is_active and (expires_at is null or expires_at > now())
        and (usage_limit is null or used_count < usage_limit) for update;
    if not found then raise exception 'invalid coupon'; end if;
    if v_subtotal < coalesce(v_cp.min_order_amount, 0) then raise exception 'order below coupon minimum'; end if;
    v_discount := case when v_cp.discount_type = 'percentage'
      then round(v_subtotal * v_cp.discount_value / 100, 2) else v_cp.discount_value end;
    v_discount := least(v_discount, v_subtotal);
    update public.coupons set used_count = used_count + 1 where id = v_cp.id;
  end if;

  v_shipping := case when v_subtotal - v_discount >= v_free_over then 0 else v_flat end;
  v_tax := round((v_subtotal - v_discount) * v_vat_rate, 2);
  v_total := v_subtotal - v_discount + v_tax + v_shipping;

  update public.orders set subtotal = v_subtotal, discount = v_discount, tax = v_tax, shipping_fee = v_shipping,
    total = v_total, coupon_code = nullif(p_coupon, '') where id = v_order_id;

  insert into public.payments (order_id, user_id, gateway, amount, status)
  values (v_order_id, p_user, p_gateway, v_total, 'pending');

  if p_gateway = 'wallet' then
    select * into v_wallet from public.wallets where user_id = p_user for update;
    if not found or v_wallet.balance < v_total then raise exception 'insufficient wallet balance'; end if;
    update public.wallets set balance = balance - v_total where id = v_wallet.id;
    insert into public.wallet_transactions (wallet_id, type, amount, description, status)
    values (v_wallet.id, 'purchase', v_total, 'Order ' || v_order_id, 'completed');
    perform public.mark_order_paid_secure(v_order_id, 'wallet', 'wallet-' || v_order_id, null);
  elsif p_gateway = 'cod' then
    update public.orders set status = 'confirmed' where id = v_order_id;
  end if;

  delete from public.cart_items where user_id = p_user;
  insert into public.notifications (user_id, title, body, link)
  values (p_user, 'Order placed', 'Your order ' || v_order_id || ' was received.', '/account/orders');
  return v_order_id;
end; $$;

create or replace function public.mark_order_paid_secure(
  p_order text, p_gateway text, p_ref text, p_raw jsonb
) returns void language plpgsql security definer set search_path = '' as $$
declare v_o record; v_n bigint;
begin
  select * into v_o from public.orders where id = p_order for update;
  if not found then raise exception 'order not found'; end if;
  if v_o.payment_status = 'paid' then return; end if;
  update public.payments set status = 'paid', gateway_ref = p_ref, raw = p_raw
    where order_id = p_order and gateway = p_gateway;
  update public.orders set payment_status = 'paid', status = 'confirmed' where id = p_order;
  select count(*) + 1 into v_n from public.invoices;
  insert into public.invoices (order_id, invoice_number, subtotal, vat, total)
  values (p_order, 'INV-' || to_char(now(), 'YYYY') || '-' || lpad(v_n::text, 6, '0'),
          coalesce(v_o.subtotal, 0) - coalesce(v_o.discount, 0), coalesce(v_o.tax, 0), v_o.total)
  on conflict (order_id) do nothing;
  insert into public.audit_log (action, entity, entity_id, meta)
  values ('payment.paid', 'order', p_order, jsonb_build_object('gateway', p_gateway, 'ref', p_ref));
end; $$;

revoke execute on function public.create_order_secure(uuid, jsonb, jsonb, text, text) from public, anon, authenticated;
revoke execute on function public.mark_order_paid_secure(text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.create_order_secure(uuid, jsonb, jsonb, text, text) to service_role;
grant execute on function public.mark_order_paid_secure(text, text, text, jsonb) to service_role;

-- ------------------------------------------------------------
-- 8. Platform configuration (not demo data)
-- ------------------------------------------------------------
insert into public.payment_gateways (code, name, enabled, mode, sort_order) values
  ('cod','Cash on delivery', true,  'live',    1),
  ('wallet','Souq wallet',   true,  'live',    2),
  ('moyasar','Moyasar (mada, Apple Pay)', false, 'sandbox', 3),
  ('hyperpay','HyperPay',    false, 'sandbox', 4),
  ('tap','Tap Payments',     false, 'sandbox', 5),
  ('stripe','Stripe',        false, 'sandbox', 6)
on conflict (code) do nothing;

insert into public.app_settings (key, value) values
  ('vat_rate', '0.15'), ('free_shipping_threshold', '200'), ('shipping_flat', '25'), ('currency', '"SAR"')
on conflict (key) do nothing;
