"use client";

import React, { useState } from "react";
import Link from "next/link";
import VendorNav from "@/components/vendor/VendorNav";
import VendorAuthGuard from "@/components/vendor/VendorAuthGuard";
import {
  AnimatedCard,
  AnimatedCounter,
  StaggerContainer,
  StaggerItem,
  FadeIn,
} from "@/components/ui/motion-primitives";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { notify } from "@/lib/notify";
import {
  Store,
  DollarSign,
  TrendingUp,
  Package,
  FileCheck2,
  ShieldCheck,
  ArrowLeft,
  ChevronDown,
  Truck,
  Download,
  CheckCircle2,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";

export default function VendorHubPage() {
  const [activeTab, setActiveTab] = useState<"landing" | "dashboard">("dashboard");
  const [monthlySalesEstimate, setMonthlySalesEstimate] = useState(150000);

  // Revenue calculator logic: 92% vendor payout, 8% sovereign platform fee
  const estimatedPayout = Math.round(monthlySalesEstimate * 0.92);
  const platformFee = Math.round(monthlySalesEstimate * 0.08);

  const vendorStats = {
    gmv: 485000,
    ordersCount: 38,
    pendingEscrow: 85200,
    availableBalance: 399800,
    activeListings: 19,
  };

  const pendingOrders = [
    { id: "SQ-94281", buyer: "صاحب السمو الأمير فهد آل سعود", item: "ساعة الصقر الكرونوغراف KSA-01", amount: 48500, status: "جاري التجهيز", carrier: "SPL Express" },
    { id: "SQ-94280", buyer: "معالي د. عبد الرحمن القحطاني", item: "دهن عود ملكي معتق ٦٠ عاماً", amount: 12500, status: "بانتظار الشحن", carrier: "SMSA Express" },
    { id: "SQ-94279", buyer: "سعادة الأستاذ محمد بن خالد", item: "خاتم نيوم من التيتانيوم الفضائي", amount: 15600, status: "بانتظار التأكيد", carrier: "SPL Express" },
  ];

  return (
    <TooltipProvider delayDuration={180}>
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <VendorNav />

      <VendorAuthGuard>
        <main className="flex-1">
        {/* Top View Toggle Banner */}
        <section className="bg-white border-b border-slate-200/80 py-4">
          <div className="max-w-[1400px] mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#006948] text-white flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-slate-900">
                    بوابة التجار واستوديو الحرفيين (Vendor B2B)
                  </h1>
                  <Badge variant="sovereign">دار الروضة للعطور • شريك بلاتيني</Badge>
                </div>
                <p className="text-xs text-slate-500">
                  السجل التجاري: 1010884920 • الربط الضريبي ZATCA Phase 2: نشط
                </p>
              </div>
            </div>

            {/* Toggle Between Dashboard and Seller Onboarding Landing */}
            <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-[#006948] text-white shadow-md shadow-[#006948]/20"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                لوحة عمليات المتجر
              </button>
              <button
                onClick={() => setActiveTab("landing")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "landing"
                    ? "bg-[#006948] text-white shadow-md shadow-[#006948]/20"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                مزايا وحاسبة عوائد التجار
              </button>
            </div>
          </div>
        </section>

        {activeTab === "dashboard" ? (
          /* Vendor Command Dashboard View */
          <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 space-y-8">
            {/* Quick Actions Navigation Strip */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="sovereign" size="sm" className="font-bold">
                  <Link href="/vendor/catalog/add" className="flex items-center gap-1.5">
                    <Package className="w-4 h-4" />
                    <span>إضافة منتج جديد للكتالوج</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="font-bold">
                  <Link href="/vendor/orders" className="flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    <span>إدارة الطلبات وبوالص الشحن</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="font-bold">
                  <Link href="/vendor/financials" className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>اللوحة المالية والتسويات</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="font-bold">
                  <Link href="/vendor/settings" className="flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-emerald-600" />
                    <span>إعدادات المتجر</span>
                  </Link>
                </Button>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 cursor-help">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span>محفظة الضمان المالي في ساما: نشطة</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  جميع التسويات المالية محمية تحت إشراف البنك المركزي السعودي وتفرج تلقائياً بعد التسليم
                </TooltipContent>
              </Tooltip>
            </div>

            {/* 4 KPIs Cards with Animated Counters */}
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StaggerItem>
                <AnimatedCard className="rounded-3xl">
                  <Card className="p-6 rounded-3xl border border-slate-200/80 bg-white">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-bold">إجمالي المبيعات (GMV)</span>
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-2xl font-black text-slate-900 block">
                      <AnimatedCounter value={vendorStats.gmv} formatter={formatSAR} />
                    </span>
                    <span className="text-[10px] text-emerald-700 block mt-1 font-bold">+١٨% مقارنة بالشهر السابق</span>
                  </Card>
                </AnimatedCard>
              </StaggerItem>

              <StaggerItem>
                <AnimatedCard className="rounded-3xl">
                  <Card className="p-6 rounded-3xl border border-slate-200/80 bg-white">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-bold">الرصيد المتاح للتحويل</span>
                      <DollarSign className="w-4 h-4 text-[#006948]" />
                    </div>
                    <span className="text-2xl font-black text-[#006948] block">
                      <AnimatedCounter value={vendorStats.availableBalance} formatter={formatSAR} />
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">تحويل فوري عبر نظام سريع</span>
                  </Card>
                </AnimatedCard>
              </StaggerItem>

              <StaggerItem>
                <AnimatedCard className="rounded-3xl">
                  <Card className="p-6 rounded-3xl border border-slate-200/80 bg-white">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-bold">مبالغ الضمان المعلقة (Escrow)</span>
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                    </div>
                    <span className="text-2xl font-black text-amber-600 block">
                      <AnimatedCounter value={vendorStats.pendingEscrow} formatter={formatSAR} />
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">تُفرج تلقائياً بعد استلام المقتني</span>
                  </Card>
                </AnimatedCard>
              </StaggerItem>

              <StaggerItem>
                <AnimatedCard className="rounded-3xl">
                  <Card className="p-6 rounded-3xl border border-slate-200/80 bg-white">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-bold">المنتجات النشطة بالكتالوج</span>
                      <Package className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-2xl font-black text-slate-900 block">
                      <AnimatedCounter value={vendorStats.activeListings} suffix=" قطعة" />
                    </span>
                    <span className="text-[10px] text-emerald-700 block mt-1 font-bold">جميعها موثقة في زاتكا</span>
                  </Card>
                </AnimatedCard>
              </StaggerItem>
            </StaggerContainer>

            {/* Pending Orders Queue Table */}
            <FadeIn className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">قائمة الطلبات الواردة بانتظار الشحن</h3>
                  <p className="text-xs text-slate-500">الطلبات المسددة عبر حساب الضمان ساما والجاهزة لإصدار البوالص.</p>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="sovereign" size="sm" className="font-bold text-xs gap-1.5 cursor-pointer">
                        <Truck className="w-3.5 h-3.5" />
                        <span>إجراءات الشحن الجماعي</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60 text-start">
                      <DropdownMenuLabel className="text-[11px]">عمليات لوجستية ومالية سريعة</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          notify.luxury(
                            "تم إصدار ٣ بوالص شحن SPL / SMSA مجمعة",
                            "جاهزة للطباعة وتسليم المندوب المعتمد."
                          )
                        }
                        className="gap-2 cursor-pointer"
                      >
                        <Truck className="w-4 h-4 text-[#006948]" />
                        <span>إصدار بوالص SPL & SMSA دفعة واحدة</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          notify.zatca(
                            "تم تصدير تقرير الفواتير والتسويات الضريبي",
                            "الملف مطابق لمتطلبات المرحلة الثانية من ZATCA."
                          )
                        }
                        className="gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-emerald-700" />
                        <span>تصدير كشف التسويات المالية (CSV)</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          notify.success("تم إرسال إشعارات التجهيز للمقتنين بنجاح")
                        }
                        className="gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>تحديث حالة كافة الطلبات إلى جاهز للشحن</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button asChild variant="outline" size="sm" className="font-bold">
                    <Link href="/vendor/orders">عرض كافة الطلبات ({pendingOrders.length})</Link>
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400">
                      <th className="py-3 px-4 font-bold">رقم الطلب</th>
                      <th className="py-3 px-4 font-bold">المقتني</th>
                      <th className="py-3 px-4 font-bold">القطعة الملكية</th>
                      <th className="py-3 px-4 font-bold">القيمة المودعة</th>
                      <th className="py-3 px-4 font-bold">الناقل اللوجستي</th>
                      <th className="py-3 px-4 font-bold">الحالة</th>
                      <th className="py-3 px-4 font-bold text-center">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-slate-900">{ord.id}</td>
                        <td className="py-4 px-4 font-medium text-slate-800">{ord.buyer}</td>
                        <td className="py-4 px-4 font-semibold text-slate-900">{ord.item}</td>
                        <td className="py-4 px-4 font-black text-[#006948]">{formatSAR(ord.amount)}</td>
                        <td className="py-4 px-4 text-slate-600 font-medium">{ord.carrier}</td>
                        <td className="py-4 px-4">
                          <Badge variant="sovereign">{ord.status}</Badge>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Button asChild variant="outline" size="sm" className="text-xs font-bold">
                            <Link href="/vendor/orders">طباعة البوليصة</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FadeIn>
          </section>
        ) : (
          /* Vendor Onboarding & Revenue Calculator Landing */
          <section className="max-w-[1200px] mx-auto px-4 lg:px-8 py-10 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="sovereign">شراكة سيادية للأعمال B2B</Badge>
              <h2 className="text-3xl font-black text-slate-900">
                انضم لأكبر منصة وطنية للتجارة السيادية والمقتنيات الفاخرة
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                اربط متجرك مع آلاف المقتنين والدبلوماسيين في المملكة والخليج، مع إدارة كاملة للفوترة ZATCA وحسابات الضمان المالي في ساما.
              </p>
            </div>

            {/* Interactive Revenue Calculator */}
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-xl max-w-3xl mx-auto space-y-8">
              <div className="text-center space-y-1">
                <span className="text-xs font-black text-emerald-800 uppercase">حاسبة العوائد والأرباح التقديرية</span>
                <h3 className="text-xl font-bold text-slate-900">كم تتوقع أن تبلغ مبيعاتك الشهرية؟</h3>
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-3">
                  <span className="text-xs font-bold text-slate-500">حجم المبيعات المستهدف:</span>
                  <span className="text-2xl font-black text-[#006948]">{formatSAR(monthlySalesEstimate)}</span>
                </div>
                <Slider
                  min={10000}
                  max={1000000}
                  step={10000}
                  value={[monthlySalesEstimate]}
                  onValueChange={(val) => setMonthlySalesEstimate(val[0])}
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                  <span>١٠,٠٠٠ ر.س</span>
                  <span>١,٠٠٠,٠٠٠ ر.س</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 block mb-1">صافي أرباحك المحولة لحسابك (92%):</span>
                  <span className="text-2xl font-black text-emerald-700">{formatSAR(estimatedPayout)}</span>
                  <span className="text-[10px] text-slate-400 block mt-1">إيداع أسبوعي تلقائي عبر نظام سريع</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-1">رسوم المنصة التشغيلية (8%):</span>
                  <span className="text-2xl font-black text-slate-700">{formatSAR(platformFee)}</span>
                  <span className="text-[10px] text-slate-400 block mt-1">تشمل التأمين، الفوترة زاتكا، والدفع ساما</span>
                </div>
              </div>

              <div className="text-center">
                <Button asChild variant="sovereign" size="lg" className="rounded-2xl font-bold text-sm">
                  <Link href="/vendor/register" className="flex items-center gap-2 justify-center">
                    <span>بدء معالج توثيق المنشأة (KYB 8 خطوات)</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>
      </VendorAuthGuard>

      {/* Dedicated Vendor Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white">شمال الحجاز • بوابة التجار B2B</span>
            <span>•</span>
            <span className="text-emerald-400">حساب موثق KYB عبر واثق</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/portals" className="text-slate-300 hover:text-white transition-colors">
              بوابات المنظومة
            </Link>
            <Link href="/" className="text-slate-300 hover:text-white transition-colors">
              واجهة المتجر
            </Link>
            <Link href="/vendor/settings" className="text-slate-300 hover:text-white transition-colors">
              إعدادات الحساب
            </Link>
          </div>
        </div>
      </footer>
    </div>
    </TooltipProvider>
  );
}
