# Handoff Report: `package.json` Syntax Repair & Test Harness Configuration

**Agent:** m1_explorer_1 (`teamwork_explorer`)  
**Target:** Parent Orchestrator / Milestone 1 Worker  
**Milestone:** Milestone 1 — DevOps & Build Foundation  
**Date:** 2026-11-10  
**Status:** Hard Handoff (Investigation Complete)  

---

## 1. Observation

1. **`package.json` Lines 5–19 Syntax Failure**:
   Direct inspection of `d:\SOUQ\package.json`:
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
   Running `node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))"` produced:
   `JSON Error: Expected ',' or '}' after property value in JSON at position 442` (verbatim error).
   Line 12 lacks a terminating comma `,` before line 13.

2. **Duplicate Script Keys**:
   - `dev`: declared at line 9 and line 13 (`"next dev"`).
   - `build`: declared at line 8 (`"next build"`) and line 14 (`"next build --webpack"`).
   - `start`: declared at line 10 and line 15 (`"next start"`).
   - `lint`: declared at line 6 (`"next lint"`) and line 16 (`"eslint"`).
   - `test`: declared at line 12 and line 17 (identical child process spawn command).
   - `postinstall`: declared at line 11 and line 18 (`"node fix-magic-string.js"`).
   - `typecheck`: declared once at line 7 (`"tsc --noEmit"`).

3. **Silent Failure in Existing `test` Wrapper**:
   Lines 12 & 17 execute:
   `node -e "process.env.NODE_OPTIONS='--experimental-require-module'; require('child_process').spawnSync('npx', ['vitest', 'run'], { stdio: 'inherit', shell: true })"`
   `child_process.spawnSync` returns an execution status object without invoking `process.exit()`. If Vitest fails with exit code 1, the Node runner still terminates with exit code 0.

4. **Next.js 16 Bundler Architecture**:
   `node_modules/next/dist/lib/bundler.js` lines 122–146 indicate `next build` defaults to Turbopack (`Bundler.Turbopack`), while `--webpack` sets `Bundler.Webpack`.
   `postcss.config.mjs` configures `@tailwindcss/postcss` for Tailwind v4. Under Webpack, PostCSS plugins run reliably without custom Turbopack loader configuration.

5. **ESLint 9 Flat Config Alignment**:
   `node_modules/next/dist/docs/01-app/03-api-reference/05-config/03-eslint.md` line 70 documents standard flat config invocation via `npx eslint .`. `eslint.config.mjs` in the project root defines the Next.js 16 flat configuration.

6. **Test Harness Integrity**:
   - `vitest.config.mjs` defines alias `@` -> `./`, `globals: true`, `environment: "node"`, and `setupFiles: ["./vitest.setup.ts"]`.
   - `vitest.setup.ts` polyfills `WebSocket` for Supabase Realtime in Node < 22 and `ResizeObserver` for Radix UI in jsdom, plus mocks `next/navigation`.
   - DOM tests (`HomePage.test.tsx`, `routeGuards.test.ts`) declare `// @vitest-environment jsdom` at line 1.

---

## 2. Logic Chain

1. **Step 1 (Parser Failure -> Missing Comma)**:
   Observation 1 demonstrates that all Node/npm tooling fails immediately when parsing `package.json` due to missing comma on line 12. Removing the duplicate block and formatting with trailing commas on all properties except the last restores valid RFC 8259 JSON syntax.

2. **Step 2 (Deduplication -> Script Selection)**:
   - For `build`: Observation 4 shows Next 16 defaults to Turbopack, but Tailwind v4 requires Webpack via `--webpack` for reliable PostCSS handling. Setting `"build": "next build --webpack"` as primary and providing `"build:turbo": "next build"` preserves both options.
   - For `lint`: Observation 5 shows Next 16 flat config relies directly on ESLint. Setting `"lint": "eslint"` and `"lint:next": "next lint"` maintains modern standard while retaining legacy Next CLI command.
   - For `postinstall`: Observation 2 shows `fix-magic-string.js` is critical for patching `@tailwindcss/node`. It must be preserved.
   - For `typecheck`: Line 7 `"tsc --noEmit"` must be preserved.

3. **Step 3 (Test Runner Fix -> Exit Code Propagation)**:
   Observation 3 shows the existing `test` command masks test failures. Switching the primary command to `"test": "vitest run"` and watch to `"test:watch": "vitest"` allows native exit code propagation. If the `--experimental-require-module` wrapper is preserved for compatibility (`"test:compat"`), it must explicitly call `process.exit(r.status ?? 0)`.

4. **Step 4 (Test Harness Hardening)**:
   Observation 6 shows `vitest.config.mjs` has no `include` or `exclude` restrictions. Adding `include: ["__tests__/**/*.{test,spec}.?(c|m)[jt]s?(x)"]` and `exclude: ["node_modules", "e2e", ".next"]` prevents interference with future E2E test suites. In `vitest.setup.ts`, adding a mock for `window.matchMedia` prevents unhandled exceptions in UI component tests.

---

## 3. Caveats

1. **TypeScript Build Dependency**:
   While `package.json` repair enables `npm run typecheck` to execute `tsc`, `tsc --noEmit` will still exit with code 1 until Milestone 1 Feature 2 (`app/auth/login/page.tsx` unclosed `<motion.div>` tags) is implemented. This is expected and tracked under Feature 2.
2. **Next.js Turbopack vs Webpack**:
   `next build` with Turbopack can be tested once the codebase compiles cleanly; until custom Turbopack CSS loaders are verified, `--webpack` is the guaranteed production build flag.

---

## 4. Conclusion

The Worker should perform a clean, single-contiguous replacement of `package.json` lines 5–19, replacing the broken duplicate block with the unified specification:

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

Additionally, harden `vitest.config.mjs` with explicit test file include/exclude patterns, and add `window.matchMedia` mock in `vitest.setup.ts`.

---

## 5. Verification Method

1. **Syntax Check**:
   ```bash
   node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8')); console.log('VALID JSON');"
   ```
   *Expected Output:* `VALID JSON` (exit code 0).
   *Invalidation Condition:* JSON parse error or non-zero exit code.

2. **Lint Execution**:
   ```bash
   npm run lint
   ```
   *Expected Output:* ESLint runs against configured files using `eslint.config.mjs`.

3. **Vitest Execution**:
   ```bash
   npm test
   ```
   *Expected Output:* Vitest loads `vitest.config.mjs` and `vitest.setup.ts`, runs the test suite in `__tests__/`, and returns appropriate test results with correct exit codes.
