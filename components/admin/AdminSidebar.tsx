"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Truck,
  Building2,
  Users,
  FolderTree,
  Tag,
  Receipt,
  Settings,
  ExternalLink,
  ShieldCheck,
  LogOut,
} from "lucide-react";

export const adminNavItems = [
  {
    title: "لوحة القيادة والمؤشرات",
    href: "/admin",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "تدقيق واعتماد الكتالوج",
    href: "/admin/products",
    icon: CheckSquare,
    badge: "5 بانتظار الاعتماد",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  {
    title: "إدارة العمليات والنزاعات",
    href: "/admin/orders",
    icon: Truck,
    badge: "2 نزاع مفتوح",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  },
  {
    title: "خزينة توثيق التجار KYB",
    href: "/admin/vendors",
    icon: Building2,
    badge: "3 طلبات جديدة",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  {
    title: "سجل العملاء وإدارة الرصيد",
    href: "/admin/customers",
    icon: Users,
    badge: null,
  },
  {
    title: "هيكلة الأقسام والتصنيفات",
    href: "/admin/categories",
    icon: FolderTree,
    badge: null,
  },
  {
    title: "محرك العروض والكوبونات",
    href: "/admin/marketing",
    icon: Tag,
    badge: null,
  },
  {
    title: "التسويات وفواتير ZATCA",
    href: "/admin/finance",
    icon: Receipt,
    badge: null,
  },
  {
    title: "إعدادات النظام والصلاحيات",
    href: "/admin/settings",
    icon: Settings,
    badge: null,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-slate-950 text-slate-300 border-e border-slate-800 flex flex-col shrink-0 min-h-screen">
      {/* Brand & Crest Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-emerald-500/30 p-1.5 flex items-center justify-center shadow-lg shadow-emerald-950/40 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-mark.png"
              alt="شعار شمال الحجاز"
              className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(16,185,129,0.35)]"
            />
          </div>
          <div>
            <h2 className="font-black text-sm text-white tracking-wide">
              شمال الحجاز
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                الرقابة السيادية
              </span>
            </div>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
          v2.5
        </span>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
          الوحدات التشغيلية والرقابة
        </span>

        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                isActive
                  ? "bg-[#006948] text-white shadow-md shadow-emerald-950/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-400"
                  }`}
                />
                <span>{item.title}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono border ${
                    isActive ? "bg-white/20 text-white border-white/30" : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* External Shortcuts & Exit */}
      <div className="p-3 border-t border-slate-800 space-y-1">
        <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
          بوابات المنصة
        </span>

        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            واجهة متجر العملاء
          </span>
          <span className="text-[10px] text-slate-500">متجر B2C</span>
        </Link>

        <Link
          href="/vendor"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            بوابة التجار والحرفيين
          </span>
          <span className="text-[10px] text-slate-500">منظومة B2B</span>
        </Link>

        <Link
          href="/portals"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-emerald-400 hover:text-emerald-300 hover:bg-slate-900 transition-colors font-bold"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            فهرس البوابات المستقلة
          </span>
          <span className="text-[10px] text-emerald-500">Portals</span>
        </Link>

        <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between px-3.5 py-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              م
            </div>
            <div>
              <span className="block text-xs font-bold text-white">مشرف الرقابة</span>
              <span className="block text-[10px] text-emerald-400">Super Admin</span>
            </div>
          </div>
          <Link
            href="/auth/login"
            title="تسجيل الخروج"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

