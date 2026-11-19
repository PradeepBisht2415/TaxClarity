import React from 'react';
import { TaxComparison } from '../../engine/types';
import { formatINR } from '../../utils/format';
import { Award, CheckCircle2, AlertCircle } from 'lucide-react';

interface SavingsBannerProps {
  comparison: TaxComparison;
}

export const SavingsBanner: React.FC<SavingsBannerProps> = ({ comparison }) => {
  const { betterRegime, savings, selectedRegime, old: oldRes } = comparison;

  const isTie = betterRegime === 'equal' || savings === 0;
  const isNewWinner = betterRegime === 'new';
  const isOldWinner = betterRegime === 'old';

  // Check user preference vs recommendation
  const hasUserSelectedSpecific = selectedRegime === 'old' || selectedRegime === 'new';
  const userSelectedBetter = selectedRegime === betterRegime;
  const userSelectedWorse = hasUserSelectedSpecific && !userSelectedBetter && !isTie;

  const winningRegimeLabel = isNewWinner ? 'New Regime' : isOldWinner ? 'Old Regime' : '';

  return (
    <div className="space-y-3">
      {/* Primary Savings Card */}
      <div
        className={`p-6 rounded-2xl shadow-sm border ${
          isTie
            ? 'bg-blue-50 border-blue-200 text-blue-950'
            : 'bg-emerald-600 text-white border-emerald-500'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isTie ? 'bg-blue-100 text-blue-700' : 'bg-white/10 text-white'
              }`}
            >
              {isTie ? <CheckCircle2 className="w-6 h-6" /> : <Award className="w-7 h-7" />}
            </div>
            <div>
              <p
                className={`text-xs uppercase tracking-wider font-semibold ${
                  isTie ? 'text-blue-700' : 'text-emerald-100'
                }`}
              >
                Recommended Choice
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">
                {isTie
                  ? 'Both regimes result in the exact same tax'
                  : `${winningRegimeLabel} saves you ${formatINR(savings)}`}
              </h2>
            </div>
          </div>

          <div
            className={`self-start sm:self-auto px-4 py-2 rounded-xl font-mono text-sm sm:text-base font-bold ${
              isTie
                ? 'bg-blue-100 text-blue-900'
                : 'bg-emerald-700/60 text-white border border-emerald-400/30'
            }`}
          >
            {isTie
              ? `Tax: ${formatINR(oldRes.totalTax)}`
              : `Total Savings: ${formatINR(savings)}`}
          </div>
        </div>
      </div>

      {/* User Selection Differential Insight */}
      {userSelectedWorse && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-sm text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Preference Comparison: </span>
            You selected the <strong>{selectedRegime === 'old' ? 'Old Regime' : 'New Regime'}</strong>,
            but switching to the <strong>{winningRegimeLabel}</strong> will save you an additional{' '}
            <strong className="font-mono">{formatINR(savings)}</strong> annually.
          </div>
        </div>
      )}

      {hasUserSelectedSpecific && userSelectedBetter && !isTie && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            Great pick! Your preferred <strong>{winningRegimeLabel}</strong> is also the most tax-efficient regime.
          </span>
        </div>
      )}
    </div>
  );
};
