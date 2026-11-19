import React from 'react';
import { useTax } from '../../context/TaxContext';
import { CurrencyInput } from '../common/CurrencyInput';
import { calculateHRAExemption } from '../../engine/hra';
import { formatINR } from '../../utils/format';
import { Home, Info, Building2 } from 'lucide-react';

export const StepSalaryDetails: React.FC = () => {
  const { input, updateSalaryDetails } = useTax();
  const salary = input.salaryDetails || {};

  const hraExemption = calculateHRAExemption(salary);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Salary & Allowances Breakdown</h2>
        <p className="text-sm text-slate-500 mt-1">
          These details calculate your House Rent Allowance (HRA) exemption and Employer NPS caps under the Old Regime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CurrencyInput
          id="basicDA"
          label="Basic Salary + DA (Annual)"
          value={salary.basicDA ?? 0}
          onChange={(val) => updateSalaryDetails({ basicDA: val })}
          tooltip="Essential for computing the 10%/40%/50% HRA exemption limits and 80CCD(2) NPS caps."
          placeholder="e.g. 6,00,000"
        />

        <CurrencyInput
          id="employerNPS"
          label="Employer NPS Contribution (Sec 80CCD(2))"
          value={salary.employerNPS ?? 0}
          onChange={(val) => updateSalaryDetails({ employerNPS: val })}
          tooltip="Allowed in BOTH Old (max 10% of Basic+DA) and New Regime (max 14% of Basic+DA)."
          placeholder="e.g. 60,000"
          helperText="Deductible under both regimes!"
        />
      </div>

      {/* HRA Exemption Sub-section */}
      <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
        <div className="flex items-center space-x-2">
          <Home className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-semibold text-slate-800">
            House Rent Allowance (HRA) Helper
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CurrencyInput
            id="hraReceived"
            label="HRA Component Received (Annual)"
            value={salary.hraReceived ?? 0}
            onChange={(val) => updateSalaryDetails({ hraReceived: val })}
            tooltip="Total annual HRA allowance shown in your salary payslip."
            placeholder="e.g. 2,40,000"
          />

          <CurrencyInput
            id="rentPaid"
            label="Total Rent Paid (Annual)"
            value={salary.rentPaid ?? 0}
            onChange={(val) => updateSalaryDetails({ rentPaid: val })}
            tooltip="Actual total rent paid to landlord during the financial year."
            placeholder="e.g. 3,00,000"
          />
        </div>

        {/* Metro Flag Toggle */}
        <label className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-slate-300">
          <input
            type="checkbox"
            checked={Boolean(salary.isMetro)}
            onChange={(e) => updateSalaryDetails({ isMetro: e.target.checked })}
            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
          />
          <div className="flex items-center space-x-2 text-sm text-slate-700">
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>Rented accommodation is in a Metro City (Delhi, Mumbai, Kolkata, Chennai)</span>
          </div>
        </label>

        {/* Live Calculated HRA Exemption Card */}
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-emerald-800">
            <Info className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Eligible HRA Exemption (Old Regime):</span>
          </div>
          <span className="font-bold text-emerald-900 font-mono text-base">
            {formatINR(hraExemption)}
          </span>
        </div>
      </div>

      {/* Additional Salaried Deductions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CurrencyInput
          id="professionalTax"
          label="Professional Tax Paid"
          value={salary.professionalTax ?? 0}
          onChange={(val) => updateSalaryDetails({ professionalTax: val })}
          cap={2_500}
          tooltip="State professional tax deducted from salary (max ₹2,500/year under Sec 16(iii))."
          placeholder="2,500"
        />

        <CurrencyInput
          id="ltaExempt"
          label="Leave Travel Allowance (LTA) Exemption"
          value={salary.ltaExempt ?? 0}
          onChange={(val) => updateSalaryDetails({ ltaExempt: val })}
          tooltip="Eligible exempt domestic travel expenditure under Section 10(5)."
          placeholder="e.g. 25,000"
        />
      </div>
    </div>
  );
};
