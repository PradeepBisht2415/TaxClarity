# TaxClarity: Implementation Tasks Breakdown

This document breaks down the implementation of **TaxClarity** (Browser-Only Indian Income Tax Calculator for FY 2026-27 / AY 2027-28) from [TaxClarity_PRD.md](file:///D:/TaxClarity/TaxClarity_PRD.md) into atomic, phased, dependency-tracked tasks.

---

## Dependency Graph Overview

```
Phase 1: Setup & Engine
TASK-101 (Setup) ───► TASK-102 (Types) ───► TASK-103 (Tax Config)
                                   │                   │
                                   ▼                   ▼
                           TASK-104 (Format)   TASK-105 (Deductions) ──► TASK-106 (HRA)
                                                       │                         │
                                                       ▼                         ▼
                                               TASK-107 (Slabs)          TASK-108 (Surcharge)
                                                       │                         │
                                                       └──────────┬──────────────┘
                                                                  ▼
                                                          TASK-109 (Orchestrator)
                                                                  │
                                                                  ▼
                                                          TASK-110 (Engine Tests)
                                                                  │
                                                                  ▼
Phase 2: Wizard UI
TASK-201 (State) ◄────────────────────────────────────────────────┘
       │
       ├─────────────► TASK-202 (UI Primitives)
       │                      │
       ▼                      ▼
TASK-203 (Wizard Shell) ──► TASK-204 (Step 1: Profile)
       │               ──► TASK-205 (Step 2: Income)
       │               ──► TASK-206 (Step 3: Salary Details)
       │               ──► TASK-207 (Step 4: Deductions)
       │               ──► TASK-208 (Step 5: Regime Preference)
       ▼
TASK-209 (Form Validation)
       │
       ▼
Phase 3: Summary & Integration
TASK-301 (Engine Integration Hook)
       │
       ├─────────────► TASK-302 (Savings Banner)
       ├─────────────► TASK-303 (Side-by-Side Comparison Matrix)
       ├─────────────► TASK-304 (Itemised Deductions Drawer/Modal)
       ├─────────────► TASK-305 (User Selection & Diff View)
       ▼
TASK-306 (Navigation & Reset Flow)
       │
       ▼
Phase 4: Polish, Privacy & Insights
TASK-401 (Local Persistence & Privacy)
TASK-402 (Print & PDF Export)
TASK-403 (Break-Even Deduction Insight)
TASK-404 (Visual Comparison Chart)
TASK-405 (Disclaimers & Config Metadata)
TASK-406 (Accessibility & WCAG AA Audit)
TASK-407 (Mobile Responsiveness Audit)
       │
       ▼
Phase 5: Hardening & Release
TASK-501 (Boundary & Edge Case Tests)
TASK-502 (PWA & Offline Worker)
TASK-503 (Bundle Size & Performance Audit)
TASK-504 (README & Year-Update Guide)
```

---

## Phase 1: Project Setup & Core Calculation Engine

> **Goal:** Create a 100% pure TypeScript calculation engine with zero UI dependencies, configured declaratively for FY 2026-27, and fully verified by unit tests against PRD test vectors.

- [x] **TASK-101: Project Scaffolding & Tooling Setup**
  - **Phase:** Phase 1
  - **Depends on:** None
  - **Description:** Initialize Vite + React (TypeScript) project. Configure Tailwind CSS, Vitest with coverage reporter (`v8`), ESLint, and Prettier.
  - **Acceptance Criteria:**
    - `npm run dev` boots the Vite development server cleanly.
    - `npm run test` executes Vitest and reports test run status.
    - Tailwind CSS classes compile and apply without warnings.
    - Path aliases (e.g. `@/engine`, `@/components`, `@/utils`) configured in `tsconfig.json` and `vite.config.ts`.

- [x] **TASK-102: Data Contracts & Type Definitions**
  - **Phase:** Phase 1
  - **Depends on:** TASK-101
  - **Description:** Define TypeScript interfaces in `src/engine/types.ts` for inputs, outputs, regimes, deduction items, user profiles, and config structures matching PRD Section 3.2.
  - **Deliverable Types:**
    - `Regime` ('old' | 'new')
    - `AgeCategory` ('below60' | 'senior' | 'superSenior')
    - `TaxInput` (income heads, profile, deductions, basic+DA, salary details)
    - `TaxResult` (grossTotalIncome, standardDeduction, otherDeductions, taxableIncome, slabTax, rebate, marginalRelief, surcharge, cess, totalTax, effectiveRate)
    - `TaxComparison` (old: TaxResult, new: TaxResult, betterRegime: Regime | 'equal', savings: number)
  - **Acceptance Criteria:**
    - Strict types with no `any`.
    - Fully exported and importable across engine modules.

- [x] **TASK-103: Declarative Tax Configuration (`taxConfig.ts`)**
  - **Phase:** Phase 1
  - **Depends on:** TASK-102
  - **Description:** Create `src/engine/taxConfig.ts` holding all tax slabs, rates, limits, rebate thresholds, surcharge bands, and statutory section references for FY 2026-27 (AY 2027-28).
  - **Configuration Elements:**
    - `financialYear`: "2026-27", `assessmentYear`: "2027-28", `lastVerifiedDate`: "2026-11-19".
    - New regime slabs: 0-4L (0%), 4-8L (5%), 8-12L (10%), 12-16L (15%), 16-20L (20%), 20-24L (25%), >24L (30%).
    - Old regime slabs by age: Below 60 (2.5L threshold), 60-79 (3L threshold), 80+ (5L threshold).
    - Standard deduction: ₹75,000 (New), ₹50,000 (Old).
    - Section 87A / Sec 156 rebate: New regime (threshold 12L, max 60k), Old regime (threshold 5L, max 12.5k).
    - Deduction caps: 80C (1.5L), 80CCD(1B) (50k), 80CCD(2) (10% old / 14% new of basic+DA), 80D self (25k/50k), 80D parents (25k/50k), 80TTA (10k), 80TTB (50k), Sec 24b home loan interest (2L).
    - Surcharge slabs & 4% cess.
  - **Acceptance Criteria:**
    - Zero magic numbers in calculation logic; all rates read strictly from `taxConfig`.
    - Updating a slab rate in `taxConfig.ts` changes calculation output without code edits in engine files.

- [x] **TASK-104: Indian Currency & Math Formatting Utilities**
  - **Phase:** Phase 1
  - **Depends on:** TASK-101
  - **Description:** Implement `src/utils/format.ts` for Indian numbering format (`en-IN` style: `12,34,567`), currency parsing, and tax rounding helpers.
  - **Functions:**
    - `formatINR(amount: number, options?: { showSymbol?: boolean }): string`
    - `parseINR(value: string): number`
    - `roundDownTo10(value: number): number` (Sec 288A: rounding taxable income down to nearest 10)
    - `roundToRupee(value: number): number` (Sec 288B: rounding total tax to nearest rupee)
  - **Acceptance Criteria:**
    - Unit tests verify formatting with lakh/crore commas (e.g. `1234567` -> `"₹12,34,567"`).
    - Parsing correctly handles commas, spaces, currency symbols, and invalid characters.
    - Rounding down to nearest 10 verified (e.g., 5,00,009 -> 5,00,000; 5,00,011 -> 5,00,010).

- [x] **TASK-105: Deductions & Standard Deduction Engine**
  - **Phase:** Phase 1
  - **Depends on:** TASK-102, TASK-103
  - **Description:** Implement `src/engine/deductions.ts` to compute allowable deductions for both regimes, applying individual statutory caps and regime eligibility.
  - **Requirements:**
    - Standard deduction applies only against salary/pension income: `min(grossSalary, standardDeductionCap)`.
    - 80C capped at ₹1,50,000 (Old regime only).
    - 80CCD(1B) capped at ₹50,000 (Old regime only).
    - 80CCD(2) employer NPS: 10% of basic+DA in Old, 14% of basic+DA in New regime.
    - 80D self & family: ₹25,000 (₹50,000 if senior).
    - 80D parents: ₹25,000 (₹50,000 if parent is senior).
    - 80TTA/80TTB: Capped against interest income, TTA max 10k (non-seniors), TTB max 50k (seniors).
    - Sec 24b self-occupied home loan interest: capped at ₹2,00,000 (Old only).
    - Total deductions must not reduce taxable income below 0.
  - **Acceptance Criteria:**
    - Returns itemized list with `label`, `claimed`, and `allowed` amounts.
    - Disallows old-regime-only deductions when computing New regime.

- [x] **TASK-106: HRA Exemption Calculator**
  - **Phase:** Phase 1
  - **Depends on:** TASK-102, TASK-103
  - **Description:** Implement `calculateHRAExemption` in `src/engine/hra.ts` (or `deductions.ts`) as per PRD Section 2.6.
  - **Formula:**
    - Exemption = `min(actualHRA, rentPaid - 0.10 * basicDA, (isMetro ? 0.50 : 0.40) * basicDA)`
    - Floor at 0. Old regime only.
  - **Acceptance Criteria:**
    - Test Vector #9 verified: Basic+DA 6,00,000; HRA 2,40,000; Rent 3,00,000; Metro -> Exemption = ₹2,40,000.
    - Negative or rent < 10% basic yields ₹0 exemption.

- [x] **TASK-107: Slabs & Rebate Calculation Engine**
  - **Phase:** Phase 1
  - **Depends on:** TASK-102, TASK-103, TASK-104
  - **Description:** Implement `src/engine/slabs.ts` to calculate slab tax, Section 87A/156 rebate, and marginal relief on taxable income.
  - **Logic:**
    - **New Regime:**
      - Calculate tax through progressive slabs.
      - If taxable income <= ₹12,00,000: Rebate = slabTax (up to ₹60,000) -> Tax = 0.
      - If taxable income > ₹12,00,000: Marginal relief = `max(0, slabTax - (taxableIncome - 12,00,000))`. Tax after relief = `slabTax - marginalRelief`.
    - **Old Regime:**
      - Slab threshold determined by age category (below 60, senior, super senior).
      - If taxable income <= ₹5,00,000: Rebate = `min(slabTax, 12,500)`.
      - No marginal relief under Old Regime Section 87A.
  - **Acceptance Criteria:**
    - Test Vectors #1, #2, #3, #4, #5, #8 pass with exact expected values.

- [x] **TASK-108: Surcharge & Surcharge Marginal Relief Engine**
  - **Phase:** Phase 1
  - **Depends on:** TASK-102, TASK-103
  - **Description:** Implement `src/engine/surcharge.ts` for surcharge calculation across all income brackets (50L, 1Cr, 2Cr, 5Cr) with mandatory marginal relief.
  - **Rules:**
    - New Regime: surcharge capped at 25% for income > 2Cr (no 37% slab).
    - Old Regime: 10% (50L-1Cr), 15% (1Cr-2Cr), 25% (2Cr-5Cr), 37% (>5Cr).
    - Marginal relief formula at threshold `T`:
      - `marginalLimit = (tax on threshold T with lower surcharge) + (totalIncome - T)`
      - If `tax + rawSurcharge > marginalLimit`: `surcharge = max(0, marginalLimit - tax)`.
  - **Acceptance Criteria:**
    - Test Vector #6: Taxable ₹50,50,000 -> Surcharge after marginal relief is exactly ₹35,000.

- [x] **TASK-109: Master Tax Calculation Orchestrator**
  - **Phase:** Phase 1
  - **Depends on:** TASK-104, TASK-105, TASK-106, TASK-107, TASK-108
  - **Description:** Implement `calculateTax(input: TaxInput): TaxComparison` in `src/engine/calculate.ts` orchestrating both regimes.
  - **Order of Execution:**
    1. Calculate Gross Total Income = Salary + Interest + Rental + Other.
    2. Compute allowable deductions per regime (including standard deduction and HRA).
    3. Taxable Income = `max(0, Gross - Total Deductions)`, rounded down to nearest 10 (Sec 288A).
    4. Compute Slab Tax.
    5. Compute Rebate and Marginal Relief on rebate.
    6. Compute Surcharge with surcharge marginal relief.
    7. Add 4% Health & Education Cess on (Tax after rebate + Surcharge).
    8. Total Tax = rounded to nearest Rupee (Sec 288B).
    9. Effective Tax Rate = `(Total Tax / Gross Total Income) * 100`.
    10. Determine `betterRegime` and `savings` amount.
  - **Acceptance Criteria:**
    - Pure function with no external or DOM state.
    - Test Vector #7: Gross ₹15,00,000; 80C ₹1.5L; 80D ₹25k -> New Regime total ₹97,500, Old Regime total ₹2,02,800, New wins by ₹1,05,300.

- [x] **TASK-110: Engine Unit Test Suite & Vector Verification**
  - **Phase:** Phase 1
  - **Depends on:** TASK-109
  - **Description:** Create comprehensive Vitest suite in `tests/engine/` validating all 10 test vectors from PRD Section 7 and edge cases from Section 8.
  - **Acceptance Criteria:**
    - 100% of PRD test vectors (1 through 10) pass.
    - Salary < standard deduction edge case tested (standard deduction capped to salary).
    - Deductions exceeding gross income tested (taxable income floored at 0).
    - 90%+ code coverage across all `/engine` files.

---

## Phase 2: Wizard UI & Input Handling

> **Goal:** Build an accessible, mobile-first 5-step wizard with real-time Indian currency input masking, validation, conditional fields, and deduction limit warnings.

- [x] **TASK-201: Global Wizard State Management**
  - **Phase:** Phase 2
  - **Depends on:** TASK-102
  - **Description:** Create React Context or Zustand store (`src/context/TaxContext.tsx`) to manage the wizard state, current step index, user inputs, errors, and regime preference.
  - **State Model:**
    - `step`: number (1-6)
    - `maxStepReached`: number
    - `input`: `TaxInput`
    - `preference`: 'old' | 'new' | 'compare'
    - Actions: `updateInput(patch)`, `setStep(index)`, `nextStep()`, `prevStep()`, `reset()`
  - **Acceptance Criteria:**
    - Navigating back and forward preserves all entered values.
    - State updates trigger calculation reactivity without lagging.

- [x] **TASK-202: UI Primitives Component Library**
  - **Phase:** Phase 2
  - **Depends on:** TASK-104
  - **Description:** Build reusable UI components in `src/components/common/`:
    - `CurrencyInput`: Formatted INR display with raw numeric entry, automatic comma insertion, leading zero handling, and blocking negative/alphabetic characters.
    - `RadioGroup`: Accessible card/radio selector for age categories and regime preference.
    - `InfoTooltip`: Accessible hover/touch tooltip explaining tax terms (80C, 80D, standard deduction, etc.).
    - `CapWarningBadge`: Visual badge showing "Max ₹X,XX,XXX allowed" when input exceeds statutory cap.
  - **Acceptance Criteria:**
    - Inputs work smoothly on touch devices and keyboards.
    - Numbers formatted with Indian comma notation as user types.

- [x] **TASK-203: Wizard Shell, Stepper & Navigation Controls**
  - **Phase:** Phase 2
  - **Depends on:** TASK-201, TASK-202
  - **Description:** Create `src/components/Wizard/WizardLayout.tsx`, step progress bar, step indicators, and "Back" / "Continue" footer bar.
  - **Features:**
    - Step bar with step numbers and labels (Profile, Income, Salary, Deductions, Regime, Summary).
    - Clickable step headers to jump to any previously visited step.
    - Sticky bottom navigation bar on mobile viewports.
  - **Acceptance Criteria:**
    - Back button disabled on Step 1.
    - Progress percentage updates smoothly with accessible ARIA progressbar tags.

- [x] **TASK-204: Step 1 - Profile & Demographics Screen**
  - **Phase:** Phase 2
  - **Depends on:** TASK-201, TASK-203
  - **Description:** Implement `src/components/Wizard/StepProfile.tsx`.
  - **Inputs:**
    - Age category selector: "Below 60 years", "60 to 79 years (Senior)", "80+ years (Super Senior)".
    - Residency confirmation checkbox/badge (Default: Resident individual; show non-resident out-of-scope note).
    - Income source selector: "Salaried / Pensioner", "Self-employed / Other".
  - **Acceptance Criteria:**
    - Selection of age adjusts deduction caps (e.g. 80D, 80TTB) downstream.
    - Selecting "Other" dynamically hides Step 3 (Salary Details) in the flow.

- [x] **TASK-205: Step 2 - Income Details Screen**
  - **Phase:** Phase 2
  - **Depends on:** TASK-201, TASK-203
  - **Description:** Implement `src/components/Wizard/StepIncome.tsx`.
  - **Inputs:**
    - Gross Annual Salary or Pension (INR).
    - Interest Income (Savings accounts, Fixed Deposits).
    - Rental Income (Net annual value entered after 30% standard deduction).
    - Other Income (taxable at normal slab rates).
  - **Acceptance Criteria:**
    - Total Gross Income displays dynamically at the bottom.
    - Empty inputs treated as ₹0 without throwing errors.

- [x] **TASK-206: Step 3 - Conditional Salary & HRA Details Screen**
  - **Phase:** Phase 2
  - **Depends on:** TASK-201, TASK-203, TASK-106
  - **Description:** Implement `src/components/Wizard/StepSalaryDetails.tsx`. Shown only if user is Salaried/Pensioner.
  - **Inputs:**
    - Basic Salary + Dearness Allowance (DA).
    - HRA Received (annual).
    - Total Rent Paid (annual).
    - Metro City toggle (Delhi, Mumbai, Kolkata, Chennai -> 50% basic; else 40%).
    - LTA Exemption claimed.
    - Professional Tax paid (default quick-fill: ₹2,500).
    - Employer NPS contribution (Sec 80CCD(2)).
  - **Features:**
    - Live calculated HRA Exemption preview card displaying calculated exempt amount.
  - **Acceptance Criteria:**
    - Automatically skipped if user selected non-salaried in Step 1.
    - HRA live preview updates instantly when rent or basic changes.

- [x] **TASK-207: Step 4 - Deductions Screen with Live Cap Feedback**
  - **Phase:** Phase 2
  - **Depends on:** TASK-201, TASK-202, TASK-203, TASK-105
  - **Description:** Implement `src/components/Wizard/StepDeductions.tsx` covering all Section 2.5 deductions.
  - **Inputs:**
    - Section 80C (PPF, EPF, ELSS, Life Insurance, Tuition Fees) -> capped at ₹1,50,000.
    - Section 80CCD(1B) (Self NPS) -> capped at ₹50,000.
    - Section 80D Health Insurance (Self/Family) -> ₹25,000 (₹50,000 if senior).
    - Section 80D Health Insurance (Parents) -> ₹25,000 (₹50,000 if parent is senior toggle).
    - Section 80E (Higher Education Loan Interest) -> no cap.
    - Section 80TTA / 80TTB (Savings interest) -> auto-populated/capped.
    - Section 80G (Eligible donations).
    - Section 24(b) (Home loan interest for self-occupied property) -> capped at ₹2,00,000.
  - **Features:**
    - Live warning badge if entered amount exceeds statutory limit (e.g. "Allowed: ₹1,50,000").
    - Info tooltip for every section explaining eligible investments.
  - **Acceptance Criteria:**
    - Test Vector #10 verified: Entering ₹2,00,000 in 80C displays cap warning and caps deduction at ₹1,50,000.

- [x] **TASK-208: Step 5 - Regime Preference Selection**
  - **Phase:** Phase 2
  - **Depends on:** TASK-201, TASK-203
  - **Description:** Implement `src/components/Wizard/StepRegimePreference.tsx`.
  - **Inputs:**
    - Radio options: "Compare both regimes (Recommended)", "I prefer New Regime", "I prefer Old Regime".
    - Explanatory note: App always calculates both regimes regardless of choice so user can see financial impact.
  - **Acceptance Criteria:**
    - Default selection set to "Compare both".
    - Submitting Step 5 moves user to Step 6 (Summary).

- [x] **TASK-209: Input Validation & Sanitization Layer**
  - **Phase:** Phase 2
  - **Depends on:** TASK-201, TASK-202
  - **Description:** Implement input sanitization and boundary constraints across all wizard steps.
  - **Rules:**
    - Block negative numbers and non-numeric characters.
    - Cap maximum input ceiling at ₹100 Crores (prevent JavaScript `Number.MAX_SAFE_INTEGER` overflow).
    - Auto-trim clipboard paste containing formatting like `₹` or commas.
  - **Acceptance Criteria:**
    - Pasting `"₹ 15,00,000"` cleanses cleanly to numeric `1500000`.
    - No `NaN` or unhandled errors on extreme values.

---

## Phase 3: Summary, Comparison & Engine Integration

> **Goal:** Connect the UI to the tax calculation engine and display side-by-side comparison cards, savings banner, and itemized deduction breakdowns.

- [x] **TASK-301: Engine Integration Hook (`useTaxComputation`)**
  - **Phase:** Phase 3
  - **Depends on:** TASK-109, TASK-201
  - **Description:** Implement custom React hook `useTaxComputation()` that takes the wizard store state and memoizes the calculation output via `calculateTax()`.
  - **Acceptance Criteria:**
    - Recalculates in < 10ms upon any state change.
    - Returns full `TaxComparison` object with Old and New `TaxResult`.

- [x] **TASK-302: Prominent Savings & Recommendation Banner**
  - **Phase:** Phase 3
  - **Depends on:** TASK-301
  - **Description:** Create `src/components/Summary/SavingsBanner.tsx`.
  - **States:**
    - New Regime wins: Green banner — "**New regime saves you ₹X,XX,XXX**".
    - Old Regime wins: Green banner — "**Old regime saves you ₹X,XX,XXX**".
    - Tie: Blue banner — "**Both regimes result in the exact same tax**".
    - Highlight user's preference if specified in Step 5 (e.g. "Your selected regime saves you..." or "Your selected regime costs ₹X more").
  - **Acceptance Criteria:**
    - Banner clearly indicates which regime is financially beneficial.
    - Savings amount formatted with Indian currency symbols.

- [x] **TASK-303: Side-by-Side Tax Comparison Matrix**
  - **Phase:** Phase 3
  - **Depends on:** TASK-301
  - **Description:** Create `src/components/Summary/ComparisonTable.tsx` presenting side-by-side breakdown for Old vs New regime.
  - **Line Items:**
    - Gross Total Income
    - Standard Deduction
    - Other Deductions & Exemptions (with "View Breakdown" toggle)
    - Taxable Income
    - Slab Tax (before rebate)
    - Rebate (Sec 87A / Sec 156) & Marginal Relief
    - Surcharge (with marginal relief if applicable)
    - Health & Education Cess (4%)
    - **Total Tax Payable** (highlighted)
    - Effective Tax Rate (%)
    - Monthly Tax Burden (`Total Tax / 12`)
  - **Acceptance Criteria:**
    - On mobile (< 640px), renders as stacked cards with tab/toggle switcher.
    - On desktop (>= 640px), renders side-by-side columns with winning regime column highlighted.

- [x] **TASK-304: Itemised Deductions & Exemptions Breakdown**
  - **Phase:** Phase 3
  - **Depends on:** TASK-301, TASK-105
  - **Description:** Implement `src/components/Summary/ItemisedDeductions.tsx` allowing users to expand and view exactly which deductions were applied under Old vs New regime.
  - **Features:**
    - Shows Claimed vs Allowed amounts for each section (80C, 80D, HRA, etc.).
    - Clear visual explanation that most Chapter VI-A deductions are not allowable under the New Regime.
  - **Acceptance Criteria:**
    - Accordion or modal expands smoothly.
    - Allowed values match PRD rules and individual statutory caps.

- [x] **TASK-305: "Your Selection" Highlight & Differential Analysis**
  - **Phase:** Phase 3
  - **Depends on:** TASK-301, TASK-302
  - **Description:** When the user selects a preferred regime in Step 5 (other than "Compare both"), add a dedicated badge to their chosen column and display a comparison message.
  - **Acceptance Criteria:**
    - If user picked Old regime but New regime saves ₹50,000, display warning: *"You chose Old Regime, but New Regime saves you ₹50,000."*

- [x] **TASK-306: Step Navigation, Edit Inputs & Reset Flow**
  - **Phase:** Phase 3
  - **Depends on:** TASK-201, TASK-303
  - **Description:** Implement action buttons on the Summary screen:
    - "Edit Details": Returns user to Step 1 or a step selection menu without wiping data.
    - "Start Over": Confirmation dialog to reset all inputs to defaults and return to Step 1.
  - **Acceptance Criteria:**
    - Editing does not lose previously entered numbers.
    - Reset clears all state and resets step to 1.

---

## Phase 4: Polish, Privacy, Offline & Advanced Insights

> **Goal:** Enhance user experience with client-side privacy controls, print/PDF export, break-even analysis, visual charts, and accessibility compliance.

- [x] **TASK-401: Local Storage Persistence & Privacy Shield**
  - **Phase:** Phase 4
  - **Depends on:** TASK-201
  - **Description:** Implement optional `localStorage` persistence in `src/utils/storage.ts` with explicit user consent.
  - **Features:**
    - Default: Off (no persistence across sessions).
    - Toggle: "Remember my inputs on this device".
    - Button: "Clear saved data".
    - Prominent privacy badge: *"Your data never leaves your device. 100% offline & client-side."*
  - **Acceptance Criteria:**
    - When toggle is disabled, refreshing browser clears data.
    - When toggle is enabled, data persists across reloads.
    - Zero network requests sent when toggling or clearing storage.

- [x] **TASK-402: Print Stylesheet & Save as PDF Export**
  - **Phase:** Phase 4
  - **Depends on:** TASK-303, TASK-304
  - **Description:** Add print stylesheet (`@media print`) and "Download / Print Tax Summary" button invoking `window.print()`.
  - **Requirements:**
    - Hides wizard navigation, stepper, buttons, and decorative elements during print.
    - Formats comparison table into a clean, 1-page printable tax report including date, financial year, and disclaimer.
  - **Acceptance Criteria:**
    - Print preview displays clean layout with no cropped tables or awkward page breaks.

- [x] **TASK-403: Old Regime Break-Even Deduction Calculator**
  - **Phase:** Phase 4
  - **Depends on:** TASK-301
  - **Description:** Implement `src/components/Summary/BreakEvenInsight.tsx` calculating the exact additional deduction required under the Old Regime to match or beat the New Regime.
  - **Logic:**
    - Compute Old Regime tax at current deductions.
    - If New Regime is cheaper, solve for the additional deductions needed under Old Regime such that Old Tax <= New Tax.
    - If achievable, display: *"You need ₹X more in deductions under Old Regime to make it better than New Regime."*
    - If impossible (e.g. already capped or mathematical floor reached), inform user gently.
  - **Acceptance Criteria:**
    - Insight displayed in summary screen when New Regime wins.

- [x] **TASK-404: Visual Tax Breakdown & Comparison Chart**
  - **Phase:** Phase 4
  - **Depends on:** TASK-301
  - **Description:** Implement a lightweight SVG / Tailwind-based bar chart comparing Old vs New regime total tax and take-home income.
  - **Acceptance Criteria:**
    - Zero heavy external chart libraries (keeps bundle size under 300KB).
    - Clear visual representation of Take-Home Pay vs Tax Paid for both regimes.

- [x] **TASK-405: Disclaimers, Legal Footnotes & Last-Verified Config UI**
  - **Phase:** Phase 4
  - **Depends on:** TASK-103
  - **Description:** Implement statutory disclaimers in `src/components/common/Disclaimer.tsx` and footer.
  - **Text:**
    - *"Calculations cover resident individuals and income taxed at normal slab rates for FY 2026-27 (AY 2027-28)."*
    - *"Capital gains, business income, foreign income, HUF and non-residents are out of scope."*
    - *"Tax law is subject to change. This tool provides estimates for information only and is not tax advice."*
    - Display config's `lastVerifiedDate` and `financialYear`.
  - **Acceptance Criteria:**
    - Disclaimer visible on footer and summary screen.

- [x] **TASK-406: Accessibility (a11y) & WCAG AA Audit**
  - **Phase:** Phase 4
  - **Depends on:** TASK-202, TASK-203, TASK-303
  - **Description:** Conduct complete accessibility pass for WCAG AA compliance.
  - **Checklist:**
    - Proper `<label>` for every input field.
    - Keyboard navigable tabs, steps, tooltips, and buttons (`Tab`, `Shift+Tab`, `Enter`, `Space`).
    - Visible focus rings (`focus-visible:ring-2`).
    - ARIA attributes: `aria-expanded`, `aria-describedby` for cap warnings, `role="table"` for summary.
    - High contrast text matching WCAG AA minimum 4.5:1 ratio.
  - **Acceptance Criteria:**
    - Lighthouse Accessibility score of 90+ (or 0 axe-core critical violations).

- [x] **TASK-407: Mobile Responsiveness Audit (360px Viewport)**
  - **Phase:** Phase 4
  - **Depends on:** TASK-203, TASK-303
  - **Description:** Test and refine layout on 360px wide viewports (e.g. small Android screens).
  - **Acceptance Criteria:**
    - No horizontal scrolling or content clipping on 360px viewport width.
    - Touch targets for all buttons and inputs are at least 44x44px.

---

## Phase 5: Hardening, Edge Cases, PWA & Release

> **Goal:** Verify extreme boundary scenarios, configure PWA offline capability, optimize bundle size, and write clear documentation for yearly tax updates.

- [x] **TASK-501: Boundary & Edge Case Test Suite**
  - **Phase:** Phase 5
  - **Depends on:** TASK-110
  - **Description:** Implement edge case unit tests in `tests/engine/boundary.test.ts`.
  - **Scenarios:**
    - Exact rebate threshold boundaries: ₹12,00,000 and ₹12,00,010 (marginal relief onset).
    - ₹12,75,000 threshold (where New Regime marginal relief tapers off).
    - Old Regime ₹5,00,000 vs ₹5,00,010 (sudden cliff edge).
    - Surcharge transition boundaries: ₹50,00,000 vs ₹50,00,010; ₹1,00,00,000; ₹2,00,00,000; ₹5,00,00,000.
    - Super-senior citizen (age 80+) with ₹5,00,000 exemption limit.
    - Salary lower than standard deduction (e.g. ₹40,000 salary with ₹75,000 standard deduction).
    - Deductions exceeding total income.
    - Extreme income amounts (₹50 Crores, ₹100 Crores) testing precision and no NaN.
  - **Acceptance Criteria:**
    - All boundary tests pass with exact statutory calculations.

- [x] **TASK-502: Offline Service Worker / PWA Configuration**
  - **Phase:** Phase 5
  - **Depends on:** TASK-101
  - **Description:** Configure `vite-plugin-pwa` to enable offline usage, app manifest, and service worker caching of static assets.
  - **Acceptance Criteria:**
    - App can be installed to home screen / desktop.
    - App loads and functions completely offline with network disconnected.
    - Zero external CDN links or un-cached external resources.

- [x] **TASK-503: Production Build & Bundle Size Audit**
  - **Phase:** Phase 5
  - **Depends on:** TASK-502
  - **Description:** Run production build and analyze bundle output.
  - **Acceptance Criteria:**
    - `npm run build` generates static assets in `dist/`.
    - Total gzipped bundle size is under 300KB.
    - No build warnings or TypeScript errors.

- [x] **TASK-504: Comprehensive Documentation & Yearly Tax Update Guide**
  - **Phase:** Phase 5
  - **Depends on:** TASK-103
  - **Description:** Write `README.md` detailing:
    - Overview and feature list.
    - Local setup instructions (`npm install`, `npm run dev`, `npm run test`, `npm run build`).
    - Architectural overview (Engine vs UI separation).
    - **Yearly Tax Update Guide**: Step-by-step instructions for updating `taxConfig.ts` when a new Union Budget changes slabs, rebate limits, or standard deduction.
  - **Acceptance Criteria:**
    - Any developer can follow the README to update tax rates for a future FY without modifying calculation logic.

---

## Task Verification Matrix

| Phase | Tasks Count | Verification Method | Exit Criteria |
|---|---|---|---|
| **Phase 1: Setup & Engine** | 10 tasks (101-110) | Automated unit tests (`npm run test`) | All 10 PRD test vectors pass, >90% coverage in `/engine`, zero UI dependencies |
| **Phase 2: Wizard UI** | 9 tasks (201-209) | Component & interaction testing | User can traverse steps 1-5, values retained, caps enforced, invalid input blocked |
| **Phase 3: Summary & Integration** | 6 tasks (301-306) | End-to-end flow testing | Engine outputs live results to summary table, winning regime accurately identified |
| **Phase 4: Polish & Privacy** | 7 tasks (401-407) | Network inspection, Lighthouse, Print test | Zero outgoing network requests, Lighthouse a11y >= 90, print layout functional |
| **Phase 5: Hardening & Release** | 4 tasks (501-504) | Boundary tests, offline test, build check | Production build < 300KB gzipped, offline works via PWA, documentation complete |
