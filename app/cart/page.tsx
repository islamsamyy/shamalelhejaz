"use client";

import React, { useState } from "react";
import Link from "next/link";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ChevronLeft,
  ShieldCheck,
  Gift,
  Tag,
  CheckCircle2,
  Timer,
  Lock,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { toast } from "sonner";

export default function CartPage() {
  const {
    cart,
    cartCount,
    subtotal,
    taxAmount,
    discount,
    couponCode,
    total,
    removeFromCart,
    updateQuantity,
    applyCoupon,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState("");
  const [giftWrapping, setGiftWrapping] = useState(false);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCoupon.trim()) {
      applyCoupon(inputCoupon.trim());
      setInputCoupon("");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <StorefrontHeader />

      <main className="flex-1 pt-32 lg:pt-36">
        {/* Top Trust Ribbon */}
        <section className="bg-white border-b border-slate-200/80 py-3">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>مقتنياتك مؤمنة بالكامل في حساب ضمان معتمد من البنك المركزي السعودي (ساما)</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full font-bold text-[11px] border border-emerald-200/60">
              <Timer className="w-3.5 h-3.5 text-emerald-600" />
              <span>الحجز السيادي نشط: 58:42 دقيقة</span>
            </div>
          </div>
        </section>

        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          {/* Breadcrumb & Header */}
          <div className="mb-6">
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Link href="/" className="hover:text-[#006948] transition-colors">الرئيسية</Link>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[#006948] font-bold">سلة المقتنيات والحقيبة السيادية</span>
            </nav>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  سلة المقتنيات الملكية
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  لديك <span className="font-bold text-[#006948]">{cartCount} قطع مخصصة</span> محجوزة لمعرفك السيادي.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>دفع مشفر بنظام TLS 1.3 معتمد</span>
              </div>
            </div>
          </div>

          {cart.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-xl mx-auto my-8">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-[#006948] flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">حقيبة المقتنيات فارغة</h3>
              <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
                لم تقم بإضافة أي قطع بعد. استكشف خزانة المقتنيات السيادية ودهن العود المعتق وأضف ما يناسب ذوقك.
              </p>
              <Button asChild variant="sovereign" size="lg" className="rounded-2xl">
                <Link href="/catalog" className="flex items-center gap-2">
                  <span>تصفح دليل المقتنيات</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Items List (8 Cols) */}
              <div className="lg:col-span-8 space-y-4">
                {cart.map((item) => (
                  <Card
                    key={item.id}
                    className="p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all bg-white"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                      {/* Image */}
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-emerald-800">
                            {item.vendor}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            title="حذف من السلة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <Link href={`/products/${item.id}`} className="hover:text-[#006948]">
                          <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                            {item.title}
                          </h4>
                        </Link>

                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-base font-black text-[#006948]">
                            {formatSAR(item.price)}
                          </span>
                          {item.originalPrice && (
                            <span className="text-xs text-slate-400 line-through">
                              {formatSAR(item.originalPrice)}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">شامل الضريبة 15%</span>
                        </div>
                      </div>

                      {/* Quantity Stepper & Total */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-2 text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-black text-slate-900">
                          {formatSAR(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}

                {/* Royal Gifting Option */}
                <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        التغليف الملكي وبطاقة الإهداء الدبلوماسية
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        صندوق فاخر مخملي مع ختم شمعي يحمل شعار السيفين والنخلة.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setGiftWrapping(!giftWrapping);
                      toast.info(giftWrapping ? "تم إلغاء التغليف الملكي" : "تمت إضافة التغليف الملكي بنجاح مجاناً!");
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      giftWrapping
                        ? "bg-[#006948] text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {giftWrapping ? "مضاف مجاناً ✓" : "إضافة التغليف"}
                  </button>
                </div>
              </div>

              {/* Order Summary Sidebar (4 Cols) */}
              <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
                <h3 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-100">
                  ملخص الحقيبة والحساب المالي
                </h3>

                {/* Coupon Input Form */}
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    كوبون الخصم السيادي (جرب SOUQ2030 أو ROYAL15)
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      placeholder="رمز القسيمة"
                      className="h-10 text-xs uppercase"
                    />
                    <Button type="submit" variant="sovereign" size="sm" className="h-10 text-xs font-bold shrink-0">
                      تطبيق
                    </Button>
                  </div>
                  {couponCode && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تم تفعيل الكوبون ({couponCode})</span>
                    </div>
                  )}
                </form>

                {/* Cost Breakdown */}
                <div className="space-y-2.5 text-xs pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-slate-600">
                    <span>المجموع الفرعي ({cartCount} قطع):</span>
                    <span className="font-bold text-slate-900">{formatSAR(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>الخصم المطبق:</span>
                      <span>- {formatSAR(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>ضريبة القيمة المضافة ZATCA (15%):</span>
                    <span className="font-bold text-emerald-800">{formatSAR(taxAmount)}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>رسوم الشحن والتوصيل المصفح:</span>
                    <span className="font-bold text-emerald-700">مجاناً (عرض سيادي)</span>
                  </div>

                  <div className="flex justify-between items-baseline pt-4 border-t border-slate-200 text-slate-900">
                    <span className="text-sm font-black">الإجمالي الكلي النهائي:</span>
                    <span className="text-xl font-black text-[#006948]">{formatSAR(total)}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block text-end">
                    السعر شامل 15% ضريبة القيمة المضافة ZATCA
                  </span>
                </div>

                <Button asChild variant="sovereign" size="lg" className="w-full font-black text-sm rounded-2xl shadow-lg">
                  <Link href="/checkout" className="flex items-center justify-center gap-2">
                    <span>المتابعة لإنهاء الطلب والدفع</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </Button>

                <div className="p-3.5 rounded-2xl bg-emerald-50 text-[11px] text-emerald-900 space-y-1 border border-emerald-100">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>ضمان ساما المالي لحماية المشتري</span>
                  </div>
                  <p className="text-[10px] text-emerald-700 leading-relaxed">
                    لا يتم تحويل المبلغ للبائع إلا بعد استلامك للقطعة وفحصها والتأكد من مطابقتها لشهادة الأصالة المعتمدة.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}
