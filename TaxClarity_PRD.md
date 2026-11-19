# PRD: Indian Income Tax Calculator (Browser-Only Web App)

**Version:** 1.0
**Tax year covered:** FY 2026-27 (AY 2027-28)
**Audience:** AI coding tool / developer building the app

---

## 1. Overview

A single-page web app that guides an individual taxpayer through entering income and deductions. It computes tax under both the **old** and **new** regimes and shows which one costs less. All calculation happens in the browser. There is no backend, no network call with user data, no analytics and no accounts.

### 1.1 Goals
- Step-by-step wizard for income, deductions and regime preference.
- Accurate tax computation, including standard deduction, slabs, rebate (Sec 87A, now Sec 156 of the Income-tax Act 2025), marginal relief, surcharge and 4% cess.
- Clear summary: total income, deductions, taxable income, tax under each regime, and the better regime with the savings amount.
- 100% client-side. It should work offline after the first load.

### 1.2 Non-Goals (v1)
- Filing returns, generating ITR forms, Form 16 parsing.
- Capital gains (special rates), crypto, F&O or business income presumptive schemes, foreign income, non-residents, HUFs.
- User accounts, cloud sync, backend of any kind.
- Advance tax and TDS reconciliation.

### 1.3 Assumptions
- User is a **resident individual**. Age category: below 60, 60-79 (senior), 80+ (super senior).
- Income is mainly **salary or pension** plus **other income taxed at slab rates** (interest, rental income, etc.).
- If the user chooses a regime in the wizard, it is highlighted as "your selection". The app always computes both so it can compare.

---

## 2. Tax Rules Specification (FY 2026-27)

> All rates MUST live in one config file (`taxConfig.ts`), not be hardcoded in logic. Add a `financialYear` field so future years can be added. Show a visible disclaimer and the config's "last verified" date in the UI.

### 2.1 New Regime (default)
Same slabs for all ages.

| Taxable income (INR) | Rate |
|---|---|
| Up to 4,00,000 | Nil |
| 4,00,001 - 8,00,000 | 5% |
| 8,00,001 - 12,00,000 | 10% |
| 12,00,001 - 16,00,000 | 15% |
| 16,00,001 - 20,00,000 | 20% |
| 20,00,001 - 24,00,000 | 25% |
| Above 24,00,000 | 30% |

- **Standard deduction (salary/pension):** 75,000 (or the salary amount if lower).
- **Rebate:** if taxable income <= 12,00,000, the rebate equals the slab tax, up to 60,000, so tax is nil.
- **Marginal relief:** if taxable income is above 12,00,000, tax (before cess) = min(slab tax, taxable income - 12,00,000). This applies only while slab tax is greater than the excess.
- Rebate applies to residents only. It does not apply to special-rate income (out of scope in v1).

### 2.2 Old Regime

| Taxable income | Below 60 | 60-79 | 80+ |
|---|---|---|---|
| Up to 2,50,000 | Nil | Nil | Nil |
| 2,50,001 - 3,00,000 | 5% | Nil | Nil |
| 3,00,001 - 5,00,000 | 5% | 5% | Nil |
| 5,00,001 - 10,00,000 | 20% | 20% | 20% |
| Above 10,00,000 | 30% | 30% | 30% |

- **Standard deduction (salary/pension):** 50,000.
- **Rebate:** if taxable income <= 5,00,000, rebate = min(slab tax, 12,500). **No marginal relief.**

### 2.3 Surcharge (on tax after rebate)

| Total income | Old regime | New regime |
|---|---|---|
| Up to 50L | 0% | 0% |
| 50L - 1Cr | 10% | 10% |
| 1Cr - 2Cr | 15% | 15% |
| 2Cr - 5Cr | 25% | 25% |
| Above 5Cr | 37% | 25% (capped) |

- **Marginal relief on surcharge** at each threshold: (tax + surcharge) must not exceed (tax at the threshold + income above the threshold).
- Tax at the threshold must itself include the surcharge applicable to the lower band.

### 2.4 Cess
4% Health & Education Cess on (tax after rebate + surcharge), in both regimes.

### 2.5 Deductions

| Deduction | Old regime | New regime | Limit / rule |
|---|---|---|---|
| Standard deduction | Yes (50,000) | Yes (75,000) | Auto-applied if salary/pension > 0 |
| 80C (EPF, PPF, ELSS, LIC, tuition, etc.) | Yes | No | Max 1,50,000 |
| 80CCD(1B) additional NPS | Yes | No | Max 50,000 |
| 80CCD(2) employer NPS | Yes | Yes | Cap: 10% of basic+DA (old), 14% (new) |
| 80D health insurance (self/family) | Yes | No | 25,000 (50,000 if senior) |
| 80D parents | Yes | No | 25,000 (50,000 if parent is senior) |
| 80E education loan interest | Yes | No | No cap (interest paid) |
| 80TTA / 80TTB savings interest | Yes | No | 10,000 (TTA, below 60) / 50,000 (TTB, seniors) |
| 80G donations | Yes | No | User enters the eligible amount directly |
| Home loan interest, self-occupied (Sec 24b) | Yes | No | Max 2,00,000 |
| HRA exemption | Yes | No | Computed (see 2.6) |
| LTA exemption | Yes | No | User enters the exempt amount |
| Professional tax | Yes | No | User-entered, usually up to 2,500 |

> Section numbers changed under the Income-tax Act 2025. Show the familiar labels (80C etc.), but keep the section references in config so they can be updated.

### 2.6 HRA Exemption (old regime only)
Exempt HRA = min of:
1. HRA actually received
2. Rent paid - 10% of (basic + DA)
3. 50% of (basic + DA) if metro, else 40%

Floor at 0. The user enters basic+DA, HRA received, annual rent and metro/non-metro.

### 2.7 Income Heads Collected
- Gross salary (annual), or pension
- Other income at slab rates: interest (savings/FD), rental income (net annual value after 30% standard deduction, user-entered), others
- Optional: basic+DA (needed for HRA and NPS caps)

Standard deduction applies only to salary/pension, not other income.

---

## 3. Functional Requirements

### 3.1 Wizard Flow

| Step | Screen | Inputs |
|---|---|---|
| 1 | Profile | Age category, residency confirmation (resident individual), income type (salaried/pensioner or other) |
| 2 | Income | Gross salary/pension, interest income, rental income, other income |
| 3 | Salary details (shown only if salaried) | Basic+DA, HRA received, rent paid, metro flag, LTA exempt, professional tax, employer NPS |
| 4 | Deductions | All old-regime deductions from 2.5, with inline limits and live "applied vs claimed" display |
| 5 | Regime preference | Radio: Old / New / "Compare both" (default) |
| 6 | Summary | Results (see 3.3) |

**Behaviour:**
- Progress indicator, Back/Next, and the ability to jump to any completed step.
- Inputs are INR, with Indian digit grouping (12,34,567) in display and numeric-only validation.
- Negative values are blocked. Empty fields are treated as 0.
- If a value exceeds a cap, show an inline warning ("Capped at 1,50,000") and use the capped value in the calculation.
- Show a small info tooltip for each deduction explaining what it is.

### 3.2 Calculation Engine
- Pure functions, no UI dependencies, fully unit-tested.
- Input: a `TaxInput` object. Output: a `TaxResult` for each regime.

```ts
type Regime = "old" | "new";

interface TaxResult {
  regime: Regime;
  grossTotalIncome: number;
  standardDeduction: number;
  otherDeductions: { label: string; claimed: number; allowed: number }[];
  totalDeductions: number;
  taxableIncome: number;
  slabTax: number;
  rebate: number;
  marginalRelief: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  effectiveRate: number; // percent
}
```

**Calculation order (per regime):**
1. Gross total income = salary + other income
2. Subtract the standard deduction and the regime-eligible deductions
3. Taxable income = max(0, result), **rounded down to the nearest 10 rupees**
4. Slab tax
5. Rebate and marginal relief
6. Surcharge with marginal relief
7. Cess
8. Total tax, **rounded to the nearest rupee**

### 3.3 Summary Screen
- Side-by-side cards or table: **Old** | **New**, with rows for gross total income, deductions (itemised, expandable), taxable income, slab tax, rebate, surcharge, cess, **total tax**, effective rate and monthly tax.
- A prominent banner: "**New regime saves you ₹X**" or "**Old regime saves you ₹X**". If the difference is 0, show "Both regimes result in the same tax".
- If the user picked a regime in step 5, label it "Your selection" and show the savings or extra cost compared with the other.
- A "Break-even" hint: the extra deductions you would need under the old regime for it to win (optional, Phase 4).
- Buttons: Edit inputs, Start over, Print / Save as PDF (via browser print stylesheet).

### 3.4 Privacy
- No `fetch`/XHR calls with user data. No third-party scripts, analytics or fonts loaded from CDNs, so that the app works offline.
- Optional "Remember my inputs" toggle that uses `localStorage`. It is off by default, with a "Clear saved data" button.
- A visible note: "Your data never leaves this device."

---

## 4. Non-Functional Requirements
- **Tech stack:** React + TypeScript + Vite, Tailwind CSS (or plain CSS), Vitest for tests. No backend.
- **Offline:** PWA/service worker in Phase 5 (optional); the app must at minimum be buildable as static files and open via `index.html`.
- **Accessibility:** WCAG AA, labelled inputs, keyboard navigation, visible focus, screen-reader-friendly summary table.
- **Responsive:** mobile-first, usable at 360px width.
- **Performance:** recalculation is instant (under 50ms). The bundle is small (under 300KB gzipped).
- **Localisation:** English in v1. Keep strings in one file for later Hindi support.
- **Disclaimer:** a footer, and on the summary screen: "Estimate for information only; not tax advice. Verify with the Income Tax Department or a qualified CA."

---

## 5. Suggested Project Structure

```
src/
  engine/
    taxConfig.ts        # slabs, limits, rates (single source of truth)
    slabs.ts            # slab tax calculation
    deductions.ts       # caps, HRA, eligibility per regime
    surcharge.ts        # surcharge + marginal relief
    calculate.ts        # orchestrates both regimes
    types.ts
  components/
    Wizard/             # step components, progress bar
    Summary/            # comparison table, banner
    inputs/             # CurrencyInput, RadioGroup, InfoTooltip
  utils/format.ts       # Indian number formatting
  App.tsx
tests/
  engine/*.test.ts
```

---

## 6. Phased Build Plan

Each phase should end with working, tested code. Do not start the next phase until the acceptance criteria are met.

### Phase 1: Project Setup and Tax Engine (no UI)
**Tasks**
- Initialise the Vite + React + TypeScript project with Vitest.
- Implement `taxConfig.ts`, `types.ts`, `slabs.ts`, `deductions.ts`, `surcharge.ts` and `calculate.ts`.
- Write unit tests for every rule in Section 2.

**Acceptance criteria**
- All test vectors in Section 7 pass.
- No UI or DOM dependency in `/engine`.
- Changing a slab in config changes results without touching logic.

### Phase 2: Wizard UI and Input Handling
**Tasks**
- Build the 5 input steps with navigation, a progress bar and validation.
- `CurrencyInput` with Indian formatting and numeric-only entry.
- Cap warnings, conditional salary-details step, and the HRA helper.
- Hold state in a single store (React context or Zustand).

**Acceptance criteria**
- A user can complete all steps and reach a placeholder summary.
- Back/forward keeps entered values.
- Invalid input (negative, non-numeric) is blocked.

### Phase 3: Summary and Comparison
**Tasks**
- Build the side-by-side results, the savings banner, the itemised deductions (expandable) and the "your selection" label.
- Connect to the engine for live results.
- Add Edit / Start over.

**Acceptance criteria**
- Results match the Section 7 vectors when the same inputs are entered through the UI.
- The better regime is always identified correctly, including ties.

### Phase 4: Polish, Privacy and Insights
**Tasks**
- Print stylesheet / Save as PDF.
- Optional local persistence toggle plus a "Clear data" button.
- Tooltips, inline help, empty and error states.
- Optional: break-even deductions hint, and a bar chart comparing the two regimes.
- Accessibility pass (axe or Lighthouse score 90+).

**Acceptance criteria**
- Works fully with the network disabled.
- No outgoing requests in the DevTools Network tab during use.
- Lighthouse accessibility 90 or higher.

### Phase 5: Hardening and Release
**Tasks**
- Edge-case tests (boundaries around 12L, 12.75L, 5L, 50L, 1Cr, 2Cr and 5Cr).
- Optional PWA for offline install.
- README: how to run, how to update tax config for a new financial year.
- Static build deployable to any static host, or openable locally.

**Acceptance criteria**
- All tests are green and the production build succeeds.
- README explains the yearly update steps.

---

## 7. Test Vectors (all amounts in INR)

All use age under 60, resident, salaried unless stated.

| # | Scenario | Expected |
|---|---|---|
| 1 | New: salary 12,75,000 | Taxable 12,00,000; slab tax 60,000; rebate 60,000; **total tax 0** |
| 2 | New: taxable 12,10,000 (salary 12,85,000) | Slab tax 61,500; marginal relief makes tax 10,000; cess 400; **total 10,400** |
| 3 | New: taxable 12,75,000 (salary 13,50,000) | Slab tax 71,250; no relief; cess 2,850; **total 74,100** |
| 4 | Old: taxable 5,00,000 | Slab tax 12,500; rebate 12,500; **total 0** |
| 5 | Old: taxable 5,10,000 | Slab tax 14,500; no rebate; cess 580; **total 15,080** |
| 6 | New: taxable 50,50,000 (non-salary income, no std. deduction) | Slab tax 10,95,000; surcharge after marginal relief 35,000; cess 45,200; **total 11,75,200** |
| 7 | Salary 15,00,000; 80C 1,50,000; 80D 25,000 | **Old:** taxable 12,75,000; slab tax 1,95,000; cess 7,800; total **2,02,800**. **New:** taxable 14,25,000; slab tax 93,750; cess 3,750; total **97,500**. **New regime wins by 1,05,300** |
| 8 | Old: senior (65), taxable 4,00,000 | Slab tax 5,000 (5% on 3L-4L); rebate 5,000; **total 0** |
| 9 | HRA: basic+DA 6,00,000; HRA 2,40,000; rent 3,00,000; metro | min(2,40,000; 3,00,000-60,000=2,40,000; 3,00,000) = **2,40,000** |
| 10 | Deduction cap: 80C entered 2,00,000 | Allowed 1,50,000; UI shows cap warning |

---

## 8. Edge Cases to Handle
- Salary is less than the standard deduction: the deduction equals the salary, and taxable income never goes below 0.
- Deductions exceed income: taxable income is 0.
- 80D has separate caps for self and parents, depending on each person's senior status.
- Employer NPS cap uses basic+DA. If basic+DA is not provided, ask for it or skip the cap with a warning.
- Taxable income is rounded down to the nearest 10 rupees before slabs.
- Rebate does not apply to income taxed at special rates (capital gains are out of scope, so show a note if the user mentions them).
- Very large values (up to 100Cr) must not overflow or show NaN.

---

## 9. Disclaimers and Out-of-Scope Notices (display in app)
- "Calculations cover resident individuals and income taxed at normal slab rates for FY 2026-27."
- "Capital gains, business income, foreign income and HUF/non-resident cases are not supported."
- "Tax law is subject to change. This tool is an estimate and not professional advice."

---

## 10. Definition of Done
- All phases' acceptance criteria are met.
- Engine test coverage is 90% or higher on `/engine`.
- No network requests containing user data.
- A non-technical user can complete the flow in under 3 minutes and understand which regime is better.
