"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  Package,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building,
  Truck,
  ArrowUpRight,
  FileCheck2,
  Scale,
  Sparkles,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";

export default function AdminExecutiveDashboardPage() {
  const kpiData = [
    {
      title: "إجمالي حجم التداول (GMV)",
      value: formatSAR(48920400),
      change: "+18.4% مقارنة بالشهر السابق",
      isPositive: true,
      icon: DollarSign,
      subtext: "شامل ضريبة القيمة المضافة 15%",
    },
    {
      title: "الطلبات المنفذة في المملكة",
      value: "12,840 طلب",
      change: "+12.1% نمو أسبوعي",
      isPositive: true,
      icon: Package,
      subtext: "متوسط قيمة الطلب: 3,810 ر.س",
    },
    {
      title: "المنشآت والحرفيين المعتمدين",
      value: "184 منشأة",
      change: "+9 منشآت هذا الأسبوع",
      isPositive: true,
      icon: Building,
      subtext: "موثقة بسجل تجاري وترخيص ZATCA",
    },
    {
      title: "ضريبة ZATCA المورّدة",
      value: formatSAR(7338060),
      change: "مطابقة 100% لفواتير المرحلة 2",
      isPositive: true,
      icon: ShieldCheck,
      subtext: "إشعار الامتثال الضريبي الصادر",
    },
  ];

  const regionalSales = [
    { region: "منطقة الرياض", share: "44%", gmv: "21,525,000 ر.س", color: "bg-emerald-600" },
    { region: "منطقة مكة المكرمة وجدة", share: "28%", gmv: "13,697,000 ر.س", color: "bg-[#006948]" },
    { region: "المنطقة الشرقية والخبر", share: "18%", gmv: "8,805,000 ر.س", color: "bg-teal-600" },
    { region: "القصيم، عسير، والمدن الأخرى", share: "10%", gmv: "4,893,400 ر.س", color: "bg-amber-600" },
  ];

  const pendingAlerts = [
    {
      title: "5 مقتنيات بانتظار فحص الجودة وتدقيق الكتالوج",
      desc: "منتجات من فئة الساعات الملكية والبشوت بحاجة لمطابقة شهادات الأصالة قبل النشر.",
      actionLabel: "طابور تدقيق المنتجات",
      href: "/admin/products",
      severity: "amber",
      icon: FileCheck2,
    },
    {
      title: "2 نزاع مفتوح للشحن والتسليم عبر سبل SPL",
      desc: "طلب تأكيد رمز التسليم السري (OTP) للتحكيم بين المقتني والناقل الوطني.",
      actionLabel: "فض النزاعات والعمليات",
      href: "/admin/orders",
      severity: "rose",
      icon: Scale,
    },
    {
      title: "3 ملفات توثيق منشأة تجارية (KYB) معلقة",
      desc: "تتطلب مطابقة بيانات السجل التجاري مع وزارة التجارة والآيبان البنكي (سويفت).",
      actionLabel: "خزينة توثيق التجار",
      href: "/admin/vendors",
      severity: "blue",
      icon: Building,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-l from-slate-950 via-slate-900 to-[#004d34] text-white p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
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

        <div className="absolute start-6 bottom-6 hidden sm:flex items-center gap-3">
          <div className="bg-slate-800/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/60 text-start">
            <span className="text-[10px] text-slate-400 block font-bold">زمن تشغيل المنظومة</span>
            <span className="text-xs font-mono font-bold text-emerald-400">99.98% Uptime</span>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpiData.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500">{kpi.title}</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006948] flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="text-2xl font-black text-slate-900 mb-1">{kpi.value}</div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-2">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{kpi.change}</span>
              </div>

              <span className="text-[10px] text-slate-400 block border-t border-slate-100 pt-2">
                {kpi.subtext}
              </span>
            </Card>
          );
        })}
      </div>

      {/* Operational Alerts & Moderation Priority */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            التنبيهات التشغيلية والمهام الرقابية العاجلة
          </h3>
          <span className="text-xs text-slate-500 font-medium">محدث تلقائياً</span>
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
                حجم السيولة وقيمة المشتريات المعتمدة بحسب المناطق والمحافظات الرئيسية.
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
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: item.share }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Gateways & Logistics Status */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-black text-slate-900 text-base mb-1">
              جاهزية البوابات والربط التقني
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              مراقبة الربط المباشر مع الشبكة السعودية للمدفوعات ونواقل الشحن.
            </p>

            <div className="space-y-3.5">
              {[
                { name: "مدى (Mada Network)", status: "نشط 100%", ping: "12ms" },
                { name: "Apple Pay (الخدمة المصرفية)", status: "نشط 100%", ping: "18ms" },
                { name: "تمارا وتابي (BNPL المعتمد)", status: "نشط 100%", ping: "22ms" },
                { name: "سبل البريد السعودي (SPL API)", status: "متصل لحظياً", ping: "45ms" },
                { name: "منظومة فاتورة ZATCA Phase-2", status: "مرخص ومتزامن", ping: "30ms" },
              ].map((gw, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-bold text-slate-800">{gw.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">{gw.ping}</span>
                    <span className="text-[11px] font-bold text-emerald-700">{gw.status}</span>
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
  );
}
