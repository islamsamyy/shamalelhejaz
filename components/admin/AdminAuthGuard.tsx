"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchClientRole } from "@/lib/rbac";
import { ShieldAlert, Lock, ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    fetchClientRole().then((role) => setIsAuthorized(role === "admin"));
  }, []);

  if (isAuthorized === null) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-semibold">جاري تدقيق الصلاحيات الرقابية...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-rose-200 shadow-xl p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 uppercase tracking-wider">
              صلاحية غير كافية • 403 Forbidden
            </span>
            <h2 className="text-xl font-black text-slate-900">
              الدخول مقصور على مسؤولي الرقابة والامتثال
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              هذه المنطقة السيادية محمية وتتطلب التحقق من عضوية الإدارة العامة والمشرفين المعتمدين عبر نفاذ أو الرقم الوظيفي.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <Button
              asChild
              variant="sovereign"
              size="lg"
              className="w-full rounded-2xl text-xs font-bold"
            >
              <Link href="/auth/login?role=admin&redirect=/admin" className="flex items-center justify-center gap-2">
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول كمسؤول نظام (Admin)</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full rounded-xl text-xs"
            >
              <Link href="/" className="flex items-center justify-center gap-2 text-slate-600">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>العودة إلى واجهة المتجر الرئيسية</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
