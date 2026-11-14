"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import {
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ArrowLeft,
  MapPin,
  Truck,
  CreditCard,
  FileText,
  Lock,
  Sparkles,
  Phone,
  Building,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { toast } from "sonner";
import { createOrderInSupabase } from "@/lib/supabase";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartCount, subtotal, taxAmount, discount, total, clearCart } = useCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Step 1: Address Form State
  const [address, setAddress] = useState({
    fullName: "صاحب السمو الأمير فهد آل سعود",
    phone: "0501234567",
    city: "الرياض",
    district: "حي السفارات (حي الدبلوماسيين)",
    street: "شارع اليمامة",
    buildingNo: "7421",
    postalCode: "12512",
    additionalNo: "3184",
  });

  // Step 2: Shipping Option
  const [shippingMethod, setShippingMethod] = useState("express-2h");

  // Step 3: Payment Method (codes match public.payment_gateways.code)
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "wallet" | "moyasar" | "hyperpay" | "tap" | "stripe">("cod");
  const [couponCode, setCouponCode] = useState("");

  const steps = [
    { number: 1, title: "العنوان الوطني (SPL)" },
    { number: 2, title: "سرعة الشحن والتوصيل" },
    { number: 3, title: "وسيلة الدفع المعتمدة" },
    { number: 4, title: "مراجعة فاتورة زاتكا" },
  ];

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!address.fullName || !address.phone || !address.buildingNo) {
        toast.error("يرجى إكمال بيانات العنوان الوطني ورقم الجوال للتوصيل.");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(steps.length, prev + 1));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleConfirmOrder = async () => {
    if (cart.length === 0) {
      toast.error("سلة المشتريات فارغة.");
      return;
    }
    setIsProcessing(true);
    toast.info("جاري التحقق البنكي وإنشاء الطلب في قاعدة بيانات Supabase...");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((c) => ({ product_id: c.id, quantity: c.quantity })),
          address,
          gateway: paymentMethod,
          coupon: couponCode.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.orderId) {
        if (res.status === 401) {
          toast.error("يرجى تسجيل الدخول أولاً لإتمام الطلب.");
          router.push("/auth/login?redirect=/checkout");
          return;
        }
        toast.error(json.error || "تعذر إتمام الطلب.");
        return;
      }

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#006948", "#c5a059", "#10b981", "#ffffff"],
      });

      notify.zatca(
        "تم تأكيد الطلب بنجاح وإصدار فاتورة زاتكا!",
        `تم توثيق الطلب رقم ${json.orderId} في قاعدة البيانات.`
      );
      clearCart();
      router.push(`/orders/${json.orderId}/confirmation`);
    } catch (e: any) {
      toast.error(e?.message || "حدث خطأ غير متوقع أثناء إنشاء الطلب.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <StorefrontHeader />

      <main className="flex-1 pt-32 lg:pt-36">
        {/* Top Regulatory Assurance */}
        <section className="bg-slate-900 text-white text-xs py-2.5 border-b border-slate-800">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>بوابة دفع سيادية مشفرة ومعتمدة من البنك المركزي السعودي (ساما)</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 animate-pulse">
                <Lock className="w-3.5 h-3.5" />
                <span>توثيق نفاذ الوطني الموحد وبوابة ساما نشطة</span>
              </span>
            </div>
          </div>
        </section>

        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          {/* Breadcrumb & Title */}
          <div className="mb-8">
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Link href="/cart" className="hover:text-[#006948] transition-colors">السلة</Link>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[#006948] font-bold">بوابة الدفع السيادي المباشر</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              إنهاء الطلب والدفع الإلكتروني
            </h1>
          </div>

          {/* Animated Multi-Step Progress Bar & Stepper */}
          <div className="mb-8 space-y-4">
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-l from-[#006948] via-emerald-500 to-[#c5a059] rounded-full"
                initial={{ width: "25%" }}
                animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {steps.map((st) => (
                <motion.div
                  key={st.number}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => st.number < currentStep && setCurrentStep(st.number)}
                  className={`p-4 rounded-2xl border transition-colors flex items-center gap-3 cursor-pointer ${
                    currentStep === st.number
                      ? "bg-[#006948] text-white border-[#006948] shadow-md shadow-[#006948]/20"
                      : st.number < currentStep
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-white text-slate-400 border-slate-200"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                      currentStep === st.number
                        ? "bg-white text-[#006948]"
                        : st.number < currentStep
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {st.number < currentStep ? "✓" : st.number}
                  </div>
                  <span className="text-xs font-bold leading-tight">{st.title}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 2-Column Checkout Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Step Content Card (8 Cols) */}
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md">
              {/* Step 1: National Address */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006948] flex items-center justify-center font-bold">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          العنوان الوطني السعودي (SPL)
                        </h3>
                        <p className="text-xs text-slate-500">
                          يرجى التحقق من بيانات التوصيل المعتمدة لضمان وصول الشحنة المصفحة.
                        </p>
                      </div>
                    </div>
                    <Badge variant="sovereign">توثيق سبل نشط</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">الاسم الكامل للمستلم</label>
                      <Input
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        placeholder="الاسم الثلاثي"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">رقم الجوال السعودي للتواصل</label>
                      <Input
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        placeholder="05XXXXXXXX"
                        dir="ltr"
                        className="text-start"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">المدينة</label>
                      <Input
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        placeholder="الرياض / جدة..."
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">الحي</label>
                      <Input
                        value={address.district}
                        onChange={(e) => setAddress({ ...address, district: e.target.value })}
                        placeholder="اسم الحي السكني"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">رقم المبنى (٤ أرقام)</label>
                      <Input
                        value={address.buildingNo}
                        onChange={(e) => setAddress({ ...address, buildingNo: e.target.value })}
                        placeholder="7421"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">الرمز البريدي (٥ أرقام)</label>
                      <Input
                        value={address.postalCode}
                        onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                        placeholder="12512"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button variant="sovereign" onClick={handleNextStep} className="font-bold">
                      <span>المتابعة لخيارات الشحن</span>
                      <ArrowLeft className="w-4 h-4 ms-1.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Delivery Options */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006948] flex items-center justify-center font-bold">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          خيارات الشحن والتسليم الأمني
                        </h3>
                        <p className="text-xs text-slate-500">
                          اختر سرعة التوصيل المناسبة مع ميزة التتبع اللحظي ومندوب كونسيرج.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        id: "express-2h",
                        title: "توصيل فوري مصفح (خلال ساعتين)",
                        desc: "خدمة سيادية خاصة بمدينة الرياض وجدة مع مندوب كونسيرج مخصص وتأمين فوري.",
                        price: "مجاناً (عرض سيادي)",
                        badge: "الأسرع والأكثر أماناً",
                      },
                      {
                        id: "spl-secure",
                        title: "الشحن الوطني الموحد عبر سبل (SPL Express)",
                        desc: "تسليم رسمي خلال ٢٤ - ٤٨ ساعة لجميع مدن ومحافظات المملكة.",
                        price: "مجاناً",
                        badge: "تغطية شاملة للمملكة",
                      },
                      {
                        id: "scheduled",
                        title: "موعد تسليم مجدول مسبقاً",
                        desc: "اختر الوقت واليوم المناسب لك مع بروتوكول تسليم خاص بالقصور والمقرات.",
                        price: "مجاناً",
                        badge: "مرونة كاملة",
                      },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        onClick={() => setShippingMethod(opt.id)}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                          shippingMethod === opt.id
                            ? "border-[#006948] bg-emerald-50/60 ring-2 ring-[#006948]/20"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            checked={shippingMethod === opt.id}
                            onChange={() => setShippingMethod(opt.id)}
                            className="w-4 h-4 mt-1 accent-[#006948]"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{opt.title}</span>
                              <Badge variant="sovereign" className="text-[10px]">{opt.badge}</Badge>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-[#006948] shrink-0 ms-4">{opt.price}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={handlePrevStep}>السابق</Button>
                    <Button variant="sovereign" onClick={handleNextStep}>
                      <span>المتابعة لوسيلة الدفع</span>
                      <ArrowLeft className="w-4 h-4 ms-1.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Method */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006948] flex items-center justify-center font-bold">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          وسيلة الدفع الوطنية المعتمدة
                        </h3>
                        <p className="text-xs text-slate-500">
                          بوابات مرخصة من البنك المركزي السعودي (ساما) مع حماية الوديعة المالية.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        id: "cod",
                        title: "الدفع عند الاستلام (Cash on Delivery)",
                        desc: "ادفع نقداً أو بالبطاقة عند استلام الطلب من مندوب التوصيل.",
                        badge: "مفعل وجاهز",
                      },
                      {
                        id: "wallet",
                        title: "محفظة شمال الحجاز السيادية (Souq Wallet)",
                        desc: "خصم فوري من رصيد محفظتك النشط مع إصدار فاتورة ضريبية فورية.",
                        badge: "دفع فوري",
                      },
                      {
                        id: "moyasar",
                        title: "بوابة مُيسر (مدى / Apple Pay / البطاقات)",
                        desc: "الدفع الإلكتروني عبر شبكة مدى البنكية أو Apple Pay عبر Moyasar.",
                        badge: "Moyasar",
                      },
                      {
                        id: "tap",
                        title: "بوابة تاب للمدفوعات (Tap Payments)",
                        desc: "دفع إلكتروني سريع ومشفر لجميع بطاقات الخليج.",
                        badge: "Tap",
                      },
                      {
                        id: "hyperpay",
                        title: "بوابة هايبر باي (HyperPay)",
                        desc: "معالجة مصرفية مباشرة ومعتمدة من البنك المركزي السعودي.",
                        badge: "HyperPay",
                      },
                      {
                        id: "stripe",
                        title: "البطاقات الدولية (Stripe)",
                        desc: "قبول عالمي لجميع بطاقات Visa و Mastercard مع حماية 3D Secure.",
                        badge: "Stripe",
                      },
                    ].map((p) => (
                      <label
                        key={p.id}
                        onClick={() => setPaymentMethod(p.id as typeof paymentMethod)}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                          paymentMethod === p.id
                            ? "border-[#006948] bg-emerald-50/60 ring-2 ring-[#006948]/20"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethod === p.id}
                            onChange={() => setPaymentMethod(p.id as typeof paymentMethod)}
                            className="w-4 h-4 mt-1 accent-[#006948]"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{p.title}</span>
                              <Badge variant="sovereign" className="text-[10px]">{p.badge}</Badge>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{p.desc}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={handlePrevStep}>السابق</Button>
                    <Button variant="sovereign" onClick={handleNextStep}>
                      <span>المتابعة لمراجعة الفاتورة</span>
                      <ArrowLeft className="w-4 h-4 ms-1.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Review ZATCA Phase-2 Invoice & Final Confirmation */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006948] flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          مراجعة الفاتورة الضريبية ZATCA Phase-2
                        </h3>
                        <p className="text-xs text-slate-500">
                          مطابقة لأنظمة هيئة الزكاة والضريبة والجمارك وموثقة برقم UUID مشفر.
                        </p>
                      </div>
                    </div>
                    <Badge variant="sovereign">مرحلة الربط الإلكتروني 2</Badge>
                  </div>

                  {/* Order Preview Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-700">عنوان التسليم:</span>
                      <span className="text-slate-600 font-medium">
                        {address.city} - {address.district} ({address.buildingNo})
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-700">طريقة الدفع:</span>
                      <span className="text-[#006948] font-bold uppercase">{paymentMethod}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">سرعة الشحن:</span>
                      <span className="text-emerald-700 font-bold">توصيل فوري خلال ساعتين (VIP)</span>
                    </div>
                  </div>

                  {/* Warning / SAMA Escrow Note */}
                  <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-xs leading-relaxed space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>ضمان حماية المشتري المعتمد من ساما</span>
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      بالنقر على &quot;تأكيد الدفع السيادي&quot;، سيتم حجز المبلغ في حساب الضمان المستقل، وإصدار الفاتورة الضريبية الفورية مع رمز الاستجابة السريعة (QR Code).
                    </p>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={handlePrevStep} disabled={isProcessing}>
                      السابق
                    </Button>
                    <Button
                      variant="gold"
                      size="lg"
                      onClick={handleConfirmOrder}
                      disabled={isProcessing}
                      className="font-black text-sm"
                    >
                      {isProcessing ? "جاري المعالجة البنكية المشفرة..." : `تأكيد الدفع السيادي (${formatSAR(total)})`}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Order Summary (4 Cols) */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
              <h3 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-100">
                ملخص المقتنيات ({cartCount} قطع)
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-xs">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 truncate">
                      <h5 className="font-bold text-slate-900 truncate">{item.title}</h5>
                      <span className="text-[10px] text-slate-400">الكمية: {item.quantity}</span>
                    </div>
                    <span className="font-bold text-[#006948] shrink-0">
                      {formatSAR(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>المجموع الفرعي:</span>
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
                  <span>الشحن والتأمين:</span>
                  <span className="font-bold text-emerald-700">مجاناً</span>
                </div>

                <div className="flex justify-between items-baseline pt-3 border-t border-slate-200 text-slate-900">
                  <span className="text-sm font-black">الإجمالي الكلي:</span>
                  <span className="text-xl font-black text-[#006948]">{formatSAR(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}
