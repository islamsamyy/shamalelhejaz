# SOUQ SAUDIYA — BACKEND, DATA, APIS & SAUDI COMPLIANCE SURVEY REPORT

**Survey Date:** 2026-11-10  
**Investigator:** `explorer_survey_2` (Teamwork Explorer)  
**Target Platform:** Souq Saudiya (سوق السعودية)  
**Status:** Read-Only Investigation Complete  

---

## 1. Executive Summary

This report delivers an exhaustive, line-by-line technical audit of the **Backend, Data Layer, APIs, and Saudi Compliance** implementations for the "Souq Saudiya" marketplace platform.

### Core Discoveries at a Glance:
1. **Critical Tooling Blocker:** `package.json` contains a malformed JSON syntax error (missing comma at line 12 and duplicate script keys on lines 13–18). As a consequence, `npm test`, `npm run build`, `npm run lint`, and all Vitest suites fail immediately on parse before executing any application code.
2. **Zero Server-Side API Handlers:** The repository contains **0** Next.js Route Handlers (`app/api` directory does not exist) and **0** Server Actions (`use server` is never declared). All data interactions are executed entirely in client-side React components (`"use client"`) using either local component state (`useState`) or client-side calls via `@supabase/supabase-js`.
3. **Severe Security & RBAC Vulnerabilities:** 
   - `middleware.ts` relies exclusively on an unverified, plaintext client cookie (`souq_role`). Anyone can execute `document.cookie = "souq_role=admin; path=/"` in browser DevTools to gain unrestricted access to `/admin/*` routes.
   - `lib/rbac.ts` provides a `verifyJwtToken` function that decodes base64 tokens without verifying cryptographic signatures.
   - Built-in test accounts (`TEST_ACCOUNTS` in `lib/rbac.ts`) allow trivial password authentication (`Admin@123`, `Vendor@123`, `Customer@123`, `123456`), and the client OTP verification accepts `1234` as a master key.
4. **ZATCA Phase-2 Compliance is Pure Mock Simulation:** 
   - The "ZATCA QR code" on the order confirmation page (`app/orders/[id]/confirmation/page.tsx:77-84`) is a static icon (`<QrCode />`) from `lucide-react`. There is no TLV (Tag-Length-Value) base64 generator, no digital signature, and no UBL 2.1 XML payload.
   - The 15% VAT calculation in `context/CartContext.tsx:87-91` adds 15% on top of product prices that are already labeled in the UI as "inclusive of 15% VAT" (مشمول الضريبة), leading to double taxation calculations.
5. **Superficial Saudi Business Verification:** 
   - Commercial Registration (CR), Tax ID (VAT), and IBAN validation in `app/vendor/register/page.tsx:85-96` rely strictly on string length checks (`length !== 10`, `length !== 15`, `!iban.startsWith("SA")`). There is no regex verification, no ZATCA VAT format check (`^3\d{13}3$`), no ISO 7064 Mod 97-10 IBAN checksum, and no bank routing check.
   - Submitting the 8-step KYB wizard does not persist any record to the database; it merely triggers a timer.
6. **Payment Gateways are 100% Mocked:** 
   - Mada, Apple Pay, Tabby, and Tamara in `app/checkout/page.tsx` are static radio buttons. Submitting checkout immediately flags the order as `"paid"` in client state without interacting with any gateway SDK, payment intent, 3D Secure redirect, or webhook listener. STC Pay is missing entirely from checkout options.
7. **Database Schema Disconnect:** 
   - `prisma/schema.prisma` is a legacy generic schema (USD currency, no Saudi entities, no vendor profiles) and Prisma is not even installed in `package.json`.
   - `supabase/schema.sql` defines 10 basic tables, but lacks critical production tables: `invoices`, `escrow_ledger`, `vendor_payouts`, `rma_requests`, `customer_addresses`, `shipments`, and `payments`. Furthermore, order lines are stored in an untyped JSONB blob without vendor commission splits.

---

## 2. API Routes & Server Actions Analysis

### 2.1 API Route Inventory
- **Location Inspected:** `d:\SOUQ\app\api\`
- **Observation:** The `app/api/` directory does not exist. A project-wide search for `route.ts` yielded zero application route handlers.
- **Impact:**
  - No webhook endpoints for payment gateway callbacks (Moyasar, HyperPay, Tabby, Tamara).
  - No webhook endpoints for courier tracking webhooks (Saudi Post SPL, SMSA).
  - No secure server-side endpoints for ZATCA clearance/reporting or Watheeq CR verification.
  - No server-side PDF invoice generation or digital signature computation.

### 2.2 Server Actions Inventory
- **Pattern Searched:** `"use server"`
- **Observation:** 0 occurrences across the entire repository.
- **Impact:** Every database insert, update, or fetch is triggered directly from client components via `@supabase/supabase-js` using the public anonymous key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).

### 2.3 Authentication, RBAC & Middleware Security Flaws
- **File:** `d:\SOUQ\middleware.ts` (lines 4–31)
  ```typescript
  export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const role = request.cookies.get("souq_role")?.value;

    if (pathname.startsWith("/admin")) {
      if (role !== "admin") {
        // Redirect to /auth/login
      }
    }
    if (pathname.startsWith("/vendor") && pathname !== "/vendor/register") {
      if (role !== "vendor" && role !== "admin") {
        // Redirect to /auth/login
      }
    }
    return NextResponse.next();
  }
  ```
  **Vulnerability:** The role is read directly from an unsigned, client-writable cookie `souq_role`.
- **File:** `d:\SOUQ\lib\rbac.ts` (lines 188–223)
  ```typescript
  export function verifyJwtToken(token: string | null | undefined): { userId: string; role: Role; exp: number } {
    // ...
    const parts = token.split(".");
    // Decode base64 payload WITHOUT SIGNATURE VERIFICATION
    const payloadStr = Buffer.from(parts[1], "base64").toString("utf-8");
    const payload = JSON.parse(payloadStr);
    // ...
  }
  ```
  **Vulnerability:** This function decodes JWT payloads without checking any cryptographic signature (HMAC secret or RSA/ECDSA public key). Any tampered JWT will be accepted if its base64 JSON payload contains `sub` and `exp`.
- **File:** `d:\SOUQ\lib\rbac.ts` (lines 269–276)
  ```typescript
  export function setClientRole(role: Role) {
    document.cookie = `souq_role=${encodeURIComponent(role)}; path=/; max-age=604800; SameSite=Lax`;
    localStorage.setItem("souq_role", role);
  }
  ```
  **Vulnerability:** The cookie is set via client-side JavaScript (`document.cookie`) without `HttpOnly`, `Secure`, or HMAC signing.
- **File:** `d:\SOUQ\app\auth\login\page.tsx` (lines 127–139)
  ```typescript
  const handleClientVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === "1234" || otp.length === 4) {
      setClientRole("customer");
      // Authenticates user immediately
    }
  }
  ```
  **Vulnerability:** OTP authentication is hardcoded to `"1234"`.

---

## 3. Database Architecture & Persistence Analysis

### 3.1 Prisma Schema (`prisma/schema.prisma`)
- **Status:** Orphaned / Dead artifact.
- **Observations:**
  - Line 23: `currency String @default("USD")`
  - Line 22: `locale String @default("en")`
  - Line 277: `provider String // stripe, paypal, etc.`
  - Line 40: `enum UserRole { CUSTOMER, SELLER, ADMIN }`
  - No fields or models for Saudi National Address, CR number, VAT number, SAMA Escrow, ZATCA Phase-2, or vendor commission tiers.
  - `@prisma/client` and `prisma` packages are **not installed** in `package.json`.

### 3.2 Supabase Schema (`supabase/schema.sql`)
The Supabase schema represents the active database structure intended for production. It defines 10 tables:
1. `public.profiles`: Links to `auth.users`, stores role, full name, phone, currency (SAR).
2. `public.vendors`: Stores store details, CR number, VAT number, ratings.
3. `public.categories`: Hierarchical category tree with `parent_id`.
4. `public.products`: Product catalog with pricing, vendor references, specs.
5. `public.reviews`: Customer ratings and reviews.
6. `public.orders`: Customer orders, tracking number, payment status, shipping address.
7. `public.wallets`: Customer internal wallet balance.
8. `public.wallet_transactions`: Wallet credits/debits.
9. `public.coupons`: Promotional codes and usage limits.
10. `public.referrals`: Referral tracking.

### 3.3 Critical Missing Tables & Schema Deficiencies

| Missing Domain | Required Production Tables & Fields | Current Status in Codebase |
|---|---|---|
| **ZATCA Phase-2 Invoicing** | Table `public.invoices`: `id`, `order_id`, `invoice_number`, `invoice_type` (Standard/Simplified), `uuid`, `icv` (Counter), `pih` (Previous Hash), `hash` (SHA-256), `cryptographic_stamp`, `qr_code_tlv` (Base64), `ubl_xml` (XML text), `status` (REPORTED/CLEARED), `created_at` | **Non-existent**. Invoices are mocked by displaying a hardcoded UUID string on the confirmation page. |
| **SAMA Escrow & Vendor Payouts** | Table `public.escrow_ledger`: `id`, `order_id`, `vendor_id`, `gross_amount`, `vat_amount`, `platform_commission`, `net_vendor_amount`, `status` (HELD/RELEASED/REFUNDED), `release_due_at`, `released_at`.<br>Table `public.payout_requests`: `id`, `vendor_id`, `amount`, `iban`, `bank_name`, `status` (PENDING/PROCESSING/PAID/FAILED), `sarie_reference` | **Non-existent**. In `vendors`, there are no financial balance columns. `/admin/finance` and `/vendor/financials` use hardcoded arrays in React state. |
| **Product Moderation** | Columns in `public.products`: `status` (`pending_review`, `approved`, `rejected`), `moderated_by`, `moderated_at`, `rejection_reason` | **Missing**. `public.products` lacks a moderation `status` column. `/admin/products` moderates products in local React `useState` only. |
| **Customer Addresses** | Table `public.addresses`: `id`, `user_id`, `full_name`, `phone`, `city`, `district`, `street`, `building_number`, `postal_code`, `additional_number`, `spl_short_address`, `is_default` | **Missing**. `orders.shipping_address` is untyped JSONB. In `/account`, addresses are stored in component state. |
| **RMA & Returns** | Table `public.rma_requests`: `id`, `order_id`, `user_id`, `vendor_id`, `items` (JSONB), `reason`, `photos` (TEXT[]), `refund_method` (wallet/card), `status` (`requested`, `pickup_scheduled`, `inspected`, `approved`, `refunded`, `rejected`), `spl_waybill` | **Missing**. `/returns` page handles submissions with `setTimeout` and local `useState`. |
| **Shipments & Logistics** | Table `public.shipments`: `id`, `order_id`, `carrier` (SPL/SMSA), `waybill_number`, `tracking_url`, `status`, `events` (JSONB) | **Missing**. Waybills are randomly generated strings in mock data. |
| **Payment Transactions** | Table `public.payment_transactions`: `id`, `order_id`, `gateway` (Moyasar/HyperPay/Tabby/Tamara), `transaction_id`, `amount`, `currency`, `method` (mada/applepay/visa/bnpl), `status`, `raw_response` | **Missing**. Payment status in `orders` is just a basic text column set directly to `'paid'`. |

---

## 4. Business Logic & Saudi Compliance Implementations

### 4.1 ZATCA Phase-2 E-Invoicing Audit
- **Requirement:** 
  1. ZATCA simplified tax invoices require an ECDSA-signed TLV QR code containing Tags 1–8:
     - Tag 1: Seller's Name (اسم المورد)
     - Tag 2: VAT Registration Number (الرقم الضريبي للمنشأة - 15 رقماً)
     - Tag 3: Time Stamp (ISO 8601 UTC)
     - Tag 4: Invoice Total (with VAT)
     - Tag 5: VAT Total
     - Tag 6: Hash of XML Invoice (SHA-256)
     - Tag 7: Cryptographic Stamp / ECDSA Signature
     - Tag 8: Public Key (secp256k1)
  2. Generation of UBL 2.1 XML invoices compliant with ZATCA XML specifications.
- **Current Codebase Implementation:**
  - In `app/orders/[id]/confirmation/page.tsx` (lines 76–84):
    ```tsx
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
      <div className="w-14 h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center shrink-0">
        <QrCode className="w-9 h-9" />
      </div>
      <div className="text-right text-[11px] leading-tight">
        <span className="font-bold text-slate-900 block">رمز الاستجابة السريعة</span>
        <span className="text-slate-500">مشفر وفق خوارزمية ECDSA</span>
      </div>
    </div>
    ```
    The QR code is literally an SVG icon (`<QrCode />`) with no actual barcode or encoded string.
  - In `app/orders/[id]/confirmation/page.tsx` (lines 31–33):
    ```tsx
    const handleDownloadInvoice = () => {
      toast.success("تم إعداد وتنزيل الفاتورة الضريبية ZATCA Phase-2 بنجاح!");
    };
    ```
    Clicking "تحميل الفاتورة PDF" only displays a toast notification; no PDF or XML document is generated.
- **VAT Calculation Anomaly in `context/CartContext.tsx`:**
  - Lines 87–91:
    ```typescript
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = Math.round((subtotal * discountPercent) / 100);
    const taxableAmount = Math.max(0, subtotal - discount);
    const taxAmount = Math.round(taxableAmount * 0.15); // ZATCA 15% VAT
    const total = taxableAmount + taxAmount;
    ```
  - **Issue:** Saudi consumer protection and ZATCA regulations mandate that all B2C prices displayed on e-commerce sites must be **tax-inclusive** (الأسعار شاملة ضريبة القيمة المضافة). The product catalog states "السعر شامل 15% ضريبة القيمة المضافة ZATCA", but the checkout logic treats `subtotal` as exclusive and adds another 15% on top, charging the customer 132.25% of the intended retail price. Furthermore, using `Math.round()` on currency values drops fractional halalas rather than maintaining 2-decimal arithmetic.

### 4.2 Saudi National Address & SPL Short Address Validation
- **Requirement:** Saudi Post (SPL) addresses require:
  - 4-digit Building Number (`^\d{4}$`)
  - 5-digit Postal Code (`^\d{5}$`)
  - 4-digit Additional Number (`^\d{4}$`)
  - SPL Short Address (Wasel format: 4 uppercase letters followed by 4 digits, e.g. `RRRD2929` matching `^[A-Z]{4}\d{4}$`)
  - Saudi mobile phone (`^(05|\+9665)\d{8}$`)
- **Current Codebase Implementation:**
  - In `app/checkout/page.tsx` (lines 66–72):
    ```typescript
    const handleNextStep = () => {
      if (currentStep === 1) {
        if (!address.fullName || !address.phone || !address.buildingNo) {
          toast.error("يرجى إكمال بيانات العنوان الوطني ورقم الجوال للتوصيل.");
          return;
        }
      }
      setCurrentStep((prev) => Math.min(steps.length, prev + 1));
    };
    ```
  - There is zero regex validation for phone numbers, building numbers, or postal codes. Any random string satisfies the validation. No field or validation exists for SPL Short Address in the checkout form.

### 4.3 Business Verification (CR, Tax ID, Saudi IBAN)
- **Requirement:**
  - Commercial Registration (CR): Exactly 10 digits (`^\d{10}$`), with standard Ministry of Commerce regional prefix codes (e.g. 1010 for Riyadh, 4030 for Jeddah, 2050 for Dammam).
  - ZATCA VAT Number: Exactly 15 digits, starting with `3` and ending with `3` (`^3\d{13}3$`).
  - Saudi IBAN: Exactly 24 alphanumeric characters, starting with `SA`, followed by 2 check digits and 20 bank/account digits (`^SA\d{2}[A-Z0-9]{2}\d{18}$` or `^SA\d{22}$`), validated via the ISO 7064 Mod 97-10 checksum algorithm.
- **Current Codebase Implementation:**
  - In `app/vendor/register/page.tsx` (lines 84–97):
    ```typescript
    const handleNext = () => {
      if (step === 3 && kybData.crNumber.length !== 10) {
        toast.error("السجل التجاري السعودي يجب أن يتكون من 10 أرقام.");
        return;
      }
      if (step === 4 && kybData.vatNumber.length !== 15) {
        toast.error("الرقم الضريبي ZATCA يجب أن يتكون من 15 رقماً.");
        return;
      }
      if (step === 5 && !kybData.iban.startsWith("SA")) {
        toast.error("الآيبان البنكي السعودي يجب أن يبدأ بحرفي SA.");
        return;
      }
      setStep((prev) => Math.min(8, prev + 1));
    };
    ```
  - A string of 10 letters like `"abcdefghij"` passes the CR check. A string like `"111111111111111"` passes the VAT check despite violating ZATCA's `3...3` standard. An IBAN string like `"SA123"` passes the IBAN check.
  - In `app/vendor/register/page.tsx` (lines 104–113):
    ```typescript
    const handleSubmitKYB = () => {
      setIsSubmitting(true);
      toast.info("جاري التحقق التلقائي عبر منصة واثق الحكومية الموحدة...");
      setTimeout(() => {
        setIsSubmitting(false);
        setIsComplete(true);
        toast.success("تم توثيق المنشأة واعتماد الحساب البلاتيني بنجاح!");
      }, 1500);
    };
    ```
    No data is sent to the server or database.

### 4.4 Order Lifecycle, Cart, Tracking & RMA
- **Cart Context (`context/CartContext.tsx`):**
  - State is in-memory only (`useState`). If the user refreshes the page, the cart resets to `defaultCart` (3 hardcoded items).
  - No synchronization with `localStorage` or a database cart session.
- **Order Placement (`app/checkout/page.tsx:80–126`):**
  - Invokes `createOrderInSupabase(...)`. If Supabase throws an error (e.g. unauthenticated or network failure), the catch block swallows it with `console.warn`.
  - The redirect is hardcoded to `/orders/SQ-94281/confirmation`, ignoring the actual UUID or ID returned by Supabase.
- **Order Tracking (`app/orders/[id]/tracking/page.tsx:33–40`):**
  - 6-stage visual timeline is a hardcoded array. Order progress is static and not tied to any database status updates.
- **Returns & RMA (`app/returns/page.tsx:22–30`):**
  - Self-service return portal does not write to the database. It triggers a toast and shows a hardcoded return number `RET-74910`.

### 4.5 Vendor Payouts, Escrow Ledger & Commissions
- **Escrow & Payouts in Vendor Hub (`app/vendor/financials/page.tsx`):**
  - `availableBalance` (399,800 SAR) and `pendingEscrow` (85,200 SAR) are hardcoded in React state.
  - Submitting a payout request simply subtracts the amount from local React state.
- **Admin Finance & Payout Batches (`app/admin/finance/page.tsx`):**
  - Payout batches (`PAY-901` through `PAY-904`) are hardcoded.
  - Releasing payouts updates state in memory only.
- **Commission Rates:**
  - In `app/admin/vendors/page.tsx`, the commission slider updates local component state.
  - In `app/vendor/catalog/add/page.tsx:35`, the vendor payout calculation is hardcoded to an 8% commission (`netVendorPayout = Math.round(price * 0.92)`).

### 4.6 Payment Gateways (Mada, Apple Pay, STC Pay, Tabby, Tamara)
- **Current State:**
  - In `app/checkout/page.tsx` (lines 394–425), options for Mada, Apple Pay, Tabby, Tamara, and Credit Card exist solely as UI radio buttons.
  - STC Pay is missing from checkout.
  - Choosing any payment option executes identical code: no gateway initialization, no iframe, no redirect to Tabby/Tamara session URLs, and no 3DS callback verification.
  - Orders are marked as `payment_status: "paid"` immediately without server-side confirmation.

---

## 5. Critical Blocker: `package.json` Syntax Error

### Exact Defect Location
- **File:** `d:\SOUQ\package.json` (lines 11–19)
```json
11:     "postinstall": "node fix-magic-string.js",
12:     "test": "node -e \"process.env.NODE_OPTIONS='--experimental-require-module'; require('child_process').spawnSync('npx', ['vitest', 'run'], { stdio: 'inherit', shell: true })\""
13:     "dev": "next dev",
14:     "build": "next build --webpack",
15:     "start": "next start",
16:     "lint": "eslint",
17:     "test": "node -e \"process.env.NODE_OPTIONS='--experimental-require-module'; require('child_process').spawnSync('npx', ['vitest', 'run'], { stdio: 'inherit', shell: true })\"",
18:     "postinstall": "node fix-magic-string.js"
19:   },
```
- **Analysis:** Line 12 is missing a trailing comma, and lines 13–18 duplicate the `dev`, `build`, `start`, `lint`, `test`, and `postinstall` script keys from lines 6–12.
- **Impact:** Any tool attempting to read `package.json` (such as `npm`, `npx`, `vitest`, `esbuild`, or Next.js build) crashes with `EJSONPARSE`.

---

## 6. Actionable Production Hardening Roadmap & Remediation Plan

To bring the Souq Saudiya backend and compliance layers to sovereign production standards, the following structured remediation is recommended:

### Phase 1: Tooling & Script Cleanup (Immediate Fix)
1. Fix the `package.json` scripts block to remove duplicate keys and restore valid JSON syntax:
   ```json
   "scripts": {
     "dev": "next dev",
     "build": "next build",
     "start": "next start",
     "lint": "next lint",
     "typecheck": "tsc --noEmit",
     "test": "vitest run",
     "postinstall": "node fix-magic-string.js"
   }
   ```

### Phase 2: Database Schema & Migration Hardening
Apply a Supabase migration to create the missing mission-critical tables:
1. `public.invoices`: Full ZATCA Phase-2 fields (UUID, ICV, PIH, SHA-256 hash, ECDSA signature, TLV QR base64, XML UBL 2.1 payload, clearance status).
2. `public.escrow_ledger`: SAMA Escrow tracking per order line item with release schedules.
3. `public.vendor_payouts`: Payout requests, IBAN verification status, Sarie payment tracking.
4. `public.addresses`: Customer saved National Addresses with SPL short address validation.
5. `public.rma_requests`: Complete returns lifecycle management.
6. `public.shipments`: Carrier tracking numbers and status logs.
7. `public.payments`: Payment transaction audit logs.
8. Add moderation fields to `public.products`: `status` (`pending_review`, `approved`, `rejected`), `rejection_reason`.

### Phase 3: ZATCA Phase-2 Compliance Engine
1. Implement a server-side TLV encoder function (`lib/zatca/tlv.ts`):
   - Computes Tag 1 (Seller), Tag 2 (VAT Number), Tag 3 (Timestamp), Tag 4 (Total), Tag 5 (Tax), Tag 6 (Hash), Tag 7 (Signature), Tag 8 (Public Key).
   - Generates true Base64 TLV data strings.
2. Render standard QR codes dynamically using `qrcode.react` or server-generated SVGs based on the TLV string.
3. Fix VAT calculation in `CartContext`:
   - Treat advertised prices as VAT-inclusive.
   - Extract VAT using the formula: `vatAmount = subtotal * (15 / 115)`.
   - Maintain 2-decimal halala arithmetic throughout.

### Phase 4: Saudi Validation Utility Library (`lib/saudi-validation.ts`)
Create strict Zod schemas and validation helpers:
1. `validateSaudiCR(cr: string)`: 10 digits with valid region code.
2. `validateZatcaVat(vat: string)`: 15 digits matching `^3\d{13}3$`.
3. `validateSaudiIban(iban: string)`: Exactly 24 chars, starts with `SA`, validates ISO 7064 Mod 97-10 check digits, matches registered SAMA bank codes.
4. `validateSplShortAddress(code: string)`: 4 letters + 4 digits (`^[A-Z]{4}\d{4}$`).
5. `validateSaudiPhone(phone: string)`: Matches `^(05|\+9665)\d{8}$`.

### Phase 5: API Route Handlers & Server Security
1. Implement Next.js App Router API endpoints:
   - `app/api/auth/session/route.ts`: Secure HTTP-only cookie session management with signed JWTs.
   - `app/api/zatca/invoice/route.ts`: Generate compliant ZATCA invoices.
   - `app/api/webhooks/payments/route.ts`: Webhook listeners for payment gateways (Moyasar, Tabby, Tamara).
   - `app/api/vendor/payout/route.ts`: Validate and record vendor payout requests.
   - `app/api/returns/route.ts`: Create and track RMA requests.
2. Update `middleware.ts` to verify cryptographic session signatures (HMAC/JWT) rather than reading unverified plaintext cookies.

---

**Report Prepared By:** `explorer_survey_2`  
**Working Directory:** `d:\SOUQ\.agents\teamwork\explorer_survey_2\`
