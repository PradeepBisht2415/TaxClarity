import React from 'react';
import { useTax } from '../../context/TaxContext';
import { Lock, Trash2 } from 'lucide-react';

export const PrivacyControls: React.FC = () => {
  const { isSavedLocally, setIsSavedLocally, clearSavedData } = useTax();

  return (
    <div className="p-4 bg-slate-100/80 border border-slate-200 rounded-xl space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              100% Client-Side Privacy
            </p>
            <p className="text-xs text-slate-500">
              Your inputs are computed solely in your browser and never leave this device.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-auto">
          <label className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-slate-700 select-none">
            <input
              type="checkbox"
              checked={isSavedLocally}
              onChange={(e) => setIsSavedLocally(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
            />
            <span>Remember inputs on this device</span>
          </label>

          {isSavedLocally && (
            <button
              type="button"
              onClick={clearSavedData}
              className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors"
              title="Clear stored data"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
