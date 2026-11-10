"use client";

import React from "react";
import Link from "next/link";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      q: "كيف تضمن منصة شمال الحجاز أصالة المنتجات وساعات الذهب والأجهزة؟",
      a: "تخضع جميع المقتنيات في المنصة لبروتوكول فحص مخبري إلزامي في مختبرات التوثيق المعتمدة بالرياض وجدة. تُزود كل قطعة بشريحة NFC مشفرة ورقم مرجعي لا يقبل التكرار، موثق بختم وزارة التجارة السعودية.",
    },
    {
      q: "ما هو نظام الضمان المالي المرخص من البنك المركزي السعودي (ساما)؟",
      a: "عند إتمام عملية الشراء، يتم إيداع المبلغ في حساب وسيط (Escrow) خاضع لرقابة ساما. لا يتم الإفراج عن المبلغ للتاجر أو الحرفي إلا بعد استلامك للمقتنى وفحصه وتأكيد رضاك التام بنسبة 100%.",
    },
    {
      q: "كيف تعمل خدمة التوصيل المصفح الفوري خلال ساعتين؟",
      a: "تتوفر الخدمة حالياً لكافة أحياء مدينة الرياض ومحافظة جدة. يقوم ناقل أمني مصفح بتسليم القطعة شخصياً للمقتني مع رمز تحقق رقمي OTP لضمان عدم تسليمها إلا للمشتري شخصياً.",
    },
    {
      q: "هل الأسعار المعروضة تشمل ضريبة القيمة المضافة (ZATCA)؟",
      a: "نعم، كافة الأسعار شاملة لضريبة القيمة المضافة بنسبة 15%. ويتم إصدار فاتورة ضريبية إلكترونية فورية مطابقة لمتطلبات المرحلة الثانية لهيئة الزكاة والضريبة والجمارك مع رمز QR مشفر.",
    },
    {
      q: "ما هي شروط الانضمام كتاجر أو حرفي سعودي في المنصة (KYB)؟",
      a: "يشترط وجود سجل تجاري نشط (10 أرقام)، ورقم ضريبي ZATCA (15 رقماً)، وحساب آيبان بنكي سعودي مسجل باسم المنشأة، بالإضافة لشهادة معروف الذهبية أو رخصة العمل الحر المعتمدة.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <StorefrontHeader />

      <main className="flex-1 pt-32 lg:pt-36">
        <section className="bg-white border-b border-slate-200/80 py-8">
          <div className="max-w-[1000px] mx-auto px-4 lg:px-8">
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Link href="/" className="hover:text-[#006948] transition-colors">الرئيسية</Link>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[#006948] font-bold">الأسئلة الشائعة وتراخيص العمليات</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              الأسئلة الشائعة ودليل المقتني السيادي
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              إجابات شاملة حول أنظمة الفحص، حساب الضمان في ساما، وآليات التوصيل والاسترجاع.
            </p>
          </div>
        </section>

        <section className="max-w-[1000px] mx-auto px-4 lg:px-8 py-10">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-10">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-start text-xs sm:text-sm font-bold text-slate-900 hover:text-[#006948]">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-slate-600 leading-relaxed pt-1">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}

