# Project: Souq Saudiya (سوق السعودية) Production Readiness

## Architecture
Souq Saudiya is a sovereign-tier, multi-vendor e-commerce marketplace tailored for the Kingdom of Saudi Arabia.
- **Frontend Ecosystem**: Next.js 15+ (App Router) with React 19, Tailwind CSS v4 using strict CSS Logical Properties (`ms-*`, `me-*`, `ps-*`, `pe-*`), shadcn/ui & Radix UI primitives, framer-motion micro-interactions, sonner toasts.
- **Three Core Portals**:
  1. Customer Storefront (B2C): 17 routes covering discovery, search, catalog, PDP, cart, 5-step checkout, ZATCA order confirmation, visual tracking, 13-tab account center, returns, and editorial magazine.
  2. Vendor Operations (B2B): 7 routes covering real-time revenue dashboard, TanStack product inventory studio, SPL/SMSA waybill order fulfillment, SAMA escrow ledger, and 8-step KYB registration wizard.
  3. Enterprise Admin: 9 routes covering executive GMV overview, master catalog moderation queue, order disputes, vendor verification vault, customer CRM, category taxonomy builder, marketing coupon engine, and RBAC system settings.
- **Backend & Data Layer**: Next.js Route Handlers (`app/api/`), Supabase PostgreSQL database schemas & RLS policies, cryptographic session management, and Saudi regulatory integration engines.
- **Saudi Regulatory & Localization Stack**:
  1. ZATCA Phase-2 E-Invoicing: Real TLV (Tag-Length-Value) base64 QR code encoding, UBL 2.1 invoice generation, and tax-inclusive 15% VAT calculation.
  2. Saudi Address Integration: Saudi Post (SPL) National Address & Short Address format validation.
  3. Saudi Business Verification: 10-digit Commercial Registration (CR), 15-digit ZATCA Tax ID (`3...3`), and ISO 7064 Mod 97-10 Saudi IBAN validation.
  4. Payment Gateways: Mada, Apple Pay, STC Pay, Tabby, Tamara, and SAMA escrow ledger.
  5. Bilingual Localization: `LanguageContext.tsx` with instant dynamic RTL/LTR directionality switching and comprehensive AR/EN dictionaries.

## Feature Inventory
Every feature identified during the comprehensive Phase 0 survey is mapped to a milestone below.

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Package Scripts & Tooling Repair | Fix invalid JSON syntax and duplicate scripts in `package.json` to restore Vitest, ESLint, and npm scripts | M1 | survey_platform |
| 2 | Auth Login JSX Compiler Fix | Fix unclosed `<motion.div>` JSX tags in `app/auth/login/page.tsx` to unblock `tsc --noEmit` and `next build` | M1 | survey_platform |
| 3 | CI Automation Pipeline | Establish `.github/workflows/ci.yml` running lint, typecheck, and Vitest test suites on pull requests and pushes | M1 | survey_platform |
| 4 | Gitignore Configuration Fix | Ensure `.env.example` is tracked by git while `.env` and `.env.local` remain ignored | M1 | survey_platform |
| 5 | Test Harness & Baseline Unit Tests | Establish working Vitest test runner configuration and baseline tests for core utilities | M1 | survey_platform |
| 6 | Database Schema Expansion | Deploy migrations/SQL for missing tables: `invoices`, `escrow_ledger`, `vendor_payouts`, `addresses`, `rma_requests`, `shipments`, `payments` | M2 | survey_backend |
| 7 | Server-Side API Architecture | Create Next.js Route Handlers in `app/api/` for checkout, orders, invoices, and payouts | M2 | survey_backend |
| 8 | ZATCA Phase-2 E-Invoice Engine | Implement genuine TLV base64 QR code generator (Tags 1-5) and downloadable compliant tax invoices | M2 | survey_backend |
| 9 | Correct 15% VAT Arithmetic | Update `CartContext` and checkout pricing logic to properly handle tax-inclusive catalog pricing without double-taxation | M2 | survey_backend |
| 10 | Saudi Business Verification Logic | Implement rigorous validation algorithms: CR (10 digits), Tax ID (15 digits `^3\d{13}3$`), and Saudi IBAN (ISO 7064 Mod 97-10) | M2 | survey_backend |
| 11 | Saudi Post (SPL) Address Validation | Implement National Address (Building, Street, District, Postal Code, Additional Number) & Short Address validation | M2 | survey_backend |
| 12 | Payment Gateway Simulation Engine | Implement transactional payment processing state machine supporting Mada, Apple Pay, STC Pay, Tabby, and Tamara | M2 | survey_backend |
| 13 | Secure Route Middleware | Refactor `middleware.ts` to use cryptographically verified HTTP-only session tokens instead of plaintext unverified cookies | M3 | survey_platform |
| 14 | Expanded Protected Route Matchers | Protect `/admin/*`, `/vendor/*`, `/account/*`, `/checkout/*`, and `/orders/*` under appropriate role guards | M3 | survey_platform |
| 15 | Cryptographic JWT Verification | Replace unverified base64 decoder in `lib/rbac.ts` with HMAC/SHA-256 signature verification | M3 | survey_backend |
| 16 | Production Credential Sanitation | Remove hardcoded plaintext passwords from production paths and enforce secure environment variable secret handling | M3 | survey_platform |
| 17 | HTTP Security Headers | Configure CSP, HSTS, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy in `next.config.ts` | M3 | survey_platform |
| 18 | CSS Logical Properties Refactoring | Eliminate all 59 physical CSS classes (`ml-*`, `pr-*`, `right-*`, `text-right`, etc.) in favor of logical equivalents | M4 | survey_frontend |
| 19 | RTL/LTR Dynamic Flipping Fix | Remove root `direction: rtl` lock from `globals.css` and ensure dynamic layout flipping based on `dir` attribute | M4 | survey_frontend |
| 20 | Bilingual Language Switcher | Add AR/EN toggle in `StorefrontHeader`, wire `useLanguage()`, and expand localization dictionaries for key flows | M4 | survey_frontend |
| 21 | Customer Account 13-Tab Dashboard | Expand `app/account/page.tsx` from 5 tabs to all 13 specified tabs with functional views | M4 | survey_frontend |
| 22 | 5-Step Checkout Workflow | Align `app/checkout/page.tsx` with the 5-step checkout requirement (National Address, Shipping, Payment, Review, Confirmation) | M4 | survey_frontend |
| 23 | Vendor-Grouped Shopping Cart | Refactor `app/cart/page.tsx` to group line items by vendor with subtotal calculations per vendor | M4 | survey_frontend |
| 24 | Cart State LocalStorage Persistence | Add persistent `localStorage` synchronization to `CartContext.tsx` | M4 | survey_frontend |
| 25 | Next/Image Asset Optimization | Migrate all raw `<img>` tags across 13 pages to Next.js `next/image` with proper width, height, and remote domain patterns | M5 | survey_platform |
| 26 | Web Fonts Optimization | Refactor Google Fonts from render-blocking `<link>` tags in `layout.tsx` to `next/font/google` | M5 | survey_platform |
| 27 | Next.js Error & Status Boundaries | Implement `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`, and `app/loading.tsx` | M5 | survey_platform |
| 28 | Health Check & Observability | Create `/api/health` route with database connectivity ping and structured JSON health status | M5 | survey_platform |
| 29 | Comprehensive Production Documentation | Create complete production deployment guide, architecture specification, and updated `README.md` | M5 | survey_platform |
| 30 | Requirement-Driven E2E Test Suite | Design and implement opaque-box test runner covering Tiers 1-4 (>100 automated test cases) | E2E Track | e2e_architecture |
| 31 | Full E2E Test Suite Pass | Execute and verify 100% pass rate across Tiers 1-4 of the E2E test suite | M6 | final_acceptance |
| 32 | Adversarial Hardening (Tier 5) | Conduct white-box adversarial stress testing, boundary fuzzing, and coverage hardening | M6 | final_acceptance |

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | DevOps & Build Foundation | Repair `package.json`, fix login JSX compiler errors, configure Vitest, CI workflow, and `.env.example` git tracking | none | PLANNED |
| M2 | Backend, APIs & Saudi Compliance | Deploy database schemas, `app/api/` route handlers, ZATCA Phase-2 TLV QR generator, VAT logic, and business verification algorithms | M1 | PLANNED |
| M3 | Security & RBAC Hardening | Cryptographic session tokens, hardened `middleware.ts`, route gating for admin/vendor/account, security headers, and secret sanitization | M1 | PLANNED |
| M4 | Frontend UI/UX, RTL/LTR & Route Completeness | Eliminate physical CSS classes, fix RTL/LTR flipping in `globals.css`, bilingual header toggle, 13-tab account, 5-step checkout, vendor-grouped cart, and localStorage persistence | M1 | PLANNED |
| M5 | Performance, Observability & Documentation | `next/image` migration, `next/font/google`, error boundaries (`error.tsx`, `not-found.tsx`), `/api/health` endpoint, and production documentation | M1 | PLANNED |
| M6 | Final Acceptance & Adversarial Hardening | Pass 100% of E2E test suite (Tiers 1-4), followed by Tier 5 adversarial stress testing and hardening | M1, M2, M3, M4, M5, TEST_READY.md | PLANNED |

## Parallel Track: E2E Testing Track
- **Owner**: E2E Testing Orchestrator (`teamwork_orchestrator`)
- **Scope**: Requirement-driven, opaque-box test harness and test case suite covering Tiers 1-4 across all 32 inventoried features.
- **Output**: Publishes `TEST_INFRA.md` and `TEST_READY.md` upon completion.

## Interface Contracts

### 1. ZATCA Compliance Module (`lib/zatca.ts`)
- `generateZatcaQr(sellerName: string, vatNumber: string, timestamp: string, invoiceTotal: string, vatTotal: string): string`
  - Returns base64-encoded TLV string (Tag 1 = Seller Name, Tag 2 = VAT Registration Number, Tag 3 = Timestamp ISO-8601, Tag 4 = Total with VAT, Tag 5 = VAT Total).
- `calculateTaxInclusiveVat(totalAmount: number, taxRate?: number): { baseAmount: number; vatAmount: number }`
  - `baseAmount = Math.round((totalAmount / 1.15) * 100) / 100`
  - `vatAmount = Math.round((totalAmount - baseAmount) * 100) / 100`

### 2. Saudi Business Verification (`lib/saudi-validation.ts`)
- `validateCrNumber(cr: string): { valid: boolean; error?: string }`
  - Exactly 10 digits (`^\d{10}$`).
- `validateVatNumber(vat: string): { valid: boolean; error?: string }`
  - Exactly 15 digits, starting and ending with 3 (`^3\d{13}3$`).
- `validateSaudiIban(iban: string): { valid: boolean; error?: string }`
  - Format `^SA\d{22}$`, verified against ISO 7064 Mod 97-10 checksum algorithm.
- `validateNationalAddress(shortAddress: string): { valid: boolean; error?: string }`
  - Format 4 letters + 4 digits (`^[A-Z]{4}\d{4}$`).

### 3. Authentication & Session Management (`lib/session.ts` & `middleware.ts`)
- `createSessionToken(payload: { userId: string; role: 'customer' | 'vendor' | 'admin'; email: string }): Promise<string>`
  - Cryptographically signed HMAC-SHA256 JWT using `SESSION_SECRET` environment variable.
- `verifySessionToken(token: string): Promise<{ valid: boolean; payload?: any }>`
  - Cryptographic signature and expiration check.
- Cookie configuration:
  - Name: `souq_session`
  - Flags: `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`

### 4. Health Check API (`app/api/health/route.ts`)
- `GET /api/health`
- Response:
  ```json
  {
    "status": "ok" | "degraded",
    "timestamp": "ISO-8601",
    "version": "0.1.0",
    "database": "connected" | "disconnected",
    "uptime": 123.45
  }
  ```

## Code Layout
- `app/` — Next.js 15 App Router pages, layouts, and route handlers
  - `app/(storefront)/` or `app/` — Customer routes
  - `app/vendor/` — Vendor portal routes
  - `app/admin/` — Admin center routes
  - `app/api/` — Server-side Route Handlers (`health/`, `orders/`, `zatca/`, etc.)
  - `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`, `app/loading.tsx` — Status boundaries
- `components/` — Shared UI components
  - `components/ui/` — Radix primitives and shadcn/ui components
  - `components/StorefrontHeader.tsx`, `AdminSidebar.tsx`, `VendorNav.tsx`, etc.
- `context/` — React Context providers (`LanguageContext.tsx`, `CartContext.tsx`)
- `lib/` — Core business logic, validation algorithms, Supabase client, and session management
- `supabase/` — Database schema definitions, migrations, and seed scripts
- `__tests__/` — Vitest unit and integration test suites
- `e2e/` — Requirement-driven opaque-box E2E test suites (Tiers 1-4)
- `.github/workflows/` — Automated CI/CD pipeline definitions
