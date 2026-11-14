"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import {
  ChevronLeft,
  Phone,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.id;
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!orderId) return;
    supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setOrder(data);
      });
  }, [orderId]);

  const statusRank: Record<string, number> = {
    pending: 1,
    confirmed: 2,
    processing: 3,
    shipped: 4,
    out_for_delivery: 5,
    delivered: 6,
  };
  const activeStep = statusRank[order?.status || "confirmed"] || 2;

  const timelineStages = [
    { id: 1, title: "تم إنشاء الطلب", done: activeStep >= 1, current: activeStep === 1, desc: "تم تسجيل الطلب وحجز المنتجات في قاعدة البيانات" },
    { id: 2, title: "تم تأكيد الطلب والدفع", done: activeStep >= 2, current: activeStep === 2, desc: "التحقق من وسيلة الدفع وإصدار الفاتورة الضريبية" },
    { id: 3, title: "جاري التجهيز والتغليف", done: activeStep >= 3, current: activeStep === 3, desc: "فحص الجودة والتغليف لدى المنشأة التاجرة" },
    { id: 4, title: "تم تسليم الشحنة للناقل (SPL)", done: activeStep >= 4, current: activeStep === 4, desc: "إصدار بوليصة الشحن واستلامها من الناقل" },
    { id: 5, title: "الشحنة في طريقها للتسليم", done: activeStep >= 5, current: activeStep === 5, desc: "خروج المندوب باتجاه عنوان المقتني" },
    { id: 6, title: "تم التسليم بنجاح", done: activeStep >= 6, current: activeStep === 6, desc: "تسليم الطلب وتأكيد الاستلام" },
  ];

  const handleContactCourier = () => {
    toast.info("تم إرسال تنبيه مباشر إلى خدمة العملاء لمتابعة الشحنة.");
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
                  <span className="text-xs text-slate-400 font-mono">
                    بوليصة: {order?.tracking_number || `SPL-${String(orderId).slice(-8)}`}
                  </span>
                </div>
                <h1 className="text-2xl font-black text-slate-900">
                  تتبع الشحنة ({orderId})
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleContactCourier} className="gap-1.5 font-bold">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>التواصل مع الدعم</span>
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
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md">
              <h3 className="text-base font-bold text-slate-900 mb-6">
                مسار رحلة الشحنة (الحالة الفعلية: {order?.status || "confirmed"})
              </h3>

              <div className="relative pr-6 space-y-8 before:absolute before:right-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {timelineStages.map((stage) => (
                  <div key={stage.id} className="relative flex items-start gap-4">
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
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{stage.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase block">وجهة التسليم (العنوان الوطني)</span>
                <h5 className="font-bold text-slate-900 text-sm">
                  {order?.shipping_address?.city || "الرياض"} - {order?.shipping_address?.district || ""}
                </h5>
                <p className="text-xs text-slate-500 leading-relaxed">
                  المستلم: {order?.shipping_address?.fullName || order?.shipping_address?.full_name || "—"} • جوال:{" "}
                  {order?.shipping_address?.phone || "—"}
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
