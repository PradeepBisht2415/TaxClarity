import { describe, it, expect } from 'vitest';
import { calculateTax, calculateTaxForRegime } from '../../src/engine/calculate';
import { calculateHRAExemption } from '../../src/engine/hra';
import { calculateDeductions } from '../../src/engine/deductions';
import { TaxInput } from '../../src/engine/types';

describe('PRD Section 7 Test Vectors', () => {
  const baseProfile = {
    ageCategory: 'below60' as const,
    isResident: true,
    incomeType: 'salaried' as const,
  };

  // Vector 1: New regime: salary 12,75,000
  // Expected: Taxable 12,00,000; slab tax 60,000; rebate 60,000; total tax 0
  it('Vector 1: New regime with salary 12,75,000 should yield 0 tax', () => {
    const input: TaxInput = {
      profile: baseProfile,
      income: { grossSalary: 12_75_000, interestIncome: 0, rentalIncome: 0, otherIncome: 0 },
      deductions: {},
    };
    const result = calculateTaxForRegime('new', input);
    expect(result.standardDeduction).toBe(75_000);
    expect(result.taxableIncome).toBe(12_00_000);
    expect(result.slabTax).toBe(60_000);
    expect(result.rebate).toBe(60_000);
    expect(result.totalTax).toBe(0);
  });

  // Vector 2: New: taxable 12,10,000 (salary 12,85,000)
  // Expected: Slab tax 61,500; marginal relief makes tax 10,000; cess 400; total 10,400
  it('Vector 2: New regime with taxable 12,10,000 should apply marginal relief', () => {
    const input: TaxInput = {
      profile: baseProfile,
      income: { grossSalary: 12_85_000, interestIncome: 0, rentalIncome: 0, otherIncome: 0 },
      deductions: {},
    };
    const result = calculateTaxForRegime('new', input);
    expect(result.taxableIncome).toBe(12_10_000);
    expect(result.slabTax).toBe(61_500);
    expect(result.marginalRelief).toBe(51_500); // 61,500 - 10,000
    expect(result.taxAfterRebateAndRelief).toBe(10_000);
    expect(result.cess).toBe(400);
    expect(result.totalTax).toBe(10_400);
  });

  // Vector 3: New: taxable 12,75,000 (salary 13,50,000)
  // Expected: Slab tax 71,250; no relief; cess 2,850; total 74,100
  it('Vector 3: New regime with taxable 12,75,000 has no relief', () => {
    const input: TaxInput = {
      profile: baseProfile,
      income: { grossSalary: 13_50_000, interestIncome: 0, rentalIncome: 0, otherIncome: 0 },
      deductions: {},
    };
    const result = calculateTaxForRegime('new', input);
    expect(result.taxableIncome).toBe(12_75_000);
    expect(result.slabTax).toBe(71_250);
    expect(result.marginalRelief).toBe(0);
    expect(result.cess).toBe(2_850);
    expect(result.totalTax).toBe(74_100);
  });

  // Vector 4: Old: taxable 5,00,000
  // Expected: Slab tax 12,500; rebate 12,500; total 0
  it('Vector 4: Old regime with taxable 5,00,000 gives 0 tax', () => {
    const input: TaxInput = {
      profile: baseProfile,
      // To have taxable 5,00,000 with 50,000 standard deduction, salary = 5,50,000
      income: { grossSalary: 5_50_000, interestIncome: 0, rentalIncome: 0, otherIncome: 0 },
      deductions: {},
    };
    const result = calculateTaxForRegime('old', input);
    expect(result.taxableIncome).toBe(5_00_000);
    expect(result.slabTax).toBe(12_500);
    expect(result.rebate).toBe(12_500);
    expect(result.totalTax).toBe(0);
  });

  // Vector 5: Old: taxable 5,10,000
  // Expected: Slab tax 14,500; no rebate; cess 580; total 15,080
  it('Vector 5: Old regime with taxable 5,10,000 has no rebate and pays 15,080', () => {
    const input: TaxInput = {
      profile: baseProfile,
      // 5,60,000 salary - 50,000 std deduction = 5,10,000
      income: { grossSalary: 5_60_000, interestIncome: 0, rentalIncome: 0, otherIncome: 0 },
      deductions: {},
    };
    const result = calculateTaxForRegime('old', input);
    expect(result.taxableIncome).toBe(5_10_000);
    expect(result.slabTax).toBe(14_500);
    expect(result.rebate).toBe(0);
    expect(result.cess).toBe(580);
    expect(result.totalTax).toBe(15_080);
  });

  // Vector 6: New: taxable 50,50,000 (non-salary income, no std deduction)
  // Expected: Slab tax 10,95,000; surcharge after marginal relief 35,000; cess 45,200; total 11,75,200
  it('Vector 6: New regime with taxable 50,50,000 non-salary calculates surcharge relief', () => {
    const input: TaxInput = {
      profile: { ...baseProfile, incomeType: 'other' },
      income: { grossSalary: 0, interestIncome: 0, rentalIncome: 0, otherIncome: 50_50_000 },
      deductions: {},
    };
    const result = calculateTaxForRegime('new', input);
    expect(result.standardDeduction).toBe(0);
    expect(result.taxableIncome).toBe(50_50_000);
    expect(result.slabTax).toBe(10_95_000);
    expect(result.surcharge).toBe(35_000);
    expect(result.cess).toBe(45_200);
    expect(result.totalTax).toBe(11_75_200);
  });

  // Vector 7: Salary 15,00,000; 80C 1,50,000; 80D 25,000
  // Old: taxable 12,75,000; slab tax 1,95,000; cess 7,800; total 2,02,800
  // New: taxable 14,25,000; slab tax 93,750; cess 3,750; total 97,500
  // New regime wins by 1,05,300
  it('Vector 7: Salary 15L with 80C and 80D compares correctly and New wins by 1,05,300', () => {
    const input: TaxInput = {
      profile: baseProfile,
      income: { grossSalary: 15_00_000, interestIncome: 0, rentalIncome: 0, otherIncome: 0 },
      deductions: { sec80C: 1_50_000, sec80DMedicalSelf: 25_000 },
    };
    const comparison = calculateTax(input);

    // Old regime checks
    expect(comparison.old.taxableIncome).toBe(12_75_000);
    expect(comparison.old.slabTax).toBe(1_95_000);
    expect(comparison.old.cess).toBe(7_800);
    expect(comparison.old.totalTax).toBe(2_02_800);

    // New regime checks
    expect(comparison.new.taxableIncome).toBe(14_25_000);
    expect(comparison.new.slabTax).toBe(93_750);
    expect(comparison.new.cess).toBe(3_750);
    expect(comparison.new.totalTax).toBe(97_500);

    // Comparison check
    expect(comparison.betterRegime).toBe('new');
    expect(comparison.savings).toBe(1_05_300);
  });

  // Vector 8: Old: senior (65), taxable 4,00,000
  // Expected: Slab tax 5,000 (5% on 3L-4L); rebate 5,000; total 0
  it('Vector 8: Old regime senior (65) with taxable 4,00,000 has 0 tax', () => {
    const input: TaxInput = {
      profile: { ...baseProfile, ageCategory: 'senior' },
      income: { grossSalary: 4_50_000, interestIncome: 0, rentalIncome: 0, otherIncome: 0 },
      deductions: {},
    };
    const result = calculateTaxForRegime('old', input);
    expect(result.taxableIncome).toBe(4_00_000);
    expect(result.slabTax).toBe(5_000);
    expect(result.rebate).toBe(5_000);
    expect(result.totalTax).toBe(0);
  });

  // Vector 9: HRA: basic+DA 6,00,000; HRA 2,40,000; rent 3,00,000; metro
  // Expected: min(2,40,000; 3,00,000 - 60,000 = 2,40,000; 3,00,000) = 2,40,000
  it('Vector 9: HRA exemption calculates correctly for metro', () => {
    const hraExemption = calculateHRAExemption({
      basicDA: 6_00_000,
      hraReceived: 2_40_000,
      rentPaid: 3_00_000,
      isMetro: true,
    });
    expect(hraExemption).toBe(2_40_000);
  });

  // Vector 10: Deduction cap: 80C entered 2,00,000 -> Allowed 1,50,000
  it('Vector 10: 80C deduction is capped at 1,50,000', () => {
    const breakdown = calculateDeductions(
      'old',
      baseProfile,
      { grossSalary: 10_00_000, interestIncome: 0, rentalIncome: 0, otherIncome: 0 },
      { sec80C: 2_00_000 }
    );
    const item80C = breakdown.items.find((i) => i.id === 'sec80C');
    expect(item80C).toBeDefined();
    expect(item80C?.claimed).toBe(2_00_000);
    expect(item80C?.allowed).toBe(1_50_000);
  });
});
