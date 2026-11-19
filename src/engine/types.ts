export type Regime = 'old' | 'new';

export type AgeCategory = 'below60' | 'senior' | 'superSenior';

export type IncomeType = 'salaried' | 'other';

export type RegimePreference = 'old' | 'new' | 'compare';

export interface TaxProfile {
  ageCategory: AgeCategory;
  isResident: boolean;
  incomeType: IncomeType;
}

export interface IncomeDetails {
  grossSalary: number; // Annual gross salary or pension
  interestIncome: number; // Savings/FD interest
  rentalIncome: number; // Net annual value after 30% std deduction
  otherIncome: number; // Other taxable income at slab rates
}

export interface SalaryDetails {
  basicDA?: number; // Basic + Dearness Allowance (needed for HRA & 80CCD(2) caps)
  hraReceived?: number;
  rentPaid?: number;
  isMetro?: boolean; // Delhi, Mumbai, Kolkata, Chennai (50% vs 40%)
  ltaExempt?: number;
  professionalTax?: number;
  employerNPS?: number; // Section 80CCD(2)
}

export interface DeductionsInput {
  sec80C?: number; // EPF, PPF, ELSS, LIC, tuition, etc. (max 1.5L)
  sec80CCD1B?: number; // Additional NPS (max 50k)
  sec80DMedicalSelf?: number; // Health insurance self/family (25k / 50k if senior)
  sec80DMedicalParents?: number; // Health insurance parents (25k / 50k if parent senior)
  isParentSenior?: boolean;
  sec80E?: number; // Education loan interest (no cap)
  sec80G?: number; // Eligible donations
  homeLoanInterest24b?: number; // Self-occupied home loan interest (max 2L)
  otherDeductions?: number;
}

export interface TaxInput {
  profile: TaxProfile;
  income: IncomeDetails;
  salaryDetails?: SalaryDetails;
  deductions: DeductionsInput;
  regimePreference?: RegimePreference;
}

export interface DeductionItem {
  id: string;
  label: string;
  section: string;
  claimed: number;
  allowed: number;
}

export interface TaxResult {
  regime: Regime;
  grossTotalIncome: number;
  standardDeduction: number;
  otherDeductions: DeductionItem[];
  totalDeductions: number;
  taxableIncome: number;
  slabTax: number;
  rebate: number;
  marginalRelief: number;
  taxAfterRebateAndRelief: number;
  surcharge: number;
  surchargeMarginalRelief: number;
  cess: number;
  totalTax: number;
  effectiveRate: number; // percentage (e.g. 15.5%)
  monthlyTax: number;
}

export interface TaxComparison {
  old: TaxResult;
  new: TaxResult;
  betterRegime: Regime | 'equal';
  savings: number;
  selectedRegime?: Regime;
}
