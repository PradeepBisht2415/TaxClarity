import React from 'react';
import { useTax } from '../../context/TaxContext';
import { SavingsBanner } from './SavingsBanner';
import { ComparisonTable } from './ComparisonTable';
import { ItemisedDeductions } from './ItemisedDeductions';
import { BreakEvenInsight } from './BreakEvenInsight';
import { TaxChart } from './TaxChart';
import { Edit3, RotateCcw, Printer } from 'lucide-react';
import { currentTaxConfig } from '../../engine/taxConfig';

export const SummaryView: React.FC = () => {
  const { comparison, input, setStep, reset } = useTax();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header section (Visible only on print or web) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:mb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Tax Comparison Summary
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Financial Year {currentTaxConfig.financialYear} (Assessment Year {currentTaxConfig.assessmentYear})
          </p>
        </div>

        {/* Action Controls (Hidden during print) */}
        <div className="flex items-center space-x-2.5 print:hidden">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-colors focus:ring-2 focus:ring-emerald-500"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
            Edit Inputs
          </button>

          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-colors focus:ring-2 focus:ring-emerald-500"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Start Over
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white shadow-sm transition-colors focus:ring-2 focus:ring-slate-700"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Prominent Savings Winner Banner */}
      <SavingsBanner comparison={comparison} />

      {/* Break-Even Old Regime Insight */}
      <BreakEvenInsight input={input} oldRes={comparison.old} newRes={comparison.new} />

      {/* Side-by-Side Comparison Matrix */}
      <ComparisonTable comparison={comparison} />

      {/* Itemised Deductions Breakdown */}
      <ItemisedDeductions
        oldDeductions={comparison.old.otherDeductions}
        newDeductions={comparison.new.otherDeductions}
        oldStandardDeduction={comparison.old.standardDeduction}
        newStandardDeduction={comparison.new.standardDeduction}
      />

      {/* Visual Chart Comparison */}
      <div className="print:hidden">
        <TaxChart oldRes={comparison.old} newRes={comparison.new} />
      </div>
    </div>
  );
};
