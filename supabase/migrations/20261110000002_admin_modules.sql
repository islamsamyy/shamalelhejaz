-- ============================================================
-- SOUQ Admin Modules Schema Extensions & Admin RPCs
-- ============================================================

-- 1. Extend columns for full admin module persistence
alter table public.products
  add column if not exists moderation_status text not null default 'approved'
    check (moderation_status in ('pending','approved','rejected')),
  add column if not exists rejection_reason text,
  add column if not exists certificate_type text default 'مطابقة هيئة المواصفات والمقاييس SASO',
  add column if not exists sku text;

alter table public.vendors
  add column if not exists owner_name text,
  add column if not exists iban text,
  add column if not exists commission_rate numeric(5,2) not null default 8.00;

alter table public.categories
  add column if not exists commission numeric(5,2) not null default 8.00,
  add column if not exists vat_rate numeric(5,2) not null default 15.00,
  add column if not exists is_active boolean not null default true,
  add column if not exists name_en text;

alter table public.coupons
  add column if not exists description text;

alter table public.profiles
  add column if not exists city text default 'الرياض',
  add column if not exists tier text default 'Individual'
    check (tier in ('VIP Sovereign','Corporate','Individual'));

-- 2. Admin-only RPC: Credit/Adjust Customer Wallet Balance with Transaction Audit
create or replace function public.admin_credit_wallet(
  p_user_id uuid,
  p_amount numeric,
  p_reason text default 'مكافأة ولاء سيادية'
) returns numeric
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_wallet_id text;
  v_new_balance numeric(12,2);
begin
  if not private.is_admin() then
    raise exception 'forbidden: admin role required';
  end if;
  if p_amount is null or p_amount = 0 then
    raise exception 'amount must be non-zero';
  end if;

  insert into public.wallets (user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  update public.wallets
  set balance = balance + p_amount,
      updated_at = now()
  where user_id = p_user_id
  returning id, balance into v_wallet_id, v_new_balance;

  insert into public.wallet_transactions (wallet_id, type, amount, description, status)
  values (
    v_wallet_id,
    case when p_amount >= 0 then 'reward' else 'withdrawal' end,
    abs(p_amount),
    coalesce(nullif(p_reason, ''), 'تعديل رصيد إداري'),
    'completed'
  );

  insert into public.audit_log (actor_id, action, entity, entity_id, meta)
  values (
    (select auth.uid()),
    'wallet.admin_credit',
    'wallet',
    v_wallet_id,
    jsonb_build_object('user_id', p_user_id, 'amount', p_amount, 'reason', p_reason)
  );

  return v_new_balance;
end;
$$;

grant execute on function public.admin_credit_wallet(uuid, numeric, text) to authenticated, service_role;

-- 3. Default app_settings keys for carriers & flash sale
insert into public.app_settings (key, value) values
  ('carriers', '{"spl": true, "smsa": true, "dhl": false}'::jsonb),
  ('flash_sale', '{"active": true, "title": "خزائن صقور الجزيرة • إصدارات محدودة", "end_label": "٢٤ ساعة و ٠٤ دقائق متبقية"}'::jsonb)
on conflict (key) do nothing;
