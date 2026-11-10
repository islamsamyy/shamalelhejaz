"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  User,
  Store,
  ShieldCheck,
  ShoppingBag,
  Package,
  Layers,
  Building,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  BarChart3,
  Lock,
  Wallet,
  Receipt,
  FileCheck2,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";
import { formatSAR } from "@/lib/utils";

export default function PortalsHubPage() {
  const portals = [
    {
      id: "client",
      title: "بوابة المقتني والعميل",
      subtitle: "ديوان الفخامة وتجربة التسوق السيادية B2C",
      badge: "Customer & VIP Diwan",
      badgeVariant: "sovereign" as const,
      color: "from-emerald-950 via-slate-900 to-slate-950",
      accent: "text-emerald-400",
      icon: User,
      description:
        "المنصة الشخصية للمقتني للوصول إلى المقتنيات الملكية النادرة، متابعة الطلبات المشحونة عبر سبل، إدارة المحفظة السيادية، والمزادات المغلقة.",
      stats: [
        { label: "رصيد المحفظة التجريبي", value: formatSAR(124500) },
        { label: "مقتنيات موثقة بالشهادة", value: "100%" },
        { label: "زمن التوصيل VIP", value: "ساعتان" },
      ],
      primaryRoute: "/account",
      primaryLabel: "الدخول إلى ديوان العميل",
      secondaryRoute: "/auth/login?role=client",
      secondaryLabel: "تسجيل دخول مقتني",
      routes: [
        { name: "ديوان العميل (نظرة عامة)", path: "/account" },
        { name: "سجل الطلبات والشحنات", path: "/account?tab=orders" },
        { name: "تتبع الشحنة المباشر", path: "/orders/SQ-94281/tracking" },
        { name: "ديوان المقتنيات المفضلة", path: "/wishlist" },
        { name: "سلة المقتنيات والحقيبة", path: "/cart" },
        { name: "المتجر والكتالوج العام", path: "/catalog" },
      ],
    },
    {
      id: "vendor",
      title: "بوابة التجار واستوديو الحرفيين",
      subtitle: "بيئة تشغيل المنشآت وشبكة الأعمال B2B",
      badge: "Vendor Workspace B2B",
      badgeVariant: "gold" as const,
      color: "from-[#004d34] via-emerald-950 to-slate-950",
      accent: "text-amber-400",
      icon: Store,
      description:
        "لوحة تشغيل البائع المستقلة: إدارة الكتالوج والمخزون، توليد بوالص شحن SMSA و SPL، سحب المستحقات الفوري من حساب ضمان ساما، وفواتير ZATCA Phase-2.",
      stats: [
        { label: "المبيعات الشهرية (دار الروضة)", value: formatSAR(485000) },
        { label: "ضمان ساما المعلق", value: formatSAR(85200) },
        { label: "عمولة المنصة السيادية", value: "8% فقط" },
      ],
      primaryRoute: "/vendor",
      primaryLabel: "الدخول إلى لوحة التاجر",
      secondaryRoute: "/auth/login?role=vendor",
      secondaryLabel: "تسجيل دخول تاجر",
      routes: [
        { name: "لوحة القيادة والمؤشرات", path: "/vendor" },
        { name: "استوديو المنتجات والمخزون", path: "/vendor/catalog" },
        { name: "إدراج منتج جديد للكتالوج", path: "/vendor/catalog/add" },
        { name: "إدارة الطلبات والشحن", path: "/vendor/orders" },
        { name: "اللوحة المالية والتسويات", path: "/vendor/financials" },
        { name: "إعدادات المتجر وهوية العلامة", path: "/vendor/settings" },
        { name: "معالج توثيق المنشأة (KYB)", path: "/vendor/register" },
      ],
    },
    {
      id: "admin",
      title: "مركز الرقابة السيادية والإدارة المركزية",
      subtitle: "غرفة القيادة التنفيذية ومراقبة الامتثال الوطني",
      badge: "Enterprise Sovereign Center",
      badgeVariant: "outline" as const,
      color: "from-slate-950 via-slate-900 to-emerald-950",
      accent: "text-emerald-300",
      icon: ShieldCheck,
      description:
        "مركز الرقابة العليا الشامل: تدقيق واعتماد مقتنيات الكتالوج، فض النزاعات، توثيق سجلات المنشآت KYB عبر واثق، تسويات الزكاة ZATCA، وضبط صلاحيات RBAC.",
      stats: [
        { label: "إجمالي حجم التداول GMV", value: formatSAR(12480000) },
        { label: "محفظة ضمان ساما المشروطة", value: formatSAR(2490000) },
        { label: "الربط الضريبي ZATCA", value: "مرخص 100%" },
      ],
      primaryRoute: "/admin",
      primaryLabel: "الدخول إلى مركز الرقابة",
      secondaryRoute: "/auth/login?role=admin",
      secondaryLabel: "تسجيل دخول إداري",
      routes: [
        { name: "لوحة القيادة التنفيذية (GMV)", path: "/admin" },
        { name: "طابور تدقيق واعتماد الكتالوج", path: "/admin/products" },
        { name: "إدارة العمليات وفض النزاعات", path: "/admin/orders" },
        { name: "خزينة توثيق المنشآت KYB", path: "/admin/vendors" },
        { name: "سجل العملاء وإدارة المحافظ", path: "/admin/customers" },
        { name: "هندسة الأقسام والتصنيفات", path: "/admin/categories" },
        { name: "محرك العروض والكوبونات", path: "/admin/marketing" },
        { name: "التسويات وفواتير ZATCA Phase-2", path: "/admin/finance" },
        { name: "إعدادات المنظومة وصلاحيات RBAC", path: "/admin/settings" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b1315] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Sovereign Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#006948] via-[#005a3e] to-[#004d34] flex items-center justify-center text-white shadow-lg shadow-[#006948]/20 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[26px]">account_balance</span>
            </div>
            <div className="flex flex-col text-start">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                  شمال الحجاز
                </span>
                <Badge variant="sovereign" className="text-[10px] px-2 py-0">
                  مجمع البوابات المستقلة
                </Badge>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wide">
                شمال الحجاز • البوابات ولوحات التحكم المستقلة
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-xs font-bold"
            >
              <Link href="/" className="flex items-center gap-1.5">
                <span>العودة إلى المتجر الرئيسي</span>
                <ChevronLeft className="w-4 h-4 text-emerald-400" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Portals Showcase Hero */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 lg:px-8 py-10 lg:py-14 space-y-12">
        {/* Intro Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            منظومة التحكم الثلاثية المستقلة
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            اختر بوابتك المعتمدة في منصة شمال الحجاز
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            تم فصل لوحات التحكم إلى بيئات تشغيل مستقلة بالكامل لضمان سرية البيانات وخصوصية العمليات
            بين المقتنين الكرام، والشركاء التجاريين، وفريق الرقابة السيادية.
          </p>
        </div>

        {/* 3 Sovereign Portals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-7 flex flex-col justify-between hover:border-emerald-500/40 transition-all hover:shadow-2xl hover:shadow-emerald-950/30 group"
              >
                <div className="space-y-6">
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#006948] to-slate-900 border border-emerald-500/30 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                      <Icon className="w-7 h-7 text-emerald-400" />
                    </div>
                    <Badge variant={portal.badgeVariant} className="text-[11px] px-3 py-1 font-bold">
                      {portal.badge}
                    </Badge>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h2 className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">
                      {portal.title}
                    </h2>
                    <p className="text-xs text-emerald-400/80 font-bold mt-1">
                      {portal.subtitle}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed mt-3">
                      {portal.description}
                    </p>
                  </div>

                  {/* 3 Mini KPIs */}
                  <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
                    {portal.stats.map((st, i) => (
                      <div key={i} className="flex flex-col">
                        <span className="text-[10px] text-slate-400 truncate font-medium">
                          {st.label}
                        </span>
                        <span className="text-xs font-bold text-white mt-0.5 truncate">
                          {st.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Direct Route Links List */}
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[11px] font-bold text-slate-400 px-1">الشاشات والمسارات التابعة:</p>
                    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pe-1">
                      {portal.routes.map((r) => (
                        <Link
                          key={r.path}
                          href={r.path}
                          className="flex items-center justify-between p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 transition-colors"
                        >
                          <span className="truncate">{r.name}</span>
                          <span className="text-[10px] text-slate-500 group-hover:text-emerald-400 shrink-0 ms-2">
                            ←
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-6 border-t border-slate-800/80 mt-6 space-y-2.5">
                  <Button
                    asChild
                    variant="sovereign"
                    size="lg"
                    className="w-full font-bold text-xs h-11 rounded-2xl shadow-lg shadow-emerald-950/40"
                  >
                    <Link href={portal.primaryRoute} className="flex items-center justify-center gap-2">
                      <span>{portal.primaryLabel}</span>
                      <ArrowLeft className="w-4 h-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs rounded-xl h-9"
                  >
                    <Link href={portal.secondaryRoute} className="flex items-center justify-center gap-1.5">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>{portal.secondaryLabel}</span>
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Regulatory Governance & Compliance Strip */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">الربط الرقابي المعتمد والامتثال السيادي</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                جميع البوابات الثلاث مرتبطة بآليات التشفير الوطنية: نفاذ الوطني الموحد، هيئة الزكاة والضريبة والجمارك (ZATCA)، ومنصة واثق للتحقق من السجلات التجارية.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Badge variant="outline" className="text-xs bg-slate-900 border-slate-700 text-slate-300 py-1.5 px-3">
              نفاذ SSO
            </Badge>
            <Badge variant="outline" className="text-xs bg-slate-900 border-slate-700 text-slate-300 py-1.5 px-3">
              ZATCA Phase-2
            </Badge>
            <Badge variant="outline" className="text-xs bg-slate-900 border-slate-700 text-slate-300 py-1.5 px-3">
              حساب ضمان ساما
            </Badge>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>شمال الحجاز © {new Date().getFullYear()} • المنصة المعتمدة للمتاجر والموردين</p>
      </footer>
    </div>
  );
}

