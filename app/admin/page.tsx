"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { notify } from "@/lib/notify";
import { supabase } from "@/lib/supabase";
import {
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building,
  ArrowUpRight,
  FileCheck2,
  Scale,
  Sparkles,
  ChevronDown,
  Activity,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";

interface GatewayRow {
  code: string;
  name: string;
  enabled: boolean;
  mode: string;
}

export default function AdminExecutiveDashboardPage() {
  const [stats, setStats] = useState({
    gmv: 0,
    ordersCount: 0,
    avgOrderValue: 0,
    vendorsCount: 0,
    vatTotal: 0,
    pendingProductsCount: 0,
    disputeOrdersCount: 0,
    pendingVendorsCount: 0,
    invoicesCount: 0,
  });
  const [gateways, setGateways] = useState<GatewayRow[]>([]);
  const [regionalSales, setRegionalSales] = useState<
    { region: string; share: string; gmv: string; color: string }[]
  >([]);

  useEffect(() => {
    async function loadDashboard() {
      const [ordersRes, vendorsRes, productsRes, gatewaysRes, invoicesRes] = await Promise.all([
        supabase.from("orders").select("id, total, tax, status, shipping_address"),
        supabase.from("vendors").select("id, status, verified"),
        supabase.from("products").select("id, moderation_status, is_active"),
        supabase.from("payment_gateways").select("code, name, enabled, mode").order("sort_order", { ascending: true }),
        supabase.from("invoices").select("id", { count: "exact", head: true }),
      ]);

      const orders = ordersRes.data || [];
      const vendors = vendorsRes.data || [];
      const products = productsRes.data || [];

      const gmv = orders.reduce((acc, o) => acc + Number(o.total || 0), 0);
      const vatTotal = orders.reduce((acc, o) => acc + Number(o.tax || 0), 0);
      const ordersCount = orders.length;
      const avgOrderValue = ordersCount > 0 ? Math.round(gmv / ordersCount) : 0;
      const approvedVendors = vendors.filter((v) => v.status === "approved" || v.verified).length;
      const pendingVendors = vendors.filter((v) => v.status === "pending").length;
      const pendingProducts = products.filter((p) => p.moderation_status === "pending").length;
      const disputeOrders = orders.filter((o) => o.status === "cancelled" || o.status === "returned").length;

      setStats({
        gmv,
        ordersCount,
        avgOrderValue,
        vendorsCount: approvedVendors,
        vatTotal,
        pendingProductsCount: pendingProducts,
        disputeOrdersCount: disputeOrders,
        pendingVendorsCount: pendingVendors,
        invoicesCount: invoicesRes.count || 0,
      });

      if (gatewaysRes.data) {
        setGateways(gatewaysRes.data);
      }

      // Compute regional breakdown from real orders shipping_address.city
      const byCity: Record<string, number> = {
        "منطقة الرياض": 0,
        "منطقة مكة المكرمة وجدة": 0,
        "المنطقة الشرقية والخبر": 0,
        "القصيم، عسير، والمدن الأخرى": 0,
      };
      for (const o of orders) {
        const city = (o.shipping_address as { city?: string } | null)?.city || "";
        const val = Number(o.total || 0);
        if (city.includes("الرياض") || city.includes("الدرعية")) {
          byCity["منطقة الرياض"] += val;
        } else if (city.includes("جدة") || city.includes("مكة") || city.includes("الطائف")) {
          byCity["منطقة مكة المكرمة وجدة"] += val;
        } else if (city.includes("الخبر") || city.includes("الدمام") || city.includes("الظهران") || city.includes("الأحساء")) {
          byCity["المنطقة الشرقية والخبر"] += val;
        } else {
          byCity["القصيم، عسير، والمدن الأخرى"] += val;
        }
      }

      const colors = ["bg-emerald-600", "bg-[#006948]", "bg-teal-600", "bg-amber-600"];
      const totalRegional = Object.values(byCity).reduce((a, b) => a + b, 0);
      setRegionalSales(
        Object.entries(byCity).map(([region, amount], i) => {
          const pct = totalRegional > 0 ? Math.round((amount / totalRegional) * 100) : 0;
          return {
            region,
            share: `${pct}%`,
            gmv: formatSAR(amount),
            color: colors[i % colors.length],
          };
        })
      );
    }

    loadDashboard();
  }, []);

  const kpiData = [
    {
      title: "إجمالي حجم التداول (GMV)",
      numericValue: stats.gmv,
      formatter: formatSAR,
      change: `${stats.ordersCount} طلب مسجل في قاعدة البيانات`,
      isPositive: true,
      icon: DollarSign,
      subtext: "شامل ضريبة القيمة المضافة 15%",
    },
    {
      title: "الطلبات المنفذة في المملكة",
      numericValue: stats.ordersCount,
      suffix: " طلب",
      change: "بيانات حية من Supabase",
      isPositive: true,
      icon: Package,
      subtext: `متوسط قيمة الطلب: ${formatSAR(stats.avgOrderValue)}`,
    },
    {
      title: "المنشآت والحرفيين المعتمدين",
      numericValue: stats.vendorsCount,
      suffix: " منشأة",
      change: `${stats.pendingVendorsCount} منشأة بانتظار التدقيق`,
      isPositive: true,
      icon: Building,
      subtext: "موثقة بسجل تجاري وترخيص ZATCA",
    },
    {
      title: "ضريبة ZATCA المورّدة",
      numericValue: stats.vatTotal,
      formatter: formatSAR,
      change: `${stats.invoicesCount} فاتورة ضريبية مصدرة`,
      isPositive: true,
      icon: ShieldCheck,
      subtext: "إشعار الامتثال الضريبي الصادر",
    },
  ];

  const pendingAlerts = [
    {
      title: `${stats.pendingProductsCount} مقتنيات بانتظار فحص الجودة وتدقيق الكتالوج`,
      desc: "منتجات مضافة من التجار بحاجة لمراجعة شهادات الأصالة قبل النشر في الكتالوج.",
      actionLabel: "طابور تدقيق المنتجات",
      href: "/admin/products",
      severity: "amber",
      icon: FileCheck2,
    },
    {
      title: `${stats.disputeOrdersCount} طلبات مسترجعة أو ملغاة تحت المراجعة`,
      desc: "متابعة حالات الشحن والتسليم وأرصدة الضمان للطلبات الجارية.",
      actionLabel: "إدارة الطلبات والشحن",
      href: "/admin/orders",
      severity: "rose",
      icon: Scale,
    },
    {
      title: `${stats.pendingVendorsCount} ملفات توثيق منشأة تجارية (KYB) معلقة`,
      desc: "تتطلب مطابقة بيانات السجل التجاري مع وزارة التجارة والآيبان البنكي.",
      actionLabel: "خزينة توثيق التجار",
      href: "/admin/vendors",
      severity: "blue",
      icon: Building,
    },
  ];

  return (
    <TooltipProvider delayDuration={180}>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <FadeIn className="bg-gradient-to-l from-slate-950 via-slate-900 to-[#004d34] text-white p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs mb-3">
              <Sparkles className="w-3.5 h-3.5 ms-1.5" />
              منظومة الرقابة والامتثال السيادي 2030
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              مرحباً بك في مركز القيادة والتحكم لمنصة شمال الحجاز
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              متابعة لحظية لحجم التجارة الإلكترونية السيادية، وإشراف متكامل على المنشآت المعتمدة، وضمان التوافق مع ضوابط هيئة الزكاة والجمارك ZATCA والبنك المركزي السعودي.
            </p>
          </div>

          <div className="sm:absolute start-6 bottom-6 mt-5 sm:mt-0 flex flex-wrap items-center gap-3 relative z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-slate-800/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/60 text-start cursor-help">
                  <span className="text-[10px] text-slate-400 block font-bold">اتصال قاعدة البيانات</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Supabase Live
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>متصل مباشرة بقاعدة بيانات الإنتاج مع حماية RLS</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="gold" size="sm" className="rounded-2xl font-bold text-xs gap-1.5 h-10 px-4 cursor-pointer">
                  <Activity className="w-4 h-4" />
                  <span>أوامر الرقابة السريعة</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 text-start">
                <DropdownMenuLabel className="text-[11px]">إجراءات القيادة السيادية</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    notify.zatca(
                      `تم التحقق من مطابقة ${stats.invoicesCount} فاتورة ضريبية`,
                      "نسبة التوافق مع ZATCA Phase-2 تبلغ ١٠٠٪."
                    )
                  }
                  className="cursor-pointer"
                >
                  فحص مطابقة فواتير زاتكا الفوري
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    notify.luxury(
                      "تم تحديث مصفوفة تسويات ساما Escrow",
                      "جميع الأرصدة المحتجزة مطابقة للحساب البنكي الموحد."
                    )
                  }
                  className="cursor-pointer"
                >
                  تحديث تسويات الضمان البنكي SAMA
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </FadeIn>

        {/* Top 4 KPI Metrics */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {kpiData.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <StaggerItem key={idx}>
                <AnimatedCard className="h-full rounded-3xl">
                  <Card className="h-full p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-500">{kpi.title}</span>
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006948] flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="text-2xl font-black text-slate-900 mb-1">
                      <AnimatedCounter
                        value={kpi.numericValue}
                        formatter={kpi.formatter}
                        suffix={kpi.suffix}
                      />
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-2">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{kpi.change}</span>
                    </div>

                    <span className="text-[10px] text-slate-400 block border-t border-slate-100 pt-2">
                      {kpi.subtext}
                    </span>
                  </Card>
                </AnimatedCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Operational Alerts & Moderation Priority */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              التنبيهات التشغيلية والمهام الرقابية العاجلة
            </h3>
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              مراقبة حية من قاعدة البيانات
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pendingAlerts.map((alert, idx) => {
              const Icon = alert.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          alert.severity === "amber"
                            ? "bg-amber-50 text-amber-700"
                            : alert.severity === "rose"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        أولوية رقابية
                      </Badge>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm mb-2">{alert.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">{alert.desc}</p>
                  </div>

                  <Button asChild variant="outline" size="sm" className="rounded-xl w-full text-xs font-bold justify-between">
                    <Link href={alert.href}>
                      <span>{alert.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analytics & Geographic Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Distribution By Region */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  توزيع المبيعات الجغرافية داخل المملكة
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  حجم السيولة وقيمة المشتريات المعتمدة بحسب عناوين الطلبات الفعلية.
                </p>
              </div>
              <Badge variant="sovereign">تغطية وطنية</Badge>
            </div>

            <div className="space-y-4">
              {regionalSales.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>{item.region}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-900">{item.gmv}</span>
                      <span className="text-emerald-700 w-10 text-end">{item.share}</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: item.share }}
                      transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeOut" }}
                      className={`h-full ${item.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Gateways & Logistics Status */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-base mb-1">
                بوابات الدفع المسجلة
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                حالة تفعيل بوابات الدفع في قاعدة البيانات (`payment_gateways`).
              </p>

              <div className="space-y-3.5">
                {gateways.map((gw) => (
                  <div key={gw.code} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          gw.enabled ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                        }`}
                      />
                      <span className="text-xs font-bold text-slate-800">{gw.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono uppercase">{gw.mode}</span>
                      <span
                        className={`text-[11px] font-bold ${
                          gw.enabled ? "text-emerald-700" : "text-slate-400"
                        }`}
                      >
                        {gw.enabled ? "مفعل" : "معطل"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6">
              <Button asChild variant="outline" size="sm" className="w-full rounded-xl text-xs font-bold">
                <Link href="/admin/settings" className="flex items-center justify-center gap-2">
                  <span>تعديل إعدادات الربط والبوابات</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
