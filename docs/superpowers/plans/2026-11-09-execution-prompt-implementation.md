# Souq Saudiya Execution Prompt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform and verify all 38 routes, components, and layout modules of Souq Saudiya to strictly follow `souq/antigravity_execution_prompt (1).md` with 100% CSS Logical Properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`, `border-s-*`, `border-e-*`), fluid Framer Motion micro-interactions, complete bilingual RTL/LTR flipping via `LanguageContext`, and zero dead links.

**Architecture:** Systematic audit and refactoring of styling across all 38 App Router pages, shared storefront/vendor/admin layouts, and Radix UI components to eliminate any physical direction utilities. Enhance `LanguageContext` with full localized translations for headers, navigations, actions, and currency, and ensure all buttons and dialogs are fully interactive.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript (Strict), Tailwind CSS v4 with CSS Logical Properties, Radix UI & shadcn/ui primitives, Framer Motion, Sonner, and canvas-confetti.

**Spec:** `d:\SOUQ\souq\antigravity_execution_prompt (1).md`

## Global Constraints
- Next.js 15+ (App Router) with React 19 & TypeScript in Strict Mode.
- **CRITICAL:** Exclusively use CSS Logical Properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`, `border-s-*`, `border-e-*`). ZERO physical direction classes (`ml-`, `mr-`, `pl-`, `pr-`, `text-left`, `text-right`, `border-l-`, `border-r-`, `rounded-l-`, `rounded-r-`).
- Theme: "Saudi Sovereign Luxury" — Sovereign Emerald Green (`#006948`), Antique Imperial Gold (`#C5A059`), Dark Royal Charcoal, alabaster backgrounds (`#f8fafc`).
- Zero dead links (`javascript:void(0)` forbidden everywhere).
- Framer Motion micro-interactions and Sonner toast notifications on all interactive actions.
- Build & Lint: `npm run build` and `npm run lint` must exit with 0 errors.

## Review Focus
1. **Logical Properties Purity:** Automated regex audit ensuring 0 occurrences of physical direction classes in `components/` and `app/`.
2. **Bidirectional Layout & Sheet Sliding:** Verify `CartDrawer` and mobile navigation slide from `end` and properly mirror in RTL (`dir="rtl"`) vs LTR (`dir="ltr"`).
3. **Full 38 Routes Verification:** Confirm all 38 routes are operational with zero 404s, broken imports, or missing styles.
4. **Interactive Action Continuity:** Verify all cart actions, quick views, checkout stages, waybill prints, admin moderation approvals, and dispute resolutions operate with functional state and instant feedback.
5. **Confetti & Animation Fluidity:** Ensure `canvas-confetti` fires cleanly on checkout success and Framer Motion transitions are smooth without layout shifts.

---

### Task 1: Comprehensive Conversion to CSS Logical Properties
**Files:**
- Modify: `components/StorefrontHeader.tsx`
- Modify: `components/StorefrontFooter.tsx`
- Modify: `components/PlatformNavigator.tsx`
- Modify: `components/CartDrawer.tsx`
- Modify: `components/admin/AdminSidebar.tsx`
- Modify: `components/admin/AdminHeader.tsx`
- Modify: `app/page.tsx`
- Modify: `app/account/page.tsx`
- Modify: `app/admin/page.tsx`
- Modify: `app/cart/page.tsx`
- Modify: `app/catalog/page.tsx`
- Modify: `app/checkout/page.tsx`
- Modify: `app/deals/page.tsx`
- Modify: `app/faq/page.tsx`
- Modify: `app/search/page.tsx`
- Modify: `app/vendor/page.tsx`
- Modify: `app/wishlist/page.tsx`

- [ ] **Step 1: Replace all physical classes with logical properties** (`ml-*` -> `ms-*`, `mr-*` -> `me-*`, `pl-*` -> `ps-*`, `pr-*` -> `pe-*`, `text-left` -> `text-end`, `text-right` -> `text-start`, `border-l-*` -> `border-e-*`, `border-r-*` -> `border-s-*`, `rounded-l-*` -> `rounded-s-*`, `rounded-r-*` -> `rounded-e-*`).
- [ ] **Step 2: Run automated regex verification** to ensure 0 physical direction classes remain.

---

### Task 2: CartDrawer and Layout Bidirectional Adaptability
**Files:**
- Modify: `components/CartDrawer.tsx`
- Modify: `components/StorefrontHeader.tsx`
- Modify: `components/ui/sheet.tsx`

- [ ] **Step 1: Update `components/ui/sheet.tsx`** to support logical `side="end"` and `side="start"` dynamically adapting to document direction (`dir="rtl"` / `dir="ltr"`).
- [ ] **Step 2: Configure `CartDrawer.tsx`** to open from `end`.
- [ ] **Step 3: Test drawer opening** in both RTL and LTR orientations.

---

### Task 3: Comprehensive LanguageContext & Bilingual Experience
**Files:**
- Modify: `context/LanguageContext.tsx`
- Modify: `components/StorefrontHeader.tsx`
- Modify: `components/PlatformNavigator.tsx`

- [ ] **Step 1: Expand bilingual translations dictionary** in `LanguageContext.tsx` to cover navigation titles, common buttons, stats, and search placeholders.
- [ ] **Step 2: Ensure dynamic switching** between Arabic and English flips the HTML `dir` attribute and toggles fonts/labels across the platform.

---

### Task 4: Full 38-Route Inventory & Button Health Audit
**Files:**
- Verify: All 38 routes in `app/`
- Test: All forms, triggers, and state updates across Storefront, Vendor, and Admin

- [ ] **Step 1: Audit all 38 routes** to ensure no `javascript:void(0)` and all CTAs have active handlers.
- [ ] **Step 2: Run Next.js production build (`npm run build`)** to confirm all 38 routes compile cleanly.
- [ ] **Step 3: Run ESLint (`npm run lint`)** to confirm 0 errors.

---

### Task 5: Final Review & Walkthrough Documentation
**Files:**
- Create/Update: `C:\Users\Eslam\.gemini\antigravity\brain\b9b95cb6-9918-495f-9959-e9373dafa5e8\walkthrough.md`
- Deliver comprehensive walkthrough to the user.

