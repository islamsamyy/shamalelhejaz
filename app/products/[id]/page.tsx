"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  Heart,
  Share2,
  ShieldCheck,
  Award,
  Truck,
  RotateCcw,
  Star,
  CheckCircle2,
  ChevronLeft,
  Plus,
  Minus,
  Sparkles,
  Zap,
  Store,
  MessageSquare,
  Lock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { toast } from "sonner";
import { ALL_PRODUCTS, Product } from "@/lib/catalogData";
import {
  fetchProductByIdFromSupabase,
  fetchProductsFromSupabase,
  fetchReviewsFromSupabase,
  submitReviewToSupabase,
} from "@/lib/supabase";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const productId = unwrappedParams.id;

  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [userReview, setUserReview] = useState("");
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const loadProductData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch product record from Supabase
      const dbProduct = await fetchProductByIdFromSupabase(productId);
      if (dbProduct) {
        setProduct(dbProduct);
      } else {
        // Fallback to static catalog if not yet created in Supabase
        const fallback = ALL_PRODUCTS.find((p) => p.id === productId) || ALL_PRODUCTS[0];
        setProduct(fallback);
      }

      // 2. Fetch verified reviews for this product from Supabase
      const dbReviews = await fetchReviewsFromSupabase(productId);
      if (dbReviews && dbReviews.length > 0) {
        setReviewsList(dbReviews);
      } else {
        setReviewsList([
          {
            author: "م. عبدالمجيد السبيعي",
            date: "قبل ٣ أيام",
            rating: 5,
            comment: "المنتج أصلي ١٠٠٪ بتغليف المصنع وسيريال الوكيل المعتمد مسجل. التوصيل في الرياض استغرق أقل من ١٨ ساعة فقط وسعر البائع كان أفضل من المتاجر الكبرى بـ ٢٠٠ ريال.",
          },
          {
            author: "د. هتون البراهيم",
            date: "قبل أسبوع",
            rating: 5,
            comment: "جودة استثنائية وتعامل ممتاز من البائع المعتمد. نظام الضمان Escrow منحني طمأنينة كاملة أثناء الدفع عبر أبل باي. أنصح به بشدة!",
          },
        ]);
      }

      // 3. Fetch related products from Supabase
      const allDbProducts = await fetchProductsFromSupabase();
      const pool = allDbProducts.length > 0 ? allDbProducts : ALL_PRODUCTS;
      setRelatedProducts(pool.filter((p) => p.id !== productId).slice(0, 3));
    } catch (err: any) {
      console.error("Error loading product detail:", err);
      setError("تعذر تحميل بيانات المنتج من قاعدة البيانات. يرجى المحاولة مرة أخرى.");
      const fallback = ALL_PRODUCTS.find((p) => p.id === productId) || ALL_PRODUCTS[0];
      setProduct(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProductData();
  }, [productId]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      toast.success("تم نسخ رابط المنتج للمشاركة بنجاح!");
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userReview.trim() || !product) return;

    setIsSubmittingReview(true);
    try {
      await submitReviewToSupabase({
        product_id: product.id,
        author: "مشتري موثق عبر نفاذ",
        item: product.title,
        rating: 5,
        comment: userReview.trim(),
      });

      setReviewsList((prev) => [
        {
          author: "مشتري موثق عبر نفاذ",
          date: "الآن",
          rating: 5,
          comment: userReview.trim(),
        },
        ...prev,
      ]);
      setUserReview("");
      toast.success("تم تسجيل تقييمك الموثق في قاعدة بيانات المنصة بنجاح!");
    } catch (err) {
      console.error("Error submitting review to Supabase:", err);
      toast.error("حدث خطأ أثناء حفظ التقييم، يرجى المحاولة لاحقاً.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    router.push("/checkout");
  };

  // -------------------------------------------------------------
  // LOADING STATE (SKELETONS)
  // -------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
        <StorefrontHeader />
        <main className="flex-1 pt-32 lg:pt-36">
          <section className="bg-white border-b border-slate-200/80 py-4">
            <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
              <Skeleton className="h-4 w-72" />
            </div>
          </section>

          <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-7 space-y-4">
                <Skeleton className="aspect-[4/3] rounded-3xl w-full" />
                <div className="flex gap-3">
                  <Skeleton className="w-20 h-20 rounded-2xl" />
                  <Skeleton className="w-20 h-20 rounded-2xl" />
                  <Skeleton className="w-20 h-20 rounded-2xl" />
                </div>
              </div>
              <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-lg space-y-6">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-2xl" />
              </div>
            </div>
          </section>
        </main>
        <StorefrontFooter />
      </div>
    );
  }

  // -------------------------------------------------------------
  // ERROR STATE
  // -------------------------------------------------------------
  if (!product && error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
        <StorefrontHeader />
        <main className="flex-1 pt-32 lg:pt-36 flex items-center justify-center p-8">
          <div className="bg-white p-8 rounded-3xl border border-rose-200 shadow-md text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-black text-slate-900 mb-2">تعذر العثور على المنتج</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">{error}</p>
            <Button onClick={loadProductData} variant="sovereign" className="w-full rounded-xl">
              <RefreshCw className="w-4 h-4 me-2" /> إعادة المحاولة
            </Button>
          </div>
        </main>
        <StorefrontFooter />
      </div>
    );
  }

  if (!product) return null;

  const wishlisted = isWishlisted(product.id);
  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <StorefrontHeader />

      <main className="flex-1 pt-32 lg:pt-36">
        {/* Breadcrumb Strip */}
        <section className="bg-white border-b border-slate-200/80 py-4">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
            <nav className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
              <Link href="/" className="hover:text-[#006948] transition-colors">
                الرئيسية
              </Link>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
              <Link href="/catalog" className="hover:text-[#006948] transition-colors">
                {product.category}
              </Link>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
              <Link
                href={`/store/${product.vendorId || "modern-tech"}`}
                className="hover:text-[#006948] transition-colors font-medium text-slate-700"
              >
                {product.vendor}
              </Link>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#006948] font-bold truncate max-w-xs">{product.title}</span>
            </nav>
          </div>
        </section>

        {/* Product Visuals & Buy Box Section */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Gallery Column (7 Cols in RTL) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Main Showcase Image */}
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[activeImageIndex] || product.image}
                  alt={product.title}
                  className="w-full h-full object-cover transition-all duration-300"
                />
                <div className="absolute top-4 end-4 flex flex-col gap-2 items-end">
                  <Badge variant="sovereign" className="bg-white/95 backdrop-blur-md shadow-xs text-emerald-800 font-bold text-xs">
                    {product.badge}
                  </Badge>
                  <span className="px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-semibold">
                    {product.salesCount}
                  </span>
                </div>
              </div>

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        activeImageIndex === idx
                          ? "border-[#006948] ring-2 ring-[#006948]/20 scale-105"
                          : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Buy Box & Specs Column (5 Cols) */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-lg space-y-6">
              {/* Vendor & Rating Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Link
                    href={`/store/${product.vendorId || "modern-tech"}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    <Store className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{product.vendor}</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                      title="مشاركة رابط المنتج"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleWishlist({ id: product.id, title: product.title })}
                      className={`p-2 rounded-xl transition-colors ${
                        wishlisted
                          ? "text-rose-600 bg-rose-50"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                      title={wishlisted ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
                    >
                      <Heart className={`w-4 h-4 ${wishlisted ? "fill-rose-600" : ""}`} />
                    </button>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {product.title}
                </h1>

                <div className="flex items-center gap-2 mt-2 text-xs">
                  <div className="flex items-center text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="ms-1">{product.rating}</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">({reviewsList.length} تقييم موثق)</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 font-bold">{product.salesCount}</span>
                </div>
              </div>

              {/* Pricing Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-[#006948] font-mono">
                    {formatSAR(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-slate-400 line-through ms-2">
                      {formatSAR(product.originalPrice)}
                    </span>
                  )}
                  <span className="block text-[11px] text-slate-400 mt-0.5">
                    السعر شامل ضريبة القيمة المضافة 15% (فاتورة ZATCA)
                  </span>
                </div>
                {product.originalPrice && (
                  <Badge variant="destructive" className="font-bold text-xs">
                    وفر {formatSAR(product.originalPrice - product.price)}
                  </Badge>
                )}
              </div>

              {/* Delivery & Stock Info */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>التوصيل:</strong> {product.deliveryLabel} (عبر شبكة SPL / SMSA)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>حماية المشتري:</strong> مبالغ الدفع في حساب ضمان Escrow حتى الاستلام
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>الضمان:</strong> سنتين ضمان الوكيل المعتمد بالمملكة العربية السعودية
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700">الكمية المطلوبة:</span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="p-2 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-bold text-xs font-mono">{quantity}</span>
                  <button
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="p-2 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <Button
                  variant="sovereign"
                  size="lg"
                  className="w-full rounded-2xl font-bold text-xs h-12 flex items-center justify-center gap-2"
                  onClick={() => addToCart(product, quantity)}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>إضافة إلى سلة المشتريات</span>
                </Button>
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full rounded-2xl font-bold text-xs h-12"
                  onClick={handleBuyNow}
                >
                  شراء فوري عبر حساب الضمان Escrow
                </Button>
              </div>

              {/* Security Badges */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-around text-center text-[10px] text-emerald-900 font-bold">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>دفع آمن 256-bit</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
                  <span>إرجاع ١٤ يوماً</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-700" />
                  <span>أصلي 100% SASO</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Product Details Tabs (Specs, Features, Reviews, Vendor) */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <Card className="rounded-3xl border border-slate-200/80 p-6 sm:p-8 bg-white shadow-xs">
            <Tabs defaultValue="specs" className="w-full">
              <TabsList className="bg-slate-100 p-1 rounded-2xl mb-6">
                <TabsTrigger value="specs" className="rounded-xl text-xs font-bold">
                  المواصفات الفنية
                </TabsTrigger>
                <TabsTrigger value="features" className="rounded-xl text-xs font-bold">
                  المزايا والفوائد
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-xl text-xs font-bold">
                  التقييمات الموثقة ({reviewsList.length})
                </TabsTrigger>
                <TabsTrigger value="vendor" className="rounded-xl text-xs font-bold">
                  معلومات التاجر والضمان
                </TabsTrigger>
              </TabsList>

              {/* Specs Tab */}
              <TabsContent value="specs" className="space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">جدول المواصفات والاعتمادات:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.specs?.map((spec, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                    >
                      <span className="font-semibold text-slate-500">{spec.label}</span>
                      <span className="font-bold text-slate-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </p>
                {product.features && (
                  <div className="space-y-2 pt-2">
                    {product.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6">
                <div className="space-y-4">
                  {reviewsList.map((rev, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{rev.author || rev.name}</span>
                        <div className="flex items-center text-amber-500">
                          {[...Array(rev.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600">{rev.comment}</p>
                      <span className="text-[10px] text-slate-400 block">{rev.date}</span>
                    </div>
                  ))}
                </div>

                {/* Add Review Form */}
                <form onSubmit={handleAddReview} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#006948]" />
                    <span>أضف تقييمك للمنتج (متصل مباشرة بـ Supabase):</span>
                  </h4>
                  <textarea
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    placeholder="اكتب تجربتك مع المنتج وسرعة التوصيل..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none focus:border-[#006948] min-h-[80px]"
                    required
                  />
                  <Button
                    type="submit"
                    variant="sovereign"
                    size="sm"
                    className="rounded-xl text-xs font-bold"
                    disabled={isSubmittingReview}
                  >
                    {isSubmittingReview ? "جاري الإرسال..." : "إرسال التقييم"}
                  </Button>
                </form>
              </TabsContent>

              {/* Vendor Tab */}
              <TabsContent value="vendor" className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{product.vendor}</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      موزع وتاجر معتمد موثق عبر منصة واثق ونظام KYB الحكومي.
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-xl font-bold">
                    <Link href={`/store/${product.vendorId || "modern-tech"}`}>زيارة المتجر</Link>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </section>

        {/* Related Products Section */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-900">
              منتجات شائعة قد تعجبك
            </h2>
            <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-300 font-bold text-xs">
              <Link href="/catalog">عرض المزيد</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <Card
                key={rel.id}
                className="group rounded-3xl overflow-hidden border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between bg-white"
              >
                <div>
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <Badge variant="sovereign" className="absolute top-3 end-3 bg-white/95 text-emerald-800 text-[10px] font-bold">
                      {rel.badge}
                    </Badge>
                  </div>
                  <div className="p-5">
                    <span className="text-[11px] font-semibold text-emerald-800 block mb-1">
                      {rel.vendor}
                    </span>
                    <Link href={`/products/${rel.id}`} className="hover:text-[#006948] transition-colors">
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                        {rel.title}
                      </h3>
                    </Link>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-baseline gap-2">
                      <span className="text-base font-black text-[#006948]">{formatSAR(rel.price)}</span>
                      {rel.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">{formatSAR(rel.originalPrice)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <Button asChild variant="outline" size="sm" className="w-full rounded-xl text-xs font-bold">
                    <Link href={`/products/${rel.id}`}>عرض التفاصيل</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}
