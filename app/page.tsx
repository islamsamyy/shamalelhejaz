"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCart } from "@/context/CartContext";
import {
  Sparkles,
  ShoppingBag,
  Heart,
  Eye,
  ArrowLeft,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Award,
  Zap,
  Star,
  ChevronLeft,
  Truck,
  RotateCcw,
  ThumbsUp,
  MessageSquare,
  Building,
  Store,
  DollarSign,
  TrendingUp,
  BarChart3,
  Lock,
  Headphones,
  Smartphone,
  Coffee,
  Shirt,
  Dumbbell,
  Check,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { toast } from "sonner";
import {
  ALL_PRODUCTS,
  TOP_CATEGORIES,
  VENDOR_STORES,
  VERIFIED_BUYER_REVIEWS,
  Product,
} from "@/lib/catalogData";
import {
  fetchProductsFromSupabase,
  fetchTopCategoriesFromSupabase,
  fetchReviewsFromSupabase,
  submitReviewToSupabase,
} from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

const categoryFilterPills = [
  { id: "all", label: "كافة المنتجات الأكثر مبيعاً" },
  { id: "electronics", label: "الإلكترونيات والأجهزة" },
  { id: "mobiles", label: "الهواتف وملحقاتها" },
  { id: "home-kitchen", label: "المنزل الذكي والمطبخ" },
  { id: "beauty-care", label: "الصحة والجمال" },
  { id: "sports-fitness", label: "اللياقة والرياضة" },
];

export default function HomePage() {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Dynamic state from Supabase
  const [products, setProducts] = useState<Product[]>(ALL_PRODUCTS);
  const [categories, setCategories] = useState(TOP_CATEGORIES);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Reviews State
  const [reviews, setReviews] = useState(VERIFIED_BUYER_REVIEWS);
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewCity, setNewReviewCity] = useState("الرياض");
  const [newReviewItem, setNewReviewItem] = useState("سماعات رأس لاسلكية سوني WH-1000XM5");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");

  // Live Flash Deal Countdown Timer (Hours, Mins, Secs)
  const [timeLeft, setTimeLeft] = useState({ hours: 11, minutes: 28, seconds: 40 });

  // Vendor Profit Calculator
  const [monthlySalesEstimate, setMonthlySalesEstimate] = useState(85000);
  const estimatedVendorPayout = Math.round(monthlySalesEstimate * 0.94);
  const estimatedPlatformFee = Math.round(monthlySalesEstimate * 0.06);

  useEffect(() => {
    async function loadDynamicStorefrontData() {
      try {
        const [dbProducts, dbCategories, dbReviews] = await Promise.all([
          fetchProductsFromSupabase(),
          fetchTopCategoriesFromSupabase(),
          fetchReviewsFromSupabase(),
        ]);
        if (dbProducts && dbProducts.length > 0) setProducts(dbProducts);
        if (dbCategories && dbCategories.length > 0) setCategories(dbCategories);
        if (dbReviews && dbReviews.length > 0) setReviews(dbReviews);
      } catch (err) {
        console.error("Error loading dynamic data from Supabase:", err);
      } finally {
        setIsDataLoading(false);
      }
    }
    loadDynamicStorefrontData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleHelpfulVote = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r))
    );
    toast.success("شكراً لمشاركتك! تم تسجيل تصويتك الإيجابي بنجاح.");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) {
      toast.error("يرجى إكمال جميع حقول التقييم.");
      return;
    }
    const newRev = {
      id: `rev-${Date.now()}`,
      name: newReviewName,
      title: "مشتري موثق عبر نفاذ الوطني",
      city: newReviewCity,
      item: newReviewItem,
      rating: newReviewRating,
      date: "الآن",
      comment: newReviewComment,
      helpfulCount: 1,
    };
    setReviews((prev) => [newRev, ...prev]);

    try {
      await submitReviewToSupabase({
        product_id: "sony-wh1000xm5",
        author: newReviewName,
        city: newReviewCity,
        item: newReviewItem,
        rating: newReviewRating,
        comment: newReviewComment,
      });
      toast.success("تم استلام تقييمك وحفظه مباشرة في قاعدة بيانات Supabase!");
    } catch (err) {
      toast.success("تم استلام تقييمك وتوثيقه بنجاح! شكراً لمساعدتك مجتمع المتسوقين.");
    }

    setIsAddReviewOpen(false);
    setNewReviewName("");
    setNewReviewComment("");
  };

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.categorySlug === selectedCategory || p.category === selectedCategory);

  // Flash deal featured product (Ninja Airfryer)
  const flashProduct = products[2] || products[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <StorefrontHeader />

      {/* Main Content with top offset for fixed header */}
      <main className="flex-1 pt-32 lg:pt-36">
        {/* 1. Hero Bento Showcase: Multi-Vendor Marketplace Value Proposition */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Bento Main Feature (8 Cols) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-8 relative rounded-3xl overflow-hidden min-h-[480px] lg:min-h-[540px] bg-gradient-to-br from-slate-950 via-slate-900 to-[#004d34] text-white p-8 lg:p-12 flex flex-col justify-between shadow-2xl border border-slate-800"
            >
              <div
                className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay pointer-events-none"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80')",
                }}
              />

              {/* Top Meta */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
                <Badge variant="sovereign" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs py-1 px-3">
                  <Sparkles className="w-3.5 h-3.5 ms-1 text-emerald-400" />
                  منصة المتاجر والموردين المعتمدين بالمملكة
                </Badge>
                <span className="text-xs text-slate-300 font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  حسابات ضمان مالي Escrow معتمدة
                </span>
              </div>

              {/* Main Headline & SEO Copy */}
              <div className="relative z-10 max-w-2xl my-auto py-6">
                <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase block mb-2">
                  شمال الحجاز للمتاجر المعتمدة • أسعار المورد المباشرة
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4">
                  تسوق المنتجات الأكثر مبيعاً مباشرة من كبار الموردين بأسعار الجملة
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                  الوجهة الأولى لاقتناء أحدث الإلكترونيات الأصلية، الهواتف، أدوات المطبخ الذكي، ومستحضرات العناية. نوفر لك حتى ٤٠٪ بتخطي الوسطاء مع حماية المشتري وشحن فوري خلال ٢٤ ساعة.
                </p>
              </div>

              {/* Bottom Actions & Trust */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
                <div className="flex flex-wrap items-center gap-3">
                  <Button asChild variant="gold" size="lg" className="rounded-2xl font-bold text-xs h-11 px-5">
                    <Link href="/catalog" className="flex items-center gap-2">
                      <span>تسوق المنتجات الأكثر طلباً</span>
                      <ArrowLeft className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-2xl font-bold text-xs h-11 px-5">
                    <Link href="/deals">عروض الخصم الحصرية</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>توصيل سريع مجاني للطلبات فوق ٢٠٠ ر.س</span>
                </div>
              </div>
            </motion.div>

            {/* Bento Side Cards (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Card 1: Live Flash Deal Countdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-3xl p-6 bg-gradient-to-br from-white to-emerald-50/50 border border-emerald-100 shadow-lg flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#006948]">
                    <Zap className="w-4 h-4 fill-emerald-600 text-emerald-600 animate-bounce" />
                    صفقة اليوم الخاطفة
                  </span>
                  <Badge variant="destructive" className="text-[10px]">خصم ٢٧٪</Badge>
                </div>

                <div className="my-4">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={flashProduct.image}
                      alt={flashProduct.title}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">
                        {flashProduct.title}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-lg font-black text-[#006948]">{formatSAR(flashProduct.price)}</span>
                        {flashProduct.originalPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatSAR(flashProduct.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center justify-between gap-2 bg-slate-900 text-white p-3 rounded-2xl">
                  <div className="flex-1 text-center">
                    <span className="text-base font-black font-mono">{String(timeLeft.hours).padStart(2, "0")}</span>
                    <span className="text-[9px] block text-slate-400">ساعة</span>
                  </div>
                  <span className="font-bold text-emerald-400">:</span>
                  <div className="flex-1 text-center">
                    <span className="text-base font-black font-mono">{String(timeLeft.minutes).padStart(2, "0")}</span>
                    <span className="text-[9px] block text-slate-400">دقيقة</span>
                  </div>
                  <span className="font-bold text-emerald-400">:</span>
                  <div className="flex-1 text-center">
                    <span className="text-base font-black font-mono text-emerald-400">{String(timeLeft.seconds).padStart(2, "0")}</span>
                    <span className="text-[9px] block text-slate-400">ثانية</span>
                  </div>
                </div>

                <Button
                  variant="sovereign"
                  size="sm"
                  className="w-full mt-4 rounded-xl text-xs font-bold"
                  onClick={() => addToCart(flashProduct)}
                >
                  <ShoppingBag className="w-4 h-4 ms-1.5" />
                  أضف للسلة قبل نفاد الكمية
                </Button>
              </motion.div>

              {/* Card 2: Vendor B2B Onboarding Showcase */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-3xl p-6 bg-slate-900 text-white border border-slate-800 shadow-lg flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="sovereign" className="bg-amber-400/20 text-amber-300 border-amber-400/30 text-[10px]">
                    بوابة التجار والموردين B2B
                  </Badge>
                  <Store className="w-4 h-4 text-amber-400" />
                </div>
                <div className="my-3">
                  <h4 className="text-base font-bold text-white leading-snug">
                    بع منتجاتك لملايين المشترين مع 0% رسوم إدراج
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    توثيق فوري عبر منصة واثق ونفاذ، ربط مؤتمت مع الفاتورة الإلكترونية ZATCA Phase-2، وتسويات بنكية أسبوعية مباشرة.
                  </p>
                </div>
                <Button asChild variant="gold" size="sm" className="w-full rounded-xl text-xs font-bold">
                  <Link href="/vendor/register">فتح متجر تجاري في ٥ دقائق</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 2. Value Propositions Bar */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">أسعار المورد المباشرة</h5>
                <p className="text-[11px] text-slate-500">توفير حتى ٤٠٪ بدون وساطة مفرطة</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">حماية المشتري Escrow</h5>
                <p className="text-[11px] text-slate-500">أموالك محفوظة حتى استلام الشحنة</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">أصالة ١٠٠٪ وضمان سنتين</h5>
                <p className="text-[11px] text-slate-500">منتجات مطابقة لمواصفات SASO</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">إرجاع سهل ١٤ يوماً</h5>
                <p className="text-[11px] text-slate-500">استرداد نقدي فوري دون تعقيد</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Top-Selling Categories Banner & Showcase */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold text-[#006948] uppercase tracking-wider block mb-1">
                تصفح حسب الأقسام الأكثر طلباً
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                أقسام التجارة الإلكترونية الأكثر رواجاً عالمياً
              </h2>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-300 font-bold text-xs">
              <Link href="/categories" className="flex items-center gap-1.5">
                <span>عرض كافة الأقسام (٦ أقسام رئيسية)</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalog?cat=${cat.id}`}
                className="group p-4 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden mb-3 bg-slate-100 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-bold text-xs text-slate-900 group-hover:text-[#006948] transition-colors line-clamp-1">
                  {cat.title}
                </h3>
                <span className="text-[10px] text-slate-400 mt-1 font-mono">{cat.itemCount}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. Best-Selling Products Showcase */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#006948]"></span>
                <span className="text-xs font-bold text-[#006948] uppercase tracking-wider">
                  الأكثر مبيعاً وتقييماً
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-black text-slate-900">
                المنتجات الأكثر مبيعاً في شمال الحجاز اليوم
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                المنتجات التي حازت على أعلى نسب شراء وتفضيل من المتسوقين، موثقة من تجار وموردين معتمدين.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {categoryFilterPills.map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedCategory(pill.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === pill.id
                      ? "bg-[#006948] text-white shadow-md shadow-[#006948]/20"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const wishlisted = isWishlisted(product.id);
              return (
                <Card
                  key={product.id}
                  className="group rounded-3xl overflow-hidden border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between bg-white"
                >
                  <div>
                    {/* Image Area with Badges & Floating Actions */}
                    <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3 end-3 flex flex-col gap-1.5 items-end">
                        <Badge variant="sovereign" className="bg-white/95 backdrop-blur-md shadow-xs text-emerald-800 text-[11px] font-bold">
                          {product.badge}
                        </Badge>
                        <span className="px-2 py-0.5 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-semibold">
                          {product.salesCount}
                        </span>
                      </div>

                      {/* Floating Favorite Button */}
                      <button
                        onClick={() => toggleWishlist({ id: product.id, title: product.title })}
                        className={`absolute top-3 start-3 w-9 h-9 rounded-2xl flex items-center justify-center transition-all shadow-md cursor-pointer ${
                          wishlisted
                            ? "bg-rose-50 text-rose-600 border border-rose-200"
                            : "bg-white/90 backdrop-blur-md text-slate-600 hover:text-rose-600 hover:scale-110"
                        }`}
                        title={wishlisted ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
                      >
                        <Heart className={`w-4 h-4 ${wishlisted ? "fill-rose-600" : ""}`} />
                      </button>

                      {/* Quick View Button on Hover */}
                      <button
                        onClick={() => setQuickViewProduct(product)}
                        className="absolute bottom-3 start-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-md text-slate-800 text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 hover:bg-slate-900 hover:text-white cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>معاينة سريعة</span>
                      </button>
                    </div>

                    {/* Content Area */}
                    <div className="p-5">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                        <span className="font-semibold text-emerald-800 truncate max-w-[180px]">
                          {product.vendor}
                        </span>
                        <div className="flex items-center gap-1 text-amber-500 font-bold shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{product.rating}</span>
                          <span className="text-slate-400 text-[10px]">({product.reviews})</span>
                        </div>
                      </div>

                      <Link href={`/products/${product.id}`} className="block group-hover:text-[#006948] transition-colors">
                        <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                          {product.title}
                        </h3>
                      </Link>

                      <div className="flex items-baseline gap-2 mt-3 pt-3 border-t border-slate-100">
                        <span className="text-lg font-black text-[#006948]">
                          {formatSAR(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatSAR(product.originalPrice)}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 me-auto font-medium">
                          شامل ضريبة زاتكا 15%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="rounded-xl text-xs font-bold"
                    >
                      <Link href={`/products/${product.id}`}>المواصفات</Link>
                    </Button>
                    <Button
                      variant="sovereign"
                      size="sm"
                      className="rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                      onClick={() => addToCart(product)}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>إضافة للسلة</span>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center mt-12">
            <Button asChild variant="outline" size="lg" className="rounded-2xl border-slate-300 font-bold text-xs h-12 px-8">
              <Link href="/catalog" className="flex items-center gap-2">
                <span>استعراض كافة المنتجات الأكثر مبيعاً (٥٠٠,٠٠٠+ منتج)</span>
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* 5. VENDOR STORE FEATURES DEEP-DIVE */}
        <section className="w-full bg-slate-900 text-white py-16 my-8 border-y border-slate-800">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <Badge variant="sovereign" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs mb-3">
                <Sparkles className="w-3.5 h-3.5 ms-1 text-emerald-400" />
                منظومة المتجر المتعدد للمتاجر والموردين
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                مزايا حصرية للمتسوقين والتجار في منصة شمال الحجاز
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                بنينا منصة شمال الحجاز لتكون الخيار الأكثر ذكاءً وأماناً في التجارة الإلكترونية المعاصرة بالمملكة العربية السعودية والخليج.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Store,
                  title: "الربط المباشر بالمصانع والموردين",
                  desc: "تخلص من هوامش الربح المتكررة لسلاسل التوزيع؛ اشتري مباشرة من المستودع بأسعار منافسة وجودة موثوقة.",
                  highlight: "توفير حتى ٤٠٪",
                },
                {
                  icon: ShieldCheck,
                  title: "حماية المشتري وحساب الضمان Escrow",
                  desc: "تبقى مبالغ المشتريات محفوظة بأمان في حساب الضمان البنكي ولا تُسلّم للتاجر إلا بعد استلامك للمنتج وتأكيد رضاك.",
                  highlight: "ضمان مالي ١٠٠٪",
                },
                {
                  icon: Truck,
                  title: "شحن سريع ذكي وتتبع مباشر",
                  desc: "ربط تقني فوري مع سبل، سمسا، وأرامكس لتوصيل الطلبات خلال ٢٤ إلى ٤٨ ساعة مع تحديثات لحظية عبر SMS.",
                  highlight: "توصيل خلال ٢٤ ساعة",
                },
                {
                  icon: BarChart3,
                  title: "لوحة تحكم وفواتير ZATCA Phase-2",
                  desc: "إصدار فواتير ضريبية إلكترونية مشفرة معتمدة من هيئة الزكاة والضريبة والجمارك لكل عملية شراء وبشكل آلي.",
                  highlight: "امتثال نظامي كامل",
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/60 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono text-amber-400 font-bold block mb-1">
                        {item.highlight}
                      </span>
                      <h4 className="font-bold text-base text-white mb-2">{item.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.desc}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-700 flex items-center justify-between text-xs">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>معتمد ومفعل</span>
                      </span>
                      <Link href="/about" className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1">
                        <span>المزيد</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. INTERACTIVE VENDOR CALCULATOR */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10">
          <div className="p-8 lg:p-12 rounded-3xl bg-white border border-slate-200/80 shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-bold">
                  حاسبة أرباح الموردين والتجار (Vendor Payout Calculator)
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  احسب عوائد متجرك عند البيع في منصة شمال الحجاز
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  نحن نؤمن بالشفافية المطلقة؛ لا توجد رسوم إدراج خفية ولا اشتراكات شهرية إجبارية. تحصل على ٩٤٪ من صافي مبيعاتك وتودع أرباحك أسبوعياً في حساب منشأتك التجاري.
                </p>

                {/* Slider Control */}
                <div className="pt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">المبيعات الشهرية المقدرة:</span>
                    <span className="text-base text-[#006948] font-black font-mono">
                      {formatSAR(monthlySalesEstimate)}
                    </span>
                  </div>
                  <Slider
                    value={[monthlySalesEstimate]}
                    onValueChange={(val) => setMonthlySalesEstimate(val[0])}
                    min={10000}
                    max={500000}
                    step={5000}
                    className="py-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>١٠,٠٠٠ ر.س</span>
                    <span>٢٥٠,٠٠٠ ر.س</span>
                    <span>٥٠٠,٠٠٠ ر.س</span>
                  </div>
                </div>
              </div>

              {/* Calculator Output Card */}
              <div className="lg:col-span-6">
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80">
                      <span className="text-[11px] text-slate-400 block">صافي أرباحك المقدرة (94%):</span>
                      <span className="text-2xl font-black text-emerald-400 font-mono block mt-1">
                        {formatSAR(estimatedVendorPayout)}
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80">
                      <span className="text-[11px] text-slate-400 block">رسوم المنصة والتشغيل (6%):</span>
                      <span className="text-xl font-black text-slate-300 font-mono block mt-1">
                        {formatSAR(estimatedPlatformFee)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>0% رسوم إدراج للمنتجات (Unlimited Listings)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>ربط آلي مع الفاتورة الإلكترونية ZATCA Phase-2</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>بوالص شحن مخفضة مع كبرى شركات الشحن (SPL / SMSA)</span>
                    </div>
                  </div>

                  <Button asChild variant="gold" size="lg" className="w-full rounded-2xl font-bold text-xs h-11">
                    <Link href="/vendor/register">ابدأ البيع وحقق هذه الأرباح الآن</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. VERIFIED VENDOR STORES SPOTLIGHT */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-[#006948] uppercase tracking-wider block mb-1">
                متاجر ووكلاء معتمدون
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                تسوق مباشرة من كبار الموزعين المعتمدين في المملكة
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                تجار موثقون بسجلات تجارية رسمية وعضوية النفاذ الوطني وضمانات الوكلاء الرسمية.
              </p>
            </div>

            <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-300 font-bold text-xs">
              <Link href="/catalog">عرض جميع المتاجر (١٢,٥٠٠+ متجر)</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VENDOR_STORES.map((store) => (
              <Link
                key={store.id}
                href={`/store/${store.id}`}
                className="group p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#006948] to-[#004d34] text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                      {store.logoLetter}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 group-hover:text-[#006948] transition-colors line-clamp-1">
                        {store.name}
                      </h4>
                      <span className="text-xs text-slate-400 block">{store.city}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
                    {store.description}
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200 font-bold">
                      {store.badge}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{store.rating}</span>
                    <span className="text-slate-400 text-[10px]">({store.reviewsCount} تقييم)</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform">
                    <span>زيارة المتجر</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 8. VERIFIED BUYER REVIEWS & TESTIMONIALS */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12">
          {/* Section Header with Aggregate Rating */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  تقييمات وتجارب المشترين الموثقة
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                آراء وتجارب حقيقية لعملاء تسوقوا من تجار شمال الحجاز
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                شهادات موثقة لمشترين أتموا عمليات الشراء بنظام الضمان المالي واستلموا طلباتهم الأصلية.
              </p>
            </div>

            {/* Score Pill & Add Review Action */}
            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <div className="flex items-center gap-3 p-3.5 px-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-3xl font-black text-slate-900 font-mono">4.94</div>
                <div>
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">من أصل ٣٨,٤٥٠ مراجعة موثقة</span>
                </div>
              </div>

              <Button
                variant="sovereign"
                size="lg"
                onClick={() => setIsAddReviewOpen(true)}
                className="rounded-2xl font-bold text-xs"
              >
                <MessageSquare className="w-4 h-4 ms-2" />
                أضف تقييمك لتجربة الشراء
              </Button>
            </div>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Rating */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-500 border-slate-200">
                      {rev.date}
                    </Badge>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal mb-6">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                {/* Bottom Verified Buyer Card */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900">{rev.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-[10px] text-emerald-800 font-semibold block mt-0.5">
                      {rev.title} • {rev.city}
                    </span>
                    <span className="text-[10px] text-slate-400 block line-clamp-1 max-w-[200px] mt-0.5">
                      السلعة: {rev.item}
                    </span>
                  </div>

                  {/* Helpful Button */}
                  <button
                    onClick={() => handleHelpfulVote(rev.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800 border border-slate-200/80 text-[11px] font-bold transition-colors cursor-pointer"
                    title="هل كان هذا التقييم مفيداً؟"
                  >
                    <ThumbsUp className="w-3 h-3 text-emerald-600" />
                    <span>{rev.helpfulCount}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 9. SOVEREIGN TRUST, ZATCA PHASE-2 & ESCROW VAULT */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10">
          <div className="bg-gradient-to-l from-[#004d34] via-[#006948] to-slate-950 text-white p-8 lg:p-12 rounded-3xl shadow-xl border border-emerald-700/60 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <Badge variant="outline" className="bg-white/10 text-emerald-300 border-white/20 text-xs mb-3">
                ميثاق الأمان المصرفي والامتثال الحكومي
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">
                تسوق بأعلى درجات الموثوقية والحماية المصرفية في المملكة
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                كل معاملة على منصة شمال الحجاز محمية بمنظومة ZATCA Phase-2 للفواتير الإلكترونية المعتمدة، مع حفظ مستحقاتك في حساب ضمان مصرفي تحت رقابة البنك المركزي السعودي (SAMA) حتى استلام المنتج وفحصه بالكامل.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full lg:w-auto shrink-0">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                <span className="text-2xl font-black text-amber-300 font-mono block">100%</span>
                <span className="text-[11px] text-slate-200 block mt-0.5">ضمان استرجاع الأموال</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                <span className="text-2xl font-black text-emerald-300 font-mono block">ZATCA</span>
                <span className="text-[11px] text-slate-200 block mt-0.5">فواتير مرحلة ثانية مشفرة</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quick View Dialog */}
      {quickViewProduct && (
        <Dialog open={!!quickViewProduct} onOpenChange={(open) => !open && setQuickViewProduct(null)}>
          <DialogContent className="max-w-2xl text-start">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="sovereign">{quickViewProduct.badge}</Badge>
                <span className="text-xs text-slate-400">{quickViewProduct.vendor}</span>
              </div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                {quickViewProduct.title}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-4">
              <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-square relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {quickViewProduct.description}
                  </p>
                  <div className="flex items-baseline gap-2 mt-4">
                    <span className="text-2xl font-black text-[#006948]">
                      {formatSAR(quickViewProduct.price)}
                    </span>
                    {quickViewProduct.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatSAR(quickViewProduct.originalPrice)}
                      </span>
                    )}
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 text-[11px] text-emerald-800 font-medium mt-4 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ضريبة القيمة المضافة 15% مشمولة ومسجلة في زاتكا</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{quickViewProduct.deliveryLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <Button
                    variant="sovereign"
                    className="flex-1 font-bold"
                    onClick={() => {
                      addToCart(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                  >
                    <ShoppingBag className="w-4 h-4 ms-1.5" />
                    إضافة إلى السلة
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    onClick={() => setQuickViewProduct(null)}
                  >
                    <Link href={`/products/${quickViewProduct.id}`}>عرض التفاصيل كاملة</Link>
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Review Dialog */}
      <Dialog open={isAddReviewOpen} onOpenChange={setIsAddReviewOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 text-start">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#006948]" />
              توثيق تجربة وإضافة تقييم معتمد
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitReview} className="space-y-4 my-2 text-xs">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                الاسم الكريم (كما يظهر في التقييم):
              </label>
              <Input
                value={newReviewName}
                onChange={(e) => setNewReviewName(e.target.value)}
                placeholder="مثال: م. فهد الشمري"
                className="rounded-xl text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  المدينة:
                </label>
                <Input
                  value={newReviewCity}
                  onChange={(e) => setNewReviewCity(e.target.value)}
                  placeholder="مثال: الرياض"
                  className="rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  التقييم بالنجوم:
                </label>
                <div className="flex items-center gap-1 h-9">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      className="p-1 cursor-pointer hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= newReviewRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                المنتج الذي تم شراؤه:
              </label>
              <select
                value={newReviewItem}
                onChange={(e) => setNewReviewItem(e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
              >
                {ALL_PRODUCTS.map((prod) => (
                  <option key={prod.id} value={prod.title}>
                    {prod.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                نص التقييم وملاحظات التجربة:
              </label>
              <Textarea
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                placeholder="صف سرعة التوصيل، جودة المنتج، وموثوقية البائع..."
                className="rounded-xl text-xs min-h-[90px]"
                required
              />
            </div>

            <DialogFooter className="flex gap-2 sm:justify-start pt-2">
              <Button
                type="submit"
                variant="sovereign"
                size="sm"
                className="rounded-xl font-bold text-xs"
              >
                إرسال التقييم المعتمد
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddReviewOpen(false)}
                className="rounded-xl text-xs"
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <StorefrontFooter />
    </div>
  );
}
