import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { convertCurrency, formatPrice, currencyExchangeRates } from "./currency";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getActivePreviewCurrency(): string {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("souq_currency");
      if (saved && currencyExchangeRates[saved]) return saved;
      const match = document.cookie.match(/currency=([A-Z]{3})/i);
      if (match && currencyExchangeRates[match[1].toUpperCase()]) {
        return match[1].toUpperCase();
      }
    } catch {}
  }
  return "SAR";
}

export function formatSAR(amount: number, overrideCurrency?: string): string {
  const targetCurrency = overrideCurrency || getActivePreviewCurrency();
  const converted = convertCurrency(amount, targetCurrency);
  return formatPrice(converted, targetCurrency, "ar-SA");
}
