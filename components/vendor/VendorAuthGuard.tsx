"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchClientRole } from "@/lib/rbac";
import { Store, ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VendorAuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    fetchClientRole().then((role) => setIsAuthorized(role === "vendor" || role === "admin"));
  }, []);

  if (isAuthorized === null) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">جاري التحقق من صلاحيات التاجر المعتمد...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-emerald-200 shadow-xl p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#006948] border border-emerald-200 flex items-center justify-center mx-auto shadow-inner">
            <Store className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase tracking-wider">
              بوابة الموردين والتجار B2B
            </span>
            <h2 className="text-xl font-black text-slate-900">
              يتطلب الدخول حساب تاجر أو مورد معتمد
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              لإدارة متجرك، ومتابعة مبيعاتك وبوالص الشحن وفواتير زاتكا، يرجى تسجيل الدخول بحساب المنشأة أو تقديم طلب فتح متجر جديد.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <Button
              asChild
              variant="sovereign"
              size="lg"
              className="w-full rounded-2xl text-xs font-bold"
            >
              <Link href="/auth/login?role=vendor&redirect=/vendor" className="flex items-center justify-center gap-2">
                <LogIn className="w-4 h-4" />
                <span>تسجيل دخول التاجر المعتمد</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full rounded-xl text-xs font-bold"
            >
              <Link href="/vendor/register" className="flex items-center justify-center gap-2 text-emerald-800">
                <span>فتح متجر تجاري جديد (توثيق فوري عبر واثق)</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-full rounded-xl text-xs"
            >
              <Link href="/" className="flex items-center justify-center gap-2 text-slate-500">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>العودة للتسوق في المتجر</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
