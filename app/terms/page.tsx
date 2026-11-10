"use client";

import React from "react";
import Link from "next/link";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <StorefrontHeader />

      <main className="flex-1 pt-32 lg:pt-36">
        <section className="bg-white border-b border-slate-200/80 py-8">
          <div className="max-w-[1000px] mx-auto px-4 lg:px-8">
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Link href="/" className="hover:text-[#006948] transition-colors">الرئيسية</Link>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[#006948] font-bold">الشروط والأحكام المعتمدة</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              الشروط والأحكام المنظمة للعمليات
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              تنظم هذه الاتفاقية المعاملات التجارية بين المنصة والبائعين والمشترين وفق نظام التجارة الإلكترونية السعودي.
            </p>
          </div>
        </section>

        <section className="max-w-[1000px] mx-auto px-4 lg:px-8 py-10">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-6 text-xs text-slate-600 leading-relaxed">
            <h3 className="text-base font-bold text-slate-900">١. أهلية التعامل والأهلية القانونية</h3>
            <p>
              يقتصر التسجيل في منصة شمال الحجاز على الأفراد كامل الأهلية القانونية الموثقين عبر نظام نفاذ، والشركات والمؤسسات الحاصلة على سجل تجاري نشط من وزارة التجارة بالمملكة.
            </p>

            <h3 className="text-base font-bold text-slate-900">٢. التسوية المالية وحساب الضمان</h3>
            <p>
              تخضع كافة المعاملات المالية لرقابة البنك المركزي السعودي (ساما). لا تُعد الصفقة نافذة نهائياً إلا بعد استلام المشتري للقطعة وانقضاء مهلة الاعتراض البالغة ٤٨ ساعة من لحظة التسليم.
            </p>

            <h3 className="text-base font-bold text-slate-900">٣. الاختصاص القضائي وفض المنازعات</h3>
            <p>
              تخضع هذه الاتفاقية وتفسر وفقاً للأنظمة واللوائح السارية في المملكة العربية السعودية، ويكون الاختصاص القضائي في فض أي نزاع ينشأ عنها للمحاكم التجارية بمدينة الرياض.
            </p>
          </div>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}

