"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function PlatformNavigator() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const pathname = usePathname();

  const sections = [
    {
      title: "مجمع البوابات المستقلة",
      badge: "Portals Hub",
      color: "emerald",
      routes: [
        { name: "مركز البوابات المستقلة الثلاث", path: "/portals" },
      ],
    },
    {
      title: "واجهة المتجر والعملاء",
      badge: "Customer Storefront",
      color: "emerald",
      routes: [
        { name: "الواجهة الرئيسية وعروض الخزائن", path: "/" },
        { name: "دليل المقتنيات والاستكشاف الذكي", path: "/catalog" },
        { name: "فهرس الأقسام البصري", path: "/categories" },
        { name: "تفاصيل المنتج - سماعات سوني WH-1000XM5", path: "/products/sony-wh1000xm5" },
        { name: "صفحة البحث والاسترجاع الذكي", path: "/search" },
        { name: "سلة المقتنيات الفاخرة", path: "/cart" },
        { name: "بوابة الدفع السيادي 5 خطوات", path: "/checkout" },
        { name: "تأكيد الطلب وفاتورة زاتكا QR", path: "/orders/SQ-94281/confirmation" },
        { name: "تتبع الشحنة المباشر (SPL / SMSA)", path: "/orders/SQ-94281/tracking" },
        { name: "ديوان العميل (13 قسماً تحكمياً)", path: "/account" },
        { name: "قائمة المقتنيات المفضلة", path: "/wishlist" },
        { name: "عروض الخزائن والصفقات الملكية", path: "/deals" },
        { name: "المتجر الرسمي - دار الحرمين", path: "/store/dar-al-haramain" },
        { name: "بوابة الإرجاع والاستبدال الميسر", path: "/returns" },
        { name: "مجلة شمال الحجاز التحريرية", path: "/magazine" },
        { name: "بوابة الدخول ونفاذ الوطني", path: "/auth/login" },
      ],
    },
    {
      title: "بوابة التجار واستوديو الحرفيين",
      badge: "Vendor Marketplace B2B",
      color: "amber",
      routes: [
        { name: "صفحة هبوط التجار وحاسبة الأرباح", path: "/vendor" },
        { name: "استوديو إدارة الكتالوج والمخزون", path: "/vendor/catalog" },
        { name: "إدراج مقتنى جديد للكتالوج", path: "/vendor/catalog/add" },
        { name: "إدارة الطلبات وبوالص الشحن", path: "/vendor/orders" },
        { name: "اللوحة المالية وحساب التسويات", path: "/vendor/financials" },
        { name: "إعدادات المتجر وهوية العلامة", path: "/vendor/settings" },
        { name: "معالج توثيق التاجر (KYB 8 خطوات)", path: "/vendor/register" },
      ],
    },
    {
      title: "الإدارة المركزية والرقابة السيادية",
      badge: "Enterprise Admin Center",
      color: "blue",
      routes: [
        { name: "لوحة القيادة التنفيذية (GMV KPIs)", path: "/admin" },
        { name: "طابور تدقيق واعتماد الكتالوج", path: "/admin/products" },
        { name: "إدارة العمليات وفض النزاعات", path: "/admin/orders" },
        { name: "خزينة توثيق المنشآت وعمولات KYB", path: "/admin/vendors" },
        { name: "سجل العملاء وإدارة أرصدة المحافظ", path: "/admin/customers" },
        { name: "هندسة وبناء هيكل الأقسام", path: "/admin/categories" },
        { name: "محرك العروض والكوبونات والخصم", path: "/admin/marketing" },
        { name: "التسويات وفواتير ZATCA Phase-2", path: "/admin/finance" },
        { name: "إعدادات المنظومة وصلاحيات RBAC", path: "/admin/settings" },
      ],
    },
    {
      title: "صفحات الثقة والأنظمة الحكومية",
      badge: "Trust & Compliance",
      color: "purple",
      routes: [
        { name: "عن المنصة ورؤية 2030", path: "/about" },
        { name: "التواصل وخدمة كبار المقتنين", path: "/contact" },
        { name: "الأسئلة الشائعة وتراخيص العمليات", path: "/faq" },
        { name: "سياسة الخصوصية وحماية البيانات PDPL", path: "/policies/privacy" },
        { name: "الشروط والأحكام المعتمدة", path: "/terms" },
      ],
    },
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <aside aria-label="شريط التنقل السريع بين شاشات المنصة" className="fixed bottom-6 start-6 z-[9999] flex flex-col items-start gap-2 print:hidden">
        {isMinimized ? (
          <button
            onClick={() => setIsMinimized(false)}
            className="w-10 h-10 rounded-full bg-slate-900/90 hover:bg-[#006948] text-emerald-400 flex items-center justify-center shadow-xl border border-slate-700/60 transition-all cursor-pointer hover:scale-110"
            title="إظهار شاشات المنظومة"
          >
            <span className="material-symbols-outlined text-[20px]">dashboard_customize</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900 text-white shadow-2xl hover:bg-[#006948] transition-all border border-slate-700/60 font-bold text-xs cursor-pointer hover:scale-105 active:scale-95"
              title="شريط التنقل السريع بين شاشات منصة شمال الحجاز"
            >
              <span className="material-symbols-outlined text-[18px] text-emerald-400">
                {isOpen ? "close" : "dashboard_customize"}
              </span>
              <span>شاشات المنظومة كاملة</span>
              <span className="px-2 py-0.5 rounded-full bg-[#006948] text-white text-[10px] font-extrabold">
                شمال الحجاز
              </span>
            </button>

            <button
              onClick={() => {
                setIsMinimized(true);
                setIsOpen(false);
              }}
              className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700 text-xs cursor-pointer"
              title="تصغير الشريط بعيداً عن الشاشة"
            >
              −
            </button>
          </div>
        )}

        {/* Modal / Flyout Menu */}
        {isOpen && (
          <div className="w-[360px] max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl p-5 flex flex-col gap-4 text-start animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-50 via-white to-emerald-100 border border-emerald-200/90 p-1 flex items-center justify-center shadow-xs shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo-mark.png"
                    alt="شعار شمال الحجاز"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">منصة شمال الحجاز</h4>
                  <p className="text-[11px] text-slate-500">فهرس شاشات المنظومة المعتمدة</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer text-xs"
                  title="تصغير"
                >
                  −
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                  title="إغلاق"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            </div>

            {/* Standalone Portals Hub Banner */}
            <Link
              href="/portals"
              onClick={() => setIsOpen(false)}
              className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950 to-slate-900 text-white flex items-center justify-between border border-emerald-500/30 hover:border-emerald-400 transition-all shadow-md group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">hub</span>
                </div>
                <div>
                  <span className="text-xs font-bold block text-white">لوحة البوابات المستقلة</span>
                  <span className="text-[10px] text-emerald-400">فتح المجمع الشامل للبوابات الثلاث</span>
                </div>
              </div>
              <span className="text-xs text-emerald-400 group-hover:-translate-x-1 transition-transform">←</span>
            </Link>

            {sections.map((sec, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800">{sec.title}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                    {sec.badge}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {sec.routes.map((r) => {
                    const isActive = pathname === r.path;
                    return (
                      <Link
                        key={r.path}
                        href={r.path}
                        onClick={() => setIsOpen(false)}
                        className={`group flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                          isActive
                            ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span className="line-clamp-1">{r.name}</span>
                        <span className="text-[10px] text-slate-400 group-hover:text-emerald-700 transition-colors shrink-0 ms-2">
                          ←
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>
    </>
  );
}
