import { SalaryDetails } from './types';

/**
 * Calculates HRA exemption under Section 10(13A) (Old Regime only).
 *
 * Exempt HRA is minimum of:
 * 1. Actual HRA received
 * 2. Rent paid minus 10% of (Basic + DA)
 * 3. 50% of (Basic + DA) if metro, else 40% of (Basic + DA)
 *
 * Floored at 0.
 */
export function calculateHRAExemption(salaryDetails?: SalaryDetails): number {
  if (!salaryDetails) return 0;

  const basicDA = salaryDetails.basicDA ?? 0;
  const hraReceived = salaryDetails.hraReceived ?? 0;
  const rentPaid = salaryDetails.rentPaid ?? 0;
  const isMetro = Boolean(salaryDetails.isMetro);

  if (hraReceived <= 0 || rentPaid <= 0 || basicDA <= 0) {
    return 0;
  }

  const excessRent = rentPaid - 0.10 * basicDA;
  if (excessRent <= 0) {
    return 0;
  }

  const salaryPercentage = isMetro ? 0.50 : 0.40;
  const percentageCap = salaryPercentage * basicDA;

  const exemption = Math.min(hraReceived, excessRent, percentageCap);
  return Math.max(0, Math.round(exemption));
}
