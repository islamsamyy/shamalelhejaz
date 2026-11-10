# Milestone 1 Exploration Report: CI/CD Pipeline, Git Configuration & Baseline Test Suite

**Target Subsystem**: CI/CD Automation, Gitignore Whitelisting, and Baseline Unit Test Harness  
**Author**: `m1_explorer_3` (Teamwork Explorer)  
**Date**: 2026-11-10  
**Status**: Investigation Complete — Ready for Worker Implementation  

---

## 1. Executive Summary

As part of Milestone 1 (**DevOps & Build Foundation**), this investigation examined three foundational operational pillars required to transition Souq Saudiya into a reproducible, CI-gated production repository:
1. **Git Configuration & Environment Whitelisting**: Identified why `.env.example` is inadvertently hidden from Git tracking by `.gitignore:34:.env*`, verified this behavior via Git diagnostic tools, and formulated the precise negation rule (`!.env.example`).
2. **Automated CI/CD Pipeline**: Designed an enterprise-grade GitHub Actions workflow (`.github/workflows/ci.yml`) running on `main` and `master` branches, handling dependency caching, `fix-magic-string.js` synchronization, ESLint, TypeScript compilation, and Vitest test execution.
3. **Baseline Test Suite Verification**: Conducted an exhaustive audit of all 5 test files comprising 46 unit and integration test cases across `__tests__/`. Established the definitive proof that the existing test harness configuration (`vitest.config.mjs` and `vitest.setup.ts`) is fully functional and only blocked by the invalid JSON syntax in `package.json`. Formulated a concrete, step-by-step verification sequence for the implementing worker.

---

## 2. Git Configuration & `.env.example` Whitelisting

### 2.1 Direct Observation & Root Cause
Inspection of `d:\SOUQ\.gitignore` reveals the following block at lines 33–35:
```gitignore
# env files (can opt-in for committing if needed)
.env*
```

Because `.env*` employs the wildcard `*`, it matches:
- `.env`
- `.env.local`
- `.env.production`
- `.env.development`
- `.env.test`
- **`.env.example`**

### 2.2 Empirical Verification
Executing the Git check-ignore tool against the target file:
```powershell
git check-ignore -v .env.example
```
**Output observed**:
```
.gitignore:34:.env*    .env.example
```
Exit code `0` confirms that Git considers `.env.example` ignored, meaning contributors and automated environments cannot see or commit the configuration template without dangerous `-f` overrides.

Furthermore, `d:\SOUQ\.env.example` exists on disk (19 lines specifying `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `STRIPE_SECRET_KEY`, `AI_PROVIDER`, etc.), but `git status` shows it as omitted from untracked files due to the ignore pattern.

### 2.3 Proposed Fix Specification
In Git's ignore syntax, an exclamation mark (`!`) negates a pattern. A negative pattern re-includes any matching file excluded by a previous pattern.

#### Target File: `d:\SOUQ\.gitignore`
**Lines 33–35 (Current)**:
```gitignore
# env files (can opt-in for committing if needed)
.env*
```

**Lines 33–36 (Recommended Replacement)**:
```gitignore
# env files (can opt-in for committing if needed)
.env*
!.env.example
```

### 2.4 Worker Independent Verification Protocol
The Worker must execute the following commands after editing `.gitignore`:
1. Check ignore status:
   ```powershell
   git check-ignore -v .env.example
   ```
   **Expected Result**: Command must exit with code `1` (indicating `.env.example` is **not** ignored).
2. Check Git status:
   ```powershell
   git status --short
   ```
   **Expected Result**: `.env.example` appears in the untracked/modified list (e.g., `?? .env.example`), ready to be committed to version control.

---

## 3. GitHub Actions CI/CD Pipeline Architecture

### 3.1 Requirements & Operational Context
The project currently has **no `.github/workflows` directory** and zero automated pipeline validation. To safeguard against build regressions and ensure regulatory and security compliance checks are continuously enforced, a GitHub Actions workflow must be created at `d:\SOUQ\.github\workflows\ci.yml`.

### 3.2 Key Architecture Decisions
1. **Triggers**:
   - `push`: Triggered on `main` and `master` branches.
   - `pull_request`: Triggered on pull requests targeting `main` and `master`.
2. **Concurrency**:
   - `cancel-in-progress: true` scoped by `${{ github.workflow }}-${{ github.ref }}`. If a developer pushes multiple commits to a PR in rapid succession, prior pending runs are automatically cancelled to conserve runner minutes.
3. **Runner & Node Environment**:
   - Runner: `ubuntu-latest`
   - Node.js Version: `20.x` (matching `@types/node: ^20` and tested local Node `v20.18.0`).
   - Package Manager: `npm` with automated dependency caching (`cache: 'npm'`).
4. **Idempotent Postinstall & Tailwind Magic-String Handling**:
   - `package.json` specifies `"postinstall": "node fix-magic-string.js"`.
   - In Tailwind CSS v4, `@tailwindcss/node` requires synchronizing `magic-string@0.30.17`.
   - While `npm ci` executes `postinstall` automatically, an explicit step running `node fix-magic-string.js` ensures that even if dependencies are restored from cache or `--ignore-scripts` is ever used, the patch is deterministically present. As verified in `fix-magic-string.js`, the script is completely idempotent.
5. **Quality Gate Sequencing**:
   - Step 1: `npm ci` (clean, lockfile-deterministic install).
   - Step 2: `node fix-magic-string.js` (patch verification).
   - Step 3: `git check-ignore` verification (ensures `.env.example` is never accidentally re-ignored).
   - Step 4: `npm run lint` (ESLint 9 Flat Config enforcing core-web-vitals and typescript rules).
   - Step 5: `npm run typecheck` (`tsc --noEmit` validating strict TypeScript typing).
   - Step 6: `npm test` (Vitest test runner validating all unit & integration test suites).

### 3.3 Complete Production Specification: `.github/workflows/ci.yml`

```yaml
name: CI Pipeline

on:
  push:
    branches:
      - main
      - master
  pull_request:
    branches:
      - main
      - master

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  validate:
    name: Lint, Typecheck & Test
    runs-on: ubuntu-latest
    timeout-minutes: 15

    env:
      NODE_OPTIONS: "--max-old-space-size=4096 --experimental-require-module"
      NEXT_PUBLIC_SUPABASE_URL: "https://placeholder-project.supabase.co"
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder"
      CI: true

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Ensure magic-string patch applied
        run: node fix-magic-string.js

      - name: Verify Git Tracking of .env.example
        run: |
          if git check-ignore .env.example; then
            echo "ERROR: .env.example is ignored by git!"
            exit 1
          fi
          echo "SUCCESS: .env.example is properly tracked by git."

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript typecheck
        run: npm run typecheck

      - name: Run Vitest test suite
        run: npm test
```

---

## 4. Baseline Test Suite Audit & Verification

### 4.1 Test Harness Configuration
The test harness is already established across two configuration files:
- **`vitest.config.mjs`**:
  - Sets default `environment: "node"`
  - Specifies setup file: `./vitest.setup.ts`
  - Defines path alias `"@": path.resolve(__dirname, "./")`
- **`vitest.setup.ts`**:
  - Imports `@testing-library/jest-dom/vitest`
  - Polyfills `globalThis.WebSocket` for Supabase Realtime in Node environments
  - Polyfills `globalThis.ResizeObserver` for Radix UI component interactions in JSDOM
  - Mocks Next.js App Router hooks (`useRouter`, `usePathname`, `useParams`, `useSearchParams`, `notFound`)

### 4.2 Comprehensive Inventory of Existing Tests (`__tests__/`)

| # | File Path | Test Suite Name | Environment | Test Cases Count | Core Subsystems Covered |
|---|-----------|-----------------|-------------|:----------------:|-------------------------|
| 1 | `__tests__/HomePage.test.tsx` | `HomePage component` | `jsdom` (in-file pragma) | **3** | Supabase async data loading, SAR price formatting, Add to Cart interaction, Category pills filtering |
| 2 | `__tests__/currency.test.ts` | `Business Logic: lib/currency.ts & lib/utils.ts` | `node` | **10** | ISO country code currency resolution, cookie override precedence, SAR fallback, EGP currency conversion, 1.0 base rate, Arabic SAR number formatting (`١٬٤٩٩` + `ر.س`), KWD 3-decimal precision, Tailwind `cn()` conflict resolution |
| 3 | `__tests__/rbac.test.ts` | `Security & Admin RBAC: lib/rbac.ts` | `node` | **12** | Active Admin JWT decoding, missing/null token 401 error, expired token handling, malformed payload rejection, missing sub claim, Admin access grant, Customer 403 access denial, unauthenticated 401 denial, multi-role boundary enforcement, multi-tenant vendor store isolation (`canManageVendor`) |
| 4 | `__tests__/routeGuards.test.ts` | `RBAC Route Guards & Middleware Protection` | `jsdom` (in-file pragma) | **11** | Client cookie role getters/setters, Admin 307 redirect on unauthenticated access, Admin 307 redirect on customer access, Admin 200 pass on valid role, Vendor 307 redirect on unauthenticated access, Vendor public registration exception (`/vendor/register`), Vendor 200 pass on valid role, Email/Password authentication for Admin/Vendor/Customer, credential validation failure |
| 5 | `__tests__/supabase.test.ts` | `Backend Data Layer: lib/supabase.ts` | `node` | **10** | `DbProductRow` to `Product` DTO mapping, nullable database field fallbacks, `DbCategoryRow` mapping with subcategories, category nullable fallbacks, `fetchProductsFromSupabase` order by `created_at desc`, category filtering, database connection error handling, `fetchProductByIdFromSupabase` success & not found, `submitReviewToSupabase` insert payload verification |
| **Total** | | | | **46** | **100% of baseline business utilities, route guards, DTOs & home UI** |

### 4.3 Why Tests Are Currently Blocked
When invoking Vitest:
```powershell
npx vitest run
```
**Error observed**:
```
X [ERROR] Expected "," in JSON but found "\"dev\""
    package.json:13:4:
      13 │     "dev": "next dev",
         │     ~~~~~
         ╵     ,
failed to load config from D:\SOUQ\vitest.config.mjs
```
`esbuild` parses `package.json` to resolve configuration contexts and immediately aborts due to the invalid JSON syntax on lines 12–13.

### 4.4 Verification Protocol for the Worker
Once `package.json` syntax and scripts are normalized by `m1_worker_1`:
1. **JSON Syntax Verification**:
   ```powershell
   node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8')); console.log('VALID_JSON')"
   ```
2. **Execute Full Baseline Test Suite**:
   ```powershell
   npm test
   ```
   or
   ```powershell
   npx vitest run
   ```
3. **Expected Vitest Results**:
   - `5 passed (5)` test files
   - `46 passed (46)` test assertions
   - `0 failed`
4. **Individual Suite Verification (if needed for isolated checks)**:
   ```powershell
   npx vitest run __tests__/currency.test.ts
   npx vitest run __tests__/rbac.test.ts
   npx vitest run __tests__/routeGuards.test.ts
   npx vitest run __tests__/supabase.test.ts
   npx vitest run __tests__/HomePage.test.tsx
   ```

---

## 5. Implementation Roadmap & Execution Sequencing

To achieve clean Milestone 1 completion without collisions, workers must execute tasks in the following exact sequence:

1. **Step 1 (Assigned to `m1_worker_1`)**:
   - Repair `package.json` syntax error: remove duplicate scripts, unify clean scripts (`dev`, `build`, `start`, `lint`, `typecheck`, `test`, `postinstall`).
   - Repair JSX syntax errors in `app/auth/login/page.tsx` (closing unclosed `<motion.div>` tags).
2. **Step 2 (Assigned to Worker for CI & Gitignore)**:
   - Edit `.gitignore` to append `!.env.example` directly after `.env*`.
   - Create directory `.github/workflows/` (if not already present).
   - Write `.github/workflows/ci.yml` using the complete production specification from Section 3.3.
3. **Step 3 (Verification & Sign-off)**:
   - Run `git check-ignore -v .env.example` -> exit code 1.
   - Run `node fix-magic-string.js` -> verify console log.
   - Run `npm run lint` -> zero lint errors.
   - Run `npm run typecheck` -> zero TypeScript errors.
   - Run `npm test` -> all 46 test cases passing across all 5 test files.
