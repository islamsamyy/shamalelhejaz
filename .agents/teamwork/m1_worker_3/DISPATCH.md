## 2026-11-10T16:34:11Z

You are m1_worker_3, a teamwork_worker.
Your working directory is: d:\SOUQ\.agents\teamwork\m1_worker_3\
Your parent conversation ID is: e11a332c-80c3-4ae7-a6ca-d715b731b7d4
Milestone: Milestone 1 — DevOps & Build Foundation

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY INSTRUCTIONS:
1. First, read ORIGINAL_REQUEST.md at: d:\SOUQ\.agents\teamwork\ORIGINAL_REQUEST.md
2. Read PROJECT.md at: d:\SOUQ\PROJECT.md
3. Read the three Explorer handoff reports:
   - d:\SOUQ\.agents\teamwork\m1_explorer_1\handoff.md (package.json and test runner)
   - d:\SOUQ\.agents\teamwork\m1_explorer_2\handoff.md (app/auth/login/page.tsx JSX repair & typecheck)
   - d:\SOUQ\.agents\teamwork\m1_explorer_3\handoff.md (.gitignore, .github/workflows/ci.yml, and 46 baseline tests)
4. EXCLUSIVE WRITE OWNERSHIP:
   You have exclusive write ownership over the following files:
   - `d:\SOUQ\package.json`
   - `d:\SOUQ\vitest.config.mjs`
   - `d:\SOUQ\vitest.setup.ts`
   - `d:\SOUQ\app\auth\login\page.tsx`
   - `d:\SOUQ\.gitignore`
   - `d:\SOUQ\.github\workflows\ci.yml`
   Do NOT modify any files outside this exclusive list.
5. IMPLEMENTATION TASKS:
   a. In `d:\SOUQ\package.json`:
      Replace lines 5–19 with the clean, unified scripts block recommended by m1_explorer_1:
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
   b. In `d:\SOUQ\vitest.config.mjs` and `d:\SOUQ\vitest.setup.ts`:
      Harden `vitest.config.mjs` with explicit test inclusion/exclusion patterns, and add `window.matchMedia` polyfill/mock to `vitest.setup.ts`.
   c. In `d:\SOUQ\app\auth\login\page.tsx`:
      Apply the exact patch from m1_explorer_2:
      - Replace lines 164–169 with `<MotionWrapper>` around the card in `LoginFormContent`.
      - Add `</MotionWrapper>` after closing the card (after line 498).
      - Delete the accidental duplicate wrapper at lines 504–509 around `LoginPage()`.
   d. In `d:\SOUQ\.gitignore`:
      Add `!.env.example` immediately after line 34 (`.env*`).
   e. In `d:\SOUQ\.github\workflows\ci.yml`:
      Create the CI workflow file per m1_explorer_3's specification (running on push & PR for main/master, installing dependencies, checking fix-magic-string, validating git tracking of .env.example, running lint, typecheck, and test).
6. VERIFICATION (MANDATORY):
   You must run every verification command and report the exact outputs:
   - `node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8')); console.log('VALID JSON');"` -> Must output VALID JSON
   - `npx tsc --noEmit` -> Must exit with 0 errors
   - `git check-ignore -v .env.example` -> Must exit with code 1 (not ignored)
   - `npm run lint` -> Must execute ESLint cleanly
   - `npm test` -> Must pass 46/46 baseline tests
   - `npm run build` -> Must compile successfully
7. Deliverables:
   - Write your implementation report to `d:\SOUQ\.agents\teamwork\m1_worker_3\changes.md`.
   - Write your complete handoff report to `d:\SOUQ\.agents\teamwork\m1_worker_3\handoff.md`.
   - Send a concise message to parent (Recipient="e11a332c-80c3-4ae7-a6ca-d715b731b7d4") when done.
