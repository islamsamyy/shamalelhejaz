"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "ar" | "en";
export type Direction = "rtl" | "ltr";

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<string, { ar: string; en: string }> = {
  // Navigation & General
  home: { ar: "الرئيسية", en: "Home" },
  catalog: { ar: "دليل المقتنيات", en: "Catalog" },
  categories: { ar: "فهرس الأقسام", en: "Categories" },
  deals: { ar: "مركز الصفقات", en: "Deals & Offers" },
  magazine: { ar: "مجلة شمال الحجاز", en: "Shamal Al-Hijaz Magazine" },
  cart: { ar: "حقيبة التسوق", en: "Cart" },
  wishlist: { ar: "المفضلة", en: "Wishlist" },
  account: { ar: "حسابي", en: "My Account" },
  vendor_portal: { ar: "بوابة التجار", en: "Vendor Portal" },
  admin_center: { ar: "الإدارة المركزية", en: "Admin Center" },
  search_placeholder: { ar: "ابحث عن أكثر المنتجات طلباً، ماركات معتمدة، أجهزة منزلية...", en: "Search best-sellers, verified brands, appliances..." },
  sar: { ar: "ر.س", en: "SAR" },
  currency: { ar: "ريال سعودي", en: "Saudi Riyal" },

  // Status & Actions
  add_to_cart: { ar: "إضافة للسلة", en: "Add to Cart" },
  buy_now: { ar: "الشراء الفوري", en: "Buy Now" },
  quick_view: { ar: "معاينة سريعة", en: "Quick View" },
  checkout: { ar: "إتمام الطلب", en: "Checkout" },
  approve: { ar: "اعتماد", en: "Approve" },
  reject: { ar: "رفض", en: "Reject" },
  save: { ar: "حفظ", en: "Save" },
  cancel: { ar: "إلغاء", en: "Cancel" },

  // Badges & Compliance
  zatca_verified: { ar: "معتمد من ZATCA المرحلة الثانية", en: "ZATCA Phase-2 Certified" },
  sama_escrow: { ar: "ضمان البنك المركزي SAMA", en: "SAMA Escrow Protected" },
  spl_express: { ar: "شحن معتمد سبل SPL", en: "SPL Express Certified" },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("souq_lang") as Language | null;
      if (saved === "ar" || saved === "en") {
        return saved;
      }
    }
    return "ar";
  });

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("souq_lang", lang);
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === "ar" ? "en" : "ar";
    setLanguage(nextLang);
  };

  const direction: Direction = language === "ar" ? "rtl" : "ltr";

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
