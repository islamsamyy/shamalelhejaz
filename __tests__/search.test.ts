import { describe, it, expect } from "vitest";
import { normalizeArabicText, matchesSearch } from "@/lib/search";

describe("Search & Arabic Normalization", () => {
  it("normalizes Alef with Madda, Hamza Above, and Hamza Below", () => {
    expect(normalizeArabicText("آيفون")).toBe("ايفون");
    expect(normalizeArabicText("أبل")).toBe("ابل");
    expect(normalizeArabicText("إلكترونيات")).toBe("الكترونيات");
  });

  it("normalizes Taa Marbouta to Haa", () => {
    expect(normalizeArabicText("سماعة")).toBe("سماعه");
    expect(normalizeArabicText("ذكية")).toBe("ذكيه");
  });

  it("matches search query across normalized variants", () => {
    const product = {
      title: "آيفون 16 برو ماكس سعة 256 جيجابايت تيتانيوم صحراوي",
      category: "الهواتف الذكية",
      vendor: "متجر أبل المعتمد",
    };

    // User types with plain Alef
    expect(matchesSearch(product, "ايفون")).toBe(true);
    // User types "ابل" instead of "أبل"
    expect(matchesSearch(product, "متجر ابل")).toBe(true);
    // User types "الذكيه" with Haa instead of Taa Marbouta
    expect(matchesSearch(product, "الهواتف الذكيه")).toBe(true);
    // Multi-token match
    expect(matchesSearch(product, "ايفون 16 تيتانيوم")).toBe(true);
  });
});
