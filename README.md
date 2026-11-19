# TaxClarity

> **Browser-Only Indian Income Tax Calculator & Regime Comparator**  
> Covers Financial Year 2026-27 (Assessment Year 2027-28) under the Income-tax Act.

---

## 🌟 Overview

TaxClarity is an offline, privacy-first, zero-backend single page application that calculates and compares an individual taxpayer's liability under both the **Old Tax Regime** and the **New Tax Regime** (default).

### Key Features
- **100% Client-Side:** No database, no backend API, no analytics, no third-party CDNs, zero telemetry. Works completely offline.
- **Accurate FY 2026-27 Tax Engine:**
  - Progressive tax slabs for both regimes (including Senior & Super-Senior citizen age brackets).
  - Standard deduction (₹75,000 New / ₹50,000 Old).
  - Section 87A / Sec 156 Rebates (₹12,00,000 limit for New Regime, ₹5,00,000 for Old Regime).
  - Marginal Relief on taxable income (New Regime).
  - Multi-tier surcharge with marginal relief (50L, 1Cr, 2Cr, 5Cr) and 25% cap under New Regime.
  - 4% Health & Education Cess.
  - Section 10(13A) Metro & Non-Metro HRA exemption calculator.
  - Chapter VI-A deductions (80C, 80CCD(1B), 80CCD(2) employer NPS, 80D, 80E, 80TTA/80TTB, 80G, Sec 24(b)).
- **Interactive Wizard:** Real-time Indian currency input formatting (`12,34,567`), dynamic field conditioning, and live deduction cap alerts.
- **Smart Insights:** Side-by-side matrix, winning regime savings banner, Old Regime break-even deduction solver, and print-ready PDF export.
- **Ultra Lightweight:** Bundle size is under **70KB gzipped** (budget < 300KB).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Installation & Local Development
```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# Run automated test suite
npm run test

# Build production bundle
npm run build
```

---

## 🏗️ Architecture & Project Structure

The project strictly separates the calculation engine from the UI layer:

```
TaxClarity/
├── src/
│   ├── engine/                  # Pure TypeScript Engine (Zero UI/DOM dependencies)
│   │   ├── types.ts             # Strict contracts & data types
│   │   ├── taxConfig.ts         # Centralized declarative tax rules (Single Source of Truth)
│   │   ├── slabs.ts             # Progressive slabs & rebate calculation
│   │   ├── deductions.ts        # Statutory deduction caps & eligibility
│   │   ├── hra.ts               # Section 10(13A) HRA exemption formula
│   │   ├── surcharge.ts         # Multi-tier surcharge & surcharge marginal relief
│   │   └── calculate.ts         # Master orchestrator for both regimes
│   ├── components/
│   │   ├── common/              # CurrencyInput, RadioCardGroup, InfoTooltip, PrivacyControls
│   │   ├── Wizard/              # Multi-step input forms & navigation controls
│   │   └── Summary/             # Comparison table, savings banner, break-even solver, charts
│   ├── context/
│   │   └── TaxContext.tsx       # State management & live calculation reactivity
│   ├── utils/
│   │   └── format.ts            # Indian currency formatting & Section 288A/B roundings
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   └── engine/
│       ├── vectors.test.ts      # PRD Section 7 test vectors
│       ├── edge_cases.test.ts   # Edge cases (zero floor, salary < std deduction, caps)
│       └── boundary.test.ts     # Boundary tests (12L cliff, surcharge thresholds, 100Cr)
```

---

## 📅 Yearly Tax Update Guide (For New Financial Years)

TaxClarity is engineered so that **no calculation logic needs to be rewritten** when a new Union Budget changes tax rates or limits. All statutory rules reside exclusively in `src/engine/taxConfig.ts`.

To update for a new Financial Year (e.g., FY 2027-28):

1. **Open `src/engine/taxConfig.ts`**:
   - Update `financialYear` and `assessmentYear`.
   - Update `lastVerifiedDate` to the budget enactment date.
2. **Update New Regime Slabs & Rebates**:
   - If slabs change, update the `newRegime.slabs` array.
   - If Section 87A rebate or standard deduction changes, update `newRegime.rebate.threshold`, `maxAmount`, and `standardDeduction`.
3. **Update Old Regime Limits (if applicable)**:
   - Adjust `oldRegime.slabs` for `below60`, `senior`, or `superSenior`.
   - Adjust `oldRegime.deductionLimits` (e.g. `sec80C`, `sec80DNonSenior`, etc.).
4. **Run Tests**:
   ```bash
   npm run test
   ```
   Add new test vectors corresponding to the new budget circular.

---

## ⚖️ Disclaimer

Calculations cover resident individuals and income taxed at normal slab rates for FY 2026-27 (AY 2027-28). Capital gains, business income, foreign income, and HUF/non-residents are out of scope. This application provides estimates for informational guidance and is not formal tax or Chartered Accountant advice.
