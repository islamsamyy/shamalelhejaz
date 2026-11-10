"use client";

import React from "react";
import Link from "next/link";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { Heart, ShoppingBag, Trash2, ArrowLeft, ChevronLeft } from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { ALL_PRODUCTS, Product } from "@/lib/catalogData";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useCart();

  const items = ALL_PRODUCTS.filter((item) => wishlist.includes(item.id));

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <StorefrontHeader />

      <main className="flex-1 pt-32 lg:pt-36">
        <section className="bg-white border-b border-slate-200/80 py-8">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Link href="/" className="hover:text-[#006948] transition-colors">الرئيسية</Link>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[#006948] font-bold">قائمة المنتجات المفضلة</span>
            </nav>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  قائمة المنتجات المفضلة
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  لديك {items.length} منتجات محفوظة في قائمتك الخاصة للمتابعة والشراء لاحقاً.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          {items.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-xl mx-auto my-8">
              <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">لا توجد منتجات محفوظة حالياً</h3>
              <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
                اضغط على أيقونة القلب على أي منتج في المتجر لحفظه هنا ومتابعة توفره وعروضه.
              </p>
              <Button asChild variant="sovereign" size="lg" className="rounded-2xl font-bold text-xs">
                <Link href="/catalog" className="flex items-center gap-2">
                  <span>استكشف المنتجات الأكثر مبيعاً</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="group rounded-3xl overflow-hidden border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between bg-white"
                >
                  <div>
                    <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-3 end-3">
                        <Badge variant="sovereign" className="bg-white/95 text-emerald-800 text-[10px] font-bold">
                          {item.badge}
                        </Badge>
                      </div>
                      <button
                        onClick={() => toggleWishlist({ id: item.id, title: item.title })}
                        className="absolute top-3 start-3 w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-md cursor-pointer hover:bg-rose-100 transition-colors"
                        title="إزالة من المفضلة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-5">
                      <span className="text-[11px] font-semibold text-emerald-800 block mb-1">
                        {item.vendor}
                      </span>
                      <Link href={`/products/${item.id}`} className="hover:text-[#006948] transition-colors">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                      </Link>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-baseline gap-2">
                        <span className="text-base font-black text-[#006948]">
                          {formatSAR(item.price)}
                        </span>
                        {item.originalPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatSAR(item.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" asChild className="rounded-xl text-xs font-bold">
                      <Link href={`/products/${item.id}`}>المواصفات</Link>
                    </Button>
                    <Button
                      variant="sovereign"
                      size="sm"
                      className="rounded-xl text-xs font-bold"
                      onClick={() => addToCart(item)}
                    >
                      <ShoppingBag className="w-3.5 h-3.5 ms-1" />
                      إضافة للسلة
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}
