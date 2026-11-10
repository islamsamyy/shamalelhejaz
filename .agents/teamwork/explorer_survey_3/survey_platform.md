# Comprehensive Specification & Readiness Mining Report: Platform, DevOps, Security, Performance & Observability, and Documentation

**Target System:** Souq Saudiya (شمال الحجاز - Shamal Al-Hijaz) Multi-Vendor Marketplace  
**Author:** explorer_survey_3 (Teamwork Specification Miner)  
**Date:** 2026-11-10  
**Status:** Completed Investigation  

---

## Executive Summary

This report delivers an exhaustive, evidence-based survey of the current architecture, implementation state, and production readiness gaps across the remaining foundational pillars: **DevOps & CI/CD**, **Security**, **Performance & Observability**, and **Documentation**.

While the application features 38 rich frontend routes across three distinct portals (B2C Customer Storefront, B2B Vendor Portal, and Enterprise Admin Command Center), our systematic probe revealed several **critical blockers and high-severity security vulnerabilities** that strictly prevent production deployment:
1. **Critical Syntax Error in `package.json`**: A missing comma and duplicate script key block prevents all standard Node/npm tooling, esbuild, Vitest, and ESLint from running or building.
2. **Fatal JSX/TypeScript Syntax Errors in `app/auth/login/page.tsx`**: Unclosed `<motion.div>` tags block `tsc --noEmit` and `next build`.
3. **Severe Security & Authentication Defect**: Route protection in `middleware.ts` and client auth guards relies entirely on an unverified, easily forgeable client cookie (`souq_role=admin`), with zero server-side JWT verification, exposing the entire `/admin` and `/vendor` portals to unauthorized access.
4. **Zero CI/CD Automation**: No `.github/workflows` or automated test/build/deploy pipelines exist.
5. **Zero Modern Next.js Performance Optimization**: `next/image` is completely unused (falling back to unoptimized `<img>`), Google Fonts are imported via render-blocking `<link>` tags, and all pages run as client components with no server-side caching (`ISR`/`RSC`).
6. **Zero Error Boundaries & Telemetry**: No `error.tsx`, `global-error.tsx`, `not-found.tsx`, or `/api/health` endpoint exists.

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | DevOps | Package Scripts Engine | Unified npm scripts for development, building, linting, typechecking, testing, and postinstall patching | CLI commands (`npm run build`, `npm run dev`, `npm test`) | Executed process exit code (0 or 1) | Syntax error: Missing comma & duplicate keys crash JSON parser at pos 442 | `package.json:5-19`, `run_command` |
| 2 | DevOps | Postinstall Magic-String Patcher | Node script syncing `magic-string@0.30.17` into `@tailwindcss/node` nested dependencies | File paths in `node_modules` | Console confirmation log | Catches error and prints console warning | `fix-magic-string.js:1-19` |
| 3 | DevOps | TypeScript Typechecking Setup | Strict mode typechecking configured via `tsconfig.json` with Next.js path aliases (`@/*`) | TypeScript source files (`**/*.ts`, `**/*.tsx`) | Compilation diagnostic output (`tsc --noEmit`) | Fails on JSX syntax errors in `app/auth/login/page.tsx` | `tsconfig.json`, `run_command` |
| 4 | DevOps | ESLint Flat Config | Next.js core web vitals and typescript linting rules | ECMAScript/TS files | Lint diagnostics | Fails to start due to `package.json` invalid JSON error | `eslint.config.mjs:1-19` |
| 5 | DevOps | Vitest Node/JSDOM Test Suite | Unit & integration testing with mock WebSocket, ResizeObserver, and next/navigation polyfills | Test files in `__tests__/*.test.{ts,tsx}` | Test pass/fail reports | Fails startup due to esbuild parsing error in `package.json` | `vitest.config.mjs`, `vitest.setup.ts` |
| 6 | Security | Cookie-based Middleware Route Guard | Intercepts requests to `/admin/*` and `/vendor/*`, checking `souq_role` cookie | HTTP Request cookie header `souq_role` | `NextResponse.next()` (200) or 307 redirect to `/auth/login` | Redirects to login with query params `error=unauthorized` | `middleware.ts:1-36` |
| 7 | Security | Client Auth Guards (`AdminAuthGuard`, `VendorAuthGuard`) | React wrapper verifying client role against cookie/localStorage before mounting view | Client role from `getClientRole()` | Renders `{children}` if authorized, or 403 Forbidden screen | Shows access denied card with login redirect button | `components/admin/AdminAuthGuard.tsx`, `components/vendor/VendorAuthGuard.tsx` |
| 8 | Security | Hardcoded Test Credentials Suite | Predefined demo accounts for Admin, Vendor, and Customer with alternative credentials | Email/identifier and password string | `AuthUser` object, sets cookie and localStorage | Returns `success: false` with localized Arabic error | `lib/rbac.ts:28-150` |
| 9 | Security | Unsigned JWT Payload Decoder | Base64 decodes JWT payload to check `sub`, `exp`, and `role` claims | JWT string (`header.payload.signature`) | `{ userId, role, exp }` | Throws `AuthError` (401) on expired/malformed token | `lib/rbac.ts:188-223` |
| 10 | Security | RBAC Permission Gates (`requireRole`, `requireAdmin`, `canManageVendor`) | Multi-tenant isolation ensuring vendors only access their assigned `vendorId` | `AuthUser` object, target `vendorId` | Boolean permission flag | Throws `ForbiddenError` (403) or `AuthError` (401) | `lib/rbac.ts:228-255` |
| 11 | Performance | Client-side Language & Direction Switcher | Global `LanguageContext` managing bilingual `ar` (RTL) vs `en` (LTR) state | User language toggle / `localStorage("souq_lang")` | Sets `dir` and `lang` on `<html>`, translates keys | Falls back to Arabic ('ar') and key string | `context/LanguageContext.tsx:1-109` |
| 12 | Performance | Dynamic Currency Resolution & Conversion | Detects currency via ISO country code or cookie; converts SAR to GCC/global currencies | Country code (e.g., SA, EG, KW) and cookie | Formatted price string with localized precision | Defaults to SAR and base rate 1.0 | `lib/currency.ts:1-76` |
| 13 | Performance | In-Memory Shopping Cart State | Calculates subtotals, coupons, and ZATCA 15% VAT on cart items | Cart actions (`addToCart`, `updateQuantity`, `applyCoupon`) | Reactive cart state, drawer toggle, subtotal/total | Rejection toast on invalid coupon code | `context/CartContext.tsx:1-212` |
| 14 | Performance | Supabase Data Layer & DTO Mappers | Mappers translating snake_case DB rows (`DbProductRow`) to camelCase entities | DB query responses or fallback catalog data | Typed `Product` and `Category` entities | Graceful fallbacks for nullable fields and network errors | `lib/supabase.ts:1-334` |
| 15 | Performance | Tailored Sovereign Toast Engine | Sonner toast wrapper with Saudi luxury accents (emerald, gold, ZATCA) | Message string, optional description | Styled toast popover on client screen | Default error toast on fatal conditions | `lib/notify.ts:1-44` |
| 16 | Documentation | Multilingual Project Overview | Arabic/English README documenting vision, architecture, and getting started | Markdown file | Human-readable documentation | None | `README.md:1-103` |

---

## Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Package Scripts (`package.json`) | Invoking `npm test` or `npx vitest run` | Esbuild fails with `X [ERROR] Expected "," in JSON but found "\"dev\""` at line 13:4 due to invalid JSON syntax. |
| 2 | TypeScript Build (`tsc --noEmit`) | Invoking `npx tsc --noEmit` | Fails with fatal TS17008 & TS1381 syntax errors in `app/auth/login/page.tsx` due to unclosed `<motion.div>` tags. |
| 3 | ESLint Engine (`npx eslint app/`) | Invoking ESLint CLI | Crashes with `Error [ERR_INVALID_PACKAGE_CONFIG]: Invalid package config package.json ... Expected ',' or '}'`. |
| 4 | Middleware Route Guard (`middleware.ts`) | Request to `/admin` with forged cookie `souq_role=admin` | Request passes through with status 200 without any password, JWT, or database validation. |
| 5 | Middleware Customer Protection | Unauthenticated request to `/account` or `/checkout` | Middleware ignores these routes because matcher is only `["/admin/:path*", "/vendor/:path*"]`. Routes load freely. |
| 6 | JWT Verification (`verifyJwtToken`) | Tampered JWT with invalid signature and `role="admin"` | Function extracts payload without verifying signature; accepts fraudulent admin payload as valid. |
| 7 | Git Secret Tracking (`.gitignore`) | `git check-ignore .env.example` | Returns `.env.example` as ignored because line 34 `.env*` inadvertently excludes the example configuration file. |
| 8 | Cart Persistence (`CartContext`) | User adds 5 items to cart and refreshes page | Page reload wipes cart state and resets back to hardcoded `defaultCart` (3 items). |
| 9 | Next.js Image Optimization | Page loading image from `images.unsplash.com` via `next/image` | Would throw runtime error because `next.config.ts` only whitelists `lh3.googleusercontent.com`. |
| 10 | Route Not Found / 404 | User visits non-existent route `/invalid-url` | Displays unstyled default Next.js 404 page because custom `app/not-found.tsx` does not exist. |
| 11 | Unhandled Runtime Exception | Exception thrown during Server Component render | Crashes to generic Next.js 500 error because `app/error.tsx` and `app/global-error.tsx` do not exist. |

---

## Detailed Gap Analysis by Pillar

```
========================================================================================
                                 PILLAR 1: DEVOPS & CI/CD
========================================================================================
```

### 1.1 Package Scripts Integrity (`package.json`)
* **Observation**:
  Lines 5–19 of `package.json` contain an invalid JSON structure:
  ```json
  "scripts": {
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "build": "next build",
    "dev": "next dev",
    "start": "next start",
    "postinstall": "node fix-magic-string.js",
    "test": "node -e \"process.env.NODE_OPTIONS='--experimental-require-module'; require('child_process').spawnSync('npx', ['vitest', 'run'], { stdio: 'inherit', shell: true })\""
    "dev": "next dev",
    "build": "next build --webpack",
    "start": "next start",
    "lint": "eslint",
    "test": "node -e \"process.env.NODE_OPTIONS='--experimental-require-module'; require('child_process').spawnSync('npx', ['vitest', 'run'], { stdio: 'inherit', shell: true })\"",
    "postinstall": "node fix-magic-string.js"
  }
  ```
* **Impact**:
  - Missing comma between line 12 and 13.
  - Duplicate keys: `dev`, `build`, `start`, `lint`, `test`, `postinstall`.
  - JSON parsers reject the file: `JSON ERROR: Expected ',' or '}' after property value in JSON at position 442`.
  - Breaks all toolchains: `npm test`, `npx vitest run`, `npx eslint`, and production builds.
* **Requirements & Remediation**:
  - Deduplicate and normalize the scripts block.
  - Determine whether `--webpack` is strictly required for `next build`. If Tailwind CSS v4 and `@tailwindcss/postcss` work with Next 16 Turbopack, standard `next build` is preferred; otherwise keep `"build": "next build --webpack"`.
  - Standardize script commands:
    ```json
    "scripts": {
      "dev": "next dev",
      "build": "next build --webpack",
      "start": "next start",
      "lint": "eslint app/ components/ lib/",
      "typecheck": "tsc --noEmit",
      "test": "vitest run",
      "test:watch": "vitest",
      "postinstall": "node fix-magic-string.js"
    }
    ```

### 1.2 TypeScript Configuration & Syntax Failures
* **Observation**:
  `npx tsc --noEmit` reports 6 compiler errors in `app/auth/login/page.tsx`:
  - `app/auth/login/page.tsx(164,6): error TS17008: JSX element 'motion.div' has no corresponding closing tag.`
  - `app/auth/login/page.tsx(500,1): error TS1381: Unexpected token. Did you mean {'}'} or &rbrace;?`
  - `app/auth/login/page.tsx(503,3): error TS1109: Expression expected.`
  - `app/auth/login/page.tsx(504,6): error TS17008: JSX element 'motion.div' has no corresponding closing tag.`
  - `app/auth/login/page.tsx(528,1): error TS1381: Unexpected token. Did you mean {'}'} or &rbrace;?`
  - `app/auth/login/page.tsx(529,1): error TS1005: '</' expected.`
* **Impact**:
  - `next build` fails immediately during typecheck.
* **Requirements & Remediation**:
  - Ensure all `<motion.div>` tags in `app/auth/login/page.tsx` are correctly closed with `</motion.div>`.
  - Add pre-commit typecheck hook to prevent broken JSX from entering the codebase.

### 1.3 Vitest & Test Coverage
* **Observation**:
  - Existing suite contains only 5 test files in `__tests__/`:
    * `HomePage.test.tsx` (3 assertions)
    * `currency.test.ts` (9 assertions)
    * `rbac.test.ts` (10 assertions)
    * `routeGuards.test.ts` (9 assertions)
    * `supabase.test.ts` (11 assertions)
  - Total existing test cases: ~42.
* **Gaps**:
  - **37 of 38 routes have zero unit or integration tests**.
  - No tests for:
    * Cart calculations (ZATCA 15% VAT, coupons, multi-vendor grouping).
    * Checkout multi-step flow (National Address validation, payment method switching).
    * Vendor onboarding (8-step KYB wizard, CR/VAT/IBAN validations).
    * Admin moderation operations (product approvals/rejections, vendor suspension).
    * Language toggle & RTL directionality flipping.
* **Requirements & Remediation**:
  - Target minimum 80% test coverage for critical business logic (`lib/`, `context/`).
  - Add end-to-end integration tests using Playwright or Vitest Browser Mode for checkout, login, and vendor registration.

### 1.4 CI/CD Workflows
* **Observation**:
  - The repository has **NO `.github/workflows` folder** and no CI configuration file.
* **Requirements & Remediation**:
  - Create `.github/workflows/ci.yml` running on every Pull Request and push to `main`:
    1. Checkout code
    2. Setup Node.js 20.x with cache
    3. Install dependencies (`npm ci`)
    4. Lint check (`npm run lint`)
    5. Typecheck (`npm run typecheck`)
    6. Run unit tests (`npm test`)
    7. Execute production build test (`npm run build`)
  - Create `.github/workflows/deploy.yml` for automated Vercel preview/production deployments.

---

```
========================================================================================
                                   PILLAR 2: SECURITY
========================================================================================
```

### 2.1 Route Protection & Middleware Vulnerability (`middleware.ts`)
* **Observation**:
  `middleware.ts` inspects only an unencrypted client cookie:
  ```ts
  const role = request.cookies.get("souq_role")?.value;
  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      // redirect ...
    }
  }
  ```
* **Critical Flaws**:
  1. **Trivial Privilege Escalation**: A malicious actor can execute `document.cookie = "souq_role=admin; path=/"` in browser devtools, completely bypassing `/admin` route protection.
  2. **Unchecked Customer Sensitive Routes**: The middleware matcher only targets `["/admin/:path*", "/vendor/:path*"]`. Routes such as `/account`, `/checkout`, `/orders/:id/confirmation`, and `/returns` have **no route protection at all**. An unauthenticated visitor can access customer dashboards and checkout directly.
  3. **No Cryptographic Session Verification**: No Supabase Auth JWT (`supabase.auth.getUser()`) or secure session token is inspected or verified on the edge.
* **Requirements & Remediation**:
  - Migrate to `@supabase/ssr` middleware pattern using `createServerClient` to securely retrieve and verify the active authenticated session from encrypted cookies.
  - Expand matcher to include `/account/:path*`, `/checkout/:path*`, `/orders/:path*`.
  - Store role claims inside the verified Supabase JWT (`app_metadata.role` or `user_metadata.role`) rather than a loose client cookie.

### 2.2 Insecure RBAC & Hardcoded Test Credentials (`lib/rbac.ts`)
* **Observation**:
  - `verifyJwtToken` in `lib/rbac.ts` only decodes base64 payload strings without validating cryptographic HMAC or RSA signatures.
  - Plaintext demo credentials (`Admin@123`, `Vendor@123`, `Customer@123`) and phone numbers are bundled into client-accessible JavaScript.
  - `setClientRole` sets an insecure cookie without `HttpOnly`, `Secure`, or `SameSite=Strict`.
* **Requirements & Remediation**:
  - Remove hardcoded credentials from production bundles. Inject demo accounts conditionally only in non-production environments (`process.env.NODE_ENV !== "production"`).
  - Use `jose` or `jsonwebtoken` with server-side secret keys to sign and verify internal tokens.
  - Configure cookies with `HttpOnly; Secure; SameSite=Lax`.

### 2.3 HTTP Security Headers
* **Observation**:
  Zero security headers are set anywhere in `next.config.ts` or `middleware.ts`.
* **Requirements & Remediation**:
  Configure comprehensive security headers in `next.config.ts`:
  ```ts
  const securityHeaders = [
    { key: "X-DNS-Prefetch-Control", value: "on" },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
    {
      key: "Content-Security-Policy",
      value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co;"
    }
  ];
  ```

### 2.4 Secret Management & `.gitignore` Defect
* **Observation**:
  1. `.gitignore` line 34 specifies `.env*`. Running `git check-ignore .env.example` confirms that `.env.example` is ignored.
  2. `lib/supabase.ts` contains hardcoded fallback values for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
* **Requirements & Remediation**:
  - Update `.gitignore` to explicitly un-ignore `.env.example`:
    ```gitignore
    .env*
    !.env.example
    ```
  - Remove hardcoded URL and JWT strings from `lib/supabase.ts`. Throw a clear runtime configuration error if required environment variables are missing during startup:
    ```ts
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing required Supabase environment variables.");
    }
    ```

---

```
========================================================================================
                          PILLAR 3: PERFORMANCE & OBSERVABILITY
========================================================================================
```

### 3.1 Next.js Image Optimization & Domains Configuration
* **Observation**:
  - `next/image` is not imported anywhere in the project.
  - Across 13 major pages (including Homepage, PDP, Catalog, Wishlist, Checkout), unoptimized standard `<img>` tags are used.
  - `next.config.ts` only permits `lh3.googleusercontent.com` in `remotePatterns`.
* **Impact**:
  - Images are served in uncompressed formats (JPEG/PNG) at full desktop resolution to mobile devices.
  - High bounce rate and poor LCP / CLS Core Web Vitals scores on Saudi mobile 4G/5G networks.
* **Requirements & Remediation**:
  - Replace `<img>` tags with `<Image ... />` from `next/image`.
  - Expand `images.remotePatterns` in `next.config.ts` to support all product image providers:
    ```ts
    images: {
      remotePatterns: [
        { protocol: "https", hostname: "images.unsplash.com" },
        { protocol: "https", hostname: "*.supabase.co" },
        { protocol: "https", hostname: "lh3.googleusercontent.com" }
      ],
      formats: ["image/avif", "image/webp"]
    }
    ```

### 3.2 Font Loading & Layout Shifts
* **Observation**:
  `app/layout.tsx` imports Google Fonts via external `<link>` tags in `<head>`:
  ```html
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
  ```
* **Impact**:
  - Bypasses Next.js automatic font self-hosting and zero-layout-shift optimization.
  - Triggers FOIT (Flash of Invisible Text) and penalizes CLS.
* **Requirements & Remediation**:
  - Refactor to `next/font/google`:
    ```ts
    import { IBM_Plex_Sans_Arabic } from "next/font/google";
    const ibmPlexArabic = IBM_Plex_Sans_Arabic({
      subsets: ["arabic", "latin"],
      weight: ["300", "400", "500", "600", "700", "800"],
      display: "swap",
      variable: "--font-ibm-plex"
    });
    ```

### 3.3 Error Boundaries & Not-Found Routing
* **Observation**:
  The following standard Next.js special files do NOT exist in the project:
  - `app/error.tsx`
  - `app/global-error.tsx`
  - `app/not-found.tsx`
  - `app/loading.tsx`
* **Impact**:
  - Any runtime error or 404 renders Next.js default framework screens, breaking the luxury branding and leaving users without recovery actions.
* **Requirements & Remediation**:
  - Implement a sovereign luxury-branded `app/not-found.tsx` with search suggestions and homepage CTA.
  - Implement `app/error.tsx` with error recovery (`reset()`), logging dispatch, and customer support buttons.
  - Implement `app/global-error.tsx` catching root layout failures.
  - Implement `app/loading.tsx` skeletons for smooth navigation transitions.

### 3.4 Telemetry, Structured Logging & Health Check Route
* **Observation**:
  - No health check endpoint exists (`/api/health`).
  - No structured logging framework. Logging is limited to unformatted `console.error` and `console.warn`.
  - No APM, OpenTelemetry, or Sentry integration.
* **Requirements & Remediation**:
  - Create `/app/api/health/route.ts` returning database connectivity status, system timestamp, and memory health for load balancer health probes.
  - Implement a lightweight structured logger outputting JSON with timestamps, log level, correlation IDs, and contextual error metadata.

---

```
========================================================================================
                                 PILLAR 4: DOCUMENTATION
========================================================================================
```

### 4.1 Production Deployment Guide
* **Observation**:
  `README.md` only documents local execution (`npm run dev`, `npm run build`, `npm test`). It lacks production hosting instructions.
* **Requirements & Remediation**:
  - Document production Vercel deployment commands and environment variable bindings.
  - Provide a standalone multi-stage production `Dockerfile` with Node 20 alpine runner.
  - Document memory flags for large Next.js builds: `NODE_OPTIONS='--max-old-space-size=4096'`.

### 4.2 Comprehensive `.env.example`
* **Observation**:
  Current `.env.example` lacks critical production parameters.
* **Requirements & Remediation**:
  Update `.env.example` to document all necessary production configuration keys:
  ```env
  # Database & Supabase
  DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
  NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT].supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
  SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]

  # Authentication & Security
  NEXTAUTH_SECRET=[GENERATED_32_CHAR_SECRET]
  JWT_SECRET=[GENERATED_32_CHAR_SECRET]

  # Saudi Regulatory & Integrations
  ZATCA_PHASE2_API_URL=https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation
  ZATCA_CSID=[YOUR_COMPLIANCE_CSID]
  SAMA_ESCROW_WEBHOOK_SECRET=[YOUR_WEBHOOK_SECRET]
  SPL_API_KEY=[YOUR_SPL_KEY]
  SMSA_API_KEY=[YOUR_SMSA_KEY]

  # Payment Gateways
  MADA_MERCHANT_ID=[MERCHANT_ID]
  APPLE_PAY_MERCHANT_IDENTIFIER=merchant.sa.souq
  TABBY_PUBLIC_KEY=pk_test_...
  TAMARA_API_KEY=...
  ```

### 4.3 Architecture & API Specifications
* **Observation**:
  No API specification (OpenAPI/Swagger) or architecture sequence diagrams exist.
* **Requirements & Remediation**:
  - Create `docs/ARCHITECTURE.md` depicting system boundaries between Storefront, Vendor Hub, Admin Center, and Supabase database.
  - Create `docs/API_SPECIFICATION.md` defining request/response schemas for orders, payouts, and ZATCA Phase-2 invoice generation.

---

## Prioritized Implementation Roadmap

| Priority | Pillar | Task Description | Target Files |
|:---:|:---:|---|---|
| **P0** | DevOps | Repair `package.json` syntax error and remove duplicate keys | `package.json` |
| **P0** | DevOps | Fix unclosed `<motion.div>` JSX syntax errors in Login page | `app/auth/login/page.tsx` |
| **P0** | Security | Un-ignore `.env.example` in `.gitignore` and strip hardcoded secrets | `.gitignore`, `lib/supabase.ts` |
| **P1** | Security | Upgrade `middleware.ts` with secure cryptographic session checks & security headers | `middleware.ts`, `next.config.ts` |
| **P1** | Observability | Implement `app/not-found.tsx`, `app/error.tsx`, and `/api/health` | `app/not-found.tsx`, `app/error.tsx`, `app/api/health/route.ts` |
| **P1** | Performance | Configure `next/image` remote domains and replace raw `<img>` tags | `next.config.ts`, `components/*`, `app/*` |
| **P2** | DevOps | Establish GitHub Actions CI workflow for lint, test, typecheck, build | `.github/workflows/ci.yml` |
| **P2** | Performance | Migrate Google Fonts from `<link>` tags to `next/font/google` | `app/layout.tsx` |
| **P2** | Documentation | Author comprehensive deployment guide & environment specifications | `README.md`, `docs/DEPLOYMENT.md` |
| **P3** | Testing | Expand Vitest test suite to cover checkout, cart calculations, and KYB wizard | `__tests__/*` |

---
*Report produced by explorer_survey_3.*
