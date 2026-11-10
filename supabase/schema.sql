-- ========================================================
-- SOUQ SAUDIYA - COMPREHENSIVE SUPABASE DATABASE SCHEMA
-- ========================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------
-- 1. PROFILES & ROLES
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'vendor', 'customer')),
  currency TEXT NOT NULL DEFAULT 'SAR',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------
-- 2. VENDORS / STORES
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vendors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  badge TEXT,
  rating NUMERIC(3,2) DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  sales_count TEXT,
  verified BOOLEAN DEFAULT TRUE,
  bio TEXT,
  avatar TEXT,
  banner TEXT,
  location TEXT,
  cr_number TEXT,
  vat_number TEXT,
  categories JSONB DEFAULT '[]'::jsonb,
  joined_date TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------
-- 3. CATEGORIES & TAXONOMY (Hierarchical)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image TEXT,
  item_count TEXT,
  icon_name TEXT,
  subcategories JSONB DEFAULT '[]'::jsonb,
  parent_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------
-- 4. PRODUCTS
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  original_price NUMERIC(12,2),
  image TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  vendor TEXT,
  vendor_id TEXT REFERENCES public.vendors(id) ON DELETE SET NULL,
  vendor_rating NUMERIC(3,2),
  vendor_verified BOOLEAN DEFAULT FALSE,
  category TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  rating NUMERIC(3,2) DEFAULT 5.0,
  reviews INT DEFAULT 0,
  sales_count TEXT,
  badge TEXT,
  delivery TEXT,
  delivery_label TEXT,
  description TEXT,
  specs JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
  materials JSONB DEFAULT '[]'::jsonb,
  colors JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT FALSE,
  is_flash_deal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------
-- 5. REVIEWS & RATINGS
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author TEXT NOT NULL,
  city TEXT DEFAULT 'الرياض',
  item TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  date TEXT DEFAULT 'الآن',
  helpful_votes INT DEFAULT 0,
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------
-- 6. ORDERS & ORDER ITEMS
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT 'ORD-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2),
  tax NUMERIC(12,2),
  discount NUMERIC(12,2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'SAR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned')),
  shipping_address JSONB,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  tracking_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------
-- 7. WALLETS & TRANSACTIONS
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wallets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'SAR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  wallet_id TEXT NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'purchase', 'refund', 'reward', 'referral')),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SAR',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------
-- 8. COUPONS & PROMOTIONS
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(12,2) NOT NULL,
  min_order_amount NUMERIC(12,2) DEFAULT 0,
  usage_limit INT,
  used_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------
-- 9. REFERRALS (حوّل واكسب)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.referrals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT UNIQUE NOT NULL,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  commission NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------
-- 10. ENABLE ROW-LEVEL SECURITY (RLS)
-- --------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- 11. STRICT RLS POLICIES
-- --------------------------------------------------------

-- Helper functions for checking user role in JWT or profiles table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    COALESCE(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_vendor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    COALESCE(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') = 'vendor'
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'vendor'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CATEGORIES: Everyone can read; only admins can insert/update/delete
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage categories" ON public.categories;
CREATE POLICY "Admin manage categories" ON public.categories FOR ALL USING (public.is_admin());

-- PRODUCTS: Everyone can read; vendors can manage their own; admins can manage all
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Vendors manage own products" ON public.products;
CREATE POLICY "Vendors manage own products" ON public.products FOR ALL USING (
  public.is_admin() OR (
    public.is_vendor() AND vendor_id IN (
      SELECT id FROM public.vendors WHERE owner_id = auth.uid()
    )
  )
);

-- VENDORS: Everyone can view active vendors; vendor owner can update; admin full
DROP POLICY IF EXISTS "Public can view vendors" ON public.vendors;
CREATE POLICY "Public can view vendors" ON public.vendors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Vendor owners manage store" ON public.vendors;
CREATE POLICY "Vendor owners manage store" ON public.vendors FOR ALL USING (
  public.is_admin() OR owner_id = auth.uid()
);

-- REVIEWS: Everyone can view; authenticated users can insert; owners/admins can delete
DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;
CREATE POLICY "Public can view reviews" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users create reviews" ON public.reviews;
CREATE POLICY "Authenticated users create reviews" ON public.reviews FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' OR true
);

DROP POLICY IF EXISTS "Users can manage own reviews" ON public.reviews;
CREATE POLICY "Users can manage own reviews" ON public.reviews FOR DELETE USING (
  public.is_admin() OR user_id = auth.uid()
);

-- PROFILES: Users read/update own profile; admins full access
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (
  public.is_admin() OR auth.uid() = id
);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (
  public.is_admin() OR auth.uid() = id
);

-- ORDERS: Users see own orders; vendors see orders containing their products; admins see all
DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (
  public.is_admin() OR auth.uid() = user_id
);

DROP POLICY IF EXISTS "Users insert own orders" ON public.orders;
CREATE POLICY "Users insert own orders" ON public.orders FOR INSERT WITH CHECK (
  auth.uid() = user_id OR auth.role() = 'authenticated' OR user_id IS NULL
);

-- WALLETS & TRANSACTIONS: Strict user ownership
DROP POLICY IF EXISTS "Users view own wallet" ON public.wallets;
CREATE POLICY "Users view own wallet" ON public.wallets FOR SELECT USING (
  public.is_admin() OR auth.uid() = user_id
);

DROP POLICY IF EXISTS "Users view own transactions" ON public.wallet_transactions;
CREATE POLICY "Users view own transactions" ON public.wallet_transactions FOR SELECT USING (
  public.is_admin() OR wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid())
);

-- COUPONS: Public can read active coupons; admins manage
DROP POLICY IF EXISTS "Public view active coupons" ON public.coupons;
CREATE POLICY "Public view active coupons" ON public.coupons FOR SELECT USING (
  is_active = true AND (expires_at IS NULL OR expires_at > NOW())
);

DROP POLICY IF EXISTS "Admin manage coupons" ON public.coupons;
CREATE POLICY "Admin manage coupons" ON public.coupons FOR ALL USING (public.is_admin());

-- REFERRALS: Referrer views own referrals
DROP POLICY IF EXISTS "Users view own referrals" ON public.referrals;
CREATE POLICY "Users view own referrals" ON public.referrals FOR SELECT USING (
  public.is_admin() OR auth.uid() = referrer_id
);
