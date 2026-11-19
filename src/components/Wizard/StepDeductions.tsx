import React from 'react';
import { useTax } from '../../context/TaxContext';
import { CurrencyInput } from '../common/CurrencyInput';
import { currentTaxConfig } from '../../engine/taxConfig';
import { HeartPulse, ShieldAlert } from 'lucide-react';

export const StepDeductions: React.FC = () => {
  const { input, updateDeductions } = useTax();
  const deductions = input.deductions;
  const isSeniorUser =
    input.profile.ageCategory === 'senior' || input.profile.ageCategory === 'superSenior';

  const limits = currentTaxConfig.oldRegime.deductionLimits;
  const self80DLimit = isSeniorUser ? limits.sec80DSenior : limits.sec80DNonSenior;
  const parents80DLimit = deductions.isParentSenior ? limits.sec80DSenior : limits.sec80DNonSenior;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Deductions & Exemptions (Chapter VI-A)</h2>
        <p className="text-sm text-slate-500 mt-1">
          Enter eligible investments and expenditures. Most of these deductions apply exclusively under the Old Regime.
        </p>
      </div>

      {/* Note about New Regime */}
      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-3 text-xs text-blue-800">
        <ShieldAlert className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Regime Note:</span> The New Tax Regime features lower slab rates but does not allow Chapter VI-A deductions (except Employer NPS 80CCD(2)). TaxClarity computes both regimes so you can compare the exact outcome.
        </div>
      </div>

      <div className="space-y-4">
        {/* Section 80C & 80CCD(1B) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CurrencyInput
            id="sec80C"
            label="Section 80C Investments"
            value={deductions.sec80C ?? 0}
            onChange={(val) => updateDeductions({ sec80C: val })}
            cap={limits.sec80C}
            tooltip="Includes Employee Provident Fund (EPF), PPF, ELSS mutual funds, LIC premiums, home loan principal repayment, SSY, and children's tuition fees."
            placeholder="1,50,000"
          />

          <CurrencyInput
            id="sec80CCD1B"
            label="Section 80CCD(1B) NPS (Self)"
            value={deductions.sec80CCD1B ?? 0}
            onChange={(val) => updateDeductions({ sec80CCD1B: val })}
            cap={limits.sec80CCD1B}
            tooltip="Additional voluntary contribution to National Pension System (NPS Tier 1), over and above the 80C limit."
            placeholder="50,000"
          />
        </div>

        {/* Section 80D - Health Insurance */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center space-x-2 text-slate-800 font-semibold text-sm">
            <HeartPulse className="w-4 h-4 text-emerald-600" />
            <span>Section 80D: Health Insurance Premiums & Preventative Health Checkup</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CurrencyInput
              id="sec80D_self"
              label={`Self, Spouse & Children (${isSeniorUser ? 'Senior: Max ₹50k' : 'Max ₹25k'})`}
              value={deductions.sec80DMedicalSelf ?? 0}
              onChange={(val) => updateDeductions({ sec80DMedicalSelf: val })}
              cap={self80DLimit}
              tooltip="Health insurance premium paid for self, spouse, and dependent children."
              placeholder="e.g. 25,000"
            />

            <div className="space-y-2">
              <CurrencyInput
                id="sec80D_parents"
                label={`Parents (${deductions.isParentSenior ? 'Senior: Max ₹50k' : 'Max ₹25k'})`}
                value={deductions.sec80DMedicalParents ?? 0}
                onChange={(val) => updateDeductions({ sec80DMedicalParents: val })}
                cap={parents80DLimit}
                tooltip="Health insurance premiums paid for parents."
                placeholder="e.g. 25,000"
              />

              <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={Boolean(deductions.isParentSenior)}
                  onChange={(e) => updateDeductions({ isParentSenior: e.target.checked })}
                  className="w-3.5 h-3.5 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                />
                <span>One or both parents are Senior Citizens (60+ years)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 24(b) - Home Loan Interest */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CurrencyInput
            id="homeLoanInterest24b"
            label="Section 24(b) Home Loan Interest"
            value={deductions.homeLoanInterest24b ?? 0}
            onChange={(val) => updateDeductions({ homeLoanInterest24b: val })}
            cap={limits.sec24bHomeLoan}
            tooltip="Interest paid on housing loan for self-occupied residential property (max ₹2,00,000)."
            placeholder="e.g. 2,00,000"
          />

          <CurrencyInput
            id="sec80E"
            label="Section 80E Education Loan Interest"
            value={deductions.sec80E ?? 0}
            onChange={(val) => updateDeductions({ sec80E: val })}
            tooltip="Interest paid on higher education loan for self, spouse, or children. No statutory upper cap."
            placeholder="e.g. 60,000"
          />
        </div>

        {/* Section 80G & Other */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CurrencyInput
            id="sec80G"
            label="Section 80G Eligible Donations"
            value={deductions.sec80G ?? 0}
            onChange={(val) => updateDeductions({ sec80G: val })}
            tooltip="Eligible 100% or 50% qualifying donations made to recognized funds/charities."
            placeholder="e.g. 10,000"
          />

          <CurrencyInput
            id="otherDeductions"
            label="Other Chapter VI-A Deductions"
            value={deductions.otherDeductions ?? 0}
            onChange={(val) => updateDeductions({ otherDeductions: val })}
            tooltip="Any other eligible deductions (e.g., Section 80GG, 80U, 80DDB, etc.)."
            placeholder="e.g. 10,000"
          />
        </div>
      </div>
    </div>
  );
};
