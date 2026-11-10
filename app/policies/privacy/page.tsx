"use client";

import React from "react";
import Link from "next/link";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPolicyPDPLPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <StorefrontHeader />

      <main className="flex-1 pt-32 lg:pt-36">
        <section className="bg-white border-b border-slate-200/80 py-8">
          <div className="max-w-[1000px] mx-auto px-4 lg:px-8">
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Link href="/" className="hover:text-[#006948] transition-colors">الرئيسية</Link>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[#006948] font-bold">سياسة الخصوصية وحماية البيانات الشخصية</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              سياسة الخصوصية ونظام حماية البيانات الشخصية (PDPL)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              الامتثال للأنظمة الصادرة عن الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا SDAIA).
            </p>
          </div>
        </section>

        <section className="max-w-[1000px] mx-auto px-4 lg:px-8 py-10">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-6 text-xs text-slate-600 leading-relaxed">
            <h3 className="text-base font-bold text-slate-900">١. مبادئ جمع ومعالجة البيانات السيادية</h3>
            <p>
              تلتزم منصة شمال الحجاز بحماية خصوصية كافة المستخدمين والشركاء والمشترين، وتخزين كافة البيانات الحساسة على خوادم سحابية سيادية وطنية تقع جغرافياً داخل حدود المملكة العربية السعودية (منطقة KSA-Central المعتمدة).
            </p>

            <h3 className="text-base font-bold text-slate-900">٢. الربط الحكومي مع نفاذ ومركز المعلومات الوطني</h3>
            <p>
              يتم التحقق من الهوية فقط عبر القنوات الرسمية لنظام نفاذ الوطني الموحد دون الاحتفاظ بكلمات المرور أو البيانات الحيوية للمستخدم، وتُستخدم البيانات حصرياً لغايات الامتثال الضريبي (ZATCA) ومطابقة عمليات الدفع المصرفية.
            </p>

            <h3 className="text-base font-bold text-slate-900">٣. حقوق صاحب البيانات الشخصية</h3>
            <p>
              يحق لكل مستخدم طلب نسخة من بياناته المسجلة أو طلب إتلافها أو تقييد معالجتها في أي وقت عبر التواصل مع مكتب حماية البيانات في ديوان المنصة.
            </p>
          </div>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}

