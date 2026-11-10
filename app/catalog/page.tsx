"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import ProductQuickViewModal from "@/components/ProductQuickViewModal";
import {
  CatalogFiltersContent,
  CatalogMobileFilterSheet,
} from "@/components/CatalogFilters";
import {
  AnimatedCard,
  FadeIn,
} from "@/components/ui/motion-primitives";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  Heart,
  Grid,
  List,
  ArrowUpDown,
  Search,
  Star,
  X,
  ChevronLeft,
  Eye,
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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [expressOnly, setExpressOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchFilter, setSearchFilter] = useState<string>(initialQuery);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

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
      if (item.price < priceRange[0] || item.price > priceRange[1]) return false;
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
  }, [pool, selectedCategory, priceRange, expressOnly, searchFilter, sortBy]);

  const resetFilters = () => {
    setSelectedCategory("all");
    setPriceRange([0, 10000]);
    setExpressOnly(false);
    setSearchFilter("");
  };

  const activeFilterCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0) +
    (expressOnly ? 1 : 0) +
    (searchFilter.trim() ? 1 : 0);

  const filterProps = {
    categories,
    selectedCategory,
    onSelectCategory: setSelectedCategory,
    priceRange,
    onPriceRangeChange: setPriceRange,
    maxLimit: 10000,
    expressOnly,
    onExpressOnlyChange: setExpressOnly,
    searchFilter,
    onSearchFilterChange: setSearchFilter,
    onReset: resetFilters,
    activeFilterCount,
  };

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
              <div className="flex flex-wrap items-center gap-3">
                <CatalogMobileFilterSheet {...filterProps} />
                <div className="flex items-center border border-slate-200 rounded-2xl p-1 bg-slate-50">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      viewMode === "grid" ? "bg-white shadow-xs text-[#006948] scale-105" : "text-slate-400 hover:text-slate-600"
                    }`}
                    title="عرض شبكي"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      viewMode === "list" ? "bg-white shadow-xs text-[#006948] scale-105" : "text-slate-400 hover:text-slate-600"
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
            {/* Desktop Filter Sidebar (1 Col) */}
            <aside className="hidden lg:block lg:col-span-1">
              <FadeIn>
                <CatalogFiltersContent {...filterProps} />
              </FadeIn>
            </aside>

            {/* Products Display */}
            <div className="lg:col-span-3 space-y-5">
              {/* Live Active Filter Tag Pills */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 bg-white px-4 py-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-500">الفلاتر النشطة:</span>
                  {selectedCategory !== "all" && (
                    <Badge
                      variant="sovereign"
                      className="gap-1.5 text-[11px] cursor-pointer"
                      onClick={() => setSelectedCategory("all")}
                    >
                      <span>{categories.find((c) => c.id === selectedCategory)?.label}</span>
                      <X className="w-3 h-3" />
                    </Badge>
                  )}
                  {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                    <Badge
                      variant="outline"
                      className="gap-1.5 text-[11px] bg-emerald-50 text-[#006948] border-emerald-200 cursor-pointer"
                      onClick={() => setPriceRange([0, 10000])}
                    >
                      <span>
                        {formatSAR(priceRange[0])} - {formatSAR(priceRange[1])}
                      </span>
                      <X className="w-3 h-3" />
                    </Badge>
                  )}
                  {expressOnly && (
                    <Badge
                      variant="outline"
                      className="gap-1.5 text-[11px] bg-amber-50 text-amber-800 border-amber-200 cursor-pointer"
                      onClick={() => setExpressOnly(false)}
                    >
                      <span>توصيل فوري ٢٤ ساعة</span>
                      <X className="w-3 h-3" />
                    </Badge>
                  )}
                  {searchFilter.trim() && (
                    <Badge
                      variant="outline"
                      className="gap-1.5 text-[11px] cursor-pointer"
                      onClick={() => setSearchFilter("")}
                    >
                      <span>بحث: {searchFilter}</span>
                      <X className="w-3 h-3" />
                    </Badge>
                  )}
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="ms-auto text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    مسح الكل
                  </button>
                </div>
              )}

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
                  <p className="text-xs text-slate-500 mb-6">جرب تغيير معايير البحث أو توسيع النطاق السعري.</p>
                  <Button
                    onClick={resetFilters}
                    variant="outline"
                    className="rounded-xl text-xs font-bold"
                  >
                    إعادة ضبط معايير التصفية
                  </Button>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {viewMode === "grid" ? (
                    <motion.div
                      key="grid"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {filteredItems.map((product) => {
                        const wishlisted = isWishlisted(product.id);
                        return (
                          <AnimatedCard key={product.id} className="h-full rounded-3xl">
                            <Card className="group h-full rounded-3xl overflow-hidden border border-slate-200/80 hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between bg-white">
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
                                    type="button"
                                    onClick={() => toggleWishlist({ id: product.id, title: product.title })}
                                    className={`absolute top-3 start-3 p-2 rounded-2xl backdrop-blur-md transition-colors cursor-pointer ${
                                      wishlisted ? "bg-white text-rose-600 shadow-sm" : "bg-black/30 text-white hover:bg-black/50"
                                    }`}
                                    aria-label="المفضلة"
                                  >
                                    <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-rose-600" : ""}`} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setQuickViewProduct(product)}
                                    className="absolute bottom-3 start-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5 hover:bg-slate-900 hover:text-white cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>معاينة سريعة</span>
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
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl text-xs font-bold h-9 px-3 cursor-pointer"
                                  onClick={() => setQuickViewProduct(product)}
                                  title="معاينة سريعة"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </Card>
                          </AnimatedCard>
                        );
                      })}
                    </motion.div>
                  ) : (
                    /* List View */
                    <motion.div
                      key="list"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      {filteredItems.map((product) => (
                        <AnimatedCard key={product.id} className="rounded-3xl">
                          <Card className="group rounded-3xl overflow-hidden border border-slate-200/80 hover:border-emerald-300 transition-all p-4 bg-white flex flex-col sm:flex-row items-center gap-5">
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
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl text-xs font-bold h-9 px-3 cursor-pointer"
                                  onClick={() => setQuickViewProduct(product)}
                                >
                                  <Eye className="w-3.5 h-3.5 me-1" />
                                  <span>معاينة</span>
                                </Button>
                                <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-bold h-9">
                                  <Link href={`/products/${product.id}`}>تفاصيل</Link>
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </AnimatedCard>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </section>
      </main>

      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

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
