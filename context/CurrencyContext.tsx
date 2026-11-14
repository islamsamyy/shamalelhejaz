"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  currencyExchangeRates,
  convertCurrency,
  formatPrice as formatPriceLib,
} from "@/lib/currency";

export type SupportedCurrency =
  | "SAR"
  | "AED"
  | "USD"
  | "KWD"
  | "QAR"
  | "BHD"
  | "OMR"
  | "EUR"
  | "GBP"
  | "EGP";

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  label: string;
  flag: string;
  rate: number;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: "SAR", symbol: "ر.س", label: "الريال السعودي (ر.س)", flag: "🇸🇦", rate: 1.0 },
  { code: "AED", symbol: "د.إ", label: "الدرهم الإماراتي (د.إ)", flag: "🇦🇪", rate: 0.979 },
  { code: "USD", symbol: "$", label: "الدولار الأمريكي (USD)", flag: "🇺🇸", rate: 0.2667 },
  { code: "KWD", symbol: "د.ك", label: "الدينار الكويتي (د.ك)", flag: "🇰🇼", rate: 0.082 },
  { code: "QAR", symbol: "ر.ق", label: "الريال القطري (ر.ق)", flag: "🇶🇦", rate: 0.971 },
  { code: "BHD", symbol: "د.ب", label: "الدينار البحريني (د.ب)", flag: "🇧🇭", rate: 0.100 },
  { code: "OMR", symbol: "ر.ع", label: "الريال العماني (ر.ع)", flag: "🇴🇲", rate: 0.103 },
  { code: "EUR", symbol: "€", label: "اليورو الأوروبي (EUR)", flag: "🇪🇺", rate: 0.252 },
  { code: "GBP", symbol: "£", label: "الجنيه الإسترليني (GBP)", flag: "🇬🇧", rate: 0.212 },
  { code: "EGP", symbol: "ج.م", label: "الجنيه المصري (EGP)", flag: "🇪🇬", rate: 13.15 },
];

interface CurrencyContextType {
  currency: SupportedCurrency;
  setCurrency: (code: SupportedCurrency) => void;
  formatPrice: (amountInSAR: number) => string;
  convertPrice: (amountInSAR: number) => number;
  currentConfig: CurrencyConfig;
  supportedCurrencies: CurrencyConfig[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>("SAR");
  const [, setTick] = useState(0);

  // Initialize from localStorage or cookie on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("souq_currency") as SupportedCurrency | null;
      if (saved && currencyExchangeRates[saved]) {
        setCurrencyState(saved);
        return;
      }
      const match = document.cookie.match(/currency=([A-Z]{3})/i);
      if (match && currencyExchangeRates[match[1].toUpperCase()]) {
        setCurrencyState(match[1].toUpperCase() as SupportedCurrency);
      }
    } catch {}
  }, []);

  const setCurrency = useCallback((code: SupportedCurrency) => {
    if (!currencyExchangeRates[code]) return;
    setCurrencyState(code);
    try {
      localStorage.setItem("souq_currency", code);
      document.cookie = `currency=${code}; path=/; max-age=31536000; SameSite=Lax`;
      window.dispatchEvent(new CustomEvent("currencyChange", { detail: { currency: code } }));
    } catch {}

    const cfg = SUPPORTED_CURRENCIES.find((c) => c.code === code);
    toast.success(`تم تغيير عملة المعاينة إلى: ${cfg?.label || code}`, {
      description: code === "SAR" ? "العملة السيادية المعتمدة للمنصة." : "يتم تحويل الأسعار لغايات المعاينة التقديرية.",
    });
  }, []);

  // Listen to global currency changes (cross-tab / cross-component)
  useEffect(() => {
    const handleCurrencyEvent = (e: any) => {
      const nextCode = e?.detail?.currency;
      if (nextCode && nextCode !== currency && currencyExchangeRates[nextCode]) {
        setCurrencyState(nextCode);
      }
      setTick((t) => t + 1);
    };
    window.addEventListener("currencyChange", handleCurrencyEvent);
    return () => window.removeEventListener("currencyChange", handleCurrencyEvent);
  }, [currency]);

  const currentConfig =
    SUPPORTED_CURRENCIES.find((c) => c.code === currency) || SUPPORTED_CURRENCIES[0];

  const convertPrice = useCallback(
    (amountInSAR: number) => {
      return convertCurrency(amountInSAR, currency);
    },
    [currency]
  );

  const formatPrice = useCallback(
    (amountInSAR: number) => {
      const converted = convertCurrency(amountInSAR, currency);
      return formatPriceLib(converted, currency, "ar-SA");
    },
    [currency]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        convertPrice,
        currentConfig,
        supportedCurrencies: SUPPORTED_CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      currency: "SAR" as SupportedCurrency,
      setCurrency: () => {},
      formatPrice: (amount: number) => formatPriceLib(amount, "SAR", "ar-SA"),
      convertPrice: (amount: number) => amount,
      currentConfig: SUPPORTED_CURRENCIES[0],
      supportedCurrencies: SUPPORTED_CURRENCIES,
    };
  }
  return context;
}
