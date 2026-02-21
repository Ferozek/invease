/**
 * CIS (Construction Industry Scheme) Utilities
 * Single source of truth for CIS deduction rates and status labels
 */

import type { CisStatus } from '@/types/invoice';

/** CIS deduction rates: 0% (gross), 20% (verified/standard), 30% (unverified) */
export function getCisDeductionRate(status: CisStatus): number {
  switch (status) {
    case 'gross_payment': return 0;
    case 'standard': return 0.20;
    case 'unverified': return 0.30;
    default: return 0;
  }
}

/** Human-readable CIS status label */
export function getCisStatusLabel(status: CisStatus): string {
  switch (status) {
    case 'gross_payment': return 'Gross Payment (0%)';
    case 'standard': return 'Verified (20%)';
    case 'unverified': return 'Unverified (30%)';
    default: return '';
  }
}
