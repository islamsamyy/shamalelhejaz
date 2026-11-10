"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  MapPin,
  ChevronLeft,
  ShieldCheck,
  Phone,
  FileText,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.id || "SQ-94281";

  // 6-stage visual timeline matching souq/stru.md
  const timelineStages = [
    { id: 1, title: "تم إنشاء الطلب", time: "اليوم، 10:14 ص", done: true, desc: "تم تسجيل الطلب وحجز القطعة بنجاح" },
    { id: 2, title: "تم تأكيد الدفع", time: "اليوم، 10:16 ص", done: true, desc: "التحقق عبر البنك المركزي السعودي وإيداع الضمان" },
    { id: 3, title: "جاري التجهيز والتغليف الملكي", time: "اليوم، 11:30 ص", done: true, current: true, desc: "فحص الجودة المخبري والتغليف بختم الشمع الملكي" },
    { id: 4, title: "تم تسليم الشحنة للناقل (SPL)", time: "متوقع 01:00 م", done: false, desc: "إصدار بوليصة الشحن السيادية رقم SPL-94821038" },
    { id: 5, title: "الشحنة في طريقها للتسليم", time: "متوقع 02:15 م", done: false, desc: "خروج المندوب الأمني المصفح باتجاه مقر المقتني" },
    { id: 6, title: "تم التسليم بنجاح", time: "متوقع 03:00 م", done: false, desc: "تسليم القطعة مع رمز التحقق OTP وشهادة الأصالة" },
  ];

  const handleContactCourier = () => {
    toast.info("تم إرسال تنبيه مباشر إلى كونسيرج التوصيل المخصص لمتابعة الشحنة.");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <StorefrontHeader />

      <main className="flex-1 pt-32 lg:pt-36">
        <section className="bg-white border-b border-slate-200/80 py-6">
          <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Link href="/" className="hover:text-[#006948] transition-colors">الرئيسية</Link>
              <ChevronLeft className="w-3.5 h-3.5" />
              <Link href="/account" className="hover:text-[#006948] transition-colors">ديوان العميل</Link>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[#006948] font-bold">تتبع الشحنة المباشر</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="sovereign">تتبع حي وفوري</Badge>
                  <span className="text-xs text-slate-400 font-mono">بوليصة: SPL-94821038</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900">
                  تتبع الشحنة السيادية ({orderId})
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleContactCourier} className="gap-1.5 font-bold">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>الاتصال بالكونسيرج</span>
                </Button>
                <Button asChild variant="outline" size="sm" className="gap-1.5 font-bold">
                  <Link href={`/orders/${orderId}/confirmation`}>
                    <FileText className="w-3.5 h-3.5" />
                    <span>الفاتورة ZATCA</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Timeline Column (8 Cols) */}
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md">
              <h3 className="text-base font-bold text-slate-900 mb-6">
                مسار رحلة الشحنة المصفحة (البريد السعودي سبل)
              </h3>

              {/* 6-Stage Vertical Timeline */}
              <div className="relative pr-6 space-y-8 before:absolute before:right-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {timelineStages.map((stage) => (
                  <div key={stage.id} className="relative flex items-start gap-4">
                    {/* Step Icon Indicator */}
                    <div
                      className={`absolute -right-6 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white ${
                        stage.done
                          ? "bg-[#006948] text-white"
                          : stage.current
                          ? "bg-amber-500 text-white animate-pulse"
                          : "bg-slate-200 text-slate-400"
                      }`}
                    >
                      {stage.done ? "✓" : stage.id}
                    </div>

                    {/* Stage Details */}
                    <div className="flex-1 pr-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4
                          className={`text-sm font-bold ${
                            stage.current
                              ? "text-[#006948]"
                              : stage.done
                              ? "text-slate-900"
                              : "text-slate-400"
                          }`}
                        >
                          {stage.title}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono">{stage.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{stage.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Side Courier & Security Info (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Delivery Courier Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase block">مندوب التوصيل المعتمد</span>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 font-bold text-sm flex items-center justify-center">
                    م.ع
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">الكابتن / مساعد العتيبي</h5>
                    <p className="text-xs text-slate-500">ناقل أمني معتمد • الرياض</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 text-xs space-y-1.5 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">السيارة:</span>
                    <span className="font-bold text-slate-800">مصفحة أمنية KSA-08</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">رمز التسليم (OTP):</span>
                    <span className="font-mono font-bold text-emerald-700">9482</span>
                  </div>
                </div>

                <Button
                  variant="sovereign"
                  size="sm"
                  className="w-full font-bold"
                  onClick={handleContactCourier}
                >
                  <Phone className="w-3.5 h-3.5 ml-1.5" />
                  اتصال مباشر بالكابتن
                </Button>
              </div>

              {/* Destination Address */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase block">وجهة التسليم (العنوان الوطني)</span>
                <h5 className="font-bold text-slate-900 text-sm">مدينة الرياض - حي السفارات</h5>
                <p className="text-xs text-slate-500 leading-relaxed">
                  شارع اليمامة، مبنى رقم 7421، الرمز البريدي 12512.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}
