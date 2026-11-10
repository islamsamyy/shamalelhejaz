"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Bell,
  ShieldCheck,
  Building,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { formatSAR } from "@/lib/utils";

export default function AdminHeader() {
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      toast.info(`جارِ البحث المركزي في سجلات المنصة عن: "${search}"`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      {/* Global Administrative Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
        <Search className="w-4 h-4 absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث سريع: رقم الطلب، السجل التجاري، SKU، أو هاتف العميل..."
          className="pe-10 rounded-2xl border-slate-200 text-xs h-10 bg-slate-50/70 focus:bg-white"
        />
      </form>

      {/* Regulatory Health & Status Pills */}
      <div className="flex items-center gap-3">
        {/* ZATCA Phase-2 Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>ZATCA Phase-2: متصل ومرخص</span>
        </div>

        {/* SAMA Escrow Balance Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 text-[11px] font-bold border border-amber-200">
          <Building className="w-3.5 h-3.5 text-amber-600" />
          <span>محفظة الضمان (SAMA): {formatSAR(2490000)}</span>
        </div>

        {/* Notifications */}
        <button
          onClick={() =>
            toast.info("مركز التنبيهات السيادية", {
              description: "تمت مراجعة آخر 14 عملية تسوية بنجاح، لا توجد بلاغات أمنية مفتوحة.",
            })
          }
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title="التنبيهات"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 start-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
        </button>

        {/* Portals Link */}
        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-bold h-9 bg-slate-50">
          <Link href="/portals">
            <span>بوابات المنظومة</span>
          </Link>
        </Button>

        {/* Back to Storefront Link */}
        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-bold h-9">
          <Link href="/" target="_blank" className="flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5 text-[#006948]" />
            <span className="hidden sm:inline">معاينة المتجر</span>
          </Link>
        </Button>

        {/* Admin Sign Out */}
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            const { signOutClient } = await import("@/lib/rbac");
            await signOutClient();
            toast.success("تم تسجيل خروج مسؤول النظام.");
            window.location.href = "/auth/login?role=admin";
          }}
          className="rounded-xl text-xs font-bold h-9 text-rose-600 border-rose-200 hover:bg-rose-50"
        >
          <span>تسجيل الخروج</span>
        </Button>
      </div>
    </header>
  );
}

