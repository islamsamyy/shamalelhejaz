/**
 * Search Utilities with Arabic Text Normalization
 * Supports flexible Arabic matching:
 * - Normalizes Alef (أ, إ, آ, ٱ -> ا)
 * - Normalizes Taa Marbouta (ة -> ه)
 * - Normalizes Yaa (ى, ئ -> ي)
 * - Removes Tashkeel / Diacritics
 * - Multi-word token matching
 */

export function normalizeArabicText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    // Remove Arabic diacritics / Tashkeel
    .replace(/[\u064B-\u065F\u0670]/g, "")
    // Normalize Alef variants
    .replace(/[أإآٱ]/g, "ا")
    // Normalize Taa Marbouta
    .replace(/ة/g, "ه")
    // Normalize Yaa variants
    .replace(/[ىئ]/g, "ي")
    // Normalize Waw with Hamza
    .replace(/ؤ/g, "و")
    // Collapse multiple spaces
    .replace(/\s+/g, " ");
}

export function matchesSearch(
  candidate: { title?: string; vendor?: string; category?: string; description?: string },
  query: string
): boolean {
  const q = normalizeArabicText(query);
  if (!q) return true;

  const target = normalizeArabicText(
    `${candidate.title || ""} ${candidate.vendor || ""} ${candidate.category || ""} ${candidate.description || ""}`
  );

  const tokens = q.split(" ").filter(Boolean);
  return tokens.every((token) => target.includes(token));
}
