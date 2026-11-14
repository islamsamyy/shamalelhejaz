"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("كلمة المرور يجب ألا تقل عن 8 أحرف.");
      return;
    }
    setSubmitting(true);
    try {
      // Role is always 'customer': assigned by a DB trigger, never by the client.
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: { full_name: form.name.trim(), phone: form.phone.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/account`,
        },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data.session) {
        toast.success("تم إنشاء حسابك بنجاح!");
        router.push("/account");
        router.refresh();
      } else {
        toast.success("تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيد الحساب.");
        router.push("/auth/login");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <StorefrontHeader />
      <main className="flex-1 pt-32 lg:pt-36 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-emerald-100 border border-emerald-200/90 p-2.5 flex items-center justify-center shadow-lg mx-auto mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-mark.png"
                alt="شعار شمال الحجاز"
                className="w-full h-full object-contain"
              />
            </div>
            <Badge variant="sovereign" className="mb-2">
              حساب جديد
            </Badge>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">إنشاء حساب في شمال الحجاز</h1>
            <p className="text-xs text-slate-500 mt-1">
              للتجار: ابدأ من{" "}
              <Link href="/vendor/register" className="font-bold text-[#006948] hover:underline">
                تسجيل المتجر
              </Link>
              .
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">الاسم الكامل</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">رقم الجوال</label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="05XXXXXXXX"
                dir="ltr"
                className="text-start"
                autoComplete="tel"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">البريد الإلكتروني</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                dir="ltr"
                className="text-start"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">كلمة المرور (8 أحرف على الأقل)</label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                dir="ltr"
                className="text-start"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <Button type="submit" disabled={submitting} variant="sovereign" size="lg" className="w-full font-bold">
              {submitting ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500">
            لديك حساب بالفعل؟{" "}
            <Link href="/auth/login" className="font-bold text-[#006948] hover:underline">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </main>
      <StorefrontFooter />
    </div>
  );
}
