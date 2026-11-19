import { Regime, TaxProfile } from './types';
import { currentTaxConfig, SurchargeBand, TaxConfigYear } from './taxConfig';
import { calculateSlabTax } from './slabs';

export interface SurchargeResult {
  surchargeRate: number;
  rawSurcharge: number;
  marginalRelief: number;
  surcharge: number;
}

/**
 * Calculates surcharge and surcharge marginal relief
 *
 * @param totalIncome Taxable income before deductions / total income
 * @param baseTax Tax after rebate and basic marginal relief
 * @param regime Tax regime ('old' | 'new')
 * @param profile Tax profile
 * @param config Tax configuration
 */
export function calculateSurcharge(
  totalIncome: number,
  baseTax: number,
  regime: Regime,
  profile: TaxProfile,
  config: TaxConfigYear = currentTaxConfig
): SurchargeResult {
  if (totalIncome <= 50_00_000 || baseTax <= 0) {
    return {
      surchargeRate: 0,
      rawSurcharge: 0,
      marginalRelief: 0,
      surcharge: 0,
    };
  }

  const surchargeBands =
    regime === 'new'
      ? config.newRegime.surchargeBands
      : config.oldRegime.surchargeBands;

  // Find the applicable surcharge band
  let applicableBand: SurchargeBand | null = null;
  let bandIndex = -1;

  for (let i = surchargeBands.length - 1; i >= 0; i--) {
    if (totalIncome > surchargeBands[i].threshold) {
      applicableBand = surchargeBands[i];
      bandIndex = i;
      break;
    }
  }

  if (!applicableBand || applicableBand.rate <= 0) {
    return {
      surchargeRate: 0,
      rawSurcharge: 0,
      marginalRelief: 0,
      surcharge: 0,
    };
  }

  const surchargeRate = applicableBand.rate;
  const rawSurcharge = Math.round(baseTax * surchargeRate);

  // Marginal Relief on Surcharge
  // Rule: (baseTax + surcharge) must not exceed (tax at threshold + surcharge at threshold + income above threshold)
  const threshold = applicableBand.threshold;
  const excessIncome = totalIncome - threshold;

  // Compute tax at the threshold
  const taxAtThresholdResult = calculateSlabTax(threshold, regime, profile, config);
  const taxAtThreshold = taxAtThresholdResult.taxAfterRebateAndRelief;

  // Surcharge applicable at the threshold itself (from the lower band, if any)
  let surchargeAtThreshold = 0;
  if (bandIndex > 0) {
    const lowerBand = surchargeBands[bandIndex - 1];
    surchargeAtThreshold = Math.round(taxAtThreshold * lowerBand.rate);
  }

  const maxAllowableTotal = taxAtThreshold + surchargeAtThreshold + excessIncome;
  const currentTotal = baseTax + rawSurcharge;

  let marginalRelief = 0;
  let finalSurcharge = rawSurcharge;

  if (currentTotal > maxAllowableTotal) {
    marginalRelief = currentTotal - maxAllowableTotal;
    finalSurcharge = Math.max(0, rawSurcharge - marginalRelief);
  }

  return {
    surchargeRate,
    rawSurcharge,
    marginalRelief,
    surcharge: Math.round(finalSurcharge),
  };
}
