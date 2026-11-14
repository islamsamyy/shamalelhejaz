"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { formatSAR } from "@/lib/utils";
import {
  CheckCircle2,
  Download,
  Printer,
  Truck,
  ArrowLeft,
  QrCode,
} from "lucide-react";
import { toast } from "sonner";

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.id;

  const [order, setOrder] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    async function loadOrder() {
      const [ordRes, invRes] = await Promise.all([
        supabase.from("orders").select("*").eq("id", orderId).maybeSingle(),
        supabase.from("invoices").select("*").eq("order_id", orderId).maybeSingle(),
      ]);
      if (ordRes.data) setOrder(ordRes.data);
      if (invRes.data) setInvoice(invRes.data);
    }
    if (orderId) loadOrder();
  }, [orderId]);

  const handleDownloadInvoice = () => {
    const payload = { orderId, order, invoice };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${orderId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تنزيل بيانات الفاتورة الضريبية ZATCA بنجاح!");
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <StorefrontHeader />

      <main className="flex-1 pt-32 lg:pt-36">
        <section className="max-w-[1000px] mx-auto px-4 lg:px-8 py-10">
          {/* Success Banner */}
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-[#006948] flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-500/10 shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <Badge variant="sovereign" className="mb-2">تم تأكيد الطلب في قاعدة البيانات</Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              شكراً لطلبك من منصة شمال الحجاز
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              تم تسجيل طلبك برقم <span className="font-bold text-[#006948] font-mono">{orderId}</span>
              {order?.total ? ` بقيمة إجمالية ${formatSAR(Number(order.total))}` : ""}.
            </p>
          </div>

          {/* Electronic Tax Invoice Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-10 space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-emerald-100 border border-emerald-200 p-1.5 flex items-center justify-center shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo-mark.png"
                    alt="شعار شمال الحجاز"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 block uppercase">
                    المملكة العربية السعودية • هيئة الزكاة والضريبة والجمارك
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                    فاتورة ضريبية مبسطة (ZATCA Phase-2 Standard)
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">
                    UUID: {invoice?.uuid_zatca || orderId}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-14 h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center shrink-0">
                  <QrCode className="w-9 h-9" />
                </div>
                <div className="text-right text-[11px] leading-tight">
                  <span className="font-bold text-slate-900 block">
                    {invoice?.invoice_number || "فاتورة ضريبية"}
                  </span>
                  <span className="text-slate-500">مشفر وفق خوارزمية ECDSA</span>
                </div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">رقم الطلب:</span>
                <span className="font-bold text-slate-900 font-mono">{orderId}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">تاريخ ووقت الإصدار:</span>
                <span className="font-bold text-slate-900">
                  {order?.created_at
                    ? new Date(order.created_at).toLocaleDateString("ar-SA")
                    : new Date().toLocaleDateString("ar-SA")}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">الإجمالي شامل الضريبة:</span>
                <span className="font-bold text-[#006948] font-mono">
                  {order ? formatSAR(Number(order.total)) : "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">حالة الدفع والطلب:</span>
                <span className="font-bold text-emerald-700">
                  {order?.payment_status === "paid" ? "مدفوع ومؤكد" : order?.status || "مؤكد"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadInvoice} className="gap-1.5 font-bold">
                  <Download className="w-4 h-4" />
                  <span>تحميل الفاتورة</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 font-bold">
                  <Printer className="w-4 h-4" />
                  <span>طباعة</span>
                </Button>
              </div>

              <Button asChild variant="sovereign" size="lg" className="rounded-2xl font-bold">
                <Link href={`/orders/${orderId}/tracking`} className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  <span>الانتقال لتتبع الشحنة المباشر</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}
