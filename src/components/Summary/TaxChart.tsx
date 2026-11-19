import React from 'react';
import { TaxResult } from '../../engine/types';
import { formatINR } from '../../utils/format';
import { BarChart3 } from 'lucide-react';

interface TaxChartProps {
  oldRes: TaxResult;
  newRes: TaxResult;
}

export const TaxChart: React.FC<TaxChartProps> = ({ oldRes, newRes }) => {
  const gross = Math.max(oldRes.grossTotalIncome, newRes.grossTotalIncome, 1);

  const oldTaxPct = Math.min(100, (oldRes.totalTax / gross) * 100);
  const oldTakeHomePct = 100 - oldTaxPct;

  const newTaxPct = Math.min(100, (newRes.totalTax / gross) * 100);
  const newTakeHomePct = 100 - newTaxPct;

  return (
    <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
        <BarChart3 className="w-4 h-4 text-emerald-600" />
        <span>Take-Home Pay vs. Tax Comparison</span>
      </div>

      <div className="space-y-4 pt-1">
        {/* Old Regime Bar */}
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
            <span className="font-semibold">Old Regime</span>
            <span className="text-slate-500">
              Tax: <strong className="text-slate-800 font-mono">{formatINR(oldRes.totalTax)}</strong> (
              {oldRes.effectiveRate}%)
            </span>
          </div>
          <div className="w-full h-7 bg-slate-100 rounded-lg overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${oldTakeHomePct}%` }}
              className="bg-emerald-500 flex items-center justify-start pl-2.5 text-[11px] font-bold text-white transition-all duration-500"
              title={`Take-Home: ${formatINR(gross - oldRes.totalTax)}`}
            >
              Take-Home ({Math.round(oldTakeHomePct)}%)
            </div>
            {oldTaxPct > 0 && (
              <div
                style={{ width: `${oldTaxPct}%` }}
                className="bg-rose-400 flex items-center justify-end pr-2 text-[11px] font-bold text-white transition-all duration-500"
                title={`Tax: ${formatINR(oldRes.totalTax)}`}
              >
                {oldTaxPct > 8 ? `${Math.round(oldTaxPct)}%` : ''}
              </div>
            )}
          </div>
        </div>

        {/* New Regime Bar */}
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
            <span className="font-semibold">New Regime</span>
            <span className="text-slate-500">
              Tax: <strong className="text-slate-800 font-mono">{formatINR(newRes.totalTax)}</strong> (
              {newRes.effectiveRate}%)
            </span>
          </div>
          <div className="w-full h-7 bg-slate-100 rounded-lg overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${newTakeHomePct}%` }}
              className="bg-emerald-600 flex items-center justify-start pl-2.5 text-[11px] font-bold text-white transition-all duration-500"
              title={`Take-Home: ${formatINR(gross - newRes.totalTax)}`}
            >
              Take-Home ({Math.round(newTakeHomePct)}%)
            </div>
            {newTaxPct > 0 && (
              <div
                style={{ width: `${newTaxPct}%` }}
                className="bg-rose-500 flex items-center justify-end pr-2 text-[11px] font-bold text-white transition-all duration-500"
                title={`Tax: ${formatINR(newRes.totalTax)}`}
              >
                {newTaxPct > 8 ? `${Math.round(newTaxPct)}%` : ''}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-1 text-xs text-slate-500">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 bg-emerald-600 rounded-sm" />
          <span>Net Take-Home Pay</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 bg-rose-500 rounded-sm" />
          <span>Total Income Tax</span>
        </div>
      </div>
    </div>
  );
};
