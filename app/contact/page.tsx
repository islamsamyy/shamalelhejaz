"use client";

import React, { useState } from "react";
import Link from "next/link";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PhoneCall, Mail, MapPin, Clock, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("تم استلام رسالتك بنجاح!", {
      description: "سيقوم كونسيرج خدمة كبار المقتنين بالتواصل معك خلال ٣٠ دقيقة.",
    });
    setFormData({ name: "", phone: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <StorefrontHeader />

      <main className="flex-1 pt-32 lg:pt-36">
        <section className="bg-white border-b border-slate-200/80 py-8">
          <div className="max-w-[1000px] mx-auto px-4 lg:px-8">
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Link href="/" className="hover:text-[#006948] transition-colors">الرئيسية</Link>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[#006948] font-bold">التواصل وخدمة كبار المقتنين</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              ديوان خدمة كبار المقتنين الدبلوماسي
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              فريق استشاري متخصص لخدمتكم وتنسيق مواعيد المعاينات الخاصة في الرياض وجدة.
            </p>
          </div>
        </section>

        <section className="max-w-[1000px] mx-auto px-4 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Contact Form (7 Cols) */}
            <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md">
              <h3 className="text-base font-bold text-slate-900 mb-4">إرسال استفسار أو طلب معاينة خاصة</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">الاسم الكريم</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="صاحب السمو / سعادة..."
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">رقم الجوال المباشر</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="05XXXXXXXX"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">البريد الإلكتروني</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="vip@domain.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">تفاصيل الطلب أو الاستفسار</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="حدد رقم القطعة أو موعد المعاينة المرغوب..."
                    className="h-28"
                    required
                  />
                </div>
                <Button type="submit" variant="sovereign" size="lg" className="w-full font-bold">
                  إرسال الرسالة إلى الكونسيرج
                </Button>
              </form>
            </div>

            {/* Direct Lines & Office (5 Cols) */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center shrink-0">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-bold">الرقم المجاني الموحد بالمملكة</span>
                    <a href="tel:8001237687" className="text-base font-black text-slate-900 hover:text-[#006948]" dir="ltr">
                      800 123 SOUQ (7687)
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-bold">البريد الإلكتروني للديوان</span>
                    <span className="text-xs font-bold text-slate-900">concierge@souqsaudiya.sa</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006948] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-bold">المقر الرئيسي</span>
                    <span className="text-xs font-bold text-slate-900">مدينة الرياض - حي السفارات (الدرعية)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}

