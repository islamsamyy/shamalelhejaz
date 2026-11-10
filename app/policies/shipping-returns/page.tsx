"use client";

import React from "react";
import Link from "next/link";
import StorefrontHeader from "@/components/StorefrontHeader";
import StorefrontFooter from "@/components/StorefrontFooter";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";

export default function ShippingReturnsPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      <StorefrontHeader />

      <main className="flex-1 pt-32 lg:pt-36">
        <section className="bg-white border-b border-slate-200/80 py-8">
          <div className="max-w-[1000px] mx-auto px-4 lg:px-8">
            <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <Link href="/" className="hover:text-[#006948] transition-colors">الرئيسية</Link>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[#006948] font-bold">سياسات الشحن والتسليم والاسترجاع</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              سياسة الشحن الأمني والاسترجاع الملكي
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              المعايير المعتمدة بموجب نظام التجارة الإلكترونية ولائحة حماية المستهلك بالمملكة.
            </p>
          </div>
        </section>

        <section className="max-w-[1000px] mx-auto px-4 lg:px-8 py-10">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-6 text-xs text-slate-600 leading-relaxed">
            <h3 className="text-base font-bold text-slate-900">١. بروتوكول الشحن والتسليم الأمني</h3>
            <p>
              يتم نقل المقتنيات الثمينة وساعات الكرونوغراف وأدهان العود النادرة عبر أسطول سيارات أمنية مصفحة أو عبر الناقل الوطني الرسمي (البريد السعودي سبل SPL Express). يتم التحقق من هوية المستلم عبر مطابقة رمز الاستلام OTP المرسل لجواله المعتمد.
            </p>

            <h3 className="text-base font-bold text-slate-900">٢. مهلة الاسترجاع والاستبدال المعتمدة</h3>
            <p>
              يحق للمقتني طلب استرجاع أي قطعة خلال ٧ أيام عمل من تاريخ الاستلام دون إبداء أسباب، شريطة بقاء القطعة في تغليفها الأصلي السليم مع شهادة الفحص وختم الشمع الرسمي.
            </p>

            <h3 className="text-base font-bold text-slate-900">٣. استرداد الأموال وفك حجز الضمان (Escrow)</h3>
            <p>
              بمجرد فحص القطعة المسترجعة في مختبر المنصة والتأكد من سلامتها، يتم تحويل المبلغ فوراً إلى محفظة المقتني أو حسابه البنكي خلال ٢٤ ساعة عمل بإشراف البنك المركزي السعودي (ساما).
            </p>
          </div>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}

