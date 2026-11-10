"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import {
  Search,
  ShoppingBag,
  Heart,
  ChevronLeft,
  Filter,
  Star,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { ALL_PRODUCTS, Product } from "@/lib/catalogData";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { addToCart, toggleWishlist, isWishlisted } = useCart();

  const results = ALL_PRODUCTS.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.vendor.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 font-sans">
      {/* Search Header */}
      <div className="mb-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <Link href="/" className="hover:text-[#006948] transition-colors">
            الرئيسية
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#006948] font-bold">نتائج البحث في المتاجر</span>
        </nav>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              نتائج البحث عن: <span className="text-[#006948]">&quot;{query || "كافة المنتجات الأكثر طلباً"}&quot;</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              تم العثور على {results.length} منتج أصلي متوفر لدى الموردين والمتاجر المعتمدة.
            </p>
          </div>

          <Button asChild variant="outline" size="sm" className="rounded-xl border-slate-300 font-bold text-xs">
            <Link href="/catalog" className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              <span>تصفية متقدمة بالكتالوج</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Results Grid */}
      {results.length > 0 ? (
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
          <h2 className="text-lg font-bold text-slate-900 mb-1">لم نجد أي منتجات تطابق بحثك</h2>
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
