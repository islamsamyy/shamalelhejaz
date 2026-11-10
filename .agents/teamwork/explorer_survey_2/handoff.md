# Handoff Report: Backend, Data, APIs & Saudi Compliance Survey

**Agent:** `explorer_survey_2`  
**Date:** 2026-11-10  
**Target:** Parent Orchestrator (`e11a332c-80c3-4ae7-a6ca-d715b731b7d4`)  
**Artifact Link:** `d:\SOUQ\.agents\teamwork\explorer_survey_2\survey_backend.md`  

---

## 1. Observation

1. **Tooling Blocker (`package.json`)**:
   - `package.json` lines 11–19 contain malformed JSON syntax:
     ```json
     11:     "postinstall": "node fix-magic-string.js",
     12:     "test": "node -e \"process.env.NODE_OPTIONS='--experimental-require-module'; require('child_process').spawnSync('npx', ['vitest', 'run'], { stdio: 'inherit', shell: true })\""
     13:     "dev": "next dev",
     14:     "build": "next build --webpack",
     ```
   - Running `npm test` or `npx vitest run` yields:
     ```
     npm error code EJSONPARSE
     npm error JSON.parse Invalid package.json: JSONParseError: Expected ',' or '}' after property value in JSON at position 442 while parsing near "...ell: true })\\\"\"\n    \"dev\": \"next dev\",\n ..."
     ```
2. **Zero API Routes and Server Actions**:
   - Directory `d:\SOUQ\app\api\` does not exist.
   - Searching for `route.ts` across `d:\SOUQ` yields 0 route handlers.
   - Searching for `"use server"` across `d:\SOUQ` yields 0 results.
3. **Insecure Authentication and RBAC Middleware**:
   - `middleware.ts` (lines 4–29) validates role access purely via `request.cookies.get("souq_role")?.value`.
   - `lib/rbac.ts` (line 270) sets `souq_role` cookie directly in client JavaScript via `document.cookie`.
   - `lib/rbac.ts` (lines 199–201) decodes JWT payload with `Buffer.from(parts[1], "base64")` with zero signature verification.
   - `app/auth/login/page.tsx` (line 127) accepts `otp === "1234"` as valid OTP verification for customer login.
4. **ZATCA Phase-2 QR & VAT Calculation**:
   - `app/orders/[id]/confirmation/page.tsx` (lines 76–84) displays `<QrCode className="w-9 h-9" />` from Lucide React as the ZATCA QR code. No TLV base64 string or barcode generator is invoked.
   - `app/orders/[id]/confirmation/page.tsx` (line 31) handles invoice download with `toast.success("تم إعداد وتنزيل الفاتورة الضريبية ZATCA Phase-2 بنجاح!");`. No PDF or XML file is produced.
   - `context/CartContext.tsx` (lines 87–91) computes `taxAmount = Math.round(taxableAmount * 0.15)` and `total = taxableAmount + taxAmount`, adding 15% VAT on top of retail prices that are already designated in catalog UI as tax-inclusive.
5. **Business Verification (CR, Tax ID, IBAN)**:
   - `app/vendor/register/page.tsx` (lines 85–96) checks `kybData.crNumber.length !== 10`, `kybData.vatNumber.length !== 15`, and `!kybData.iban.startsWith("SA")`. No regex, checksum, or format validation is performed.
   - `app/vendor/register/page.tsx` (lines 104–112) handles KYB form submission via `setTimeout(() => setIsComplete(true), 1500)`. No API or database write occurs.
6. **Payment Gateways**:
   - `app/checkout/page.tsx` (lines 394–425) presents Mada, Apple Pay, Tabby, and Tamara as radio buttons. STC Pay is absent.
   - `app/checkout/page.tsx` (lines 80–126) flags `payment_status: "paid"` on order creation with no payment gateway transaction, 3DS verification, or session initialization.
7. **Database Schemas**:
   - `prisma/schema.prisma` is an unintegrated legacy schema with USD currency and no vendor profiles. Neither `@prisma/client` nor `prisma` is installed in `package.json`.
   - `supabase/schema.sql` defines 10 tables (`profiles`, `vendors`, `categories`, `products`, `reviews`, `orders`, `wallets`, `wallet_transactions`, `coupons`, `referrals`). It lacks `invoices`, `escrow_ledger`, `vendor_payouts`, `addresses`, `rma_requests`, `shipments`, and `payments`. Order line items are stored in an untyped JSONB array.

---

## 2. Logic Chain

1. From **Observation 1**, `package.json` syntax prevents the execution of any automated test suites, build pipelines, or lint checks. Therefore, any backend verification must begin by correcting this file.
2. From **Observation 2**, without `app/api/` route handlers or Server Actions, all business workflows (order insertion, catalog queries, authentication) are executed directly from the client using Supabase's public anonymous key. Consequently, sensitive operations cannot currently be validated, signed, or protected server-side.
3. From **Observation 3**, because `middleware.ts` trusts the plaintext, client-set `souq_role` cookie, and `verifyJwtToken` lacks cryptographic signature verification, administrative routes (`/admin/*`) and vendor routes (`/vendor/*`) can be bypassed by setting `document.cookie = "souq_role=admin"`.
4. From **Observation 4**, ZATCA Phase-2 requires a cryptographically signed TLV QR code containing Tags 1 through 8 and UBL 2.1 XML invoices. Because the application renders an SVG icon and triggers a toast, it does not currently fulfill regulatory e-invoicing requirements. In addition, adding 15% VAT on inclusive prices results in double taxation for shoppers.
5. From **Observation 5**, because CR, VAT, and IBAN checks only test string length, invalid credentials pass validation without verification against Watheeq, ZATCA, or SAMA algorithms.
6. From **Observation 6**, payment processing is fully simulated. No real transactions, callbacks, or Webhooks can succeed until a gateway integration (e.g., Moyasar, Tabby, Tamara) is implemented server-side.
7. From **Observation 7**, persistence is missing dedicated tables for invoices, escrow ledgers, vendor payouts, and RMA requests. As a result, admin dispute resolutions, vendor payouts, and return requests operate solely in client component memory and are lost on page reload.

---

## 3. Caveats

1. **Live Supabase Connectivity**: Although `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured in `.env.local`, network connectivity to `lazleotmwyxglqgqwyrq.supabase.co` was not directly tested in this read-only investigation.
2. **Third-Party External APIs**: Watheeq (CR validation), ZATCA Fatoora (e-invoicing), Saudi Post SPL (address/tracking), and payment gateways (Moyasar/HyperPay/Tabby/Tamara) currently lack production API keys in `.env.local`. Mock implementations will require these credentials to operate against live external environments.
3. **No Code Modification**: In accordance with the explorer role constraints, no source code, schema, or `package.json` files were modified during this turn.

---

## 4. Conclusion

The Souq Saudiya application possesses a rich storefront, vendor, and admin user interface, but its backend, data architecture, and Saudi compliance layers are currently running on **client-side mock simulations**. To achieve sovereign production readiness, the platform requires:
1. **Tooling Repair**: Correcting the syntax error in `package.json`.
2. **Database Hardening**: Deploying Supabase migrations for `invoices`, `escrow_ledger`, `vendor_payouts`, `addresses`, `rma_requests`, `shipments`, and `payments`.
3. **Server-Side API Architecture**: Implementing Next.js Route Handlers (`app/api/`) for authentication sessions, ZATCA e-invoice generation, webhooks, and payouts.
4. **Saudi Compliance Engine**: Implementing true ZATCA Phase-2 TLV base64 QR code generation, correcting 15% VAT arithmetic for inclusive pricing, and enforcing strict regex and ISO 7064 validation for CR, VAT, and IBAN.
5. **Security Hardening**: Replacing plaintext cookie checks in `middleware.ts` with cryptographically verified HTTP-only session tokens.

---

## 5. Verification Method

To independently verify these findings, perform the following steps:

1. **Verify `package.json` Syntax Error**:
   Run the test command in a terminal:
   ```bash
   npm test
   ```
   *Expected Result*: Fails with `npm error code EJSONPARSE` at line 13.
2. **Verify Missing API Directory**:
   Inspect directory `d:\SOUQ\app\api`:
   ```bash
   Test-Path d:\SOUQ\app\api
   ```
   *Expected Result*: Returns `False`.
3. **Verify ZATCA QR Mock**:
   Inspect lines 76–84 of `d:\SOUQ\app\orders\[id]\confirmation\page.tsx`:
   *Expected Result*: Confirms `<QrCode className="w-9 h-9" />` icon without TLV string computation.
4. **Verify RBAC Middleware Bypass**:
   Inspect `d:\SOUQ\middleware.ts` line 6:
   *Expected Result*: Confirms role is extracted directly from `request.cookies.get("souq_role")?.value`.
5. **Verify Supabase Schema Gaps**:
   Inspect `d:\SOUQ\supabase\schema.sql`:
   *Expected Result*: Confirms absence of `invoices`, `escrow_ledger`, `vendor_payouts`, `rma_requests`, and `addresses` tables.

---

**Report Authored By:** `explorer_survey_2`  
**Full Technical Survey Available At:** `d:\SOUQ\.agents\teamwork\explorer_survey_2\survey_backend.md`
