import { AgeCategory, Regime, TaxProfile } from './types';
import { currentTaxConfig, Slab, TaxConfigYear } from './taxConfig';

export interface SlabCalculationResult {
  slabTax: number;
  rebate: number;
  marginalRelief: number;
  taxAfterRebateAndRelief: number;
}

/**
 * Computes progressive tax across defined slabs
 */
export function computeProgressiveTax(taxableIncome: number, slabs: Slab[]): number {
  if (taxableIncome <= 0) return 0;

  let tax = 0;
  let lowerBound = 0;

  for (const slab of slabs) {
    if (taxableIncome <= lowerBound) break;

    const slabUpper = slab.upTo;
    const taxableInThisSlab = Math.min(taxableIncome, slabUpper) - lowerBound;

    if (taxableInThisSlab > 0 && slab.rate > 0) {
      tax += taxableInThisSlab * slab.rate;
    }

    lowerBound = slabUpper;
  }

  return Math.round(tax);
}

/**
 * Gets the slab list according to regime and age category
 */
export function getSlabsForRegime(
  regime: Regime,
  ageCategory: AgeCategory,
  config: TaxConfigYear = currentTaxConfig
): Slab[] {
  if (regime === 'new') {
    return config.newRegime.slabs;
  }

  if (ageCategory === 'superSenior') {
    return config.oldRegime.slabs.superSenior;
  }
  if (ageCategory === 'senior') {
    return config.oldRegime.slabs.senior;
  }
  return config.oldRegime.slabs.below60;
}

/**
 * Computes base slab tax, Sec 87A / Sec 156 rebate, and marginal relief
 */
export function calculateSlabTax(
  taxableIncome: number,
  regime: Regime,
  profile: TaxProfile,
  config: TaxConfigYear = currentTaxConfig
): SlabCalculationResult {
  if (taxableIncome <= 0) {
    return {
      slabTax: 0,
      rebate: 0,
      marginalRelief: 0,
      taxAfterRebateAndRelief: 0,
    };
  }

  const slabs = getSlabsForRegime(regime, profile.ageCategory, config);
  const rawSlabTax = computeProgressiveTax(taxableIncome, slabs);

  let rebate = 0;
  let marginalRelief = 0;
  let taxAfterRebateAndRelief = rawSlabTax;

  if (regime === 'new') {
    const { threshold, maxAmount, hasMarginalRelief } = config.newRegime.rebate;

    // Rebate under Section 87A / 156 (Income <= 12L)
    if (taxableIncome <= threshold) {
      rebate = Math.min(rawSlabTax, maxAmount);
      taxAfterRebateAndRelief = Math.max(0, rawSlabTax - rebate);
    } else if (hasMarginalRelief) {
      // Marginal relief on taxable income slightly exceeding 12L:
      // Tax (before cess) cannot exceed (taxable income - threshold)
      const excessIncome = taxableIncome - threshold;
      if (rawSlabTax > excessIncome) {
        taxAfterRebateAndRelief = excessIncome;
        marginalRelief = rawSlabTax - taxAfterRebateAndRelief;
      }
    }
  } else {
    // Old Regime
    const { threshold, maxAmount } = config.oldRegime.rebate;
    if (taxableIncome <= threshold) {
      rebate = Math.min(rawSlabTax, maxAmount);
      taxAfterRebateAndRelief = Math.max(0, rawSlabTax - rebate);
    }
    // No marginal relief under Old Regime Section 87A
  }

  return {
    slabTax: rawSlabTax,
    rebate,
    marginalRelief,
    taxAfterRebateAndRelief: Math.max(0, taxAfterRebateAndRelief),
  };
}
