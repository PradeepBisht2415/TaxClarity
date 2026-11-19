import { describe, it, expect } from 'vitest';
import { calculateTax, calculateTaxForRegime } from '../../src/engine/calculate';
import { calculateDeductions } from '../../src/engine/deductions';
import { roundDownTo10, roundToRupee, parseINR, formatINR } from '../../src/utils/format';
import { TaxInput } from '../../src/engine/types';

describe('Engine Edge Cases & Formats', () => {
  const baseProfile = {
    ageCategory: 'below60' as const,
    isResident: true,
    incomeType: 'salaried' as const,
  };

  it('handles salary less than standard deduction', () => {
    const input: TaxInput = {
      profile: baseProfile,
      income: { grossSalary: 35_000, interestIncome: 0, rentalIncome: 0, otherIncome: 0 },
      deductions: {},
    };
    const newRes = calculateTaxForRegime('new', input);
    expect(newRes.standardDeduction).toBe(35_000);
    expect(newRes.taxableIncome).toBe(0);
    expect(newRes.totalTax).toBe(0);

    const oldRes = calculateTaxForRegime('old', input);
    expect(oldRes.standardDeduction).toBe(35_000);
    expect(oldRes.taxableIncome).toBe(0);
    expect(oldRes.totalTax).toBe(0);
  });

  it('ensures taxable income never goes negative when deductions exceed income', () => {
    const input: TaxInput = {
      profile: baseProfile,
      income: { grossSalary: 2_00_000, interestIncome: 0, rentalIncome: 0, otherIncome: 0 },
      deductions: { sec80C: 1_50_000, sec80DMedicalSelf: 25_000, sec80CCD1B: 50_000 },
    };
    const oldRes = calculateTaxForRegime('old', input);
    expect(oldRes.totalDeductions).toBe(2_75_000); // 50k std + 1.5L + 25k + 50k
    expect(oldRes.taxableIncome).toBe(0);
    expect(oldRes.totalTax).toBe(0);
  });

  it('evaluates Section 80D with senior parents correctly', () => {
    const breakdownNonSeniorParents = calculateDeductions(
      'old',
      baseProfile,
      { grossSalary: 10_00_000, interestIncome: 0, rentalIncome: 0, otherIncome: 0 },
      { sec80DMedicalParents: 40_000, isParentSenior: false }
    );
    const itemNonSenior = breakdownNonSeniorParents.items.find((i) => i.id === 'sec80D_parents');
    expect(itemNonSenior?.allowed).toBe(25_000);

    const breakdownSeniorParents = calculateDeductions(
      'old',
      baseProfile,
      { grossSalary: 10_00_000, interestIncome: 0, rentalIncome: 0, otherIncome: 0 },
      { sec80DMedicalParents: 40_000, isParentSenior: true }
    );
    const itemSenior = breakdownSeniorParents.items.find((i) => i.id === 'sec80D_parents');
    expect(itemSenior?.allowed).toBe(40_000); // allowed up to 50k
  });

  it('evaluates Employer NPS 80CCD(2) caps under both regimes', () => {
    const salaryDetails = {
      basicDA: 10_00_000,
      employerNPS: 1_50_000,
    };
    const oldBreakdown = calculateDeductions(
      'old',
      baseProfile,
      { grossSalary: 15_00_000, interestIncome: 0, rentalIncome: 0, otherIncome: 0 },
      {},
      salaryDetails
    );
    // 10% of 10L = 1L
    const oldNPS = oldBreakdown.items.find((i) => i.id === 'sec80CCD2');
    expect(oldNPS?.allowed).toBe(1_00_000);

    const newBreakdown = calculateDeductions(
      'new',
      baseProfile,
      { grossSalary: 15_00_000, interestIncome: 0, rentalIncome: 0, otherIncome: 0 },
      {},
      salaryDetails
    );
    // 14% of 10L = 1.4L
    const newNPS = newBreakdown.items.find((i) => i.id === 'sec80CCD2');
    expect(newNPS?.allowed).toBe(1_40_000);
  });

  it('evaluates super senior citizen (80+) old regime slabs', () => {
    const input: TaxInput = {
      profile: { ...baseProfile, ageCategory: 'superSenior' },
      income: { grossSalary: 5_50_000, interestIncome: 0, rentalIncome: 0, otherIncome: 0 },
      deductions: {},
    };
    const res = calculateTaxForRegime('old', input);
    // 5.5L - 50k std deduction = 5L taxable. 0-5L is 0% for super senior!
    expect(res.taxableIncome).toBe(5_00_000);
    expect(res.slabTax).toBe(0);
    expect(res.totalTax).toBe(0);
  });

  it('handles High Net Worth Individuals (> 5 Cr) with surcharge capping', () => {
    const input: TaxInput = {
      profile: baseProfile,
      income: { grossSalary: 0, interestIncome: 0, rentalIncome: 0, otherIncome: 6_00_00_000 },
      deductions: {},
    };
    const comparison = calculateTax(input);

    // In New Regime, surcharge is capped at 25%
    expect(comparison.new.surcharge).toBeGreaterThan(0);
    // In Old Regime, surcharge is 37% above 5 Cr
    expect(comparison.old.surcharge).toBeGreaterThan(0);
    expect(comparison.old.totalTax).toBeGreaterThan(comparison.new.totalTax);
  });

  it('correctly rounds taxable income down to nearest 10 (Section 288A)', () => {
    expect(roundDownTo10(1200009)).toBe(1200000);
    expect(roundDownTo10(1200019)).toBe(1200010);
    expect(roundDownTo10(0)).toBe(0);
    expect(roundDownTo10(-5)).toBe(0);
  });

  it('correctly rounds tax to nearest rupee (Section 288B)', () => {
    expect(roundToRupee(10400.4)).toBe(10400);
    expect(roundToRupee(10400.6)).toBe(10401);
  });

  it('formats Indian currency and parses raw values', () => {
    expect(formatINR(1234567, { showSymbol: false })).toBe('12,34,567');
    expect(formatINR(1234567, { showSymbol: true })).toContain('12,34,567');
    expect(parseINR('₹ 12,34,567')).toBe(1234567);
    expect(parseINR('1500000')).toBe(1500000);
    expect(parseINR('')).toBe(0);
    expect(parseINR(null)).toBe(0);
  });
});
