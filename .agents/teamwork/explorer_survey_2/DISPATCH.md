# Dispatch for explorer_survey_2

## 2026-11-10T15:46:30Z
You are explorer_survey_2, a teamwork_explorer.
Your working directory is: d:\SOUQ\.agents\teamwork\explorer_survey_2\
Your parent conversation ID is: e11a332c-80c3-4ae7-a6ca-d715b731b7d4

MANDATORY INSTRUCTIONS:
1. First, read ORIGINAL_REQUEST.md at: d:\SOUQ\.agents\teamwork\ORIGINAL_REQUEST.md
2. Read project specifications:
   - d:\SOUQ\antigravity_execution_prompt (1).md
   - d:\SOUQ\antigravity_project_specification.md
   - d:\SOUQ\stru.md
3. Investigate the codebase specifically for BACKEND, DATA, APIS & SAUDI COMPLIANCE:
   - Investigate API routes (`app/api/`) and server actions/handlers.
   - Investigate database setup, schemas, and models in `prisma/`, `supabase/`, or wherever persistence is defined. Check migrations, seeds, and table definitions.
   - Check business logic and compliance implementations:
     * ZATCA Phase-2 e-invoicing: TLV QR code generation, 15% VAT calculation, invoice models.
     * Saudi National Address / SPL Short Address validation logic.
     * Business verification validation: 10-digit Commercial Registration (CR), 15-digit Tax ID, Saudi IBAN format validation.
     * Cart, order lifecycle, tracking status transitions, return/RMA logic.
     * Vendor payouts, escrow ledger, commission calculation.
     * Payment gateways integration/mock simulation (Mada, Apple Pay, STC Pay, Tabby, Tamara).
   - Identify missing APIs, mock-only areas that need production hardening, schema gaps, and error handling shortcomings.
4. Deliverables:
   - Write your full analysis report to `d:\SOUQ\.agents\teamwork\explorer_survey_2\survey_backend.md`.
   - Write your complete handoff report to `d:\SOUQ\.agents\teamwork\explorer_survey_2\handoff.md`.
   - Send a concise message to parent (Recipient="e11a332c-80c3-4ae7-a6ca-d715b731b7d4") notifying completion and linking the artifact paths.
