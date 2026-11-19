import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  DeductionsInput,
  IncomeDetails,
  RegimePreference,
  SalaryDetails,
  TaxComparison,
  TaxInput,
  TaxProfile,
} from '../engine/types';
import { calculateTax } from '../engine/calculate';

const STORAGE_KEY = 'tax_clarity_state_v1';
const PERSISTENCE_PREF_KEY = 'tax_clarity_persist_preference';

const defaultTaxInput: TaxInput = {
  profile: {
    ageCategory: 'below60',
    isResident: true,
    incomeType: 'salaried',
  },
  income: {
    grossSalary: 12_75_000,
    interestIncome: 0,
    rentalIncome: 0,
    otherIncome: 0,
  },
  salaryDetails: {
    basicDA: 6_00_000,
    hraReceived: 0,
    rentPaid: 0,
    isMetro: false,
    ltaExempt: 0,
    professionalTax: 2_500,
    employerNPS: 0,
  },
  deductions: {
    sec80C: 0,
    sec80CCD1B: 0,
    sec80DMedicalSelf: 0,
    sec80DMedicalParents: 0,
    isParentSenior: false,
    sec80E: 0,
    sec80G: 0,
    homeLoanInterest24b: 0,
    otherDeductions: 0,
  },
  regimePreference: 'compare',
};

interface TaxContextType {
  step: number;
  maxStepReached: number;
  input: TaxInput;
  comparison: TaxComparison;
  isSavedLocally: boolean;
  updateProfile: (patch: Partial<TaxProfile>) => void;
  updateIncome: (patch: Partial<IncomeDetails>) => void;
  updateSalaryDetails: (patch: Partial<SalaryDetails>) => void;
  updateDeductions: (patch: Partial<DeductionsInput>) => void;
  setRegimePreference: (pref: RegimePreference) => void;
  setStep: (stepNumber: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  setIsSavedLocally: (val: boolean) => void;
  clearSavedData: () => void;
  isSalaried: boolean;
}

const TaxContext = createContext<TaxContextType | undefined>(undefined);

export const TaxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSavedLocally, setIsSavedLocallyState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(PERSISTENCE_PREF_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [input, setInput] = useState<TaxInput>(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem(PERSISTENCE_PREF_KEY) === 'true') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return defaultTaxInput;
  });

  const [step, setStepState] = useState<number>(1);
  const [maxStepReached, setMaxStepReached] = useState<number>(1);

  // Sync to localStorage only if user enabled persistence
  useEffect(() => {
    try {
      if (isSavedLocally) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(input));
        localStorage.setItem(PERSISTENCE_PREF_KEY, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(PERSISTENCE_PREF_KEY, 'false');
      }
    } catch {
      // Ignore storage errors in restricted iframe/browser modes
    }
  }, [input, isSavedLocally]);

  const isSalaried = input.profile.incomeType === 'salaried';

  // Compute tax results live
  const comparison = useMemo(() => {
    return calculateTax(input);
  }, [input]);

  const setStep = (targetStep: number) => {
    if (targetStep < 1) targetStep = 1;
    if (targetStep > 6) targetStep = 6;
    setStepState(targetStep);
    setMaxStepReached((prev) => Math.max(prev, targetStep));
  };

  const nextStep = () => {
    setStepState((current) => {
      let next = current + 1;
      // Skip salary details (Step 3) if not salaried
      if (current === 2 && !isSalaried) {
        next = 4;
      }
      setMaxStepReached((prev) => Math.max(prev, next));
      return Math.min(6, next);
    });
  };

  const prevStep = () => {
    setStepState((current) => {
      let prev = current - 1;
      // Skip back over Step 3 if not salaried
      if (current === 4 && !isSalaried) {
        prev = 2;
      }
      return Math.max(1, prev);
    });
  };

  const updateProfile = (patch: Partial<TaxProfile>) => {
    setInput((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...patch },
    }));
  };

  const updateIncome = (patch: Partial<IncomeDetails>) => {
    setInput((prev) => ({
      ...prev,
      income: { ...prev.income, ...patch },
    }));
  };

  const updateSalaryDetails = (patch: Partial<SalaryDetails>) => {
    setInput((prev) => ({
      ...prev,
      salaryDetails: { ...prev.salaryDetails, ...patch },
    }));
  };

  const updateDeductions = (patch: Partial<DeductionsInput>) => {
    setInput((prev) => ({
      ...prev,
      deductions: { ...prev.deductions, ...patch },
    }));
  };

  const setRegimePreference = (pref: RegimePreference) => {
    setInput((prev) => ({
      ...prev,
      regimePreference: pref,
    }));
  };

  const reset = () => {
    setInput(defaultTaxInput);
    setStepState(1);
    setMaxStepReached(1);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const setIsSavedLocally = (val: boolean) => {
    setIsSavedLocallyState(val);
    if (!val) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(PERSISTENCE_PREF_KEY, 'false');
      } catch {
        // Ignore
      }
    }
  };

  const clearSavedData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    reset();
  };

  return (
    <TaxContext.Provider
      value={{
        step,
        maxStepReached,
        input,
        comparison,
        isSavedLocally,
        updateProfile,
        updateIncome,
        updateSalaryDetails,
        updateDeductions,
        setRegimePreference,
        setStep,
        nextStep,
        prevStep,
        reset,
        setIsSavedLocally,
        clearSavedData,
        isSalaried,
      }}
    >
      {children}
    </TaxContext.Provider>
  );
};

export const useTax = (): TaxContextType => {
  const context = useContext(TaxContext);
  if (!context) {
    throw new Error('useTax must be used within a TaxProvider');
  }
  return context;
};
