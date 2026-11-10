"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  Package,
  Wallet,
  Settings,
  ExternalLink,
  ShieldCheck,
  Building,
  Star,
} from "lucide-react";

export default function VendorNav() {
  const pathname = usePathname();

  const links = [
    {
      label: "لوحة القيادة والمؤشرات",
      href: "/vendor",
      icon: LayoutDashboard,
      active: pathname === "/vendor",
    },
    {
      label: "استوديو المنتجات والمخزون",
      href: "/vendor/catalog",
      icon: Layers,
      active: pathname === "/vendor/catalog",
    },
    {
      label: "إضافة مقتنى جديد",
      href: "/vendor/catalog/add",
      icon: PlusCircle,
      active: pathname === "/vendor/catalog/add",
    },
    {
      label: "إدارة الطلبات وبوالص الشحن",
      href: "/vendor/orders",
      icon: Package,
      active: pathname === "/vendor/orders",
    },
    {
      label: "المستحقات ومحفظة الضمان",
      href: "/vendor/financials",
      icon: Wallet,
      active: pathname === "/vendor/financials",
    },
    {
      label: "إعدادات المتجر والتوصيل",
      href: "/vendor/settings",
      icon: Settings,
      active: pathname === "/vendor/settings",
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      {/* Top Vendor Status Ribbon */}
      <div className="bg-slate-900 text-white px-4 lg:px-8 py-2.5">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">دار الصائغ الملكية للمقتنيات</span>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                  <ShieldCheck className="w-3 h-3 ms-1" />
                  منشأة موثقة KYB
                </Badge>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">سجل تجاري: 1010482910 | الرياض</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden lg:flex items-center gap-1.5 text-amber-300 font-medium bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              <Star className="w-3.5 h-3.5 fill-amber-300" />
              <span>تقييم المتجر: 4.9 / 5.0 (342 مراجعة)</span>
            </div>

            <Button asChild variant="outline" size="sm" className="bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700 text-xs rounded-xl h-8">
              <Link href="/portals" className="flex items-center gap-1">
                <span>بوابات المنظومة</span>
              </Link>
            </Button>

            <Button asChild variant="outline" size="sm" className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700 text-xs rounded-xl h-8">
              <Link href="/" className="flex items-center gap-1.5">
                <span>المتجر العام</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const { clearClientRole } = require("@/lib/rbac");
                clearClientRole();
                window.location.href = "/auth/login?role=vendor";
              }}
              className="bg-slate-800 text-rose-300 border-rose-900/40 hover:bg-rose-950/30 text-xs rounded-xl h-8"
            >
              <span>تسجيل الخروج</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Vendor Tabs Bar */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-2 py-2">
          <div className="flex items-center gap-1 shrink-0">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    link.active
                      ? "bg-[#006948] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="shrink-0 hidden md:block">
            <Button asChild variant="sovereign" size="sm" className="rounded-xl font-bold text-xs h-8">
              <Link href="/vendor/catalog/add" className="flex items-center gap-1.5">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>إدراج منتج جديد</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

