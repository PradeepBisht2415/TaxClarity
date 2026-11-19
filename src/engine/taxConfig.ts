export interface Slab {
  upTo: number; // Upper limit of the slab (Infinity for top slab)
  rate: number; // e.g., 0.05 for 5%
}

export interface SurchargeBand {
  threshold: number; // Lower threshold (e.g., 50_00_000)
  rate: number; // e.g. 0.10 for 10%
  cappedThreshold?: number; // Upper limit of band
}

export interface TaxConfigYear {
  financialYear: string;
  assessmentYear: string;
  lastVerifiedDate: string;
  cessRate: number;
  newRegime: {
    slabs: Slab[];
    standardDeduction: number;
    rebate: {
      threshold: number;
      maxAmount: number;
      hasMarginalRelief: boolean;
    };
    surchargeBands: SurchargeBand[];
    employerNPSMaxPercent: number; // 0.14 (14%)
  };
  oldRegime: {
    slabs: {
      below60: Slab[];
      senior: Slab[];
      superSenior: Slab[];
    };
    standardDeduction: number;
    rebate: {
      threshold: number;
      maxAmount: number;
      hasMarginalRelief: boolean;
    };
    surchargeBands: SurchargeBand[];
    employerNPSMaxPercent: number; // 0.10 (10%)
    deductionLimits: {
      sec80C: number;
      sec80CCD1B: number;
      sec80DNonSenior: number;
      sec80DSenior: number;
      sec80TTANonSenior: number;
      sec80TTBSenior: number;
      sec24bHomeLoan: number;
      professionalTaxMax: number;
    };
  };
}

export const TAX_CONFIG_FY2026_27: TaxConfigYear = {
  financialYear: '2026-27',
  assessmentYear: '2027-28',
  lastVerifiedDate: '2026-11-19',
  cessRate: 0.04, // 4% Health & Education Cess
  newRegime: {
    slabs: [
      { upTo: 4_00_000, rate: 0.0 },
      { upTo: 8_00_000, rate: 0.05 },
      { upTo: 12_00_000, rate: 0.10 },
      { upTo: 16_00_000, rate: 0.15 },
      { upTo: 20_00_000, rate: 0.20 },
      { upTo: 24_00_000, rate: 0.25 },
      { upTo: Infinity, rate: 0.30 },
    ],
    standardDeduction: 75_000,
    rebate: {
      threshold: 12_00_000,
      maxAmount: 60_000,
      hasMarginalRelief: true,
    },
    surchargeBands: [
      { threshold: 50_00_000, rate: 0.10, cappedThreshold: 1_00_00_000 },
      { threshold: 1_00_00_000, rate: 0.15, cappedThreshold: 2_00_00_000 },
      { threshold: 2_00_00_000, rate: 0.25, cappedThreshold: Infinity }, // Capped at 25% under New Regime
    ],
    employerNPSMaxPercent: 0.14, // 14% of Basic + DA
  },
  oldRegime: {
    slabs: {
      below60: [
        { upTo: 2_50_000, rate: 0.0 },
        { upTo: 5_00_000, rate: 0.05 },
        { upTo: 10_00_000, rate: 0.20 },
        { upTo: Infinity, rate: 0.30 },
      ],
      senior: [
        { upTo: 3_00_000, rate: 0.0 },
        { upTo: 5_00_000, rate: 0.05 },
        { upTo: 10_00_000, rate: 0.20 },
        { upTo: Infinity, rate: 0.30 },
      ],
      superSenior: [
        { upTo: 5_00_000, rate: 0.0 },
        { upTo: 10_00_000, rate: 0.20 },
        { upTo: Infinity, rate: 0.30 },
      ],
    },
    standardDeduction: 50_000,
    rebate: {
      threshold: 5_00_000,
      maxAmount: 12_500,
      hasMarginalRelief: false,
    },
    surchargeBands: [
      { threshold: 50_00_000, rate: 0.10, cappedThreshold: 1_00_00_000 },
      { threshold: 1_00_00_000, rate: 0.15, cappedThreshold: 2_00_00_000 },
      { threshold: 2_00_00_000, rate: 0.25, cappedThreshold: 5_00_00_000 },
      { threshold: 5_00_00_000, rate: 0.37, cappedThreshold: Infinity },
    ],
    employerNPSMaxPercent: 0.10, // 10% of Basic + DA
    deductionLimits: {
      sec80C: 1_50_000,
      sec80CCD1B: 50_000,
      sec80DNonSenior: 25_000,
      sec80DSenior: 50_000,
      sec80TTANonSenior: 10_000,
      sec80TTBSenior: 50_000,
      sec24bHomeLoan: 2_00_000,
      professionalTaxMax: 2_500,
    },
  },
};

export const currentTaxConfig = TAX_CONFIG_FY2026_27;
