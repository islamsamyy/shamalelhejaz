Antigravity Project Specification: Souq Saudiya (سوق السعودية)

1. Project Vision & Executive Summary

Souq Saudiya (سوق السعودية) is a next-generation, high-performance, multi-vendor e-commerce marketplace engineered specifically for the Kingdom of Saudi Arabia. The platform combines the editorial spatial elegance of Apple, the commercial conversion velocity of Amazon, the vibrant catalog energy of Noon, and futuristic AI-native interfaces.

The platform is designed to serve three distinct ecosystems within a single unified architecture:

Customer Storefront: A high-speed, localized, multi-category shopping experience.

Vendor Portal: A dedicated B2B operations center for independent stores, brands, and merchants to manage inventory, orders, and payouts.

Enterprise Admin Command Center: A secure SaaS management suite for platform operators to handle moderation, financials, compliance, and marketing.

2. Technical Stack & Architecture

Framework: Next.js (App Router) with React and TypeScript.

Styling & Components: Tailwind CSS combined with shadcn/ui built on Radix UI primitives.

Localization & Directionality: Full bilingual support (Arabic / English) with strict CSS Logical Properties (ms-*, me-*, start-*, end-*) to ensure seamless RTL and LTR switching.

Data Grids & Tables: TanStack Table for advanced filtering, sorting, and pagination across vendor and admin panels.

State & Forms: React Hook Form + Zod for robust client-side validation.

Icons & Animation: lucide-react with directional auto-flipping and Framer Motion for micro-interactions.

3. Complete Page Inventory (Sitemap)

A. Customer Storefront & Shopping Experience

Homepage: Hero Bento showcase, AI search bar, flash deals countdown, trending categories, and featured Saudi brands.

All Categories Page: Visual taxonomy directory and subcategory matrix.

Product Listing Page (PLP): Grid/list toggle, sorting, and faceted filter sidebar (price, brand, rating, delivery).

Product Details Page (PDP): Multi-image/video gallery, variant selector, sticky buy box, and verified reviews.

Search Results Page: Intelligent query matching, autocomplete suggestions, and empty-state recovery.

Shopping Cart Page: Vendor-grouped items, quantity controls, coupon application, and tax breakdown.

5-Step Checkout Flow: National Address (SPL) form, delivery options, payment methods (Mada, Apple Pay, Tabby, Tamara, COD), and order review.

Order Confirmation Page: Success animation, order number, ZATCA QR invoice download, and tracking link.

Authentication Suite: Login, register, password reset, OTP verification, and social login.

Customer Account Dashboard: 13-view control center (overview, orders, tracking, wishlist, addresses, wallet, and settings).

Order Tracking Page: 6-stage visual timeline (placed, confirmed, processing, shipped, out for delivery, delivered).

Wishlist Page: Saved items with price drop alerts and stock status.

Returns & Refunds Portal: Self-service return request form, photo upload, and refund method selection.

Brand Store Page: Custom banner, brand crest, and filtered catalog.

Deals & Offers Hub: Flash sales, daily deals, and clip-to-claim coupons.

Static & Trust Pages: About Us, Contact Us, Help Center, FAQ, Shipping & Return Policies, Privacy Policy (PDPL), and Terms.

Blog & Editorial Hub ("Souq Magazine"): Buying guides, tech reviews, and shoppable articles.

B. Vendor Marketplace System (B2B Portal)

Seller Landing Page: Value proposition, revenue calculator, and onboarding CTA.

8-Step KYB Registration Wizard: Account details, business info, Commercial Registration (CR), ZATCA VAT number, and Saudi IBAN verification.

Vendor Command Dashboard: Real-time sales KPIs, order queues, and low-stock alerts.

Product Catalog Management: TanStack table and product studio with variant and bulk upload support.

Order & Fulfillment Center: Waybill generation, carrier dispatch (SMSA/SPL), and return handling.

Financial Dashboard: Earnings ledger, pending escrow, and payout request modal.

Store Settings: Branding, custom shipping policies, and operational hours.

C. Enterprise Admin Command Center

Executive Overview: GMV, net revenue, active vendors, geographic sales heatmap, and alerts.

Master Catalog Moderation: Product approval/rejection queue with diff views.

Global Order Operations: Cross-vendor order tracking and dispute resolution.

Vendor KYB Verification: Document inspection vault, commission overrides, and account status controls.

Customer CRM & Segmentation: RFM tagging, wallet adjustments, and support histories.

Taxonomy & Brand Management: Drag-and-drop category tree and attribute schema builder.

Marketing & Promotions: Flash sale scheduler, global coupon rules, and push notification composer.

Financials & ZATCA Reconciliation: Escrow ledger, payout batching, and tax reports.

CMS & Layout Builder: Homepage banner scheduler and static page editor.

Analytics & BI: Conversion funnels, cohort retention, and report exports.

System Settings & RBAC: Role permissions, payment gateway toggles, and immutable audit logs.

4. Saudi Market Compliance & Localization

Address Integration: Saudi Post (SPL) Short Address and National Address validation fields.

Financial Compliance: ZATCA Phase-2 e-invoicing standards, 15% VAT calculation badges, and local payment methods (Mada, STC Pay, Apple Pay, Tabby, Tamara).

Business Verification: Mandatory checks for 10-digit Commercial Registration (CR), 15-digit Tax IDs, and Maroof IDs.