"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Zap, Copy, Check, Clock, ShoppingBag, ArrowLeft, ChevronLeft, ShieldCheck, Store } from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { toast } from "sonner";
import { ALL_PRODUCTS, Product } from "@/lib/catalogData";
import { supabase, mapDbProductToProduct } from "@/lib/supabase";

export default function DealsHubPage() {
  const { addToCart } = useCart();
  const { currency } = useCurrency();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState([
    { code: "SOUQ10", discount: "خصم 10%", desc: "خصم إضافي على أول طلب من كبار الموردين والمتاجر المعتمدة" },
    { code: "TECH15", discount: "خصم 15%", desc: "خصم خاص على الإلكترونيات والسماعات اللاسلكية الأصلية" },
    { code: "FREESHIP", discount: "شحن مجاني", desc: "توصيل سريع مجاني لكافة الطلبات فوق ١٥٠ ر.س" },
  ]);

  const [timeLeft, setTimeLeft] = useState({ hours: 9, minutes: 42, seconds: 15 });

  useEffect(() => {
    async function loadDeals() {
      try {
        const { data: pData } = await supabase
          .from("products")
          .select("*")
          .not("original_price", "is", null)
          .order("price", { ascending: true });

        if (pData && pData.length > 0) {
          setDealProducts((pData as any[]).map(mapDbProductToProduct));
        } else {
          setDealProducts(ALL_PRODUCTS.filter((p) => p.originalPrice));
        }

        // Fetch coupons from db
        const { data: cData } = await supabase.from("coupons").select("*").eq("is_active", true);
        if (cData && cData.length > 0) {
          setCoupons(
            cData.map((c) => ({
              code: c.code,
              discount: c.discount_type === "percent" ? `خصم ${c.discount_value}%` : `خصم ${formatSAR(c.discount_value)}`,
              desc: c.description || `قسيمة تخفيض بقيمة ${c.discount_value}${c.discount_type === "percent" ? "%" : " ر.س"}`,
            }))
          );
        }
      } catch (err) {
        setDealProducts(ALL_PRODUCTS.filter((p) => p.originalPrice));
      }
    }
    loadDeals();
  }, []);

  const handleCopyCode = (code: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(code);
      setCopiedCode(code);
      toast.success(`تم نسخ الكوبون (${code}) بنجاح!`, {
        description: "يمكنك لصقه في سلة المشتريات للحصول على الخصم الفوري.",
      });
      setTimeout(() => setCopiedCode(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <StorefrontHeader />

      <main className="flex-1 pt-32 lg:pt-36">
        <section className="bg-white border-b border-slate-200/80 py-8">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Link href="/" className="hover:text-[#006948] transition-colors">
                الرئيسية
              </Link>
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#006948] font-bold">عروض الصفقات وقسائم التوفير</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="destructive" className="flex items-center gap-1 font-bold">
                    <Zap className="w-3 h-3 fill-white" />
                    عروض محدودة الوقت من الموردين
                  </Badge>
                  <span className="text-xs text-slate-500 font-bold">تحديث يومي دوري</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  صفقات اليوم الخاطفة وقسائم الخصم المباشر
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  وفر حتى ٤٠٪ على المنتجات الأكثر طلباً في السوق السعودي مع ضمان حماية المشتري Escrow.
                </p>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-3 bg-slate-900 text-white p-3 px-5 rounded-2xl shadow-lg shrink-0">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-300">ينتهي العرض خلال:</span>
                <span className="font-mono text-sm font-black text-emerald-400">
                  {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Claimable Coupons Strip */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coupons.map((c) => (
              <div
                key={c.code}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="sovereign" className="text-xs font-bold">
                      {c.discount}
                    </Badge>
                    <span className="text-xs font-mono font-bold text-slate-400">كود معتمد</span>
                  </div>
                  <h4 className="font-mono font-black text-xl text-slate-900 mb-1">{c.code}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{c.desc}</p>
                </div>

                <Button
                  onClick={() => handleCopyCode(c.code)}
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedCode === c.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">تم نسخ الكود!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ الكود</span>
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Flash Deals Products Grid */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-900">
              منتجات بأسعار مخفضة لفترة محدودة
            </h2>
            <span className="text-xs font-bold text-emerald-700">
              {dealProducts.length} عرض نشط الآن
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dealProducts.map((item) => (
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
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 end-3 flex flex-col gap-1.5 items-end">
                      <Badge variant="destructive" className="font-bold text-xs">
                        وفر {item.originalPrice ? formatSAR(item.originalPrice - item.price) : ""}
                      </Badge>
                      <span className="px-2 py-0.5 rounded-full bg-slate-900/85 text-white text-[9px] font-semibold">
                        {item.salesCount}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <span className="text-xs font-semibold text-emerald-800 block mb-1">
                      {item.vendor}
                    </span>
                    <Link href={`/products/${item.id}`} className="hover:text-[#006948] transition-colors">
                      <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                    </Link>

                    <div className="flex items-baseline gap-2 mt-4 pt-3 border-t border-slate-100">
                      <span className="text-lg font-black text-[#006948]">
                        {formatSAR(item.price)}
                      </span>
                      {item.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatSAR(item.originalPrice)}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 me-auto">شامل الضريبة</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" asChild className="rounded-xl text-xs font-bold">
                    <Link href={`/products/${item.id}`}>التفاصيل</Link>
                  </Button>
                  <Button
                    variant="sovereign"
                    size="sm"
                    className="rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                    onClick={() => addToCart(item)}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>اقتنِ العرض</span>
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
