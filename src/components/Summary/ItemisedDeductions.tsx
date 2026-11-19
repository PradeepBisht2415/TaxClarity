import React, { useState } from 'react';
import { DeductionItem } from '../../engine/types';
import { formatINR } from '../../utils/format';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';

interface ItemisedDeductionsProps {
  oldDeductions: DeductionItem[];
  newDeductions: DeductionItem[];
  oldStandardDeduction: number;
  newStandardDeduction: number;
}

export const ItemisedDeductions: React.FC<ItemisedDeductionsProps> = ({
  oldDeductions,
  newDeductions,
  oldStandardDeduction,
  newStandardDeduction,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left bg-slate-50 hover:bg-slate-100/70 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>Itemised Deductions & Exemptions Breakdown</span>
        </div>
        <div className="flex items-center space-x-1 text-xs text-slate-500 font-medium">
          <span>{isOpen ? 'Hide breakdown' : 'View breakdown'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-5 overflow-x-auto text-sm">
          <table className="w-full text-left border-collapse" role="table">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 pr-4">Deduction / Section</th>
                <th className="py-2.5 px-3 text-right">Old Regime Allowed</th>
                <th className="py-2.5 pl-3 text-right">New Regime Allowed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {/* Standard Deduction Row */}
              <tr>
                <td className="py-2.5 pr-4">
                  <span className="font-medium text-slate-900">Standard Deduction</span>
                  <span className="block text-xs text-slate-400">Section 16(ia)</span>
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-medium">
                  {formatINR(oldStandardDeduction)}
                </td>
                <td className="py-2.5 pl-3 text-right font-mono font-medium text-emerald-600">
                  {formatINR(newStandardDeduction)}
                </td>
              </tr>

              {/* Old Regime items */}
              {oldDeductions.map((item) => {
                const matchingNew = newDeductions.find((n) => n.id === item.id);
                return (
                  <tr key={item.id}>
                    <td className="py-2.5 pr-4">
                      <span className="font-medium text-slate-900">{item.label}</span>
                      <span className="block text-xs text-slate-400">
                        {item.section} (Claimed: {formatINR(item.claimed)})
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">
                      {formatINR(item.allowed)}
                    </td>
                    <td className="py-2.5 pl-3 text-right font-mono text-slate-400">
                      {matchingNew ? formatINR(matchingNew.allowed) : '₹0'}
                    </td>
                  </tr>
                );
              })}

              {/* Any New Regime-only deductions (e.g. 80CCD(2) when not present in old) */}
              {newDeductions
                .filter((n) => !oldDeductions.some((o) => o.id === n.id))
                .map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 pr-4">
                      <span className="font-medium text-slate-900">{item.label}</span>
                      <span className="block text-xs text-slate-400">{item.section}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">₹0</td>
                    <td className="py-2.5 pl-3 text-right font-mono font-medium text-emerald-600">
                      {formatINR(item.allowed)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
