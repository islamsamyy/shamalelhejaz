"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import {
  Search,
  ShoppingBag,
  Heart,
  ChevronLeft,
  Filter,
  Star,
  Sparkles,
  X,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { ALL_PRODUCTS, Product } from "@/lib/catalogData";
import { matchesSearch } from "@/lib/search";
import { fetchProductsFromSupabase } from "@/lib/supabase";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [products, setProducts] = useState<Product[]>(ALL_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const { currency } = useCurrency();

  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    fetchProductsFromSupabase()
      .then((dbProducts) => {
        if (!active) return;
        if (dbProducts && dbProducts.length > 0) {
          const dbIds = new Set(dbProducts.map((p) => p.id));
          setProducts([...dbProducts, ...ALL_PRODUCTS.filter((p) => !dbIds.has(p.id))]);
        }
      })
      .catch((err) => console.error("Search fetch error:", err))
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  const results = products.filter((item) => matchesSearch(item, searchTerm));

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 font-sans">
      {/* Search Header */}
      <div className="mb-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#006948] transition-colors">
            الرئيسية
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#006948] font-bold">نتائج البحث في المتاجر</span>
        </nav>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Search className="w-6 h-6 text-[#006948]" />
              نتائج البحث عن: <span className="text-[#006948]">&quot;{searchTerm || "كافة المنتجات المتاحة"}&quot;</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              تم العثور على {results.length} منتج أصلي متوفر لدى الموردين والمتاجر المعتمدة.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-300 font-bold text-xs">
              <Link href="/catalog" className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                <span>تصفية متقدمة بالكتالوج</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* On-Page Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center pt-2 max-w-2xl">
          <Search className="absolute start-4 text-slate-400 w-4 h-4 pointer-events-none" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="عدّل عبارة البحث أو ابحث باسم المنتج، المتجر، أو التصنيف..."
            className="w-full h-11 ps-11 pe-24 rounded-2xl bg-slate-50 border-slate-200 text-xs focus:bg-white"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                router.push("/search");
              }}
              className="absolute end-24 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <Button
            type="submit"
            variant="sovereign"
            size="sm"
            className="absolute end-1.5 h-8 px-4 rounded-xl text-xs font-bold"
          >
            بحث
          </Button>
        </form>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
          <div className="w-12 h-12 rounded-full border-4 border-[#006948] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-bold">جارٍ استرجاع المنتجات المطابقة من قاعدة البيانات...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {results.map((product) => {
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
                    <div className="absolute top-3 end-3 flex flex-col gap-1 items-end">
                      <Badge variant="sovereign" className="bg-white/95 text-emerald-800 text-[10px] font-bold">
                        {product.badge}
                      </Badge>
                    </div>
                    <button
                      onClick={() => toggleWishlist({ id: product.id, title: product.title })}
                      className={`absolute top-3 start-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-md cursor-pointer ${
                        wishlisted ? "bg-rose-50 text-rose-600" : "bg-white/90 text-slate-600 hover:text-rose-600"
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

                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs mt-2">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{product.rating}</span>
                      <span className="text-slate-400">({product.reviews})</span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-baseline gap-2">
                      <span className="text-base font-black text-[#006948]">
                        {formatSAR(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatSAR(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" asChild className="rounded-xl text-xs font-bold">
                    <Link href={`/products/${product.id}`}>المواصفات</Link>
                  </Button>
                  <Button
                    variant="sovereign"
                    size="sm"
                    className="rounded-xl text-xs font-bold"
                    onClick={() => addToCart(product)}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 ms-1" />
                    شراء
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">لم نجد أي منتجات تطابق &quot;{searchTerm}&quot;</h2>
          <p className="text-xs text-slate-500 mb-6">
            تأكد من كتابة الكلمات بشكل صحيح أو تصفح الأقسام الرئيسية الأكثر طلباً.
          </p>
          <Button asChild variant="gold" className="rounded-xl text-xs font-bold">
            <Link href="/catalog">تصفح كافة المنتجات الأكثر مبيعاً</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <StorefrontHeader />
      <main className="flex-1 pt-32 lg:pt-36">
        <Suspense fallback={<div className="text-center py-20 text-xs text-slate-400">جاري تحميل نتائج البحث...</div>}>
          <SearchContent />
        </Suspense>
      </main>
      <StorefrontFooter />
    </div>
  );
}
