import React, { useMemo } from 'react';
import { TaxInput, TaxResult } from '../../engine/types';
import { calculateTaxForRegime } from '../../engine/calculate';
import { formatINR } from '../../utils/format';
import { Lightbulb } from 'lucide-react';

interface BreakEvenInsightProps {
  input: TaxInput;
  oldRes: TaxResult;
  newRes: TaxResult;
}

export const BreakEvenInsight: React.FC<BreakEvenInsightProps> = ({ input, oldRes, newRes }) => {
  const breakEven = useMemo(() => {
    if (newRes.totalTax >= oldRes.totalTax) {
      return null; // Old is already equal or better
    }

    if (newRes.totalTax === 0) {
      return {
        isAchievable: true,
        extraDeductionNeeded: Math.max(0, oldRes.taxableIncome - 5_00_000),
        message: 'To pay ₹0 tax under the Old Regime, your taxable income must drop to ₹5,00,000 or below.',
      };
    }

    // Binary search for additional deduction needed under Old Regime
    const targetTax = newRes.totalTax;
    let low = 0;
    let high = oldRes.taxableIncome;
    let requiredExtra = -1;

    for (let iter = 0; iter < 40; iter++) {
      const mid = Math.round((low + high) / 2);
      const testInput: TaxInput = {
        ...input,
        deductions: {
          ...input.deductions,
          otherDeductions: (input.deductions.otherDeductions || 0) + mid,
        },
      };

      const testResult = calculateTaxForRegime('old', testInput);

      if (testResult.totalTax <= targetTax) {
        requiredExtra = mid;
        high = mid - 1; // Try to find a smaller required amount
      } else {
        low = mid + 1;
      }
    }

    if (requiredExtra > 0) {
      return {
        isAchievable: true,
        extraDeductionNeeded: requiredExtra,
        message: `You would need approximately ${formatINR(requiredExtra)} in additional deductions (e.g. HRA, home loan, 80C) under the Old Regime for it to break even with the New Regime.`,
      };
    }

    return null;
  }, [input, oldRes, newRes]);

  if (!breakEven) return null;

  return (
    <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start space-x-3.5 text-sm text-amber-900">
      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700 mt-0.5">
        <Lightbulb className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-amber-950 flex items-center">
          <span>Old Regime Break-Even Analysis</span>
        </p>
        <p className="text-xs text-amber-800 leading-relaxed">
          {breakEven.message}
        </p>
        {breakEven.extraDeductionNeeded > 0 && (
          <p className="text-xs text-amber-700 font-medium pt-0.5">
            Additional Deductions Required: <strong className="font-mono">{formatINR(breakEven.extraDeductionNeeded)}</strong>
          </p>
        )}
      </div>
    </div>
  );
};
