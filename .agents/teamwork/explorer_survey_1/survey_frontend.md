# Comprehensive Frontend & UI/UX Audit Report: Souq Saudiya (شمال الحجاز)

**Auditor:** explorer_survey_1 (Teamwork Explorer / Senior Frontend Architect)  
**Date:** 2026-11-10  
**Scope:** Frontend Architecture, Route Inventory (38 routes across 3 portals), CSS Logical Properties, Bilingual Localization (RTL/LTR), Component Interactions, and UI Completeness.  
**Working Directory:** `d:\SOUQ\.agents\teamwork\explorer_survey_1\`

---

## 1. Executive Summary

A comprehensive architectural and code-level investigation of the frontend codebase for **Souq Saudiya (منصة شمال الحجاز)** was conducted against the specifications in `antigravity_execution_prompt (1).md`, `antigravity_project_specification.md`, and `stru.md`.

### Core Survey Findings:
1. **Route Coverage (100% Present, ~85% Spec-Aligned):** All 38 required routes across the three portals (Customer Storefront B2C, Vendor Portal B2B, and Enterprise Admin Command Center) exist and render rich UI layouts with Sonner toast feedback and interactive dialogs. However, critical gaps exist against prompt specifications:
   - `/account` implements only **5 tabs** instead of the mandated **13 tabs / views**.
   - `/checkout` implements a **4-step flow** instead of the mandated **5-step flow**.
   - `/cart` lists items in a flat array tagged with vendor names rather than partitioned into **vendor-grouped order buckets**.
2. **CSS Logical Properties Violations (59 Identified Instances):** The project mandates strict adherence to CSS logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `text-end`). The audit discovered **59 forbidden physical directional classes** (`ml-1`, `ml-1.5`, `pr-10`, `pr-6`, `pr-3`, `text-right`, `text-left`, `right-3.5`, `left-4`, `border-r`, `border-l`, `space-x-2`). Furthermore, `app/globals.css` hardcodes `html, body { direction: rtl; }`, which overrides the HTML element's dynamic `dir="ltr"` attribute due to CSS rule precedence.
3. **Localization Disconnect (Critical Architectural Gap):** While `context/LanguageContext.tsx` was created and mounted in `app/layout.tsx`, **`useLanguage()` is never imported or called in any page or component throughout the entire codebase**. `StorefrontHeader` features a currency dropdown (SAR, AED, USD) but **no language switcher**. Every page and component hardcodes Arabic text directly in JSX without using the translation dictionary.
4. **State Persistence Omission:** `context/CartContext.tsx` lacks `localStorage` synchronization for `cart` and `wishlist` items. Upon browser refresh, state reverts to hardcoded mock items.
5. **Zero Dead Links:** A scan for `javascript:void(0)`, empty `#`, or unhandled click actions found zero broken anchors. Interactive buttons trigger Sonner toasts or Radix modals.
6. **Syntax Blocker in `package.json`:** `package.json` line 12 is missing a trailing comma before a duplicate `"dev"` script block on line 13, causing JSON parse failure in Vitest and CLI tools.

---

## 2. Complete 38-Route Inventory & Feature Audit

The table below catalogs every required route across all three portals, evaluating spec compliance, interactivity, and identified discrepancies.

### A. Customer Storefront (B2C Portal)

| # | Route | File Path | Spec Requirement | Current State | Discrepancies & Gaps |
|---|-------|-----------|------------------|---------------|----------------------|
| 1 | `/` | `app/page.tsx` | Bento hero showcase, flash deal countdowns, category pills, verified reviews, vendor profit calculator, quick view modal | Fully implemented (1127 lines), dynamic Supabase sync, countdown timer, review submission | No major gaps; flash deal countdown and vendor calculator slider are fully interactive. |
| 2 | `/catalog` | `app/catalog/page.tsx` | Multi-faceted catalog, price range slider, express shipping toggle, sorting, grid/list view | Fully implemented (519 lines), wrapped in `<Suspense>`, dual view modes, live filter drawer | None; price slider, quick view modal, and search query filters are functional. |
| 3 | `/categories` | `app/categories/page.tsx` | Visual taxonomy directory, 63 department pills, subcategory matrix | Fully implemented (224 lines), department filter tabs, fallback to `TOP_CATEGORIES` | Responsive grid with subcategory badges. |
| 4 | `/products/[id]` | `app/products/[id]/page.tsx` | PDP with multi-image/video gallery, variant selector, specs accordion/tabs, verified reviews, sticky buy box | Fully implemented (752 lines), Supabase product/review integration, VIP engraving option, confetti on buy | Specs displayed via tabs rather than accordion; video gallery player is placeholder image. |
| 5 | `/search` | `app/search/page.tsx` | Smart search results with autocomplete, live filtering, empty-state recovery | Fully implemented (181 lines), wrapped in `<Suspense>`, search suggestions and empty state CTA | Autocomplete suggestions are static list rather than dynamic debounced backend endpoint. |
| 6 | `/cart` | `app/cart/page.tsx` | Full cart view grouped by vendor, line item controls, coupon code engine, ZATCA tax breakdown | Implemented (316 lines), line item increment/decrement, coupon application (`SOUQ10`, `TECH15`) | **Gap:** Items display vendor label, but are rendered in a **flat list**, NOT visually grouped into distinct vendor order cards as required by spec. |
| 7 | `/checkout` | `app/checkout/page.tsx` | 5-step checkout flow (SPL National Address, Shipping, Mada/ApplePay/Tabby/Tamara, ZATCA review) | Implemented (592 lines), interactive stepper, address form, Mada/ApplePay selection, confetti trigger | **Gap:** Stepper has **4 steps** instead of 5 steps (merged address and SPL validation into step 1). Hardcodes order ID `SQ-94281` upon completion. |
| 8 | `/orders/[id]/confirmation` | `app/orders/[id]/confirmation/page.tsx` | Order success animation, ZATCA Phase-2 ECDSA QR code invoice, print/download invoice | Fully implemented (137 lines), QR visual, metadata grid, print trigger | Invoice download triggers Sonner toast rather than generating actual PDF/XML download. |
| 9 | `/orders/[id]/tracking` | `app/orders/[id]/tracking/page.tsx` | 6-stage animated visual timeline (SPL / SMSA courier tracking) | Implemented (190 lines), 6-stage timeline matching `stru.md`, courier contact toast | Uses physical classes (`pr-6`, `before:right-2.5`). Static mockup stages. |
| 10 | `/account` | `app/account/page.tsx` | 13-tab / 13-view customer control center (overview, orders, tracking, wishlist, addresses, wallet, settings) | Implemented (558 lines), includes Address modal and Wallet top-up modal | **Major Gap:** Only **5 tabs** are implemented (`overview`, `orders`, `addresses`, `wallet`, `settings`). The remaining 8 views (wishlist, tracking, payment methods, security/Nafath, RMA returns, preferences, notifications, tickets) are missing or merged. |
| 11 | `/wishlist` | `app/wishlist/page.tsx` | Saved items for later purchase, price drop badges, empty state | Fully implemented (139 lines), removal controls, add to cart direct actions | State is in memory (`CartContext`), not persisted across page reloads. |
| 12 | `/deals` | `app/deals/page.tsx` | Flash sales hub with countdown timer, clip-to-claim copyable coupon codes | Fully implemented (223 lines), clipboard copy with toast feedback, countdown timer | Fully functional. |
| 13 | `/store/[storeId]` | `app/store/[storeId]/page.tsx` | Verified vendor storefront, brand crest, CR/ZATCA badges, filtered products | Fully implemented (204 lines), banner header, store metadata, dynamic vendor products | None; fallback for unspecified storeId works gracefully. |
| 14 | `/returns` | `app/returns/page.tsx` | Automated 3-step RMA portal, self-service return form, refund destination | Implemented (162 lines), form validation, order number input, RMA number generation | Photo upload input is not present (only text/dropdowns). |
| 15 | `/magazine` | `app/magazine/page.tsx` | Editorial/blog hub with shoppable articles and embedded buy buttons | Fully implemented (188 lines), 3 shoppable heritage articles with direct "Add to Cart" | None. |
| 16 | `/about` | `app/about/page.tsx` | Trust, Vision 2030, and platform value proposition | Fully implemented (430 lines), stats grid, platform features accordion | None. |
| 17 | `/contact` | `app/contact/page.tsx` | VIP concierge contact form, Saudi phone / email links | Fully implemented (143 lines), form state with Sonner toast confirmation | None. |
| 18 | `/faq` | `app/faq/page.tsx` | Regulatory, SAMA Escrow, and ZATCA compliance FAQs | Fully implemented (79 lines), Radix Accordion | None. |
| 19 | `/policies/shipping-returns` | `app/policies/shipping-returns/page.tsx` | Shipping & Return policies under Saudi e-commerce law | Fully implemented (57 lines) | None. |
| 20 | `/policies/privacy` | `app/policies/privacy/page.tsx` | PDPL privacy policy compliant with SDAIA regulations | Fully implemented (57 lines) | None. |
| 21 | `/terms` | `app/terms/page.tsx` | Saudi e-commerce legal terms and dispute jurisdiction | Fully implemented (57 lines) | None. |
| 22 | `/auth/login` | `app/auth/login/page.tsx` | Authentication suite (Customer, Vendor, Admin), OTP verification, test accounts | Fully implemented (529 lines), quick-fill buttons for test credentials, role switching | Uses `px-3 py-1.5` and standard buttons; OTP mode mock-verifies. |
| 23 | `/auth/register` | `app/auth/register/page.tsx` | Account registration with customer / vendor selector | Fully implemented (171 lines), tab switcher, input validation | None. |
| 24 | `/portals` | `app/portals/page.tsx` | Central switchboard connecting Customer, Vendor, and Admin | Fully implemented (315 lines), role deep-links, platform navigation | None. |

---

### B. Vendor Portal (B2B Marketplace)

| # | Route | File Path | Spec Requirement | Current State | Discrepancies & Gaps |
|---|-------|-----------|------------------|---------------|----------------------|
| 25 | `/vendor` | `app/vendor/page.tsx` | Vendor dashboard with interactive revenue calculator slider, sales KPIs, order fulfillment queue | Fully implemented (418 lines), `<VendorAuthGuard>`, slider calculating 92% payout vs 8% fee, pending order shortcuts | Uses physical classes; requires vendor session cookie. |
| 26 | `/vendor/catalog` | `app/vendor/catalog/page.tsx` | Product studio table, active/critical stock/suspended filters, quick edit modal | Fully implemented (632 lines), search, status filters, inventory update modal | Table header uses `text-right` instead of `text-start`. Search uses `pr-10` and `absolute right-3.5`. |
| 27 | `/vendor/catalog/add` | `app/vendor/catalog/add/page.tsx` | Product studio with auto-profit calculator deducting 15% ZATCA and commission | Fully implemented (188 lines), live math for customer price vs net payout | Drag-and-drop image upload is a simulated UI file button. |
| 28 | `/vendor/orders` | `app/vendor/orders/page.tsx` | Fulfillment queue with SPL / SMSA waybill print dialog | Fully implemented (258 lines), status updater, waybill dialog with `window.print()` | Dialog content uses `text-right` and `text-left`. |
| 29 | `/vendor/financials` | `app/vendor/financials/page.tsx` | SAMA Escrow ledger, instant IBAN payout request modal, ZATCA tax report XML download | Fully implemented (213 lines), payout request modal with balance validation, XML download toast | Transactions table uses `text-right`. |
| 30 | `/vendor/settings` | `app/vendor/settings/page.tsx` | Store configuration, bio, operational hours, 2h express shipping toggle | Fully implemented (115 lines), form inputs with Sonner toast feedback | None. |
| 31 | `/vendor/register` | `app/vendor/register/page.tsx` | 8-step KYB wizard (CR 10 digits, Tax ID 15 digits, Saudi IBAN `SA*`, warehouse address, agreement) | Fully implemented (478 lines), 8 sequential steps with validation per step | Uses `text-right`, `ml-1.5`. |

---

### C. Enterprise Admin Center

| # | Route | File Path | Spec Requirement | Current State | Discrepancies & Gaps |
|---|-------|-----------|------------------|---------------|----------------------|
| 32 | `/admin/layout.tsx` | `app/admin/layout.tsx` | Persistent admin layout with `<AdminSidebar>`, `<AdminHeader>`, `<AdminAuthGuard>` | Fully implemented (31 lines), dark sidebar, sticky header | None. |
| 33 | `/admin` | `app/admin/page.tsx` | Executive GMV dashboard, regional sales distribution, pending operational alerts | Fully implemented (378 lines), animated KPI counters, regional progress bars, alert shortcuts | None. |
| 34 | `/admin/products` | `app/admin/products/page.tsx` | Catalog moderation queue (Approve / Reject with notes, certificate inspection) | Fully implemented (494 lines), rejection reason dialog, certificate viewer, diff inspection | Table uses `text-right`, search uses `pr-10` and `right-3.5`, icons use `ml-1`. |
| 35 | `/admin/orders` | `app/admin/orders/page.tsx` | Global logistics tracking, dispute resolution panel, SAMA Escrow release/hold | Fully implemented (443 lines), dispute reason modal, escrow status toggle, carrier tracking | Table uses `text-right`, search uses `pr-10` and `right-3.5`, icons use `ml-1`. |
| 36 | `/admin/vendors` | `app/admin/vendors/page.tsx` | KYB verification vault, dynamic commission rate slider, account suspend/activate | Fully implemented (485 lines), document inspection modal, commission slider, status toggles | Table uses `text-right`, search uses `pr-10` and `right-3.5`, icons use `ml-1`. |
| 37 | `/admin/customers` | `app/admin/customers/page.tsx` | CRM customer segmentation (VIP, Corporate, Individual), wallet balance adjustment | Fully implemented (346 lines), wallet credit adjustment modal, customer details | Table uses `text-right`, search uses `pr-10` and `right-3.5`, icons use `ml-1`. |
| 38 | `/admin/categories` | `app/admin/categories/page.tsx` | Taxonomy tree builder for parent & subcategories, commission & VAT rates | Fully implemented (329 lines), collapsible taxonomy cards, add category modal | None. |
| 39 | `/admin/marketing` | `app/admin/marketing/page.tsx` | Platform coupon engine, flash sale scheduler, clip-to-copy codes | Fully implemented (385 lines), add coupon dialog, flash sale toggle, usages tracking | Table uses `text-right`, icons use `ml-1.5`. |
| 40 | `/admin/finance` | `app/admin/finance/page.tsx` | ZATCA Phase-2 tax reconciliation, batch payout execution via SARIE | Fully implemented (312 lines), batch release modal, tax XML download | Table uses `text-right`, icons use `ml-1.5`. |
| 41 | `/admin/settings` | `app/admin/settings/page.tsx` | RBAC staff management, payment gateway toggles, carrier toggles | Fully implemented (346 lines), gateway toggles (Mada, Apple Pay, Tamara, Tabby), add staff modal | Table uses `text-right`, icons use `ml-1.5`. |

---

## 3. CSS Logical Properties Audit (Strict RTL/LTR Compliance)

The project specification dictates:
> **CRITICAL:** You must exclusively use CSS Logical Properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, `border-s-*`). Do NOT use physical directional classes (like `ml-` or `pr-`) to ensure perfect RTL/LTR flipping.

### Complete Census of Forbidden Physical Classes

A targeted scan across all `.tsx`, `.ts`, and `.css` files identified **59 violations**:

#### 1. Physical Left/Right Margins (`ml-*` / `mr-*`) — 32 instances
All 32 instances are `ml-1` or `ml-1.5` on Lucide icons, which push the icon away from the physical left rather than the logical start or end:
- `app/admin/vendors/page.tsx`: Lines 284, 290, 296, 310 (`ml-1`)
- `app/admin/products/page.tsx`: Lines 203, 321, 333, 343 (`ml-1`)
- `app/admin/orders/page.tsx`: Lines 321, 327, 333, 353, 364 (`ml-1`)
- `app/admin/customers/page.tsx`: Lines 225, 262 (`ml-1`)
- `app/admin/categories/page.tsx`: Line 169 (`ml-1.5`)
- `app/admin/marketing/page.tsx`: Lines 152, 162, 272 (`ml-1`, `ml-1.5`)
- `app/admin/finance/page.tsx`: Lines 125, 136, 224, 229 (`ml-1`, `ml-1.5`)
- `app/admin/settings/page.tsx`: Lines 121, 231 (`ml-1.5`)
- `app/vendor/catalog/page.tsx`: Lines 245, 255, 491, 497, 503 (`ml-1`, `ml-1.5`)
- `app/vendor/register/page.tsx`: Line 454 (`ml-1.5`)
- `app/orders/[id]/tracking/page.tsx`: Line 168 (`ml-1.5`)
*Remedy:* Replace with `ms-1` or `me-1` (logical margin start/end) or use flex `gap-1.5`.

#### 2. Physical Left/Right Paddings (`pl-*` / `pr-*`) — 7 instances
- `app/admin/vendors/page.tsx`: Line 206 (`pr-10`)
- `app/admin/products/page.tsx`: Line 218 (`pr-10`)
- `app/admin/orders/page.tsx`: Line 226 (`pr-10`)
- `app/admin/customers/page.tsx`: Line 166 (`pr-10`)
- `app/vendor/catalog/page.tsx`: Line 322 (`pr-10`)
- `app/orders/[id]/tracking/page.tsx`: Line 97 (`pr-6`), Line 114 (`pr-3`)
*Remedy:* Replace `pr-10` with `pe-10` (padding-end for search inputs), and `pr-6` / `pr-3` with `pe-6` / `ps-6`.

#### 3. Physical Absolute Positioning (`left-*` / `right-*`) — 12 instances
- `app/admin/vendors/page.tsx`: Line 201 (`right-3.5`)
- `app/admin/products/page.tsx`: Line 213 (`right-3.5`)
- `app/admin/orders/page.tsx`: Line 221 (`right-3.5`)
- `app/admin/customers/page.tsx`: Line 161 (`right-3.5`)
- `app/vendor/catalog/page.tsx`: Line 317 (`right-3.5`)
- `app/magazine/page.tsx`: Line 114 (`top-3 right-3`)
- `app/orders/[id]/tracking/page.tsx`: Line 97 (`before:right-2.5`), Line 102 (`-right-6`)
- `components/ui/dialog.tsx`: Line 43 (`left-4`)
- `components/ui/sheet.tsx`: Line 37 (`left-0`, `slide-in-from-left`), Line 39 (`right-0`, `slide-in-from-right`)
*Remedy:* Replace `right-3.5` on search icon with `end-3.5`; replace `left-4` on close button with `start-4`; replace `right-3` with `end-3`.

#### 4. Physical Text Alignment (`text-left` / `text-right`) — 18 instances
- `app/admin/customers/page.tsx`: Line 195 (`text-right`), Line 291 (`text-left`)
- `app/admin/vendors/page.tsx`: Line 235 (`text-right`)
- `app/admin/products/page.tsx`: Line 252 (`text-right`)
- `app/admin/orders/page.tsx`: Line 256 (`text-right`)
- `app/admin/marketing/page.tsx`: Line 210 (`text-right`)
- `app/admin/finance/page.tsx`: Line 185 (`text-right`)
- `app/admin/settings/page.tsx`: Line 237 (`text-right`)
- `app/vendor/orders/page.tsx`: Line 135 (`text-right`), Line 199 (`text-right`), Line 218 (`text-left`), Line 234 (`text-left`)
- `app/vendor/catalog/page.tsx`: Line 396 (`text-right`)
- `app/vendor/financials/page.tsx`: Line 124 (`text-right`), Line 157 (`text-right`)
- `app/vendor/register/page.tsx`: Line 220 (`text-right`), Line 342 (`text-right`)
- `app/orders/[id]/confirmation/page.tsx`: Line 80 (`text-right`)
*Remedy:* Replace `text-right` with `text-start` and `text-left` with `text-end`.

#### 5. Physical Borders and Spacing in UI Primitives — 4 instances
- `components/ui/sheet.tsx`: Line 37 (`border-r`), Line 39 (`border-l`), Line 93 (`sm:space-x-2`)
- `components/ui/dialog.tsx`: Line 72 (`sm:space-x-2`)
*Remedy:* Replace `border-r`/`border-l` with `border-e`/`border-s`; replace `space-x-2` with `gap-2`.

#### 6. CSS Specificity Override in `globals.css`
In `app/globals.css`:
```css
html, body {
  margin: 0;
  padding: 0;
  font-family: 'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--background);
  color: var(--foreground);
  direction: rtl; /* <-- OVERRIDES html[dir="ltr"]! */
  overflow-x: hidden;
}
```
Because `html, body { direction: rtl; }` has tag selector specificity, even when `LanguageContext` sets `document.documentElement.dir = "ltr"`, the CSS `direction: rtl` property forces the layout to remain RTL.  
*Remedy:* Remove `direction: rtl;` from `html, body` and declare:
```css
:root {
  direction: inherit;
}
html[dir="rtl"] {
  direction: rtl;
}
html[dir="ltr"] {
  direction: ltr;
}
```

---

## 4. Localization & Bilingual Architecture Audit

### Current `LanguageContext.tsx` Implementation
- Path: `d:\SOUQ\context\LanguageContext.tsx`
- State:
  ```ts
  export type Language = "ar" | "en";
  export type Direction = "rtl" | "ltr";
  ```
- Dictionary: Contains only **25 keys** (`home`, `catalog`, `categories`, `deals`, `magazine`, `cart`, `wishlist`, `account`, `vendor_portal`, `admin_center`, `search_placeholder`, `sar`, `currency`, `add_to_cart`, `buy_now`, `quick_view`, `checkout`, `approve`, `reject`, `save`, `cancel`, `zatca_verified`, `sama_escrow`, `spl_express`).
- Storage: Saves preference to `localStorage.getItem("souq_lang")`.
- Side Effect: Sets `document.documentElement.dir` and `lang`.

### Architectural Flaws Discovered:
1. **Total Orphan Status:** Grep search for `useLanguage` across the codebase revealed that **not a single component or page imports or calls `useLanguage()`**.
2. **Missing Toggle in Header:** `StorefrontHeader.tsx` includes an currency dropdown (SAR, AED, USD) inside the top ribbon, but does **not include a language switcher** button (AR/EN) to invoke `toggleLanguage()`.
3. **Hardcoded Text:** All 38 page routes contain 100% hardcoded Arabic strings in JSX. Switching language does not change navigation links, product card labels, table headers, buttons, or form placeholders.
4. **Directional Arrow Inversions:** Multiple back-buttons use `ArrowLeft` or `ChevronLeft` hardcoded as JSX icons (`<ChevronLeft className="w-3.5 h-3.5" />`). In RTL, a chevron pointing left represents progression forward ("continue"), but in LTR it represents progression backward. Directional icons must use conditional flipping or logical rotation classes (`rtl:rotate-0 ltr:rotate-180`).

---

## 5. Component & Interaction Completeness

### UI Components Library (`components/ui/`)
- Built on `@radix-ui/react-*` and Tailwind CSS.
- Primitives inspected: `accordion.tsx`, `avatar.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `input.tsx`, `sheet.tsx`, `skeleton.tsx`, `slider.tsx`, `tabs.tsx`, `textarea.tsx`, `tooltip.tsx`, `motion-primitives.tsx`.
- Findings:
  - `sheet.tsx`: Only defines `side: "left" | "right" | "top" | "bottom"`. It lacks logical `side: "start" | "end"`.
  - `CartDrawer.tsx`: Uses `<SheetContent side="left">`. In RTL, physical left is the logical "end" (slide from left side of viewport). But if the user switches to English (LTR), the drawer slides from physical left, which is logical "start" (the left side), violating the requirement for the cart sheet to slide from the "end".
  - `dialog.tsx`: Uses `left-4` for the close button.

### Dead Links & Actions Audit
- **Dead Links (`href="#"`, `javascript:void(0)`):** **0 found**. Every link targets a real page path (`/`, `/catalog`, `/deals`, `/account`, `/admin/*`, etc.).
- **Button Handlers:** All forms have `onSubmit` handlers wired to React state or Sonner toasts (e.g. `notify.zatca()`, `toast.success()`).
- **Interactive Modals:**
  - `ProductQuickViewModal.tsx`: Image carousel, variant selector, quantity counter, VIP engraving input, "Add to Cart" with Sonner toast.
  - `AdminProductsModerationPage`: Approval with toast, rejection dialog with reason textarea.
  - `AdminVendorsPage`: Document inspection vault, commission slider.
  - `AdminOrdersPage`: Dispute resolution dialog with Escrow release.
  - `AdminCustomersCRMPage`: Wallet credit adjustment modal.
  - `VendorOrdersPage`: SPL/SMSA Waybill print dialog using `window.print()`.
  - `VendorFinancialsPage`: Instant IBAN payout request modal.

### State Persistence (`CartContext.tsx`)
- Current state initializes with a static 3-item array:
  - Sony WH-1000XM5 (SAR 1,399)
  - Ninja DualZone Airfryer (SAR 799)
  - Stanley Quencher Tumbler (SAR 219)
- Wishlist initializes with 2 item IDs.
- **Flaw:** Neither `cart` nor `wishlist` is persisted to `localStorage`. Refreshing any page restores the default 3 items and resets any added items.

---

## 6. Build & Dependency Critical Observations

### Syntax Error in `package.json`
Lines 12–19 of `d:\SOUQ\package.json` contain duplicate script keys and a missing comma:
```json
10:     "start": "next start",
11:     "postinstall": "node fix-magic-string.js",
12:     "test": "node -e \"process.env.NODE_OPTIONS='--experimental-require-module'; require('child_process').spawnSync('npx', ['vitest', 'run'], { stdio: 'inherit', shell: true })\""
13:     "dev": "next dev",
14:     "build": "next build --webpack",
15:     "start": "next start",
16:     "lint": "eslint",
17:     "test": "node -e \"process.env.NODE_OPTIONS='--experimental-require-module'; require('child_process').spawnSync('npx', ['vitest', 'run'], { stdio: 'inherit', shell: true })\"",
18:     "postinstall": "node fix-magic-string.js"
```
**Impact:** `esbuild` and `vitest` fail immediately on launch with:
`Expected "," in JSON but found "\"dev\"" (package.json:13:4)`.
This must be resolved by cleaning up the duplicate keys and ensuring valid JSON.

---

## 7. Actionable Recommendations for Implementation Phase

### Priority 1: High-Impact Blockers
1. **Fix `package.json` JSON Syntax:** Remove duplicate script keys and restore comma formatting so build and test suites run.
2. **Fix `globals.css` RTL Specificity:** Remove `direction: rtl` on `html, body` and bind direction to `html[dir="rtl"]` / `html[dir="ltr"]`.

### Priority 2: CSS Logical Properties Refactoring
3. **Replace all 32 `ml-1` / `ml-1.5` classes** with `ms-1` or `me-1`.
4. **Replace all 7 `pr-*` classes** with `pe-10` / `ps-*`.
5. **Replace all 18 `text-right` and `text-left` classes** with `text-start` and `text-end`.
6. **Replace absolute `right-3.5` and `left-4`** with `end-3.5` and `start-4`.
7. **Add logical `side="start" | "end"` to `components/ui/sheet.tsx`** and update `CartDrawer.tsx` to `side="end"`.

### Priority 3: Localization & Translation Integration
8. **Wire AR/EN Language Switcher in `StorefrontHeader.tsx`:** Add a prominent localized button invoking `toggleLanguage()` next to the currency dropdown.
9. **Expand `translations` in `LanguageContext.tsx`:** Expand dictionary to include global header links, footer sections, common CTAs, and page titles.
10. **Directional Icon Flipping:** Wrap `ChevronLeft` and `ArrowLeft` in `rtl:rotate-0 ltr:rotate-180` where they represent forward progression.

### Priority 4: Specification Gap Remediation
11. **Expand `/account` Tabs from 5 to 13:** Implement the full 13-view control center specified in `stru.md`.
12. **Update `/checkout` to 5 Steps:** Explicitly separate National Address verification and Delivery Speed into distinct sequential steps.
13. **Group Cart Items by Vendor in `/cart`:** Partition cart array by `item.vendor` so each vendor has a distinct order sub-card with shipping subtotal.
14. **Persist Cart & Wishlist to `localStorage`:** In `CartContext.tsx`, load initial state from `localStorage` and persist updates.
