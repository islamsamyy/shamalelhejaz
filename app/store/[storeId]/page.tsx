"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import {
  ShieldCheck,
  CheckCircle2,
  Star,
  MapPin,
  ShoppingBag,
  Heart,
  ChevronLeft,
  Phone,
  Clock,
  Sparkles,
  Store,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { toast } from "sonner";
import { VENDOR_STORES, ALL_PRODUCTS, Product } from "@/lib/catalogData";
import { supabase, mapDbProductToProduct } from "@/lib/supabase";

export default function BrandStorePage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const unwrappedParams = use(params);
  const storeId = unwrappedParams.storeId || "modern-tech";
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const { currency } = useCurrency();

  const [store, setStore] = useState<any>({
    id: storeId,
    name: "شركة آفاق التقنية للتجارة",
    category: "إلكترونيات وأجهزة ذكية",
    rating: 4.95,
    reviewsCount: 3240,
    city: "الرياض • المملكة العربية السعودية",
    cr: "1010884920",
    zatca: "310192847200003",
    badge: "تاجر معتمد موثق (KYB)",
    logoLetter: "ش",
    banner: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80",
    description:
      "متجر رسمي معتمد وموثق في منصة واثق ونظام النفاذ الوطني. جميع المنتجات أصلية ١٠٠٪ ومغطاة بضمان الوكلاء المعتمدين مع شحن فوري وحماية المشتري عبر حساب الضمان Escrow.",
  });

  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStore() {
      setIsLoading(true);
      try {
        // Query vendor
        const { data: vData } = await supabase
          .from("vendors")
          .select("*")
          .or(`id.eq.${storeId},slug.eq.${storeId}`)
          .maybeSingle();

        if (vData) {
          setStore({
            id: vData.id,
            name: vData.name,
            category: vData.categories?.[0] || "إلكترونيات وأجهزة ذكية",
            rating: Number(vData.rating) || 4.95,
            reviewsCount: Number(vData.reviews_count) || 420,
            city: vData.location || "الرياض • المملكة العربية السعودية",
            cr: vData.cr_number || "1010884920",
            zatca: vData.vat_number || "310192847200003",
            badge: vData.verified ? "تاجر معتمد موثق (KYB)" : "شريك معتمد",
            logoLetter: vData.name ? vData.name.charAt(0) : "م",
            banner: vData.banner || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80",
            description: vData.bio || "متجر رسمي معتمد وموثق في منصة واثق ونظام النفاذ الوطني.",
          });
        }

        // Query products
        const { data: pData } = await supabase
          .from("products")
          .select("*")
          .or(`vendor_id.eq.${storeId},vendor.ilike.%${vData?.name || storeId}%`)
          .order("created_at", { ascending: false });

        if (pData && pData.length > 0) {
          setDisplayProducts(pData.map(mapDbProductToProduct));
        } else {
          // If none specifically linked, show all products
          const { data: anyProds } = await supabase.from("products").select("*").limit(4);
          if (anyProds && anyProds.length > 0) {
            setDisplayProducts(anyProds.map(mapDbProductToProduct));
          } else {
            setDisplayProducts(ALL_PRODUCTS.slice(0, 4));
          }
        }
      } catch (err) {
        console.error("Error loading store:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStore();
  }, [storeId]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <StorefrontHeader />

      <main className="flex-1 pt-32 lg:pt-36">
        {/* Brand Banner */}
        <div className="relative h-64 lg:h-80 bg-slate-900 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={store.banner}
            alt={store.name}
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        {/* Brand Profile Card Overlap */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 -mt-24 relative z-10 mb-8">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#006948] to-[#004d34] text-white flex items-center justify-center font-black text-3xl shadow-lg ring-4 ring-white shrink-0">
                {store.logoLetter || "م"}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">{store.name}</h1>
                  <Badge variant="sovereign">{store.badge}</Badge>
                </div>
                <p className="text-xs text-slate-500 max-w-xl leading-relaxed">{store.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    السجل التجاري: {store.cr}
                  </span>
                  <span>الرقم الضريبي ZATCA: {store.zatca}</span>
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {store.rating} ({store.reviewsCount || 420} تقييم موثق)
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="sovereign"
              onClick={() => toast.success("تم فتح محادثة الدعم المباشر مع ممثل المتجر.")}
              className="font-bold shrink-0 text-xs h-11 px-5 rounded-2xl"
            >
              تواصل مع المتجر
            </Button>
          </div>
        </section>

        {/* Store Catalog */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-slate-900">
              منتجات المتجر المتاحة للشراء ({displayProducts.length} منتج أصلي)
            </h2>
            <span className="text-xs text-slate-400">تحديث فوري للمخزون</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => {
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
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-3 end-3">
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
                      <Link href={`/products/${product.id}`} className="block hover:text-[#006948] transition-colors">
                        <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                          {product.title}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs mt-2">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{product.rating}</span>
                        <span className="text-slate-400">({product.reviews})</span>
                      </div>

                      <div className="flex items-baseline gap-2 mt-3 pt-3 border-t border-slate-100">
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
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}
