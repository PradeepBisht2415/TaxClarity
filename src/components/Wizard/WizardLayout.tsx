import React from 'react';
import { useTax } from '../../context/TaxContext';
import { ArrowLeft, ArrowRight, RotateCcw, Check, Sparkles } from 'lucide-react';

interface StepMeta {
  id: number;
  label: string;
}

export const WizardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { step, maxStepReached, setStep, nextStep, prevStep, reset, isSalaried } = useTax();

  const stepsList: StepMeta[] = [
    { id: 1, label: 'Profile' },
    { id: 2, label: 'Income' },
    ...(isSalaried ? [{ id: 3, label: 'Salary Details' }] : []),
    { id: 4, label: 'Deductions' },
    { id: 5, label: 'Preference' },
    { id: 6, label: 'Summary' },
  ];

  const currentStepIndex = stepsList.findIndex((s) => s.id === step);
  const activeIndex = currentStepIndex !== -1 ? currentStepIndex : 0;
  const progressPercent = ((activeIndex + 1) / stepsList.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-10">
      {/* Progress Bar & Steps Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>
            Step {activeIndex + 1} of {stepsList.length}: {stepsList[activeIndex]?.label}
          </span>
          <span>{Math.round(progressPercent)}% Completed</span>
        </div>

        {/* Visual Progress Bar */}
        <div
          role="progressbar"
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="w-full h-2 bg-slate-200 rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Indicator Pills (Clickable for visited steps) */}
        <div className="hidden sm:flex items-center justify-between mt-4">
          {stepsList.map((s, idx) => {
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;
            const isClickable = s.id <= maxStepReached;

            return (
              <button
                key={s.id}
                type="button"
                disabled={!isClickable}
                onClick={() => setStep(s.id)}
                className={`flex items-center space-x-2 text-xs font-medium py-1.5 px-3 rounded-full transition-all ${
                  isCurrent
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isCurrent
                      ? 'bg-white text-emerald-700 font-bold'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : idx + 1}
                </span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Body */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 mb-6">
        {children}
      </div>

      {/* Stepper Navigation Footer */}
      {step < 6 && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={reset}
              className="hidden sm:inline-flex items-center px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset
            </button>

            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <span>{step === 5 ? 'View Tax Summary' : 'Continue'}</span>
              {step === 5 ? (
                <Sparkles className="w-4 h-4 ml-2" />
              ) : (
                <ArrowRight className="w-4 h-4 ml-2" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
