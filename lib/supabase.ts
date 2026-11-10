import { createBrowserClient } from "@supabase/ssr";
import { Product, Category } from "./catalogData";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Set them in .env.local (see .env.example)."
  );
}

// Cookie-based browser client so the server (proxy, route handlers) sees the same session.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export interface DbProductRow {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  image: string;
  images: string[] | null;
  vendor: string | null;
  vendor_id: string | null;
  vendor_rating: number | null;
  vendor_verified: boolean | null;
  category: string;
  category_slug: string;
  rating: number | null;
  reviews: number | null;
  sales_count: string | null;
  badge: string | null;
  delivery: string | null;
  delivery_label: string | null;
  description: string | null;
  specs: { label: string; value: string }[] | null;
  features: string[] | null;
  stock_status: "in_stock" | "low_stock" | "out_of_stock" | null;
  materials: string[] | null;
  colors: string[] | null;
  is_featured: boolean | null;
  is_flash_deal: boolean | null;
  created_at: string;
}

export interface DbCategoryRow {
  id: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  item_count: string | null;
  icon_name: string | null;
  subcategories: { name: string; count: string; popular?: boolean }[] | null;
  parent_id: string | null;
  slug: string;
  department: string | null;
}

export interface DbVendorRow {
  id: string;
  name: string;
  slug: string;
  badge: string | null;
  rating: number | null;
  reviews_count: number | null;
  sales_count: string | null;
  verified: boolean | null;
  bio: string | null;
  avatar: string | null;
  banner: string | null;
  location: string | null;
  cr_number: string | null;
  vat_number: string | null;
  categories: string[] | null;
  joined_date: string | null;
}

export interface DbReviewRow {
  id: string;
  product_id: string;
  author: string;
  city: string | null;
  item: string | null;
  rating: number;
  comment: string;
  date: string | null;
  helpful_votes: number | null;
  verified: boolean | null;
  created_at: string;
}

// Convert DB snake_case to Product interface
export function mapDbProductToProduct(row: DbProductRow): Product {
  return {
    id: row.id,
    title: row.title,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    image: row.image,
    images: Array.isArray(row.images) ? row.images : row.images ? [row.images] : [row.image],
    vendor: row.vendor || "سوق السعودية",
    vendorId: row.vendor_id || undefined,
    vendorRating: row.vendor_rating ? Number(row.vendor_rating) : 4.9,
    vendorVerified: row.vendor_verified ?? true,
    category: row.category,
    categorySlug: row.category_slug,
    rating: row.rating ? Number(row.rating) : 5.0,
    reviews: row.reviews ? Number(row.reviews) : 0,
    salesCount: row.sales_count || "١٠٠+ بيعت",
    badge: row.badge || "منتج معتمد",
    delivery: row.delivery || "express",
    deliveryLabel: row.delivery_label || "توصيل سريع",
    description: row.description || "",
    specs: Array.isArray(row.specs) ? row.specs : [],
    features: Array.isArray(row.features) ? row.features : [],
    stockStatus: (row.stock_status as "in_stock" | "low_stock") || "in_stock",
    materials: Array.isArray(row.materials) ? row.materials : [],
    colors: Array.isArray(row.colors) ? row.colors : [],
  };
}

// Convert DB category to Category interface
export function mapDbCategoryToCategory(row: DbCategoryRow): Category {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || "",
    image: row.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    itemCount: row.item_count || "١,٠٠٠+ منتج",
    iconName: row.icon_name || "box",
    subcategories: Array.isArray(row.subcategories) ? row.subcategories : [],
  };
}

// -------------------------------------------------------------
// Real-time & Async Data Fetching Helpers from Supabase
// -------------------------------------------------------------

export async function fetchProductsFromSupabase(categorySlug?: string): Promise<Product[]> {
  try {
    let query = supabase.from("products").select("*").order("created_at", { ascending: false });
    if (categorySlug && categorySlug !== "all") {
      query = query.eq("category_slug", categorySlug);
    }
    const { data, error } = await query;
    if (error) {
      console.error("Error fetching products from Supabase:", error.message);
      return [];
    }
    return (data || []).map(mapDbProductToProduct);
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return [];
  }
}

export async function fetchProductByIdFromSupabase(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      console.warn("Product not found in Supabase:", id, error?.message);
      return null;
    }
    return mapDbProductToProduct(data);
  } catch (err) {
    console.error("Failed to fetch product by id:", err);
    return null;
  }
}

export async function fetchCategoriesFromSupabase(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching categories from Supabase:", error.message);
      return [];
    }
    return (data || []).map(mapDbCategoryToCategory);
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    return [];
  }
}

export async function fetchTopCategoriesFromSupabase(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .in("id", ["electronics", "mobiles", "home-kitchen", "beauty-care", "fashion-apparel", "sports-fitness"]);

    if (error || !data || data.length === 0) {
      return fetchCategoriesFromSupabase();
    }
    return data.map(mapDbCategoryToCategory);
  } catch (err) {
    console.error("Failed to fetch top categories:", err);
    return [];
  }
}

export async function fetchReviewsFromSupabase(productId?: string) {
  try {
    let query = supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (productId) {
      query = query.eq("product_id", productId);
    }
    const { data, error } = await query;
    if (error) {
      console.error("Error fetching reviews from Supabase:", error.message);
      return [];
    }
    return (data || []).map((r) => ({
      id: r.id,
      name: r.author,
      title: r.item || "تقييم منتج",
      city: r.city || "الرياض",
      item: r.item || "",
      rating: r.rating,
      comment: r.comment,
      date: r.date || "مؤخراً",
      verified: r.verified ?? true,
      helpfulVotes: r.helpful_votes || 0,
      helpfulCount: r.helpful_votes || 0,
    }));
  } catch (err) {
    console.error("Failed to fetch reviews:", err);
    return [];
  }
}

export async function submitReviewToSupabase(review: {
  product_id: string;
  author: string;
  city?: string;
  item?: string;
  rating: number;
  comment: string;
}) {
  return supabase.from("reviews").insert([
    {
      product_id: review.product_id,
      author: review.author,
      city: review.city || "الرياض",
      item: review.item,
      rating: review.rating,
      comment: review.comment,
      verified: true,
      helpful_votes: 1,
    },
  ]);
}

export interface CreateOrderPayload {
  items: any[];
  total: number;
  subtotal: number;
  tax: number;
  discount?: number;
  currency?: string;
  shipping_address?: any;
  payment_method?: string;
  payment_status?: string;
}

export async function createOrderInSupabase(orderData: CreateOrderPayload) {
  try {
    const { data, error } = await supabase.from("orders").insert([
      {
        items: orderData.items,
        total: orderData.total,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        discount: orderData.discount || 0,
        currency: orderData.currency || "SAR",
        status: "confirmed",
        shipping_address: orderData.shipping_address || {},
        payment_method: orderData.payment_method || "mada",
        payment_status: orderData.payment_status || "paid",
      },
    ]);

    if (error) {
      console.warn("Notice saving order to Supabase:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    console.error("Failed to insert order into Supabase:", err);
    return { success: false, error: err.message };
  }
}

export async function fetchOrdersFromSupabase() {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Could not fetch orders from Supabase:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Failed to fetch orders:", err);
    return [];
  }
}

export async function fetchVendorsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Could not fetch vendors from Supabase:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Failed to fetch vendors:", err);
    return [];
  }
}
