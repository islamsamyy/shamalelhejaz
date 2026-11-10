# Antigravity Project Specification: Multi-Vendor E-commerce Platform

## 1. Executive Summary
This document outlines the architectural and functional requirements for a premium, high-performance multi-vendor e-commerce marketplace. The platform is designed to scale and provide a seamless, localized experience (including RTL/LTR bilingual support) while managing complex B2B and B2C workflows.

The system is divided into three primary ecosystems:
1. **Customer Storefront (B2C):** A highly optimized, conversion-focused shopping interface.
2. **Vendor Portal (B2B):** A self-service dashboard for merchants to manage their catalogs, orders, and financials.
3. **Enterprise Admin Center:** A centralized command center for platform operators to monitor, moderate, and configure the marketplace.

---

## 2. Technology Stack
* **Framework:** Next.js 15+ (App Router) with React 19 and TypeScript.
* **Styling:** Tailwind CSS v4 using CSS Logical Properties (`ms-*`, `me-*`, `start-*`, `end-*`) for native RTL/LTR layout flipping.
* **UI Components:** `shadcn/ui` combined with Radix UI primitives for accessible, unstyled foundational components (Dialog, Sheet, Tabs, DropdownMenu).
* **Data Visualization & Tables:** TanStack Table for complex data grids and Recharts for analytics.
* **State Management & Forms:** React Hook Form integrated with Zod for strict client-side validation.
* **Animations:** Framer Motion for micro-interactions and smooth page transitions.

---

## 3. Comprehensive Page Inventory

### A. Customer Storefront (App Router: `/app/(storefront)`)
The customer-facing application prioritizing speed, discovery, and conversion.

1. **Homepage (`/`):** Hero banners, dynamic category grids, flash deal countdowns, and personalized recommendations.
2. **Global Catalog (`/catalog`):** Unified product discovery with list/grid views.
3. **Category Hub (`/categories`):** Visual directory of all parent and sub-categories.
4. **Product Details Page (`/products/[id]`):** High-resolution image gallery, variant selection (color/size), stock urgency indicators, sticky "Add to Cart", and customer reviews.
5. **Intelligent Search (`/search`):** Search results with auto-suggestions, typo tolerance, and faceted filtering.
6. **Shopping Cart (`/cart`):** Vendor-grouped line items, promo code inputs, and real-time tax/shipping calculations.
7. **Multi-Step Checkout (`/checkout`):** Address selection (map/GPS integrated), shipping methods, and integrated payment gateways (Cards, Apple Pay, BNPL, COD).
8. **Order Confirmation (`/orders/[id]/confirmation`):** Success animations, order ID, and downloadable tax invoice.
9. **Visual Order Tracking (`/orders/[id]/tracking`):** Live delivery status timeline and courier details.
10. **Customer Dashboard (`/account`):** Central hub for order history, saved addresses, wallet balance, and profile settings.
11. **Wishlist (`/wishlist`):** Saved items for later purchase.
12. **Deals & Flash Sales (`/deals`):** Time-sensitive promotional campaigns.
13. **Brand/Store Page (`/store/[id]`):** Dedicated showcase for specific brands or verified vendors.
14. **Returns Portal (`/returns`):** Automated flow for initiating product returns and refunds.
15. **Content Pages:** About Us, Contact, FAQ, Shipping & Returns Policy, Privacy Policy, and Terms of Service.
16. **Authentication (`/auth/login`, `/auth/register`):** Secure login, registration, and OTP verification flows.

### B. Vendor Portal (App Router: `/app/(vendor)`)
The operational hub for merchants selling on the platform.

17. **Vendor Onboarding (`/vendor/register`):** Multi-step KYC/KYB wizard for business verification, tax IDs, and bank details.
18. **Vendor Dashboard (`/vendor`):** High-level metrics, pending order alerts, and sales graphs.
19. **Product Studio (`/vendor/catalog`):** Interface to add, edit, and bulk-import products with variant configurations.
20. **Order Management (`/vendor/orders`):** Order fulfillment queue, waybill generation, and status updates.
21. **Financials & Payouts (`/vendor/financials`):** Escrow balances, transaction ledger, platform commission breakdowns, and payout requests.
22. **Store Settings (`/vendor/settings`):** Store branding, business hours, and notification preferences.

### C. Enterprise Admin Center (App Router: `/app/(admin)`)
The master control panel for platform owners.

23. **Executive Dashboard (`/admin`):** Platform-wide GMV, active user metrics, and operational health checks.
24. **Catalog Moderation (`/admin/products`):** Queue for approving or rejecting new vendor products to maintain quality control.
25. **Order Operations (`/admin/orders`):** Global view of all shipments, dispute resolutions, and customer support overrides.
26. **Vendor Management (`/admin/vendors`):** Reviewing KYC documents, setting custom commission tiers, and suspending accounts.
27. **Customer CRM (`/admin/customers`):** User segmentation, support ticket history, and wallet credit management.
28. **Taxonomy Builder (`/admin/categories`):** Drag-and-drop interface for structuring marketplace categories and sub-categories.
29. **Marketing Engine (`/admin/marketing`):** Creation of platform-wide discount codes, homepage banner management, and flash sale scheduling.
30. **Platform Financials (`/admin/finance`):** Tax reporting, escrow release to vendors, and revenue reconciliation.
31. **System Settings (`/admin/settings`):** Payment gateway configurations, shipping API keys, and Role-Based Access Control (RBAC) for admin staff.

---

## 4. Key Architectural Features
* **Global Cart State:** Persistent shopping cart context using local storage and server synchronization.
* **Component Modularity:** Strict reuse of `shadcn/ui` components to maintain design consistency across all 31+ pages.
* **Localization-First:** Database schema and UI built to natively handle dual-language content (Title AR, Title EN) and dual-directional layouts without duplicate codebases.