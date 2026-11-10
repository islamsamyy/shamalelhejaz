# Sovereign Luxury UI & UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the marketplace UI and UX into an elite luxury tier with fluid Framer Motion animations, Radix UI dialogs, drawers, tabs, and interactive Sonner toasts.

**Architecture:** Build a unified client-side motion primitive layer and integrate Radix UI primitives (Dialog, Sheet, Tabs, Slider, DropdownMenu, Tooltip) into the existing 14 Next.js routes, enhancing customer, vendor, and admin experiences with tactile luxury feedback.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion v14, Radix UI (`@radix-ui/react-*`), Sonner, Canvas-Confetti, Lucide React.

**Spec:** `docs/superpowers/specs/2026-11-09-sovereign-luxury-ui-ux-design.md`

## Global Constraints
- Must maintain 100% RTL Arabic alignment (`dir="rtl"`) and `IBM Plex Sans Arabic` typography.
- Must preserve sovereign color palette (`#006948`, `#c5a059`, `#0f172a`, `#f8fafc`).
- Must pass `npm run build` without TypeScript errors.

## Review Focus
1. Mobile viewport filter toggle opens smooth Radix Sheet drawer without page horizontal scroll.
2. Quick-view modal opens cleanly with image gallery, quantity selector, and adds to cart with feedback toast.
3. Price range dual slider smoothly filters products between SAR 0 and SAR 200,000+.
4. Instant order button on PDP and Checkout triggers celebratory confetti without blocking navigation.
5. Vendor and Admin dashboards render animated KPI metrics with live hover states.

---

### Task 1: Motion Primitives & Feedback System
**Files:**
- Create: `components/ui/motion-primitives.tsx`
- Create: `lib/notify.ts`
- Modify: `app/globals.css`

**Interfaces:**
- Produces: `FadeIn`, `ScaleIn`, `StaggerContainer`, `AnimatedCard`, `MagneticButton` from `motion-primitives.tsx`.
- Produces: `notify.success()`, `notify.luxury()`, `notify.zatca()` from `lib/notify.ts`.

- [ ] **Step 1: Write `components/ui/motion-primitives.tsx` with Framer Motion variants and wrappers**
- [ ] **Step 2: Create `lib/notify.ts` with custom themed Sonner toasts (emerald & gold accents)**
- [ ] **Step 3: Update `app/globals.css` with luxury shimmer and keyframe classes**
- [ ] **Step 4: Verify build/compile passes**

---

### Task 2: Radix UI Product Quick-View Modal
**Files:**
- Create: `components/ProductQuickViewModal.tsx`
- Test: Manual check via browser / test component

**Interfaces:**
- Consumes: `@radix-ui/react-dialog`, `CartContext`, `framer-motion`, `lucide-react`, `lib/notify`.
- Produces: `<ProductQuickViewModal product={...} isOpen={...} onClose={...} />`.

- [ ] **Step 1: Create `ProductQuickViewModal.tsx` with high-res photo gallery, thumbnail carousel, and size/engraving selector**
- [ ] **Step 2: Add quantity increment/decrement with stock limit indicators**
- [ ] **Step 3: Connect Add to Cart with sensory Sonner toast and smooth modal exit**
- [ ] **Step 4: Verify build/compile passes**

---

### Task 3: Storefront & Navigation Luxury Overhaul
**Files:**
- Modify: `components/StorefrontHeader.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `motion-primitives`, `ProductQuickViewModal`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tooltip`.

- [ ] **Step 1: Upgrade `StorefrontHeader.tsx` with Radix DropdownMenu for profile & currency, animated cart badge counter, and glassmorphic blur on scroll**
- [ ] **Step 2: Add Staggered entrance animations and countdown flip-card physics to Hero in `app/page.tsx`**
- [ ] **Step 3: Add Quick View modal triggers and hover lift effects to all 8 featured products on Home**
- [ ] **Step 4: Verify compilation and interactive state**

---

### Task 4: Intelligent Discovery & Catalog Enhancements
**Files:**
- Create: `components/CatalogFilters.tsx`
- Modify: `app/catalog/page.tsx`

**Interfaces:**
- Consumes: `@radix-ui/react-sheet`, `@radix-ui/react-slider`, `@radix-ui/react-accordion`, `ProductQuickViewModal`.

- [ ] **Step 1: Build `CatalogFilters.tsx` with Radix dual-slider price picker and expandable Accordion categories**
- [ ] **Step 2: Integrate mobile Radix Sheet drawer for filter access on small viewports**
- [ ] **Step 3: Update `app/catalog/page.tsx` with quick view modal on product cards, animated view mode toggle (grid/list), and live active tag pills**
- [ ] **Step 4: Verify catalog filtering and UI response**

---

### Task 5: Luxury PDP & Checkout Celebrations
**Files:**
- Modify: `app/products/[id]/page.tsx`
- Modify: `app/checkout/page.tsx`

**Interfaces:**
- Consumes: `@radix-ui/react-tabs`, `canvas-confetti`, `lib/notify`, `framer-motion`.

- [ ] **Step 1: Upgrade PDP (`app/products/[id]/page.tsx`) with animated Radix Tabs for Specifications, Royal Provenance, and ZATCA Warranty**
- [ ] **Step 2: Add interactive VIP Engraving customizer with live text preview on PDP**
- [ ] **Step 3: Add `canvas-confetti` fireworks burst and celebratory Sonner toast upon instant purchase**
- [ ] **Step 4: Enhance Checkout (`app/checkout/page.tsx`) with animated multi-step progress bar and secure SAMA payment badge pulses**

---

### Task 6: Vendor & Admin Executive Command Centers
**Files:**
- Modify: `app/vendor/page.tsx`
- Modify: `app/admin/page.tsx`

**Interfaces:**
- Consumes: `motion-primitives`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tabs`.

- [ ] **Step 1: Add animated entrance and hover glow to KPI stat cards in Vendor Hub (`app/vendor/page.tsx`)**
- [ ] **Step 2: Add Radix DropdownMenu for bulk shipment waybill actions (SMSA/Aramex) and quick status toggles**
- [ ] **Step 3: Add animated sovereign monitoring indicators and live alert ticker to Admin Command Center (`app/admin/page.tsx`)**

---

### Task 7: Full System Verification & Quality Gate
**Files:**
- Test all 14 routes
- Run: `npm run build`

- [ ] **Step 1: Execute `npm run build` and ensure clean compilation with 0 TypeScript errors**
- [ ] **Step 2: Test all 14 routes over HTTP to confirm 200 OK status codes and verify interactive features**
- [ ] **Step 3: Verify floating PlatformNavigator remains functional across all views**
