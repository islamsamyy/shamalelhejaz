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
  Lock,
  Smartphone,
  ArrowLeft,
  CheckCircle2,
  User,
  Store,
  Building,
  KeyRound,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { setClientRole } from "@/lib/rbac";

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

  // Client form states
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");

  // Vendor form states
  const [crNumber, setCrNumber] = useState("");
  const [vendorPassword, setVendorPassword] = useState("");

  // Admin form states
  const [staffId, setStaffId] = useState("");
  const [adminPin, setAdminPin] = useState("");

  const redirectParam = searchParams.get("redirect");
  const errorParam = searchParams.get("error");

  useEffect(() => {
    if (errorParam === "unauthorized") {
      if (initialRole === "admin") {
        toast.error("تنبيه أمني: يلزم تسجيل الدخول بصلاحيات مسؤول النظام (Admin) للوصول إلى لوحة الرقابة.");
      } else if (initialRole === "vendor") {
        toast.error("تنبيه: يتطلب الوصول إلى بوابة الموردين B2B تسجيل الدخول بحساب تاجر معتمد.");
      }
    }
  }, [errorParam, initialRole]);

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
      toast.success("تم توثيق الدخول عبر نفاذ بنجاح!");
      router.push(redirectParam || "/account");
    }, 1200);
  };

  // Vendor login handling
  const handleVendorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!crNumber) {
      toast.error("يرجى إدخال رقم السجل التجاري المعتمد.");
      return;
    }
    setClientRole("vendor");
    toast.success("تم التحقق من بيانات المنشأة في واثق بنجاح!");
    router.push(redirectParam || "/vendor");
  };

  // Admin login handling
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId) {
      toast.error("يرجى إدخال الرقم الوظيفي الرقابي.");
      return;
    }
    setClientRole("admin");
    toast.success("تم تأكيد الصلاحيات الرقابية السيادية بنجاح!");
    router.push(redirectParam || "/admin");
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 sm:p-8 space-y-6">
      {/* Brand & Crest Header */}
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#006948] to-[#004d34] text-white flex items-center justify-center font-black text-xl shadow-lg mx-auto mb-3">
          ش
        </div>
        <Badge variant="sovereign" className="mb-2">
          بوابة الدخول الموحدة
        </Badge>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          تسجيل الدخول إلى شمال الحجاز
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          حدد صفتك للتوجه فورياً إلى لوحة التحكم المخصصة لك.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setRole("client");
            setStep("phone");
          }}
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
          onClick={() => setRole("vendor")}
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
          onClick={() => setRole("admin")}
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

      {/* Role-Specific Form Fields */}
      {role === "client" && (
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

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-semibold">
                  أو عبر المنظومة الحكومية
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

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
                <span className="text-[11px] text-slate-400 mt-1 block text-center">
                  أدخل الرمز المكون من ٤ أرقام المرسل إلى {phone}
                </span>
              </div>

              <Button type="submit" variant="sovereign" size="lg" className="w-full font-bold">
                تأكيد الدخول والانتقال لديوان العميل
              </Button>

              <button
                type="button"
                onClick={() => setStep("phone")}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800"
              >
                تغيير رقم الجوال
              </button>
            </form>
          )}
        </>
      )}

      {role === "vendor" && (
        <form onSubmit={handleVendorLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              رقم السجل التجاري الموثق (10 أرقام)
            </label>
            <Input
              value={crNumber}
              onChange={(e) => setCrNumber(e.target.value)}
              placeholder="1010884920"
              dir="ltr"
              className="text-start font-mono"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              كلمة المرور أو رمز التفويض
            </label>
            <Input
              type="password"
              value={vendorPassword}
              onChange={(e) => setVendorPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" variant="sovereign" size="lg" className="w-full font-bold">
            دخول التاجر إلى استوديو العمليات (Vendor Hub)
          </Button>

          <div className="pt-2 text-center">
            <Link
              href="/vendor/register"
              className="text-xs font-bold text-emerald-700 hover:underline block"
            >
              لست مسجلاً كتاجر معتمد بعد؟ ابدأ توثيق المنشأة KYB
            </Link>
          </div>
        </form>
      )}

      {role === "admin" && (
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              الرقم الوظيفي الرقابي (Staff ID)
            </label>
            <Input
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              placeholder="KSA-ADM-901"
              dir="ltr"
              className="text-start font-mono"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              الرمز الأمني المشفر (Security PIN)
            </label>
            <Input
              type="password"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full font-bold bg-slate-900 hover:bg-slate-800 text-white h-11 rounded-2xl"
          >
            دخول المشرف إلى مركز الرقابة السيادية (Admin Center)
          </Button>
        </form>
      )}

      {/* One-Click Quick Direct Navigation for Developers / Reviewers */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <span className="text-[11px] font-bold text-slate-400 block text-center">
          اختصارات الدخول المباشر إلى لوحات التحكم:
        </span>
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              toast.success("تم الدخول لديوان العميل VIP");
              router.push("/account");
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
              toast.success("تم الدخول لاستوديو التاجر B2B");
              router.push("/vendor");
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
              toast.success("تم الدخول لمركز الرقابة السيادية");
              router.push("/admin");
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
