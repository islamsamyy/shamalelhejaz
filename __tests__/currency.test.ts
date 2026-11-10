import { describe, it, expect } from "vitest";
import {
  resolveCurrency,
  convertCurrency,
  formatPrice,
  countryCurrencyMap,
  currencyExchangeRates,
} from "@/lib/currency";
import { formatSAR, cn } from "@/lib/utils";

describe("Business Logic: lib/currency.ts & lib/utils.ts", () => {
  // =========================================================================
  // 1. RESOLVE CURRENCY TESTS (AAA PATTERN)
  // =========================================================================

  describe("resolveCurrency", () => {
    it("should resolve currency accurately based on ISO country codes", () => {
      // Arrange & Act & Assert
      expect(resolveCurrency("SA")).toBe("SAR");
      expect(resolveCurrency("EG")).toBe("EGP");
      expect(resolveCurrency("AE")).toBe("AED");
      expect(resolveCurrency("US")).toBe("USD");
      expect(resolveCurrency("KW")).toBe("KWD");
    });

    it("should prioritize cookie preference over GeoIP country code", () => {
      // Arrange
      const cookieHeader = "theme=dark; currency=EUR; auth=token123";
      const geoCountry = "SA"; // Geo says Saudi Arabia

      // Act
      const result = resolveCurrency(geoCountry, cookieHeader);

      // Assert: user cookie override must win
      expect(result).toBe("EUR");
    });

    it("should fallback to 'SAR' when country is unknown and no valid cookie is present", () => {
      // Arrange
      const unknownCountry = "ZZ";

      // Act
      const result = resolveCurrency(unknownCountry, "currency=INVALID");

      // Assert
      expect(result).toBe("SAR");
    });
  });

  // =========================================================================
  // 2. CURRENCY CONVERSION & EXCHANGE RATE TESTS
  // =========================================================================

  describe("convertCurrency", () => {
    it("should convert 100 SAR to EGP accurately based on defined exchange rate", () => {
      // Arrange
      const amountInSAR = 100;
      const expectedEGP = Number((100 * currencyExchangeRates.EGP).toFixed(2));

      // Act
      const converted = convertCurrency(amountInSAR, "EGP");

      // Assert
      expect(converted).toBe(expectedEGP);
    });

    it("should return identical amount for base currency SAR (rate 1.0)", () => {
      // Arrange & Act
      const converted = convertCurrency(350, "SAR");

      // Assert
      expect(converted).toBe(350);
    });

    it("should fallback to 1.0 rate for unlisted currencies", () => {
      // Arrange & Act
      const converted = convertCurrency(200, "XYZ");

      // Assert
      expect(converted).toBe(200);
    });
  });

  // =========================================================================
  // 3. LOCALE-AWARE PRICE FORMATTING TESTS
  // =========================================================================

  describe("formatPrice & formatSAR", () => {
    it("should format Arabic SAR price without decimals", () => {
      // Arrange
      const amount = 1499;

      // Act
      const formatted = formatSAR(amount);

      // Assert
      expect(formatted).toContain("١٬٤٩٩");
      expect(formatted).toContain("ر.س");
    });

    it("should format KWD with 3 decimal precision", () => {
      // Arrange
      const amount = 25.123;

      // Act
      const formatted = formatPrice(amount, "KWD", "en-US");

      // Assert
      expect(formatted).toContain("KWD");
      expect(formatted).toContain("25.123");
    });

    it("should gracefully handle invalid currency codes without throwing", () => {
      // Arrange
      const amount = 500;

      // Act
      const formatted = formatPrice(amount, "UNKNOWN_CURRENCY");

      // Assert
      expect(formatted).toBe("500 UNKNOWN_CURRENCY");
    });
  });

  // =========================================================================
  // 4. TAILWIND CLASSNAME MERGE UTILITY
  // =========================================================================

  describe("cn (tailwind merge)", () => {
    it("should merge tailwind classes properly eliminating conflicts", () => {
      // Arrange & Act
      const merged = cn("p-4 text-red-500", "p-6 text-emerald-600 font-bold");

      // Assert
      expect(merged).toContain("p-6");
      expect(merged).not.toContain("p-4");
      expect(merged).toContain("text-emerald-600");
      expect(merged).not.toContain("text-red-500");
    });
  });
});
