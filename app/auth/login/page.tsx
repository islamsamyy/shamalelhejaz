"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  User,
  Store,
  Mail,
  KeyRound,
  Copy,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import MotionWrapper from "@/components/ui/motion-wrapper";
import {
  setClientRole,
  setClientUser,
  authenticateWithCredentials,
  TEST_ACCOUNTS,
  Role,
} from "@/lib/rbac";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Role: client | vendor | admin derived from initial query param or state
  const roleParam = searchParams.get("role");
  const initialRole: "client" | "vendor" | "admin" =
    roleParam === "vendor" || roleParam === "admin" || roleParam === "client"
      ? roleParam
      : "client";

  const [role, setRole] = useState<"client" | "vendor" | "admin">(initialRole);
  const [clientAuthMode, setClientAuthMode] = useState<"email" | "otp">("email");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unified Email & Password states
  const [email, setEmail] = useState(TEST_ACCOUNTS.customer.email);
  const [password, setPassword] = useState(TEST_ACCOUNTS.customer.password);

  // Client OTP form states
  const [phone, setPhone] = useState("0501234567");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");

  const redirectParam = searchParams.get("redirect");
  const errorParam = searchParams.get("error");

  const mappedRole: Role = role === "client" ? "customer" : role;
  const activeTestAccount = TEST_ACCOUNTS[mappedRole];

  // Auto-populate default credentials when switching role tabs
  const handleSelectRole = (nextRole: "client" | "vendor" | "admin") => {
    setRole(nextRole);
    const targetRole: Role = nextRole === "client" ? "customer" : nextRole;
    setEmail(TEST_ACCOUNTS[targetRole].email);
    setPassword(TEST_ACCOUNTS[targetRole].password);
    setStep("phone");
  };

  useEffect(() => {
    const targetRole: Role = initialRole === "client" ? "customer" : initialRole;
    setEmail(TEST_ACCOUNTS[targetRole].email);
    setPassword(TEST_ACCOUNTS[targetRole].password);
  }, [initialRole]);

  useEffect(() => {
    if (errorParam === "unauthorized") {
      if (initialRole === "admin") {
        toast.error(
          "تنبيه أمني: يلزم تسجيل الدخول بصلاحيات مسؤول النظام (Admin) للوصول إلى لوحة الرقابة."
        );
      } else if (initialRole === "vendor") {
        toast.error(
          "تنبيه: يتطلب الوصول إلى بوابة الموردين B2B تسجيل الدخول بحساب تاجر معتمد."
        );
      }
    }
  }, [errorParam, initialRole]);

  // Unified Email + Password Login Handler for all 3 roles
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await authenticateWithCredentials(email, password, mappedRole);
      if (!result.success || !result.user) {
        toast.error(result.error || "بيانات الدخول غير صحيحة.");
        return;
      }

      if (result.user.role === "admin") {
        toast.success(`مرحباً ${result.user.name} — تم تأكيد الصلاحيات الرقابية السيادية!`);
      } else if (result.user.role === "vendor") {
        toast.success(`مرحباً ${result.user.name} — تم الدخول إلى بوابة الموردين B2B!`);
      } else {
        toast.success(`مرحباً ${result.user.name} — تم تسجيل الدخول بنجاح!`);
      }

      router.push(redirectParam || result.redirectTo || "/account");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Client OTP handling
  const handleClientSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 9) {
      toast.error("يرجى إدخال رقم جوال سعودي صحيح.");
      return;
    }
    setStep("otp");
    toast.info("تم إرسال رمز التحقق OTP إلى جوالك (الرمز التجريبي: 1234)");
  };

  const handleClientVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === "1234" || otp.length === 4) {
      setClientRole("customer");
      setClientUser({
        id: TEST_ACCOUNTS.customer.id,
        email: TEST_ACCOUNTS.customer.email,
        name: TEST_ACCOUNTS.customer.name,
        role: "customer",
      });
      toast.success("تم تسجيل الدخول بنجاح! جارِ التوجيه إلى ديوان العميل...");
      router.push(redirectParam || "/account");
    } else {
      toast.error("رمز التحقق التجريبي هو: 1234");
    }
  };

  const handleNafathLogin = () => {
    toast.info("جاري التحويل إلى بوابة نفاذ الوطني الموحد...");
    setTimeout(() => {
      setClientRole("customer");
      setClientUser({
        id: TEST_ACCOUNTS.customer.id,
        email: TEST_ACCOUNTS.customer.email,
        name: TEST_ACCOUNTS.customer.name,
        role: "customer",
      });
      toast.success("تم توثيق الدخول عبر نفاذ بنجاح!");
      router.push(redirectParam || "/account");
    }, 900);
  };

  const fillDemoAccount = () => {
    setEmail(activeTestAccount.email);
    setPassword(activeTestAccount.password);
    toast.info(`تم تعبئة بيانات حساب (${activeTestAccount.name}) التجريبي`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-lg mx-auto"
    >
    <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 sm:p-8 space-y-6">
      {/* Brand & Crest Header */}
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#006948] to-[#004d34] text-white flex items-center justify-center font-black text-xl shadow-lg mx-auto mb-3">
          ش
        </div>
        <Badge variant="sovereign" className="mb-2">
          بوابة الدخول الموحدة (RBAC)
        </Badge>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          تسجيل الدخول إلى شمال الحجاز
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          حدد صفتك وسجّل الدخول بالبريد الإلكتروني وكلمة المرور المخصصة لكل صلاحية.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
        <button
          type="button"
          onClick={() => handleSelectRole("client")}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            role === "client"
              ? "bg-[#006948] text-white shadow-md shadow-[#006948]/20"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>المقتني VIP</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectRole("vendor")}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            role === "vendor"
              ? "bg-[#006948] text-white shadow-md shadow-[#006948]/20"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>التاجر B2B</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectRole("admin")}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all cursor-pointer ${
            role === "admin"
              ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>الرقابة الإدارية</span>
        </button>
      </div>

      {/* Active Role Test Credentials Box */}
      <div className="rounded-2xl bg-slate-50 border border-slate-200/90 p-3.5 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-black text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            بيانات الحساب التجريبي ({role === "client" ? "عميل Customer" : role === "vendor" ? "تاجر Vendor" : "مدير Admin"}):
          </span>
          <button
            type="button"
            onClick={fillDemoAccount}
            className="text-[11px] font-bold text-[#006948] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Copy className="w-3 h-3" />
            تعبئة تلقائية
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]" dir="ltr">
          <div className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-slate-400 block text-[10px]">Email:</span>
            <strong className="text-slate-900 select-all">{activeTestAccount.email}</strong>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5">
            <span className="text-slate-400 block text-[10px]">Password:</span>
            <strong className="text-slate-900 select-all">{activeTestAccount.password}</strong>
          </div>
        </div>
      </div>

      {/* Optional mode toggle for Customer (Email/Password vs OTP) */}
      {role === "client" && (
        <div className="flex items-center justify-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setClientAuthMode("email")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              clientAuthMode === "email"
                ? "bg-emerald-100 text-emerald-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            البريد الإلكتروني وكلمة المرور
          </button>
          <button
            type="button"
            onClick={() => setClientAuthMode("otp")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              clientAuthMode === "otp"
                ? "bg-emerald-100 text-emerald-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            الجوال السريع (OTP / نفاذ)
          </button>
        </div>
      )}

      {/* Email & Password Login Form (Default for all 3 roles) */}
      {(role !== "client" || clientAuthMode === "email") && (
        <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {role === "vendor"
                ? "البريد الإلكتروني للتاجر (أو رقم السجل التجاري)"
                : role === "admin"
                ? "البريد الإلكتروني للمشرف (أو الرقم الوظيفي)"
                : "البريد الإلكتروني للعميل"}
            </label>
            <div className="relative">
              <Input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={activeTestAccount.email}
                dir="ltr"
                className="text-start font-mono ps-9"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              كلمة المرور (Password)
            </label>
            <div className="relative">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="text-start font-mono ps-9"
                required
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
            {role === "admin"
              ? "دخول المشرف إلى مركز الرقابة السيادية (Admin Center)"
              : role === "vendor"
              ? "دخول التاجر إلى استوديو العمليات (Vendor Hub)"
              : "تسجيل الدخول والانتقال لديوان العميل"}
          </Button>

          {role === "vendor" && (
            <div className="pt-1 text-center">
              <Link
                href="/vendor/register"
                className="text-xs font-bold text-emerald-700 hover:underline block"
              >
                لست مسجلاً كتاجر معتمد بعد؟ ابدأ توثيق المنشأة KYB
              </Link>
            </div>
          )}
        </form>
      )}

      {/* Customer OTP Alternative Flow */}
      {role === "client" && clientAuthMode === "otp" && (
        <>
          {step === "phone" ? (
            <form onSubmit={handleClientSendOtp} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  رقم الجوال السعودي
                </label>
                <div className="relative">
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                    className="text-start pe-14"
                    required
                  />
                  <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                    +966
                  </span>
                </div>
              </div>

              <Button type="submit" variant="sovereign" size="lg" className="w-full font-bold">
                إرسال رمز الدخول السريع (OTP)
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleNafathLogin}
                className="w-full font-bold border-emerald-300 text-emerald-800 hover:bg-emerald-50"
              >
                <ShieldCheck className="w-4 h-4 me-2 text-emerald-600" />
                الدخول السريع عبر نفاذ الوطني الموحد
              </Button>
            </form>
          ) : (
            <form onSubmit={handleClientVerifyOtp} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  رمز التحقق OTP (جرب 1234)
                </label>
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="1234"
                  maxLength={4}
                  className="text-center text-lg tracking-widest font-mono font-bold"
                  required
                />
              </div>

              <Button type="submit" variant="sovereign" size="lg" className="w-full font-bold">
                تأكيد الدخول والانتقال لديوان العميل
              </Button>
            </form>
          )}
        </>
      )}

      {/* One-Click Quick Direct Navigation for Developers / Reviewers */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <span className="text-[11px] font-bold text-slate-400 block text-center">
          اختصارات الدخول المباشر (ضغطة واحدة للتجربة السريعة):
        </span>
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setClientRole("customer");
              setClientUser({
                id: TEST_ACCOUNTS.customer.id,
                email: TEST_ACCOUNTS.customer.email,
                name: TEST_ACCOUNTS.customer.name,
                role: "customer",
              });
              toast.success("تم الدخول بحساب العميل VIP");
              router.push(redirectParam || "/account");
            }}
            className="text-[11px] font-bold h-8 rounded-xl border-emerald-200 text-emerald-800 hover:bg-emerald-50"
          >
            لوحة العميل
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setClientRole("vendor");
              setClientUser({
                id: TEST_ACCOUNTS.vendor.id,
                email: TEST_ACCOUNTS.vendor.email,
                name: TEST_ACCOUNTS.vendor.name,
                role: "vendor",
                vendorId: TEST_ACCOUNTS.vendor.vendorId,
              });
              toast.success("تم الدخول بحساب التاجر B2B");
              router.push(redirectParam || "/vendor");
            }}
            className="text-[11px] font-bold h-8 rounded-xl border-amber-200 text-amber-800 hover:bg-amber-50"
          >
            لوحة التاجر
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setClientRole("admin");
              setClientUser({
                id: TEST_ACCOUNTS.admin.id,
                email: TEST_ACCOUNTS.admin.email,
                name: TEST_ACCOUNTS.admin.name,
                role: "admin",
              });
              toast.success("تم الدخول بحساب المشرف العام (Admin)");
              router.push(redirectParam || "/admin");
            }}
            className="text-[11px] font-bold h-8 rounded-xl border-slate-300 text-slate-800 hover:bg-slate-100"
          >
            لوحة الإدارة
          </Button>
        </div>
      </div>

      {/* Bottom Switch Links */}
      <div className="pt-2 text-center text-xs text-slate-500 flex items-center justify-between">
        <Link href="/auth/register" className="font-bold text-[#006948] hover:underline">
          إنشاء حساب مقتني جديد
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-lg mx-auto"
    >
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <StorefrontHeader />

      <main className="flex-1 pt-32 lg:pt-36 flex items-center justify-center p-4">
        <Suspense
          fallback={
            <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400">
              جاري تجهيز بوابة الدخول الموحدة...
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
