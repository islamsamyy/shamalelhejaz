# Exploration & Strategy Report: `package.json` Syntax Repair & Test Harness Configuration

**Target System:** Souq Saudiya (سوق السعودية) Multi-Vendor Marketplace  
**Milestone:** Milestone 1 — DevOps & Build Foundation  
**Author:** m1_explorer_1 (`teamwork_explorer`)  
**Date:** 2026-11-10  
**Status:** Investigation Complete — Ready for Worker Implementation  

---

## 1. Executive Summary

A critical syntax error and script duplication in `package.json` (lines 5–19) currently halts all standard Node.js development workflows, npm scripts, ESLint, TypeScript compilation, and Vitest test execution across the repository.

Specifically:
1. **Missing Comma**: Line 12 (`"test": "node -e ..."`) lacks a closing comma, immediately followed on line 13 by `"dev": "next dev"`. Standard JSON parsers reject the entire file with `Expected ',' or '}' after property value in JSON at position 442`.
2. **Duplicate Script Keys**: Six script keys (`dev`, `build`, `start`, `lint`, `test`, `postinstall`) are defined twice with diverging flags and implementation commands.
3. **Flawed Test Runner Command**: The existing `test` command invokes a Node.js child process wrapper (`spawnSync`) without propagating the child's exit status (`process.exit(...)`), which would cause failing tests to report exit code 0 (silent test suite passes in CI).
4. **Bundler & Tooling Flag Divergence**: The build script alternates between `next build` (Next.js 16 default Turbopack) and `next build --webpack` (required for `@tailwindcss/postcss` and Tailwind CSS v4 stability).

This report details the root cause, dissects each script variation, provides an airtight unified `"scripts"` specification that preserves all flags and functionality, evaluates `vitest.config.mjs` and `vitest.setup.ts` compatibility, and delivers exact, line-level remediation instructions for the Worker.

---

## 2. Line-by-Line Inspection of `package.json` (Lines 5–19)

### 2.1 Raw Content of Current Script Block

```json
5:   "scripts": {
6:     "lint": "next lint",
7:     "typecheck": "tsc --noEmit",
8:     "build": "next build",
9:     "dev": "next dev",
10:     "start": "next start",
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

### 2.2 Defects Identified

| Defect | Line Number(s) | Description | Impact |
|---|---|---|---|
| **Syntax Error: Missing Comma** | Line 12 | Line 12 lacks a trailing comma before line 13 property declaration. | All JSON parsers crash (`npm`, `esbuild`, `eslint`, `vitest`). |
| **Duplicate Key: `dev`** | Line 9 & Line 13 | `"dev": "next dev"` is declared twice. | Duplicate object keys violate RFC 8259 JSON conventions; linters/parsers warn or overwrite. |
| **Duplicate Key: `build`** | Line 8 & Line 14 | Line 8 specifies `"next build"`; line 14 specifies `"next build --webpack"`. | Later declaration overwrites earlier declaration in JS runtimes, but causes tooling confusion. |
| **Duplicate Key: `start`** | Line 10 & Line 15 | `"start": "next start"` is declared twice. | Redundant key duplication. |
| **Duplicate Key: `lint`** | Line 6 & Line 16 | Line 6 specifies `"next lint"`; line 16 specifies `"eslint"`. | Divergent CLI invocations. |
| **Duplicate Key: `test`** | Line 12 & Line 17 | Line 12 and 17 contain identical complex child process one-liner. | Redundant key duplication; lacks exit status forwarding. |
| **Duplicate Key: `postinstall`** | Line 11 & Line 18 | `"postinstall": "node fix-magic-string.js"` declared twice. | Redundant key duplication. |

---

## 3. Dissection and Analysis of Divergent Script Commands

### 3.1 `build`: Turbopack (`next build`) vs Webpack (`next build --webpack`)

#### Investigation of Next.js 16 Bundler Architecture
In `node_modules/next/dist/lib/bundler.js`:
- Lines 77–82 define `Bundler`: `Turbopack = 0`, `Webpack = 1`, `Rspack = 2`.
- Lines 142–146 define default behavior:
  ```javascript
  if (bundlerFlags.size === 0) {
      process.env.TURBOPACK = 'auto';
      return 0; // Bundler.Turbopack
  }
  ```
- If `--webpack` is passed (line 122), `options.webpack` sets `Bundler.Webpack` (1).

#### Why `--webpack` Was Added in Line 14
The project relies on:
1. `tailwindcss@^4`
2. `@tailwindcss/postcss@^4.3.5`
3. `@tailwindcss/turbopack@^4`
4. `postcss.config.mjs` defining `plugins: { "@tailwindcss/postcss": {} }`

In Next.js 16.4.5, building with standard `next build` triggers Turbopack (`TURBOPACK='auto'`). While `@tailwindcss/turbopack` is in `devDependencies`, `next.config.ts` currently does not register custom Turbopack rules. Under Webpack (`next build --webpack`), Next.js routes all CSS through standard PostCSS via `postcss.config.mjs`, ensuring 100% reliable compilation of `@import "tailwindcss";` and `@theme` definitions in `app/globals.css`.

#### Unification Strategy
- Set the primary production `"build"` script to `"next build --webpack"`.
- Introduce a parallel convenience script `"build:turbo": "next build"` so developers and CI can benchmark or run Turbopack builds without losing the Webpack flag.

---

### 3.2 `lint`: Next CLI (`next lint`) vs Direct ESLint (`eslint`)

#### Investigation of Next.js 16 ESLint Architecture
According to Next.js 16 documentation in `node_modules/next/dist/docs/01-app/03-api-reference/05-config/03-eslint.md`:
- Next.js 16 transitioned entirely to ESLint 9 Flat Config (`eslint.config.mjs`).
- The official documented invocation is:
  ```bash
  npx eslint .
  ```
- `eslint.config.mjs` in the project root already implements this standard:
  ```javascript
  import { defineConfig, globalIgnores } from "eslint/config";
  import nextVitals from "eslint-config-next/core-web-vitals";
  import nextTs from "eslint-config-next/typescript";

  const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    globalIgnores([
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ]),
  ]);
  export default eslintConfig;
  ```
- Running `next lint` under ESLint 9 flat config can introduce deprecation warnings or compatibility layers. Invoking `"lint": "eslint"` runs the flat config directly with maximum performance.

#### Unification Strategy
- Primary script: `"lint": "eslint"`
- Secondary script: `"lint:next": "next lint"` (preserving legacy Next CLI access)

---

### 3.3 `test`: Vitest Direct vs Node Child Process Wrapper

#### Analysis of the Existing Wrapper Command
Lines 12 & 17 contain:
```bash
node -e "process.env.NODE_OPTIONS='--experimental-require-module'; require('child_process').spawnSync('npx', ['vitest', 'run'], { stdio: 'inherit', shell: true })"
```

#### Why Was This Written?
In Node.js 20.x (the project runs on Node v20.18.0), loading ECMAScript modules synchronously via CommonJS `require()` is gated behind the `--experimental-require-module` flag. On Windows platforms (PowerShell and CMD), setting environment variables inline (e.g. `NODE_OPTIONS=... vitest run`) causes syntax errors without third-party utilities like `cross-env`. The author used a `node -e` script to programmatically set `process.env.NODE_OPTIONS` before spawning `npx vitest run`.

#### The Critical Defect in the Current Wrapper
`child_process.spawnSync` returns an object `{ status, signal, output, ... }`. However, the one-liner does **NOT** call `process.exit(status)`.
- If Vitest tests pass (exit 0), Node exits with code 0.
- If Vitest tests fail (exit 1), `spawnSync` completes, Node continues execution, finishes the `-e` eval string, and **exits with code 0**!
- In CI pipelines (`.github/workflows/ci.yml`), test failures would be completely masked and reported as green!

#### Unification Strategy
1. Primary test script: `"test": "vitest run"` (standard, fast, portable, exit-code preserving).
2. Watch mode: `"test:watch": "vitest"` (essential for TDD).
3. Hardened compatibility fallback:
   ```json
   "test:compat": "node -e \"process.env.NODE_OPTIONS='--experimental-require-module'; const r = require('child_process').spawnSync('npx', ['vitest', 'run'], { stdio: 'inherit', shell: true }); process.exit(r.status ?? 0);\""
   ```

---

### 3.4 `postinstall`: Preserving `fix-magic-string.js`

#### Investigation
`fix-magic-string.js` copies `magic-string@0.30.17` from the root `node_modules` into `node_modules/@tailwindcss/node/node_modules/magic-string`. This fixes a known syntax mismatch where nested `@tailwindcss/node` resolves an older `magic-string` version that fails during CSS processing.
- Coupled with `"overrides": { "magic-string": "0.30.17" }` in `package.json`, this hook is mandatory.
- Retention: `"postinstall": "node fix-magic-string.js"` must remain intact.

---

### 3.5 `typecheck`: Retention of `tsc --noEmit`

`"typecheck": "tsc --noEmit"` is already correctly declared on line 7 and only exists once. It must be retained as a core pillar for CI and local verification.

---

## 4. Test Harness Inspection (`vitest.config.mjs` & `vitest.setup.ts`)

### 4.1 Inspection of `vitest.config.mjs`
```javascript
import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

#### Evaluation:
1. **Path Alias (`@/*`)**: Correctly matches `tsconfig.json` (`"paths": { "@/*": ["./*"] }`).
2. **Environment Default**: `environment: "node"` is optimal because pure logic tests (`currency.test.ts`, `rbac.test.ts`, `supabase.test.ts`) execute without JSDOM overhead. React component tests (`HomePage.test.tsx`, `routeGuards.test.ts`) declare `// @vitest-environment jsdom` on line 1, which Vitest honors dynamically.
3. **Safety Recommendation for Milestone 6**:
   Vitest currently lacks an explicit `include` / `exclude` filter. When the E2E track creates suites under `e2e/`, `vitest run` would attempt to process them.
   **Hardening Recommendation:**
   ```javascript
   include: ["__tests__/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
   exclude: ["**/node_modules/**", "**/e2e/**", "**/.next/**"],
   ```

---

### 4.2 Inspection of `vitest.setup.ts`
```typescript
import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Polyfill WebSocket for Supabase Realtime in Node < 22 test environment
if (typeof globalThis.WebSocket === "undefined") {
  class MockWebSocket {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;
    readyState = 1;
    onopen = null;
    onclose = null;
    onerror = null;
    onmessage = null;
    send = vi.fn();
    close = vi.fn();
    addEventListener = vi.fn();
    removeEventListener = vi.fn();
    dispatchEvent = vi.fn();
  }
  // @ts-ignore
  globalThis.WebSocket = MockWebSocket;
}

// Polyfill ResizeObserver for Radix UI in jsdom
if (typeof globalThis.ResizeObserver === "undefined") {
  class MockResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  // @ts-ignore
  globalThis.ResizeObserver = MockResizeObserver;
}

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useParams: () => ({ id: "sony-wh1000xm5", slug: "electronics" }),
  useSearchParams: () => new URLSearchParams(),
  notFound: vi.fn(),
}));
```

#### Evaluation:
1. `@testing-library/jest-dom/vitest`: Correct subpath import for `@testing-library/jest-dom@^6.9.1`. Extends `expect` matchers.
2. `MockWebSocket`: Essential for `@supabase/supabase-js` realtime clients in Node < 22.
3. `MockResizeObserver`: Required for Radix UI dialogs, select dropdowns, and sliders.
4. `next/navigation`: Comprehensive mocks for App Router navigation hooks.
5. **Hardening Recommendation**:
   In JSDOM environments, components using `window.matchMedia` (such as framer-motion responsive checks or dark-mode queries) will throw `TypeError: window.matchMedia is not a function`.
   Adding a fallback mock ensures resilient UI component testing:
   ```typescript
   if (typeof window !== "undefined" && typeof window.matchMedia === "undefined") {
     window.matchMedia = vi.fn().mockImplementation((query) => ({
       matches: false,
       media: query,
       onchange: null,
       addListener: vi.fn(),
       removeListener: vi.fn(),
       addEventListener: vi.fn(),
       removeEventListener: vi.fn(),
       dispatchEvent: vi.fn(),
     }));
   }
   ```

---

## 5. Exact Specification for Worker Implementation

### 5.1 Proposed Unified `package.json` Scripts Block

```json
  "scripts": {
    "dev": "next dev",
    "dev:turbo": "next dev --turbopack",
    "build": "next build --webpack",
    "build:turbo": "next build",
    "start": "next start",
    "lint": "eslint",
    "lint:next": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:compat": "node -e \"process.env.NODE_OPTIONS='--experimental-require-module'; const r = require('child_process').spawnSync('npx', ['vitest', 'run'], { stdio: 'inherit', shell: true }); process.exit(r.status ?? 0);\"",
    "postinstall": "node fix-magic-string.js"
  },
```

#### Key Advantages:
- **Valid JSON**: Every line has correct comma separation; zero parser errors.
- **No Lost Flags**:
  - Both `next build --webpack` (default `npm run build`) and `next build` (`npm run build:turbo`) are available.
  - Both `eslint` (`npm run lint`) and `next lint` (`npm run lint:next`) are available.
  - `vitest run` (`npm test`), interactive watch (`npm run test:watch`), and hardened `--experimental-require-module` wrapper (`npm run test:compat`) are available.
- **CI Ready**: Standard commands (`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`) map cleanly to GitHub Actions runner requirements.

### 5.2 Proposed Replacement Chunk for `package.json`

**Target File:** `d:\SOUQ\package.json`  
**Lines:** 5–19  

**Target Content:**
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
  },
```

**Replacement Content:**
```json
  "scripts": {
    "dev": "next dev",
    "dev:turbo": "next dev --turbopack",
    "build": "next build --webpack",
    "build:turbo": "next build",
    "start": "next start",
    "lint": "eslint",
    "lint:next": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:compat": "node -e \"process.env.NODE_OPTIONS='--experimental-require-module'; const r = require('child_process').spawnSync('npx', ['vitest', 'run'], { stdio: 'inherit', shell: true }); process.exit(r.status ?? 0);\"",
    "postinstall": "node fix-magic-string.js"
  },
```

---

### 5.3 Proposed Hardening for `vitest.config.mjs`

**Target File:** `d:\SOUQ\vitest.config.mjs`  

```javascript
import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    include: ["__tests__/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    exclude: ["**/node_modules/**", "**/e2e/**", "**/.next/**"],
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

---

### 5.4 Proposed Hardening for `vitest.setup.ts`

**Target File:** `d:\SOUQ\vitest.setup.ts`  
Add window.matchMedia polyfill after ResizeObserver:

```typescript
// Polyfill window.matchMedia for responsive UI components in jsdom
if (typeof window !== "undefined" && typeof window.matchMedia === "undefined") {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}
```

---

## 6. Verification Steps for Worker

Once the Worker applies the patch:
1. **JSON Validation**:
   ```bash
   node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8')); console.log('package.json syntax OK');"
   ```
2. **ESLint Verification**:
   ```bash
   npm run lint
   ```
3. **Typecheck Verification**:
   ```bash
   npm run typecheck
   ```
   *(Note: TypeScript compilation in `app/auth/login/page.tsx` will fail until the unclosed `<motion.div>` tags are resolved in Feature 2).*
4. **Vitest Verification**:
   ```bash
   npm test
   ```
   Vitest should start cleanly, load `vitest.config.mjs` and `vitest.setup.ts`, and run tests.
