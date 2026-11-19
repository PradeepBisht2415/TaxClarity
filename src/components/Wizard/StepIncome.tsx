import React from 'react';
import { useTax } from '../../context/TaxContext';
import { CurrencyInput } from '../common/CurrencyInput';
import { formatINR } from '../../utils/format';
import { Wallet } from 'lucide-react';

export const StepIncome: React.FC = () => {
  const { input, updateIncome, isSalaried } = useTax();

  const totalGross =
    (input.income.grossSalary || 0) +
    (input.income.interestIncome || 0) +
    (input.income.rentalIncome || 0) +
    (input.income.otherIncome || 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Income Details</h2>
        <p className="text-sm text-slate-500 mt-1">
          Enter all annual income streams earned during Financial Year 2026-27 (AY 2027-28).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isSalaried && (
          <CurrencyInput
            id="grossSalary"
            label="Gross Annual Salary / Pension"
            value={input.income.grossSalary}
            onChange={(val) => updateIncome({ grossSalary: val })}
            tooltip="Total annual earnings from Form 16 (Part B) or salary slips before standard deduction."
            placeholder="e.g. 15,00,000"
            helperText="Standard deduction (₹75k New / ₹50k Old) will be auto-applied."
          />
        )}

        <CurrencyInput
          id="interestIncome"
          label="Interest Income"
          value={input.income.interestIncome}
          onChange={(val) => updateIncome({ interestIncome: val })}
          tooltip="Annual interest from savings accounts, fixed deposits (FD), and recurring deposits."
          placeholder="e.g. 40,000"
          helperText="Eligible for Section 80TTA (₹10k) or 80TTB (₹50k for seniors) under Old Regime."
        />

        <CurrencyInput
          id="rentalIncome"
          label="Rental Income (Net Annual Value)"
          value={input.income.rentalIncome}
          onChange={(val) => updateIncome({ rentalIncome: val })}
          tooltip="Annual rental income received after deducting municipal taxes and 30% statutory repair allowance."
          placeholder="e.g. 1,20,000"
        />

        <CurrencyInput
          id="otherIncome"
          label="Other Income (Taxable at Slab Rates)"
          value={input.income.otherIncome}
          onChange={(val) => updateIncome({ otherIncome: val })}
          tooltip="Freelance work, consulting fees, dividends, or other miscellaneous income subject to slab rates."
          placeholder="e.g. 50,000"
        />
      </div>

      {/* Live Total Gross Income Summary */}
      <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Gross Total Income
            </p>
            <p className="text-xl font-bold text-white font-mono mt-0.5">
              {formatINR(totalGross)}
            </p>
          </div>
        </div>
        <span className="text-xs text-slate-400">Before deductions</span>
      </div>
    </div>
  );
};
