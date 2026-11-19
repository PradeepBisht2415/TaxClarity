import React from 'react';
import { useTax } from '../../context/TaxContext';
import { RegimePreference } from '../../engine/types';
import { RadioCardGroup, RadioOption } from '../common/RadioCardGroup';
import { Scale } from 'lucide-react';

export const StepRegimePreference: React.FC = () => {
  const { input, setRegimePreference } = useTax();

  const regimeOptions: RadioOption<RegimePreference>[] = [
    {
      value: 'compare',
      title: 'Compare Both Regimes',
      subtitle: 'Unbiased side-by-side computation. TaxClarity recommends the one saving you more money.',
      badge: 'Recommended',
    },
    {
      value: 'new',
      title: 'I prefer New Regime',
      subtitle: 'Default tax regime under Indian IT Act. Lower slab rates, higher standard deduction (₹75k), no 80C/80D.',
    },
    {
      value: 'old',
      title: 'I prefer Old Regime',
      subtitle: 'Higher slab rates, but allows standard deduction (₹50k), HRA, 80C, 80D, home loan interest, etc.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Regime Preference</h2>
        <p className="text-sm text-slate-500 mt-1">
          Select your regime preference or let TaxClarity automatically calculate the most tax-efficient choice.
        </p>
      </div>

      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start space-x-3 text-sm text-emerald-900">
        <Scale className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Dual Computation Guarantee</p>
          <p className="text-emerald-700 text-xs mt-0.5">
            Even if you pick a preferred regime here, TaxClarity always calculates both regimes simultaneously so you can verify the exact difference in rupee savings.
          </p>
        </div>
      </div>

      <RadioCardGroup<RegimePreference>
        name="regime-preference"
        options={regimeOptions}
        selectedValue={input.regimePreference ?? 'compare'}
        onChange={setRegimePreference}
        columns={1}
      />
    </div>
  );
};
