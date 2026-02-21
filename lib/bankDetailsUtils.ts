/**
 * Bank Details Utilities
 * Consolidated bank details validation helpers
 */

import type { BankDetails } from '@/types/invoice';

/**
 * Check if ALL required bank detail fields are filled (AND logic).
 * Used for: PDF rendering (show bank section vs fallback message),
 * and email generation (include bank details in email body).
 */
export function hasBankDetails(bankDetails: BankDetails): boolean {
  return !!(
    bankDetails.accountNumber?.trim() &&
    bankDetails.sortCode?.trim() &&
    bankDetails.accountName?.trim() &&
    bankDetails.bankName?.trim()
  );
}

/**
 * Check if ANY bank detail field is filled (OR logic).
 * Used for: validation — if partial, warn user to complete or clear all.
 */
export function hasPartialBankDetails(bankDetails: BankDetails): boolean {
  return !!(
    bankDetails.accountNumber?.trim() ||
    bankDetails.sortCode?.trim() ||
    bankDetails.accountName?.trim() ||
    bankDetails.bankName?.trim()
  );
}
