// lib/currency.ts
export const countryCurrencyMap: Record<string, string> = {
  EG: 'EGP', // Egypt
  SA: 'SAR', // Saudi Arabia
  AE: 'AED', // United Arab Emirates
  US: 'USD', // United States
  GB: 'GBP', // United Kingdom
  DE: 'EUR', // Germany
  FR: 'EUR', // France
  KW: 'KWD', // Kuwait
  QA: 'QAR', // Qatar
  BH: 'BHD', // Bahrain
  OM: 'OMR', // Oman
  JO: 'JOD', // Jordan
};

export const currencyExchangeRates: Record<string, number> = {
  SAR: 1.0,     // Base currency
  USD: 0.2667,  // 1 SAR ~ 0.267 USD
  AED: 0.979,   // 1 SAR ~ 0.98 AED
  EGP: 13.15,   // 1 SAR ~ 13.15 EGP
  EUR: 0.252,   // 1 SAR ~ 0.252 EUR
  GBP: 0.212,   // 1 SAR ~ 0.212 GBP
  KWD: 0.082,
  QAR: 0.971,
  BHD: 0.100,
  OMR: 0.103,
  JOD: 0.189,
};

/**
 * Determine client currency based on cookies, headers, or country code.
 */
export function resolveCurrency(countryCode?: string, cookieHeader?: string): string {
  if (cookieHeader) {
    const match = cookieHeader.match(/currency=([A-Z]{3})/i);
    if (match) {
      const code = match[1].toUpperCase();
      if (currencyExchangeRates[code] !== undefined) {
        return code;
      }
    }
  }
  if (countryCode && countryCurrencyMap[countryCode.toUpperCase()]) {
    return countryCurrencyMap[countryCode.toUpperCase()];
  }
  return "SAR"; // Default to Saudi Riyal
}

/**
 * Convert an amount from base currency (SAR) to target currency.
 */
export function convertCurrency(amountInSAR: number, targetCurrency: string): number {
  const rate = currencyExchangeRates[targetCurrency] ?? 1.0;
  return Number((amountInSAR * rate).toFixed(2));
}

/**
 * Format price according to target currency and locale.
 */
export function formatPrice(
  amount: number,
  currency: string = "SAR",
  locale: string = "ar-SA"
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "KWD" || currency === "BHD" || currency === "OMR" ? 3 : 2,
    }).format(amount);
  } catch (err) {
    return `${amount} ${currency}`;
  }
}
