import React, { useState, useEffect } from 'react';
import { formatINR, parseINR } from '../../utils/format';
import { InfoTooltip } from './InfoTooltip';
import { AlertCircle } from 'lucide-react';

interface CurrencyInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (val: number) => void;
  cap?: number;
  tooltip?: string;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  label,
  value,
  onChange,
  cap,
  tooltip,
  placeholder = '0',
  helperText,
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState('');

  // Sync internal display when raw value changes from outside
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value > 0 ? formatINR(value, { showSymbol: false }) : '');
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawText = e.target.value;
    // Allow only digits and commas
    const numericStr = rawText.replace(/[^0-9]/g, '');

    if (!numericStr) {
      setDisplayValue('');
      onChange(0);
      return;
    }

    const num = Math.min(100_00_00_000, parseINR(numericStr)); // Cap at 100 Cr
    setDisplayValue(rawText);
    onChange(num);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setDisplayValue(value > 0 ? value.toString() : '');
  };

  const handleBlur = () => {
    setIsFocused(false);
    setDisplayValue(value > 0 ? formatINR(value, { showSymbol: false }) : '');
  };

  const isCapped = Boolean(cap && value > cap);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="text-sm font-medium text-slate-700 flex items-center">
          {label}
          {tooltip && <InfoTooltip content={tooltip} ariaLabel={`About ${label}`} />}
        </label>
        {cap && (
          <span className="text-xs text-slate-500 font-mono">
            Max: {formatINR(cap)}
          </span>
        )}
      </div>

      <div className="relative rounded-lg shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-semibold text-base">
          ₹
        </div>
        <input
          type="text"
          inputMode="numeric"
          id={id}
          disabled={disabled}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          aria-describedby={isCapped ? `${id}-cap-warning` : undefined}
          className={`block w-full pl-8 pr-3 py-2.5 sm:text-base border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
            isCapped
              ? 'border-amber-400 bg-amber-50/20 text-slate-900 focus:ring-amber-500'
              : 'border-slate-300 text-slate-900 focus:ring-emerald-500 focus:border-emerald-500'
          } ${disabled ? 'bg-slate-100 cursor-not-allowed opacity-75' : 'bg-white'}`}
        />
      </div>

      {isCapped && cap && (
        <div
          id={`${id}-cap-warning`}
          className="mt-1.5 flex items-center text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200"
        >
          <AlertCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
          <span>
            Exceeds limit. Only <strong>{formatINR(cap)}</strong> will be allowed in tax calculation.
          </span>
        </div>
      )}

      {helperText && !isCapped && (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
};
