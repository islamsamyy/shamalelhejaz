"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PhoneCall, CheckCircle2, ArrowLeft, Store, ShieldCheck } from "lucide-react";

export default function StorefrontFooter() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      toast.success("تم اشتراكك في نشرة العروض والصفقات بنجاح!", {
        description: "ستصلك أكواد الخصم والمنتجات الأكثر مبيعاً أسبوعياً على بريدك.",
      });
      setEmail("");
    } else {
      toast.error("يرجى إدخال عنوان بريد إلكتروني صالح.");
    }
  };

  return (
    <footer className="w-full bg-white border-t border-slate-200 pt-16 pb-12 text-slate-700 text-start mt-16 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-14 border-b border-slate-200">
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-emerald-100 border border-emerald-200/90 p-1.5 flex items-center justify-center shadow-xs shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-mark.png"
                  alt="شعار شمال الحجاز"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900">شمال الحجاز</span>
                <span className="text-[11px] text-emerald-700 font-bold">
                  منصة المتاجر والموردين المعتمدين بالمملكة
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              المنصة السعودية الرائدة للتجارة الإلكترونية متعددة البائعين. نربط كبار الموردين والمصنعين مباشرة بالمستهلك لتوفير المنتجات الأكثر مبيعاً بأفضل الأسعار مع حماية المشتري المصرفية وشحن فوري.
            </p>
            <div className="flex flex-col gap-1.5 pt-2">
              <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                مركز خدمة العملاء ودعم المتاجر الموحد
              </span>
              <a
                className="text-lg font-black text-slate-900 hover:text-[#006948] transition-colors"
                dir="ltr"
                href="tel:8001237687"
              >
                800 123 SOUQ (7687)
              </a>
            </div>
          </div>

          {/* Column 2: Top Selling Categories */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-black text-slate-900 tracking-wider">
              الأقسام الأكثر طلباً
            </span>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-600 font-medium">
              <li>
                <Link href="/catalog?cat=electronics" className="hover:text-[#006948] transition-colors">
                  الإلكترونيات والأجهزة الذكية
                </Link>
              </li>
              <li>
                <Link href="/catalog?cat=mobiles" className="hover:text-[#006948] transition-colors">
                  الهواتف وملحقاتها الأصلية
                </Link>
              </li>
              <li>
                <Link href="/catalog?cat=home-kitchen" className="hover:text-[#006948] transition-colors">
                  المنزل الذكي وأجهزة المطبخ
                </Link>
              </li>
              <li>
                <Link href="/catalog?cat=beauty-care" className="hover:text-[#006948] transition-colors">
                  الصحة والجمال والعناية
                </Link>
              </li>
              <li>
                <Link href="/catalog?cat=sports-fitness" className="hover:text-[#006948] transition-colors">
                  اللياقة والأنشطة الخارجية
                </Link>
              </li>
              <li>
                <Link href="/deals" className="hover:text-[#006948] transition-colors font-bold text-emerald-700">
                  عروض وتخفيضات اليوم
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Regulatory */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-black text-slate-900 tracking-wider">
              الموثوقية والأنظمة
            </span>
            <ul className="flex flex-col gap-2.5 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2 text-emerald-700 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>حساب ضمان مرخص من ساما</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>فوترة ZATCA المرحلة الثانية</span>
              </li>
              <li>
                <Link href="/about" className="text-emerald-800 font-bold hover:underline">
                  عن منصة شمال الحجاز ومزاياها
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping-returns" className="hover:text-[#006948] transition-colors">
                  سياسة الشحن والاسترجاع
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy" className="hover:text-[#006948] transition-colors">
                  سياسة الخصوصية وحماية البيانات
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#006948] transition-colors">
                  الشروط والأحكام المعتمدة
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Vendor Portal & Newsletter */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-black text-slate-900 tracking-wider">
              بوابة التجار والصفقات
            </span>
            <ul className="flex flex-col gap-2 text-xs text-slate-600 font-medium mb-2">
              <li>
                <Link href="/vendor/register" className="inline-flex items-center gap-1 text-[#006948] font-bold hover:underline">
                  <span>سجل كتاجر (0% رسوم إدراج)</span>
                  <ArrowLeft className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/vendor" className="hover:text-[#006948] transition-colors">
                  لوحة تحكم التاجر B2B
                </Link>
              </li>
            </ul>

            <span className="text-[11px] font-bold text-slate-900">
              النشرة البريدية للعروض:
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              احصل على خصومات حصرية وكوبونات توفير أسبوعية.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2 mt-1">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="بريدك الإلكتروني"
                className="h-9 text-xs bg-slate-50"
              />
              <Button type="submit" variant="dark" size="sm" className="w-full text-xs font-bold h-9">
                اشتراك
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom Trust & Payment Methods Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} شمال الحجاز (Shamal Al-Hijaz) • المنصة المعتمدة للمتاجر والموردين.</p>
          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span>مدى Mada</span>
            <span>•</span>
            <span>Apple Pay</span>
            <span>•</span>
            <span>Visa / Mastercard</span>
            <span>•</span>
            <span>Tamara</span>
            <span>•</span>
            <span>Tabby</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
