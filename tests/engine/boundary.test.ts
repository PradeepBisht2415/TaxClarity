import { describe, it, expect } from 'vitest';
import { calculateTax } from '../../src/engine/calculate';
import { calculateSlabTax } from '../../src/engine/slabs';
import { calculateSurcharge } from '../../src/engine/surcharge';
import { TaxInput } from '../../src/engine/types';

describe('Phase 5 Boundary & Statutory Cliff Edge Tests', () => {
  const baseProfile = {
    ageCategory: 'below60' as const,
    isResident: true,
    incomeType: 'salaried' as const,
  };

  // 1. New Regime Rebate Boundary: 12,00,000 vs 12,00,010
  it('New Regime: exactly at 12,00,000 taxable -> 0 tax; at 12,00,010 -> marginal relief applies', () => {
    const at12L = calculateSlabTax(12_00_000, 'new', baseProfile);
    expect(at12L.slabTax).toBe(60_000);
    expect(at12L.rebate).toBe(60_000);
    expect(at12L.taxAfterRebateAndRelief).toBe(0);

    const at12LPlus10 = calculateSlabTax(12_00_010, 'new', baseProfile);
    // Excess = 10. Raw slab tax = 60,000 + 15% of 10 = 60,002.
    // Tax before cess = min(60002, 10) = 10.
    expect(at12LPlus10.taxAfterRebateAndRelief).toBe(10);
    expect(at12LPlus10.marginalRelief).toBe(60_002 - 10);
  });

  // 2. Old Regime Rebate Cliff Edge: 5,00,000 vs 5,00,010
  it('Old Regime: cliff edge between 5,00,000 (0 tax) and 5,00,010 (no rebate)', () => {
    const at5L = calculateSlabTax(5_00_000, 'old', baseProfile);
    expect(at5L.slabTax).toBe(12_500);
    expect(at5L.rebate).toBe(12_500);
    expect(at5L.taxAfterRebateAndRelief).toBe(0);

    const at5LPlus10 = calculateSlabTax(5_00_010, 'old', baseProfile);
    // 5L-10L is 20%. Tax on 10 = 2. Total = 12,502.
    // No rebate under Old Regime since > 5,00,000!
    expect(at5LPlus10.rebate).toBe(0);
    expect(at5LPlus10.taxAfterRebateAndRelief).toBe(12_502);
  });

  // 3. Surcharge Boundary: 50,00,000 vs 50,00,010
  it('Surcharge: 50L has 0 surcharge, 50L + 10 has marginal relief', () => {
    const at50L = calculateSurcharge(50_00_000, 10_80_000, 'new', baseProfile);
    expect(at50L.surcharge).toBe(0);

    // At 50,00,010: Excess = 10. Tax at 50L = 10,80,000.
    // Max allowable total = 10,80,000 + 10 = 10,80,010.
    // Base tax at 50,00,010 = 10,80,003.
    // Surcharge after marginal relief = 10,80,010 - 10,80,003 = 7.
    const at50LPlus10 = calculateSurcharge(50_00_010, 10_80_003, 'new', baseProfile);
    expect(at50LPlus10.marginalRelief).toBeGreaterThan(0);
    expect(10_80_003 + at50LPlus10.surcharge).toBe(10_80_010);
  });

  // 4. Surcharge 1 Cr boundary
  it('Surcharge: 1 Cr threshold marginal relief', () => {
    const at1CrPlus10 = calculateSurcharge(1_00_00_010, 25_80_000, 'new', baseProfile);
    expect(at1CrPlus10.surchargeRate).toBe(0.15);
  });

  // 5. Extreme Income (100 Crores) Precision Check (No NaN, No overflow)
  it('Precision check for 100 Crores without overflow or NaN', () => {
    const input: TaxInput = {
      profile: baseProfile,
      income: { grossSalary: 0, interestIncome: 0, rentalIncome: 0, otherIncome: 100_00_00_000 },
      deductions: {},
    };
    const comp = calculateTax(input);

    expect(isNaN(comp.new.totalTax)).toBe(false);
    expect(isNaN(comp.old.totalTax)).toBe(false);
    expect(isFinite(comp.new.totalTax)).toBe(true);
    expect(isFinite(comp.old.totalTax)).toBe(true);
    expect(comp.new.totalTax).toBeGreaterThan(0);
    expect(comp.old.totalTax).toBeGreaterThan(comp.new.totalTax);
  });
});
