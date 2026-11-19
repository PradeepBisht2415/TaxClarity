import React from 'react';
import { currentTaxConfig } from '../../engine/taxConfig';
import { AlertCircle, Calendar } from 'lucide-react';

export const Disclaimer: React.FC = () => {
  return (
    <footer className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-500 space-y-3">
      <div className="flex items-start space-x-2">
        <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-600">
            Statutory Disclaimer & Information Notice:
          </p>
          <p>
            Calculations cover resident individuals and income taxed at normal progressive slab rates for{' '}
            <strong>Financial Year {currentTaxConfig.financialYear} (Assessment Year {currentTaxConfig.assessmentYear})</strong>.
          </p>
          <p>
            Capital gains (special rates), crypto assets, presumptive business schemes (Section 44AD/ADA), foreign income, HUFs, and non-resident status are out of scope.
          </p>
          <p>
            Tax law is subject to ongoing statutory changes and CBDT circulars. This tool is an estimate for informational guidance and does not constitute formal legal or Chartered Accountant advice.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
        <div className="flex items-center space-x-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>Config Rules Last Verified: {currentTaxConfig.lastVerifiedDate}</span>
        </div>
        <span>TaxClarity Browser Edition • Zero Network Telemetry</span>
      </div>
    </footer>
  );
};
