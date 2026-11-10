"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShieldCheck, UserPlus, Store, User, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<"client" | "vendor">("client");
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "الرياض" });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("يرجى إكمال بيانات التسجيل الأساسية.");
      return;
    }
    toast.success("تم إنشاء حسابك بنجاح! مرحباً بك في منصة شمال الحجاز.");
    router.push("/account");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <StorefrontHeader />

      <main className="flex-1 pt-32 lg:pt-36 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#006948] to-[#004d34] text-white flex items-center justify-center font-black text-xl shadow-lg mx-auto mb-3">
              ش
            </div>
            <Badge variant="sovereign" className="mb-2">عضوية جديدة</Badge>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              إنشاء حساب في منصة شمال الحجاز
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              اختر نوع الحساب للانضمام إلى منصة شمال الحجاز للتجارة والمتاجر المعتمدة.
            </p>
          </div>

          {/* Account Type Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setAccountType("client")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all cursor-pointer ${
                accountType === "client"
                  ? "bg-[#006948] text-white shadow-md shadow-[#006948]/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User className="w-4 h-4" />
              <span>حساب مقتني VIP</span>
            </button>
            <button
              type="button"
              onClick={() => setAccountType("vendor")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all cursor-pointer ${
                accountType === "vendor"
                  ? "bg-[#006948] text-white shadow-md shadow-[#006948]/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Store className="w-4 h-4" />
              <span>منشأة تاجر (KYB)</span>
            </button>
          </div>

          {accountType === "client" ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الاسم الكامل</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="صاحب السمو / سعادة..."
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">رقم الجوال السعودي</label>
                <div className="relative">
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
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

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">البريد الإلكتروني</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="vip@domain.sa"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">مدينة الإقامة الرئيسية</label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="الرياض / جدة / مكة..."
                  required
                />
              </div>

              <Button type="submit" variant="sovereign" size="lg" className="w-full font-bold">
                تأكيد التسجيل والانتقال للديوان
              </Button>
            </form>
          ) : (
            <div className="space-y-4 p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-start">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-sm text-emerald-950">
                  توثيق منشأة تجارية معتمدة (KYB)
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                انضم لشبكة التجار المعتمدين عبر معالج التوثيق المتكامل مع منصة واثق، هيئة الزكاة (ZATCA)، وحساب ضمان ساما المشروط.
              </p>
              <div className="pt-2">
                <Button asChild variant="sovereign" size="lg" className="w-full font-bold">
                  <Link href="/vendor/register" className="flex items-center justify-center gap-2">
                    <span>بدء معالج التوثيق (8 خطوات)</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              لديك حساب بالفعل؟{" "}
              <Link href="/auth/login" className="font-bold text-[#006948] hover:underline">
                تسجيل الدخول
              </Link>
            </div>
            <Link href="/portals" className="font-bold text-slate-600 hover:text-slate-900">
              بوابات المنظومة ←
            </Link>
          </div>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
