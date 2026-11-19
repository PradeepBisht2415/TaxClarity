import {
  DeductionItem,
  DeductionsInput,
  IncomeDetails,
  Regime,
  SalaryDetails,
  TaxProfile,
} from './types';
import { currentTaxConfig, TaxConfigYear } from './taxConfig';
import { calculateHRAExemption } from './hra';

export interface DeductionsBreakdown {
  standardDeduction: number;
  items: DeductionItem[];
  totalDeductions: number;
}

export function calculateDeductions(
  regime: Regime,
  profile: TaxProfile,
  income: IncomeDetails,
  deductionsInput: DeductionsInput = {},
  salaryDetails?: SalaryDetails,
  config: TaxConfigYear = currentTaxConfig
): DeductionsBreakdown {
  const isSenior = profile.ageCategory === 'senior' || profile.ageCategory === 'superSenior';
  const grossSalary = Math.max(0, income.grossSalary || 0);

  // 1. Standard deduction (applies only against salary/pension income)
  const maxStdDeduction =
    regime === 'new'
      ? config.newRegime.standardDeduction
      : config.oldRegime.standardDeduction;

  const standardDeduction = Math.min(grossSalary, maxStdDeduction);

  const items: DeductionItem[] = [];

  // 2. Section 80CCD(2) - Employer NPS contribution (Allowed in BOTH Old and New Regimes)
  const claimedEmployerNPS = salaryDetails?.employerNPS ?? 0;
  if (claimedEmployerNPS > 0) {
    const npsRate =
      regime === 'new'
        ? config.newRegime.employerNPSMaxPercent
        : config.oldRegime.employerNPSMaxPercent;

    const basicDA = salaryDetails?.basicDA ?? 0;
    // Cap at percentage of Basic+DA if provided, else allow claimed
    const cap = basicDA > 0 ? Math.round(basicDA * npsRate) : claimedEmployerNPS;
    const allowed = Math.min(claimedEmployerNPS, cap);

    items.push({
      id: 'sec80CCD2',
      label: 'Employer NPS Contribution',
      section: 'Sec 80CCD(2)',
      claimed: claimedEmployerNPS,
      allowed,
    });
  }

  // Under New Regime, no other deductions/exemptions are allowed
  if (regime === 'new') {
    const totalDeductions = standardDeduction + items.reduce((sum, item) => sum + item.allowed, 0);
    return {
      standardDeduction,
      items,
      totalDeductions,
    };
  }

  // --- OLD REGIME DEDUCTIONS ---
  const limits = config.oldRegime.deductionLimits;

  // HRA Exemption
  if (salaryDetails?.hraReceived && salaryDetails.hraReceived > 0) {
    const allowedHRA = calculateHRAExemption(salaryDetails);
    items.push({
      id: 'hra',
      label: 'House Rent Allowance (HRA) Exemption',
      section: 'Sec 10(13A)',
      claimed: salaryDetails.hraReceived,
      allowed: allowedHRA,
    });
  }

  // LTA Exemption
  if (salaryDetails?.ltaExempt && salaryDetails.ltaExempt > 0) {
    items.push({
      id: 'lta',
      label: 'Leave Travel Allowance (LTA) Exemption',
      section: 'Sec 10(5)',
      claimed: salaryDetails.ltaExempt,
      allowed: salaryDetails.ltaExempt,
    });
  }

  // Professional Tax
  if (salaryDetails?.professionalTax && salaryDetails.professionalTax > 0) {
    const allowedPT = Math.min(salaryDetails.professionalTax, limits.professionalTaxMax);
    items.push({
      id: 'professionalTax',
      label: 'Professional Tax',
      section: 'Sec 16(iii)',
      claimed: salaryDetails.professionalTax,
      allowed: allowedPT,
    });
  }

  // Section 80C
  if (deductionsInput.sec80C !== undefined && deductionsInput.sec80C > 0) {
    const allowed80C = Math.min(deductionsInput.sec80C, limits.sec80C);
    items.push({
      id: 'sec80C',
      label: 'Investments (PPF, EPF, ELSS, Life Insurance, etc.)',
      section: 'Sec 80C',
      claimed: deductionsInput.sec80C,
      allowed: allowed80C,
    });
  }

  // Section 80CCD(1B) - Additional NPS
  if (deductionsInput.sec80CCD1B !== undefined && deductionsInput.sec80CCD1B > 0) {
    const allowed80CCD1B = Math.min(deductionsInput.sec80CCD1B, limits.sec80CCD1B);
    items.push({
      id: 'sec80CCD1B',
      label: 'National Pension Scheme (Self Contribution)',
      section: 'Sec 80CCD(1B)',
      claimed: deductionsInput.sec80CCD1B,
      allowed: allowed80CCD1B,
    });
  }

  // Section 80D - Health Insurance (Self & Family)
  if (deductionsInput.sec80DMedicalSelf !== undefined && deductionsInput.sec80DMedicalSelf > 0) {
    const maxLimitSelf = isSenior ? limits.sec80DSenior : limits.sec80DNonSenior;
    const allowed80DSelf = Math.min(deductionsInput.sec80DMedicalSelf, maxLimitSelf);
    items.push({
      id: 'sec80D_self',
      label: `Health Insurance (Self/Family)${isSenior ? ' - Senior Citizen' : ''}`,
      section: 'Sec 80D',
      claimed: deductionsInput.sec80DMedicalSelf,
      allowed: allowed80DSelf,
    });
  }

  // Section 80D - Health Insurance (Parents)
  if (deductionsInput.sec80DMedicalParents !== undefined && deductionsInput.sec80DMedicalParents > 0) {
    const isParentSenior = Boolean(deductionsInput.isParentSenior);
    const maxLimitParents = isParentSenior ? limits.sec80DSenior : limits.sec80DNonSenior;
    const allowed80DParents = Math.min(deductionsInput.sec80DMedicalParents, maxLimitParents);
    items.push({
      id: 'sec80D_parents',
      label: `Health Insurance (Parents)${isParentSenior ? ' - Senior Parents' : ''}`,
      section: 'Sec 80D',
      claimed: deductionsInput.sec80DMedicalParents,
      allowed: allowed80DParents,
    });
  }

  // Section 80E - Education Loan Interest
  if (deductionsInput.sec80E !== undefined && deductionsInput.sec80E > 0) {
    items.push({
      id: 'sec80E',
      label: 'Education Loan Interest',
      section: 'Sec 80E',
      claimed: deductionsInput.sec80E,
      allowed: deductionsInput.sec80E,
    });
  }

  // Section 80TTA / 80TTB - Savings / Deposit Interest
  const totalInterest = income.interestIncome ?? 0;
  if (totalInterest > 0) {
    const maxInterestLimit = isSenior ? limits.sec80TTBSenior : limits.sec80TTANonSenior;
    const claimedInterest = Math.min(totalInterest, maxInterestLimit);
    const allowedInterest = Math.min(claimedInterest, totalInterest);

    items.push({
      id: isSenior ? 'sec80TTB' : 'sec80TTA',
      label: isSenior ? 'Interest on Deposits (Senior Citizens)' : 'Savings Account Interest',
      section: isSenior ? 'Sec 80TTB' : 'Sec 80TTA',
      claimed: totalInterest,
      allowed: allowedInterest,
    });
  }

  // Section 80G - Donations
  if (deductionsInput.sec80G !== undefined && deductionsInput.sec80G > 0) {
    items.push({
      id: 'sec80G',
      label: 'Eligible Donations',
      section: 'Sec 80G',
      claimed: deductionsInput.sec80G,
      allowed: deductionsInput.sec80G,
    });
  }

  // Section 24(b) - Home Loan Interest (Self-occupied property)
  if (deductionsInput.homeLoanInterest24b !== undefined && deductionsInput.homeLoanInterest24b > 0) {
    const allowed24b = Math.min(deductionsInput.homeLoanInterest24b, limits.sec24bHomeLoan);
    items.push({
      id: 'sec24b',
      label: 'Home Loan Interest (Self-Occupied)',
      section: 'Sec 24(b)',
      claimed: deductionsInput.homeLoanInterest24b,
      allowed: allowed24b,
    });
  }

  // Other Deductions
  if (deductionsInput.otherDeductions !== undefined && deductionsInput.otherDeductions > 0) {
    items.push({
      id: 'otherDeductions',
      label: 'Other Eligible Deductions',
      section: 'Chapter VI-A',
      claimed: deductionsInput.otherDeductions,
      allowed: deductionsInput.otherDeductions,
    });
  }

  const totalDeductions = standardDeduction + items.reduce((sum, item) => sum + item.allowed, 0);

  return {
    standardDeduction,
    items,
    totalDeductions,
  };
}
