import { Check } from 'lucide-react';

export interface RadioOption<T extends string> {
  value: T;
  title: string;
  subtitle?: string;
  badge?: string;
}

interface RadioCardGroupProps<T extends string> {
  name: string;
  options: RadioOption<T>[];
  selectedValue: T;
  onChange: (val: T) => void;
  columns?: 1 | 2 | 3;
}

export function RadioCardGroup<T extends string>({
  name,
  options,
  selectedValue,
  onChange,
  columns = 3,
}: RadioCardGroupProps<T>) {
  const colClass =
    columns === 3
      ? 'grid-cols-1 md:grid-cols-3'
      : columns === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1';

  return (
    <div className={`grid gap-3 ${colClass}`} role="radiogroup" aria-labelledby={name}>
      {options.map((option) => {
        const isSelected = selectedValue === option.value;
        return (
          <label
            key={option.value}
            className={`relative flex flex-col p-4 cursor-pointer rounded-xl border-2 transition-all select-none ${
              isSelected
                ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isSelected}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <div className="flex items-start justify-between">
              <div>
                <span className="block text-sm font-semibold text-slate-800">
                  {option.title}
                </span>
                {option.subtitle && (
                  <span className="block text-xs text-slate-500 mt-1">
                    {option.subtitle}
                  </span>
                )}
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                  isSelected
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
            {option.badge && (
              <span className="mt-2.5 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 self-start">
                {option.badge}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}
