import React from 'react';
import { TaxComparison } from '../../engine/types';
import { formatINR } from '../../utils/format';
import { Check, User } from 'lucide-react';

interface ComparisonTableProps {
  comparison: TaxComparison;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ comparison }) => {
  const { old: oldRes, new: newRes, betterRegime, selectedRegime } = comparison;

  const isOldWinner = betterRegime === 'old';
  const isNewWinner = betterRegime === 'new';

  return (
    <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-sm">
      <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 p-4 sm:p-5">
        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider self-end">
          Tax Component
        </div>

        {/* Old Regime Header */}
        <div
          className={`text-center p-3 rounded-xl transition-all ${
            isOldWinner
              ? 'bg-emerald-50 border-2 border-emerald-500 shadow-sm'
              : 'border border-transparent'
          }`}
        >
          <div className="flex items-center justify-center space-x-1.5">
            <span className="font-bold text-slate-900 text-base sm:text-lg">Old Regime</span>
            {isOldWinner && (
              <span className="p-0.5 bg-emerald-600 text-white rounded-full">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1 mt-1">
            {isOldWinner && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-600 text-white">
                Best Choice
              </span>
            )}
            {selectedRegime === 'old' && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 flex items-center">
                <User className="w-2.5 h-2.5 mr-0.5" /> Your Pick
              </span>
            )}
          </div>
        </div>

        {/* New Regime Header */}
        <div
          className={`text-center p-3 rounded-xl transition-all ${
            isNewWinner
              ? 'bg-emerald-50 border-2 border-emerald-500 shadow-sm'
              : 'border border-transparent'
          }`}
        >
          <div className="flex items-center justify-center space-x-1.5">
            <span className="font-bold text-slate-900 text-base sm:text-lg">New Regime</span>
            {isNewWinner && (
              <span className="p-0.5 bg-emerald-600 text-white rounded-full">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1 mt-1">
            {isNewWinner && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-600 text-white">
                Best Choice
              </span>
            )}
            {selectedRegime === 'new' && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 flex items-center">
                <User className="w-2.5 h-2.5 mr-0.5" /> Your Pick
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100 text-sm">
        {/* Gross Total Income */}
        <div className="grid grid-cols-3 p-3.5 sm:px-5 hover:bg-slate-50/50">
          <span className="font-medium text-slate-700">Gross Total Income</span>
          <span className="text-right font-mono text-slate-800">{formatINR(oldRes.grossTotalIncome)}</span>
          <span className="text-right font-mono text-slate-800">{formatINR(newRes.grossTotalIncome)}</span>
        </div>

        {/* Standard Deduction */}
        <div className="grid grid-cols-3 p-3.5 sm:px-5 hover:bg-slate-50/50">
          <div>
            <span className="font-medium text-slate-700">Standard Deduction</span>
            <span className="block text-xs text-slate-400">Sec 16(ia)</span>
          </div>
          <span className="text-right font-mono text-slate-700">- {formatINR(oldRes.standardDeduction)}</span>
          <span className="text-right font-mono text-emerald-700 font-medium">- {formatINR(newRes.standardDeduction)}</span>
        </div>

        {/* Chapter VI-A Deductions */}
        <div className="grid grid-cols-3 p-3.5 sm:px-5 hover:bg-slate-50/50">
          <div>
            <span className="font-medium text-slate-700">Other Deductions / Exemptions</span>
            <span className="block text-xs text-slate-400">80C, 80D, HRA, NPS, etc.</span>
          </div>
          <span className="text-right font-mono text-slate-700">
            - {formatINR(oldRes.totalDeductions - oldRes.standardDeduction)}
          </span>
          <span className="text-right font-mono text-slate-700">
            - {formatINR(newRes.totalDeductions - newRes.standardDeduction)}
          </span>
        </div>

        {/* Taxable Income */}
        <div className="grid grid-cols-3 p-3.5 sm:px-5 bg-slate-50/70 font-semibold text-slate-900">
          <div>
            <span>Net Taxable Income</span>
            <span className="block text-xs font-normal text-slate-500">Rounded down to ₹10 (Sec 288A)</span>
          </div>
          <span className="text-right font-mono">{formatINR(oldRes.taxableIncome)}</span>
          <span className="text-right font-mono">{formatINR(newRes.taxableIncome)}</span>
        </div>

        {/* Slab Tax */}
        <div className="grid grid-cols-3 p-3.5 sm:px-5 hover:bg-slate-50/50">
          <span className="font-medium text-slate-700">Base Slab Tax</span>
          <span className="text-right font-mono text-slate-800">{formatINR(oldRes.slabTax)}</span>
          <span className="text-right font-mono text-slate-800">{formatINR(newRes.slabTax)}</span>
        </div>

        {/* Rebate (Sec 87A/156) */}
        <div className="grid grid-cols-3 p-3.5 sm:px-5 hover:bg-slate-50/50">
          <div>
            <span className="font-medium text-slate-700">Tax Rebate (Sec 87A)</span>
            <span className="block text-xs text-slate-400">Up to ₹5L (Old) / ₹12L (New)</span>
          </div>
          <span className="text-right font-mono text-emerald-700">
            {oldRes.rebate > 0 ? `- ${formatINR(oldRes.rebate)}` : '₹0'}
          </span>
          <span className="text-right font-mono text-emerald-700 font-medium">
            {newRes.rebate > 0 ? `- ${formatINR(newRes.rebate)}` : '₹0'}
          </span>
        </div>

        {/* Marginal Relief */}
        {(oldRes.marginalRelief > 0 || newRes.marginalRelief > 0) && (
          <div className="grid grid-cols-3 p-3.5 sm:px-5 bg-emerald-50/30">
            <div>
              <span className="font-medium text-emerald-900">Marginal Relief (Rebate)</span>
              <span className="block text-xs text-emerald-700">Sec 87A / Sec 156 relief</span>
            </div>
            <span className="text-right font-mono text-emerald-700">
              {oldRes.marginalRelief > 0 ? `- ${formatINR(oldRes.marginalRelief)}` : '₹0'}
            </span>
            <span className="text-right font-mono text-emerald-700 font-medium">
              {newRes.marginalRelief > 0 ? `- ${formatINR(newRes.marginalRelief)}` : '₹0'}
            </span>
          </div>
        )}

        {/* Surcharge */}
        {(oldRes.surcharge > 0 || newRes.surcharge > 0) && (
          <div className="grid grid-cols-3 p-3.5 sm:px-5 hover:bg-slate-50/50">
            <div>
              <span className="font-medium text-slate-700">Surcharge</span>
              <span className="block text-xs text-slate-400">After marginal relief</span>
            </div>
            <span className="text-right font-mono text-slate-800">{formatINR(oldRes.surcharge)}</span>
            <span className="text-right font-mono text-slate-800">{formatINR(newRes.surcharge)}</span>
          </div>
        )}

        {/* Cess */}
        <div className="grid grid-cols-3 p-3.5 sm:px-5 hover:bg-slate-50/50">
          <div>
            <span className="font-medium text-slate-700">Health & Education Cess</span>
            <span className="block text-xs text-slate-400">4% statutory cess</span>
          </div>
          <span className="text-right font-mono text-slate-800">{formatINR(oldRes.cess)}</span>
          <span className="text-right font-mono text-slate-800">{formatINR(newRes.cess)}</span>
        </div>

        {/* TOTAL TAX (Highlighted) */}
        <div className="grid grid-cols-3 p-4 sm:p-5 bg-slate-900 text-white font-bold items-center">
          <div>
            <span className="text-base sm:text-lg">Total Tax Payable</span>
            <span className="block text-xs font-normal text-slate-400">Including cess</span>
          </div>
          <div className="text-right">
            <span className={`text-base sm:text-xl font-mono ${isOldWinner ? 'text-emerald-400' : 'text-white'}`}>
              {formatINR(oldRes.totalTax)}
            </span>
          </div>
          <div className="text-right">
            <span className={`text-base sm:text-xl font-mono ${isNewWinner ? 'text-emerald-400' : 'text-white'}`}>
              {formatINR(newRes.totalTax)}
            </span>
          </div>
        </div>

        {/* Effective Tax Rate */}
        <div className="grid grid-cols-3 p-3.5 sm:px-5 bg-slate-100/60 font-medium text-slate-700 text-xs sm:text-sm">
          <span>Effective Tax Rate</span>
          <span className="text-right font-mono">{oldRes.effectiveRate}%</span>
          <span className="text-right font-mono">{newRes.effectiveRate}%</span>
        </div>

        {/* Monthly Tax Burden */}
        <div className="grid grid-cols-3 p-3.5 sm:px-5 bg-slate-100/60 font-medium text-slate-700 text-xs sm:text-sm">
          <span>Monthly Tax Burden</span>
          <span className="text-right font-mono">{formatINR(oldRes.monthlyTax)} / mo</span>
          <span className="text-right font-mono">{formatINR(newRes.monthlyTax)} / mo</span>
        </div>
      </div>
    </div>
  );
};
