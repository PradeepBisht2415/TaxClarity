import { TaxProvider, useTax } from './context/TaxContext';
import { WizardLayout } from './components/Wizard/WizardLayout';
import { StepProfile } from './components/Wizard/StepProfile';
import { StepIncome } from './components/Wizard/StepIncome';
import { StepSalaryDetails } from './components/Wizard/StepSalaryDetails';
import { StepDeductions } from './components/Wizard/StepDeductions';
import { StepRegimePreference } from './components/Wizard/StepRegimePreference';
import { SummaryView } from './components/Summary/SummaryView';
import { PrivacyControls } from './components/common/PrivacyControls';
import { Disclaimer } from './components/common/Disclaimer';
import { Calculator, ShieldCheck } from 'lucide-react';
import { currentTaxConfig } from './engine/taxConfig';

function WizardContent() {
  const { step } = useTax();

  return (
    <WizardLayout>
      {step === 1 && <StepProfile />}
      {step === 2 && <StepIncome />}
      {step === 3 && <StepSalaryDetails />}
      {step === 4 && <StepDeductions />}
      {step === 5 && <StepRegimePreference />}
      {step === 6 && <SummaryView />}
    </WizardLayout>
  );
}

export default function App() {
  return (
    <TaxProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
        {/* Top App Header */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20 print:static print:border-none shadow-xs">
          <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                <Calculator className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="font-extrabold text-slate-900 text-lg tracking-tight">
                    TaxClarity
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    FY {currentTaxConfig.financialYear}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Indian Income Tax Calculator & Regime Comparator
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
              <span className="hidden sm:inline-flex items-center text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Browser Only • No Tracking
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">
          <WizardContent />
        </main>

        {/* Footer Area with Privacy Controls & Disclaimers */}
        <div className="max-w-4xl mx-auto px-4 pb-8 w-full print:hidden">
          <PrivacyControls />
          <Disclaimer />
        </div>
      </div>
    </TaxProvider>
  );
}
