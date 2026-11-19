/**
 * Indian numbering system & currency formatting utilities
 */

export interface FormatINROptions {
  showSymbol?: boolean;
  round?: boolean;
}

/**
 * Formats a number according to Indian currency notation (e.g. 12,34,567)
 */
export function formatINR(amount: number, options: FormatINROptions = {}): string {
  const { showSymbol = true, round = true } = options;

  if (isNaN(amount) || !isFinite(amount)) {
    return showSymbol ? '₹0' : '0';
  }

  const roundedAmount = round ? Math.round(amount) : amount;

  if (showSymbol) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(roundedAmount);
  }

  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(roundedAmount);
}

/**
 * Parses user input into a sanitized non-negative integer number
 */
export function parseINR(value: string | number | undefined | null): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value) || value < 0) return 0;
    return value;
  }

  // Remove currency symbols, commas, spaces, and any non-numeric characters
  const cleanStr = value.replace(/[^0-9.]/g, '');
  if (!cleanStr) return 0;

  const parsed = parseFloat(cleanStr);
  if (isNaN(parsed) || !isFinite(parsed) || parsed < 0) return 0;

  return Math.round(parsed);
}

/**
 * Section 288A of Income-tax Act:
 * Taxable income must be rounded off to the nearest multiple of ten rupees.
 * Note: Under Sec 288A, if the last figure is 5 or more, it is rounded up to next 10, else rounded down.
 * However, PRD explicitly states:
 * "Taxable income = max(0, result), rounded down to the nearest 10 rupees"
 * and "Taxable income is rounded down to the nearest 10 rupees before slabs."
 * We adhere to the PRD specification: Math.floor(value / 10) * 10.
 */
export function roundDownTo10(value: number): number {
  if (value <= 0) return 0;
  return Math.floor(value / 10) * 10;
}

/**
 * Section 288B:
 * Total tax payable is rounded to the nearest rupee.
 */
export function roundToRupee(value: number): number {
  if (value <= 0) return 0;
  return Math.round(value);
}
