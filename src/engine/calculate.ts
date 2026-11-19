import {
  Regime,
  TaxComparison,
  TaxInput,
  TaxResult,
} from './types';
import { currentTaxConfig, TaxConfigYear } from './taxConfig';
import { calculateDeductions } from './deductions';
import { calculateSlabTax } from './slabs';
import { calculateSurcharge } from './surcharge';
import { roundDownTo10, roundToRupee } from '../utils/format';

/**
 * Calculates tax for a single regime
 */
export function calculateTaxForRegime(
  regime: Regime,
  input: TaxInput,
  config: TaxConfigYear = currentTaxConfig
): TaxResult {
  const { profile, income, salaryDetails, deductions } = input;

  // 1. Gross total income = grossSalary + interestIncome + rentalIncome + otherIncome
  const grossSalary = Math.max(0, income.grossSalary || 0);
  const interestIncome = Math.max(0, income.interestIncome || 0);
  const rentalIncome = Math.max(0, income.rentalIncome || 0);
  const otherIncome = Math.max(0, income.otherIncome || 0);

  const grossTotalIncome = grossSalary + interestIncome + rentalIncome + otherIncome;

  // 2. Subtract standard deduction and regime-eligible deductions
  const deductionsBreakdown = calculateDeductions(
    regime,
    profile,
    income,
    deductions,
    salaryDetails,
    config
  );

  const { standardDeduction, items: otherDeductions, totalDeductions } = deductionsBreakdown;

  // 3. Taxable income = max(0, grossTotalIncome - totalDeductions), rounded down to nearest 10
  const unroundedTaxable = Math.max(0, grossTotalIncome - totalDeductions);
  const taxableIncome = roundDownTo10(unroundedTaxable);

  // 4 & 5. Slab tax, rebate (87A / 156), and rebate marginal relief
  const slabResult = calculateSlabTax(taxableIncome, regime, profile, config);
  const { slabTax, rebate, marginalRelief, taxAfterRebateAndRelief } = slabResult;

  // 6. Surcharge with marginal relief
  // Note: Surcharge applicability is based on total income (taxable income)
  const surchargeResult = calculateSurcharge(
    taxableIncome,
    taxAfterRebateAndRelief,
    regime,
    profile,
    config
  );
  const { surcharge, marginalRelief: surchargeMarginalRelief } = surchargeResult;

  // 7. Health & Education Cess (4% on tax after rebate/relief + surcharge)
  const cessableAmount = taxAfterRebateAndRelief + surcharge;
  const cess = cessableAmount > 0 ? Math.round(cessableAmount * config.cessRate) : 0;

  // 8. Total tax rounded to nearest rupee
  const totalTax = roundToRupee(taxAfterRebateAndRelief + surcharge + cess);

  // Effective tax rate
  const effectiveRate =
    grossTotalIncome > 0
      ? Number(((totalTax / grossTotalIncome) * 100).toFixed(2))
      : 0;

  // Monthly tax burden
  const monthlyTax = Math.round(totalTax / 12);

  return {
    regime,
    grossTotalIncome,
    standardDeduction,
    otherDeductions,
    totalDeductions,
    taxableIncome,
    slabTax,
    rebate,
    marginalRelief,
    taxAfterRebateAndRelief,
    surcharge,
    surchargeMarginalRelief,
    cess,
    totalTax,
    effectiveRate,
    monthlyTax,
  };
}

/**
 * Calculates and compares tax under both Old and New regimes
 */
export function calculateTax(
  input: TaxInput,
  config: TaxConfigYear = currentTaxConfig
): TaxComparison {
  const oldResult = calculateTaxForRegime('old', input, config);
  const newResult = calculateTaxForRegime('new', input, config);

  let betterRegime: Regime | 'equal' = 'equal';
  const diff = oldResult.totalTax - newResult.totalTax;

  if (diff > 0) {
    betterRegime = 'new';
  } else if (diff < 0) {
    betterRegime = 'old';
  }

  const savings = Math.abs(diff);

  const selectedRegime =
    input.regimePreference === 'new'
      ? 'new'
      : input.regimePreference === 'old'
      ? 'old'
      : undefined;

  return {
    old: oldResult,
    new: newResult,
    betterRegime,
    savings,
    selectedRegime,
  };
}
