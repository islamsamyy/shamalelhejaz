# Antigravity Multi-Vendor Marketplace Specification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the full architectural and page inventory specifications outlined in `souq/antigravity_project_specification.md`, expanding the platform with dedicated enterprise admin sub-routes, vendor product studio inventory, bilingual RTL/LTR logical localization, advanced data tables, and analytics.

**Architecture:** Extend the existing Next.js 15+ App Router architecture by establishing a dedicated Enterprise Admin layout and sub-route suite (`/admin/*`), a unified Vendor Portal workspace with Product Studio catalog management (`/vendor/catalog`), a global `LanguageContext` for seamless Arabic/English switching with CSS logical properties, and Radix UI + Zod + Recharts integrations across all 31+ pages.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4 with CSS Logical Properties, `shadcn/ui` & Radix UI primitives, Recharts, TanStack Table, React Hook Form, Zod, Framer Motion, and Sonner.

**Spec:** `d:\SOUQ\souq\antigravity_project_specification.md`

## Global Constraints
- Next.js 15+ (currently 16.4.5 Turbopack) with React 19 and TypeScript.
- Tailwind CSS v4 using CSS Logical Properties (`ms-*`, `me-*`, `start-*`, `end-*`) for native RTL/LTR bidirectional layout flipping.
- Strict reuse of `shadcn/ui` components (Button, Badge, Card, Dialog, Sheet, Tabs, DropdownMenu, Slider, Accordion, Avatar, Tooltip).
- Zero broken buttons or links (`javascript:void(0)` forbidden; all actions wired to state or modal/toast handlers).
- Zero TypeScript and ESLint errors (`npm run build` and `npm run lint` must pass with exit code 0).

## Review Focus
1. **Admin Navigation Consistency:** Ensure the admin sidebar/layout cleanly links all 9 enterprise admin sub-routes with active status indicators and breadcrumbs.
2. **Localization Bidirectional Flow:** Verify that toggling between Arabic (RTL) and English (LTR) flips alignments and logical spacing without UI distortion.
3. **Vendor Product Studio Operations:** Ensure `/vendor/catalog` supports filtering, status toggling, search, and smooth routing to `/vendor/catalog/add`.
4. **Interactive Action Feedback:** Ensure every administrative moderation button (Approve, Reject, Suspend, Escrow Release, Role change) triggers an immediate Sonner notification and state update.
5. **Data Visualization Rendering:** Ensure Recharts or chart visualizers render reliably in client components without hydration mismatches or layout shift.

---

### Task 1: Localization-First Bilingual Context & Direction Switcher
**Files:**
- Create: `d:/SOUQ/souq/context/LanguageContext.tsx`
- Modify: `d:/SOUQ/souq/app/layout.tsx`
- Modify: `d:/SOUQ/souq/components/StorefrontHeader.tsx`
- Modify: `d:/SOUQ/souq/components/PlatformNavigator.tsx`

**Interfaces:**
- Produces: `useLanguage(): { language: 'ar' | 'en', direction: 'rtl' | 'ltr', t: (key: string) => string, toggleLanguage: () => void }`
- Consumes: React Context, LocalStorage

- [x] **Step 1: Create `LanguageContext.tsx`** with bilingual dictionary (Arabic / English) for common terms (Cart, Search, Wishlist, Admin, Vendor, Currency SAR/ر.س, etc.) and auto-binding of `document.documentElement.dir` and `lang`.
- [x] **Step 2: Wrap `app/layout.tsx`** with `LanguageProvider`.
- [x] **Step 3: Add Language Toggle Button (AR / EN)** in `StorefrontHeader.tsx` and in `PlatformNavigator.tsx`.
- [x] **Step 4: Verify language toggling** works dynamically without page reload.

---

### Task 2: Vendor Portal Unified Workspace & Main Product Studio Catalog (`/vendor/catalog`)
**Files:**
- Create: `d:/SOUQ/souq/components/vendor/VendorNav.tsx`
- Create: `d:/SOUQ/souq/app/vendor/catalog/page.tsx`
- Modify: `d:/SOUQ/souq/app/vendor/page.tsx`
- Modify: `d:/SOUQ/souq/app/vendor/orders/page.tsx`
- Modify: `d:/SOUQ/souq/app/vendor/financials/page.tsx`
- Modify: `d:/SOUQ/souq/app/vendor/settings/page.tsx`
- Modify: `d:/SOUQ/souq/app/vendor/catalog/add/page.tsx`

**Interfaces:**
- Produces: `VendorNav` component with active route indicators across `/vendor`, `/vendor/catalog`, `/vendor/orders`, `/vendor/financials`, `/vendor/settings`.
- Produces: `/vendor/catalog` page displaying the merchant's live inventory grid/table with search, status filter (Active, Low Stock, Pending Moderation), SKU quick edit, and "Add New Product" CTA.

- [x] **Step 1: Create `components/vendor/VendorNav.tsx`** featuring tabs for all 6 merchant areas, store rating badge, and quick "View Storefront" link.
- [x] **Step 2: Create `app/vendor/catalog/page.tsx`** with inventory search, stock status badges, price editing, bulk actions, and direct links to `/products/[id]` and `/vendor/catalog/add`.
- [x] **Step 3: Embed `VendorNav`** into existing vendor pages (`/vendor`, `/vendor/orders`, `/vendor/financials`, `/vendor/settings`, `/vendor/catalog/add`).
- [x] **Step 4: Verify navigation** between all vendor sub-routes.

---

### Task 3: Enterprise Admin Center Layout & Navigation Shell
**Files:**
- Create: `d:/SOUQ/souq/components/admin/AdminSidebar.tsx`
- Create: `d:/SOUQ/souq/components/admin/AdminHeader.tsx`
- Create: `d:/SOUQ/souq/app/admin/layout.tsx`

**Interfaces:**
- Produces: Unified admin shell wrapping all `/admin/*` routes with persistent sidebar, search bar, ZATCA Phase-2 live ping indicator, notification badge, and quick switcher to storefront.

- [x] **Step 1: Create `AdminSidebar.tsx`** with links to all 9 admin modules (Executive Dashboard, Catalog Moderation, Order Operations, Vendor Management, Customer CRM, Taxonomy Builder, Marketing Engine, Platform Financials, System Settings).
- [x] **Step 2: Create `AdminHeader.tsx`** with search bar, system status badge, SAMA escrow summary, and user profile dropdown.
- [x] **Step 3: Create `app/admin/layout.tsx`** composing the sidebar and header around `{children}`.
- [x] **Step 4: Test layout rendering** across `/admin`.

---

### Task 4: Enterprise Admin Sub-Routes Implementation
**Files:**
- Create: `d:/SOUQ/souq/app/admin/products/page.tsx` (Catalog Moderation Queue)
- Create: `d:/SOUQ/souq/app/admin/orders/page.tsx` (Global Order Operations & Disputes)
- Create: `d:/SOUQ/souq/app/admin/vendors/page.tsx` (Vendor KYB Vault & Commission Tiers)
- Create: `d:/SOUQ/souq/app/admin/customers/page.tsx` (Customer CRM & Wallet Controls)
- Create: `d:/SOUQ/souq/app/admin/categories/page.tsx` (Taxonomy Builder)
- Create: `d:/SOUQ/souq/app/admin/marketing/page.tsx` (Marketing Engine & Coupon Generator)
- Create: `d:/SOUQ/souq/app/admin/finance/page.tsx` (Platform Financials & ZATCA Reconciliation)
- Create: `d:/SOUQ/souq/app/admin/settings/page.tsx` (System Settings, Gateways & RBAC)

**Interfaces:**
- Produces: 8 fully interactive administrative sub-pages with action dialogs, state updates, and Sonner feedback.

- [x] **Step 1: Implement `/admin/products/page.tsx`** with approval queue, rejection modal with notes, and ZATCA compliance check.
- [x] **Step 2: Implement `/admin/orders/page.tsx`** with all marketplace shipments, courier tracking links, and dispute resolution dialogs.
- [x] **Step 3: Implement `/admin/vendors/page.tsx`** with KYB verification inspector (CR, VAT, IBAN), commission adjustment slider, and suspend/activate buttons.
- [x] **Step 4: Implement `/admin/customers/page.tsx`** with customer segmentation table, lifetime GMV, and wallet balance injection dialog.
- [x] **Step 5: Implement `/admin/categories/page.tsx`** with hierarchical taxonomy tree, category add/edit dialog, commission %, and status toggles.
- [x] **Step 6: Implement `/admin/marketing/page.tsx`** with coupon generator (code, discount %, expiry, usage limit), flash sale scheduler, and banner controls.
- [x] **Step 7: Implement `/admin/finance/page.tsx`** with SAMA escrow reconciliation, ZATCA Phase-2 15% VAT ledger, and batch vendor payout release dialog.
- [x] **Step 8: Implement `/admin/settings/page.tsx`** with payment gateway toggles (Mada, Apple Pay, Tamara, Tabby), shipping API credentials, and RBAC matrix.

---

### Task 5: Platform Navigator & Integration Verification
**Files:**
- Modify: `d:/SOUQ/souq/components/PlatformNavigator.tsx`
- Verify: `npm run build`
- Verify: `npm run lint`

- [x] **Step 1: Update `components/PlatformNavigator.tsx`** to list all 38 routes grouped neatly into Customer Storefront, Vendor Portal, and Enterprise Admin Center.
- [x] **Step 2: Run `npm run build`** to verify all 38 routes compile cleanly without any TypeScript or Turbopack errors.
- [x] **Step 3: Run `npm run lint`** to confirm zero ESLint errors.
- [x] **Step 4: Document changes** and deliver full walkthrough to the user.

