"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShieldCheck, User, Store, Mail, KeyRound, Eye, EyeOff, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { signInWithCredentials, Role } from "@/lib/rbac";

type Tab = "client" | "vendor" | "admin";

/** Only allow same-site relative redirects (prevents open redirects). */
function safeRedirect(target: string | null): string | null {
  return target && target.startsWith("/") && !target.startsWith("//") ? target : null;
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roleParam = searchParams.get("role");
  const initialRole: Tab =
    roleParam === "vendor" || roleParam === "admin" || roleParam === "client" ? roleParam : "client";

  const [role, setRole] = useState<Tab>(initialRole);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const DEMO_ACCOUNTS = {
    admin: { email: "admin@souq.sa", pass: "Admin@123", name: "المشرف العام (Admin)" },
    vendor: { email: "vendor@souq.sa", pass: "Vendor@123", name: "تاجر B2B (Vendor)" },
    client: { email: "customer@souq.sa", pass: "Customer@123", name: "مشتري VIP (Customer)" },
  };

  const fillDemoAccount = (targetRole: Tab) => {
    const creds = DEMO_ACCOUNTS[targetRole];
    setRole(targetRole);
    setEmail(creds.email);
    setPassword(creds.pass);
    toast.info(`تم ملء بيانات ${creds.name} تلقائياً. انقر على "تسجيل الدخول".`);
  };

  const redirectParam = safeRedirect(searchParams.get("redirect"));
  const errorParam = searchParams.get("error");
  const mappedRole: Role = role === "client" ? "customer" : role;

  useEffect(() => {
    if (errorParam === "unauthorized" || errorParam === "forbidden") {
      toast.error(
        initialRole === "admin"
          ? "يلزم تسجيل الدخول بحساب مسؤول النظام (Admin) للوصول إلى لوحة الرقابة."
          : initialRole === "vendor"
          ? "يتطلب الوصول إلى بوابة الموردين تسجيل الدخول بحساب تاجر معتمد."
          : "يرجى تسجيل الدخول للمتابعة."
      );
    } else if (errorParam === "callback_failed") {
      toast.error("انتهت صلاحية رابط التأكيد أو أنه غير صالح. حاول تسجيل الدخول مجدداً.");
    }
  }, [errorParam, initialRole]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await signInWithCredentials(email, password, mappedRole);
      if (!result.success || !result.user) {
        toast.error(result.error || "بيانات الدخول غير صحيحة.");
        return;
      }
      toast.success(`مرحباً ${result.user.name ?? ""} — تم تسجيل الدخول بنجاح!`);
      router.push(redirectParam || result.redirectTo || "/account");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabClass = (active: boolean, dark = false) =>
    `flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
      active
        ? dark
          ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
          : "bg-[#006948] text-white shadow-md shadow-[#006948]/20"
        : "text-slate-600 hover:text-slate-900"
    }`;

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 sm:p-8 space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#006948] to-[#004d34] text-white flex items-center justify-center font-black text-xl shadow-lg mx-auto mb-3">
          ش
        </div>
        <Badge variant="sovereign" className="mb-2">
          بوابة الدخول الموحدة
        </Badge>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">تسجيل الدخول إلى شمال الحجاز</h1>
        <p className="text-xs text-slate-500 mt-1">
          سجّل الدخول بالبريد الإلكتروني وكلمة المرور. تُحدَّد صلاحياتك من حسابك.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
        <button type="button" onClick={() => setRole("client")} className={tabClass(role === "client")}>
          <User className="w-3.5 h-3.5" />
          <span>العميل</span>
        </button>
        <button type="button" onClick={() => setRole("vendor")} className={tabClass(role === "vendor")}>
          <Store className="w-3.5 h-3.5" />
          <span>التاجر B2B</span>
        </button>
        <button type="button" onClick={() => setRole("admin")} className={tabClass(role === "admin", true)}>
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>الإدارة</span>
        </button>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">البريد الإلكتروني</label>
          <div className="relative">
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              dir="ltr"
              className="text-start font-mono ps-9"
              required
            />
            <Mail className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">كلمة المرور</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              dir="ltr"
              className="text-start font-mono ps-9 pe-10"
              required
            />
            <KeyRound className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* حسابات تجريبية سريعة بنقرة واحدة */}
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
            <span className="flex items-center gap-1.5 text-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              تعبئة سريعة للحسابات التجريبية:
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => fillDemoAccount("admin")}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                role === "admin"
                  ? "border-slate-800 bg-slate-900 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              <div className="text-[10px]">المسؤول 👑</div>
              <div className="text-[9px] font-mono opacity-80 truncate">admin@souq.sa</div>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("vendor")}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                role === "vendor"
                  ? "border-[#006948] bg-[#006948] text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              <div className="text-[10px]">التاجر 🏬</div>
              <div className="text-[9px] font-mono opacity-80 truncate">vendor@souq.sa</div>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("client")}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                role === "client"
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              <div className="text-[10px]">المشتري 🛍️</div>
              <div className="text-[9px] font-mono opacity-80 truncate">customer@souq.sa</div>
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          variant={role === "admin" ? "default" : "sovereign"}
          size="lg"
          className={`w-full font-bold ${
            role === "admin" ? "bg-slate-900 hover:bg-slate-800 text-white h-11 rounded-2xl" : ""
          }`}
        >
          {isSubmitting ? "جارٍ التحقق..." : "تسجيل الدخول"}
        </Button>

        {role === "vendor" && (
          <div className="pt-1 text-center">
            <Link href="/vendor/register" className="text-xs font-bold text-emerald-700 hover:underline block">
              لست مسجلاً كتاجر معتمد بعد؟ ابدأ توثيق المنشأة KYB
            </Link>
          </div>
        )}
      </form>

      <div className="pt-2 text-center text-xs text-slate-500 flex items-center justify-between">
        <Link href="/auth/register" className="font-bold text-[#006948] hover:underline">
          إنشاء حساب جديد
        </Link>
        <Link href="/portals" className="font-bold text-slate-600 hover:text-slate-900">
          استعراض بوابات المنظومة ←
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <StorefrontHeader />
      <main className="flex-1 pt-32 lg:pt-36 flex items-center justify-center p-4">
        <Suspense
          fallback={
            <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400">
              جاري تجهيز بوابة الدخول...
            </div>
          }
        >
          <LoginFormContent />
        </Suspense>
      </main>
      <StorefrontFooter />
    </div>
  );
}
