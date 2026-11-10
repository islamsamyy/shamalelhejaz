# Sovereign Luxury UI & UX Design Specification

## Overview
Elevate the **Souq Saudiya / Shamal Al-Hijaz** marketplace to an elite, luxury tier ("unlimited UX") with fluid micro-interactions, spring animations, and accessible component primitives using **shadcn/ui**, **Radix UI**, and **Framer Motion** across all customer storefront, vendor marketplace, and admin command screens.

---

## 1. Intent & The Why
The marketplace features high-value royal assets (heritage oud, bespoke bishts, haute horlogerie, artisanal falconry, Neom smart tech). The visual design is already deeply grounded in Saudi sovereign identity, but currently uses mostly static markup from the initial Stitch generation. Adding motion physics, interactive Radix dialogs, tactile drawers, feedback toasts, and animated tabs gives the platform the sensory polish of a world-class luxury boutique (e.g., Harrods, Farfetch, Moyasar).

---

## 2. Goals & Non-Goals

### Goals
1. **Framer Motion Micro-Interaction System**:
   - Reusable motion primitives (`FadeIn`, `ScaleIn`, `StaggerContainer`, `MagneticButton`, `AnimatedCard`).
   - Smooth entrance reveals on page load, hover lifts on product cards (`y: -6px`), springy button taps (`scale: 0.97`).
   - Ambient pulse indicators on live drops, flash VIP reservations, and real-time ZATCA verification badges.
2. **Interactive Radix UI Quick-View Dialog (`ProductQuickViewModal`)**:
   - Fast-access preview on all product cards in Storefront and Catalog.
   - High-res image carousel, variant selection (size, engraving, color), quantity selector, and instant "Add to Cart" with celebratory Sonner toast.
3. **Elevated Catalog & Filter Experience (`/catalog`)**:
   - Mobile filter drawer via Radix `Sheet`.
   - Smooth dual-handle Radix `Slider` for price filtering (SAR 0 - SAR 200,000+).
   - Radix `Accordion` for expandable category taxonomy and artisanal specifications.
4. **Luxury Product Details Experience (`/products/[id]`)**:
   - Animated Radix `Tabs` for Specifications, Royal Provenance, ZATCA Warranty, and Client Reviews.
   - Interactive VIP Custom Engraving input with live visual preview.
   - `canvas-confetti` celebration upon clicking "اقتناء فوري" (Instant Acquisition).
5. **Radix Popover & Dropdowns**:
   - User profile menu and Language/Currency switcher in `StorefrontHeader` using Radix `DropdownMenu`.
   - Radix `Tooltip` on trust badges, SAMA encryption seals, and ZATCA Phase 2 compliance badges.
6. **Enhanced Vendor & Admin Command Centers (`/vendor`, `/admin`)**:
   - Animated metric KPI cards with glowing borders and counting transitions.
   - Interactive Radix `DropdownMenu` for batch waybill printing (SMSA/Aramex) and dispute release actions.

### Non-Goals
- Altering core backend database schemas or disrupting existing API contracts.
- Disabling RTL support or altering established Saudi sovereign brand palette (`#006948`, `#c5a059`).

---

## 3. Approaches Considered

- **Approach 1: Full Sovereign Luxury Suite (Chosen)**
  - Unified motion physics using Framer Motion.
  - Deep integration of Radix UI primitives (Dialog, Sheet, Tabs, Slider, Accordion, Tooltip, DropdownMenu).
  - Tactile feedback on all user interactions (Sonner toasts, confetti, live drawers).
  - *Trade-off*: Touches multiple presentation components, but provides the transformative "unlimited" UX requested.

- **Approach 2: Surface-Level CSS Hover Tweaks Only (Rejected)**
  - Only adding CSS transitions without Radix quick views, sheets, or interactive feedback.
  - *Reason for Rejection*: Does not meet the user's explicit request for "unlimited" UX enhancement and shadcn/Radix UI integration.

---

## 4. Key Component Interfaces

### 4.1 Motion Wrappers (`components/ui/motion-primitives.tsx`)
```tsx
export function FadeIn({ children, delay, className }: { children: React.ReactNode; delay?: number; className?: string });
export function StaggerContainer({ children, className, stagger }: { children: React.ReactNode; className?: string; stagger?: number });
export function AnimatedCard({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void });
```

### 4.2 Product Quick-View Dialog (`components/ProductQuickViewModal.tsx`)
```tsx
interface QuickViewProduct {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  images?: string[];
  description: string;
  artisan: string;
}
export function ProductQuickViewModal({ product, isOpen, onClose }: { product: QuickViewProduct | null; isOpen: boolean; onClose: () => void });
```

### 4.3 Catalog Filters Sheet & Slider (`components/CatalogFilters.tsx`)
- Radix Sheet on `< 1024px` viewports.
- Dual-slider price filter with SAR formatting.
- Checkbox groups for Sovereign categories with active filter counter badge.
