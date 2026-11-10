"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  Heart,
  Grid,
  List,
  Filter,
  ArrowUpDown,
  Search,
  Star,
  CheckCircle2,
  X,
  Sparkles,
  ChevronLeft,
  Truck,
  ShieldCheck,
  Store,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { ALL_PRODUCTS, Product } from "@/lib/catalogData";
import { fetchProductsFromSupabase } from "@/lib/supabase";

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("cat") || "all";
  const initialQuery = searchParams.get("q") || "";

  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [maxPrice, setMaxPrice] = useState<number>(6000);
  const [expressOnly, setExpressOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchFilter, setSearchFilter] = useState<string>(initialQuery);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const dbProducts = await fetchProductsFromSupabase();
        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts);
        } else {
          setProducts(ALL_PRODUCTS);
        }
      } catch (err) {
        console.error("Failed to load catalog products:", err);
        setProducts(ALL_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = [
    { id: "all", label: "جميع الأقسام الأكثر طلباً" },
    { id: "electronics", label: "الإلكترونيات والأجهزة الذكية" },
    { id: "mobiles", label: "الهواتف وملحقاتها" },
    { id: "home-kitchen", label: "المنزل الذكي والمطبخ" },
    { id: "beauty-care", label: "الصحة والجمال والعناية" },
    { id: "fashion-apparel", label: "الأزياء والأحذية الرياضية" },
    { id: "sports-fitness", label: "اللياقة والأنشطة الخارجية" },
  ];

  const pool = products.length > 0 ? products : ALL_PRODUCTS;

  const filteredItems = useMemo(() => {
    return pool.filter((item) => {
      if (selectedCategory !== "all" && item.categorySlug !== selectedCategory && item.category !== selectedCategory) return false;
      if (item.price > maxPrice) return false;
      if (expressOnly && item.delivery !== "express") return false;
      if (
        searchFilter.trim() &&
        !item.title.toLowerCase().includes(searchFilter.toLowerCase()) &&
        !item.vendor.toLowerCase().includes(searchFilter.toLowerCase()) &&
        !item.category.toLowerCase().includes(searchFilter.toLowerCase())
      ) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "reviews") return b.reviews - a.reviews;
      return 0; // popular default
    });
  }, [pool, selectedCategory, maxPrice, expressOnly, searchFilter, sortBy]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <StorefrontHeader />

      <main className="flex-1 pt-32 lg:pt-36">
        {/* Breadcrumb & Title Banner */}
        <section className="bg-white border-b border-slate-200/80 py-8">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-3">
              <Link href="/" className="hover:text-[#006948] transition-colors">
                الرئيسية
              </Link>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#006948] font-bold">دليل المنتجات الأكثر مبيعاً</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="sovereign">كتالوج المتاجر والموردين المعتمدين</Badge>
                  <span className="text-xs text-slate-400 font-semibold">
                    {filteredItems.length} منتج متوفر الآن
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  دليل المنتجات والأجهزة الأصلية
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                  تصفح المنتجات الموثقة والمشمولة بنظام الضمان المالي وحماية المشتري المعتمدة مع خيارات الشحن السريع.
                </p>
              </div>

              {/* View & Sorting Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-2xl p-1 bg-slate-50">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-xl transition-colors ${
                      viewMode === "grid" ? "bg-white shadow-xs text-[#006948]" : "text-slate-400 hover:text-slate-600"
                    }`}
                    title="عرض شبكي"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-xl transition-colors ${
                      viewMode === "list" ? "bg-white shadow-xs text-[#006948]" : "text-slate-400 hover:text-slate-600"
                    }`}
                    title="عرض طولي"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500 font-medium">الترتيب:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="popular">الأكثر طلباً ورواجاً</option>
                    <option value="price-asc">الأقل سعراً</option>
                    <option value="price-desc">الأعلى سعراً</option>
                    <option value="rating">الأعلى تقييماً</option>
                    <option value="reviews">الأكثر مراجعات موثقة</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Catalog Workspace */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filter Sidebar (1 Col) */}
            <aside className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#006948]" />
                    <span>تصفية النتائج</span>
                  </h3>
                  {(selectedCategory !== "all" || maxPrice < 6000 || expressOnly || searchFilter) && (
                    <button
                      onClick={() => {
                        setSelectedCategory("all");
                        setMaxPrice(6000);
                        setExpressOnly(false);
                        setSearchFilter("");
                      }}
                      className="text-[11px] text-[#006948] hover:underline font-bold"
                    >
                      إعادة تعيين
                    </button>
                  )}
                </div>

                {/* Search in catalog */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="ابحث داخل هذا القسم..."
                    className="w-full text-xs ps-9 pe-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#006948] bg-slate-50"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-3.5" />
                  {searchFilter && (
                    <button
                      onClick={() => setSearchFilter("")}
                      className="absolute end-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Categories Filter */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">الأقسام الأكثر طلباً:</span>
                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full text-start px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                          selectedCategory === cat.id
                            ? "bg-[#006948] text-white font-bold"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>{cat.label}</span>
                        {selectedCategory === cat.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Slider */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">السقف السعري:</span>
                    <span className="font-bold font-mono text-[#006948]">{formatSAR(maxPrice)}</span>
                  </div>
                  <Slider
                    defaultValue={[6000]}
                    max={6000}
                    min={50}
                    step={50}
                    value={[maxPrice]}
                    onValueChange={(val) => setMaxPrice(val[0])}
                    className="py-2"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>٥٠ ر.س</span>
                    <span>٣,٠٠٠ ر.س</span>
                    <span>٦,٠٠٠ ر.س</span>
                  </div>
                </div>

                {/* Express Shipping Checkbox */}
                <div className="pt-4 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={expressOnly}
                      onChange={(e) => setExpressOnly(e.target.checked)}
                      className="rounded border-slate-300 text-[#006948] focus:ring-[#006948] w-4 h-4"
                    />
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>توصيل فوري خلال ٢٤ ساعة فقط</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Trust Callout */}
              <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>حماية المشتري المعتمدة</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  أموالك محفوظة في حساب ضمان مصرفي مستقل. لا تحول إلى البائع إلا بعد استلامك للمنتج وتأكيد مطابقته للمواصفات.
                </p>
                <Button asChild variant="gold" size="sm" className="w-full rounded-xl text-xs font-bold h-9">
                  <Link href="/about">تعرف على نظام الضمان Escrow</Link>
                </Button>
              </div>
            </aside>

            {/* Products Display */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="rounded-3xl p-4 bg-white border border-slate-200/80 space-y-3">
                      <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-6 w-1/2" />
                    </Card>
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mb-1">لم نجد منتجات مطابقة للتصفية</h3>
                  <p className="text-xs text-slate-500 mb-6">جرب تغيير معايير البحث أو رفع الحد الأقصى للسعر.</p>
                  <Button
                    onClick={() => {
                      setSelectedCategory("all");
                      setMaxPrice(6000);
                      setExpressOnly(false);
                      setSearchFilter("");
                    }}
                    variant="outline"
                    className="rounded-xl text-xs font-bold"
                  >
                    إعادة ضبط معايير التصفية
                  </Button>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((product) => {
                    const wishlisted = isWishlisted(product.id);
                    return (
                      <Card
                        key={product.id}
                        className="group rounded-3xl overflow-hidden border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between bg-white"
                      >
                        <div>
                          <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 end-3 flex flex-col gap-1.5 items-end">
                              <Badge variant="sovereign" className="bg-white/95 backdrop-blur-md shadow-xs text-emerald-800 text-[10px] font-bold">
                                {product.badge}
                              </Badge>
                              <span className="px-2 py-0.5 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-[9px] font-semibold">
                                {product.salesCount}
                              </span>
                            </div>
                            <button
                              onClick={() => toggleWishlist({ id: product.id, title: product.title })}
                              className={`absolute top-3 start-3 p-2 rounded-2xl backdrop-blur-md transition-colors ${
                                wishlisted ? "bg-white text-rose-600 shadow-sm" : "bg-black/30 text-white hover:bg-black/50"
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-rose-600" : ""}`} />
                            </button>
                          </div>

                          <div className="p-5">
                            <span className="text-[11px] font-semibold text-emerald-800 block mb-1">
                              {product.vendor}
                            </span>
                            <Link href={`/products/${product.id}`} className="hover:text-[#006948] transition-colors">
                              <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                                {product.title}
                              </h3>
                            </Link>

                            <div className="flex items-center gap-2 mt-2 text-[11px]">
                              <div className="flex items-center text-amber-500 font-bold">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span className="ms-1">{product.rating}</span>
                              </div>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-400">({product.reviews})</span>
                            </div>

                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-baseline gap-2">
                              <span className="text-base font-black text-[#006948]">{formatSAR(product.price)}</span>
                              {product.originalPrice && (
                                <span className="text-xs text-slate-400 line-through">
                                  {formatSAR(product.originalPrice)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-5 pt-0 flex items-center gap-2">
                          <Button
                            variant="sovereign"
                            size="sm"
                            className="flex-1 rounded-xl text-xs font-bold h-9"
                            onClick={() => addToCart(product)}
                          >
                            <ShoppingBag className="w-3.5 h-3.5 me-1.5" />
                            <span>أضف للسلة</span>
                          </Button>
                          <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-bold h-9 px-3">
                            <Link href={`/products/${product.id}`}>تفاصيل</Link>
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                /* List View */
                <div className="space-y-4">
                  {filteredItems.map((product) => {
                    const wishlisted = isWishlisted(product.id);
                    return (
                      <Card
                        key={product.id}
                        className="group rounded-3xl overflow-hidden border border-slate-200/80 hover:border-emerald-300 hover:shadow-lg transition-all p-4 bg-white flex flex-col sm:flex-row items-center gap-5"
                      >
                        <div className="relative w-full sm:w-44 aspect-square rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <span className="text-[11px] font-semibold text-emerald-800 block">
                            {product.vendor}
                          </span>
                          <Link href={`/products/${product.id}`} className="hover:text-[#006948] transition-colors">
                            <h3 className="font-bold text-slate-900 text-sm leading-snug">{product.title}</h3>
                          </Link>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center text-amber-500 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 me-1" />
                              {product.rating}
                            </span>
                            <span>•</span>
                            <span>{product.salesCount}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-bold">{product.deliveryLabel}</span>
                          </div>
                        </div>
                        <div className="sm:border-s sm:border-slate-100 sm:ps-6 flex flex-col items-end gap-3 shrink-0 w-full sm:w-auto">
                          <div>
                            <span className="text-lg font-black text-[#006948]">{formatSAR(product.price)}</span>
                            {product.originalPrice && (
                              <span className="text-xs text-slate-400 line-through block text-end">
                                {formatSAR(product.originalPrice)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                              variant="sovereign"
                              size="sm"
                              className="rounded-xl text-xs font-bold h-9"
                              onClick={() => addToCart(product)}
                            >
                              <ShoppingBag className="w-3.5 h-3.5 me-1.5" />
                              <span>أضف للسلة</span>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-bold h-9">
                              <Link href={`/products/${product.id}`}>تفاصيل</Link>
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}>
      <CatalogContent />
    </Suspense>
  );
}
