import React from 'react';
import { useTax } from '../../context/TaxContext';
import { AgeCategory, IncomeType } from '../../engine/types';
import { RadioCardGroup, RadioOption } from '../common/RadioCardGroup';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export const StepProfile: React.FC = () => {
  const { input, updateProfile } = useTax();

  const ageOptions: RadioOption<AgeCategory>[] = [
    {
      value: 'below60',
      title: 'Below 60 years',
      subtitle: 'Regular Individual tax brackets',
    },
    {
      value: 'senior',
      title: '60 to 79 years',
      subtitle: 'Senior Citizen (Higher Old Regime exemption)',
      badge: 'Senior',
    },
    {
      value: 'superSenior',
      title: '80+ years',
      subtitle: 'Super Senior Citizen (₹5L Old exemption)',
      badge: 'Super Senior',
    },
  ];

  const incomeTypeOptions: RadioOption<IncomeType>[] = [
    {
      value: 'salaried',
      title: 'Salaried / Pensioner',
      subtitle: 'Includes Standard Deduction & HRA/NPS exemptions',
      badge: 'Standard Deduction',
    },
    {
      value: 'other',
      title: 'Self-employed / Other',
      subtitle: 'Business, profession, or slab-taxed freelance income',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Taxpayer Profile</h2>
        <p className="text-sm text-slate-500 mt-1">
          Tell us about your age and employment type to configure the statutory exemptions.
        </p>
      </div>

      {/* Residency Confirmation */}
      <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-emerald-900">Resident Individual</p>
          <p className="text-emerald-700 text-xs mt-0.5">
            FY 2026-27 Section 87A / Sec 156 rebates and marginal relief apply exclusively to resident individuals.
          </p>
        </div>
      </div>

      {/* Age Category */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2.5">
          Select Age Category
        </label>
        <RadioCardGroup<AgeCategory>
          name="age-category"
          options={ageOptions}
          selectedValue={input.profile.ageCategory}
          onChange={(val) => updateProfile({ ageCategory: val })}
          columns={3}
        />
      </div>

      {/* Income Source Type */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2.5">
          Primary Income Category
        </label>
        <RadioCardGroup<IncomeType>
          name="income-category"
          options={incomeTypeOptions}
          selectedValue={input.profile.incomeType}
          onChange={(val) => updateProfile({ incomeType: val })}
          columns={2}
        />
      </div>

      {/* Out-of-Scope notice for special income */}
      <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-lg flex items-center text-xs text-amber-800">
        <AlertTriangle className="w-4 h-4 text-amber-600 mr-2 flex-shrink-0" />
        <span>
          Note: Special rate capital gains (shares/crypto) and business presumptive schemes (44AD) are out of scope for v1.
        </span>
      </div>
    </div>
  );
};
