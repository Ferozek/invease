/**
 * Application Constants
 * Centralized configuration values used across the application
 */

import type { BusinessType, VatRate, CisStatus, CisCategory } from '@/types/invoice';

// ===== BUSINESS TYPES =====

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  sole_trader: 'Sole Trader',
  partnership: 'Partnership',
  limited_company: 'Limited Company',
};

export const BUSINESS_TYPE_OPTIONS: {
  value: BusinessType;
  label: string;
  description: string;
}[] = [
  {
    value: 'sole_trader',
    label: 'Sole Trader',
    description: 'Self-employed individual trading under your own name',
  },
  {
    value: 'partnership',
    label: 'Partnership',
    description: 'Two or more people running a business together',
  },
  {
    value: 'limited_company',
    label: 'Limited Company',
    description: 'Registered with Companies House (Ltd)',
  },
];

// ===== VAT RATES =====

export const VAT_RATES: { value: VatRate; label: string }[] = [
  { value: '20', label: '20%' },
  { value: '5', label: '5%' },
  { value: '0', label: '0%' },
  { value: 'reverse_charge', label: 'Reverse Charge' },
];

export const VAT_RATE_LABELS: Record<VatRate, string> = {
  '20': '20%',
  '5': '5%',
  '0': '0%',
  reverse_charge: 'Reverse Charge (0%)',
};

// ===== CIS (Construction Industry Scheme) =====

export const CIS_STATUS_OPTIONS: { value: CisStatus; label: string; rate: string }[] = [
  { value: 'gross_payment', label: 'Gross Payment', rate: '0%' },
  { value: 'standard', label: 'Verified', rate: '20%' },
  { value: 'unverified', label: 'Unverified', rate: '30%' },
];

export const CIS_STATUS_LABELS: Record<CisStatus, string> = {
  not_applicable: 'Not Applicable',
  gross_payment: 'Gross Payment (0%)',
  standard: 'Verified (20%)',
  unverified: 'Unverified (30%)',
};

export const CIS_DEDUCTION_RATES: Record<CisStatus, number> = {
  not_applicable: 0,
  gross_payment: 0,
  standard: 0.2,
  unverified: 0.3,
};

export const CIS_CATEGORY_OPTIONS: { value: CisCategory; label: string }[] = [
  { value: 'labour', label: 'Labour' },
  { value: 'materials', label: 'Materials' },
];

// ===== PAYMENT TERMS =====

export const PAYMENT_TERMS_OPTIONS: { value: string; label: string }[] = [
  { value: '0', label: 'Due on receipt' },
  { value: '7', label: '7 days' },
  { value: '14', label: '14 days' },
  { value: '30', label: '30 days' },
  { value: '60', label: '60 days' },
  { value: '90', label: '90 days' },
];

export const DEFAULT_PAYMENT_TERMS = '30';

// ===== WIZARD CONFIGURATION =====

export const WIZARD_STEPS = [
  { id: 1, name: 'Business Type', canSkip: false },
  { id: 2, name: 'Identity', canSkip: false },
  { id: 3, name: 'Tax & Compliance', canSkip: true },
  { id: 4, name: 'Bank Details', canSkip: false },
  { id: 5, name: 'Review', canSkip: false },
] as const;

export const WIZARD_TOTAL_STEPS = WIZARD_STEPS.length;

// ===== INVOICE DEFAULTS =====

export const DEFAULT_LINE_ITEM_COUNT = 1;
export const DEFAULT_QUANTITY = 1;
export const DEFAULT_VAT_RATE: VatRate = '20';
export const DEFAULT_CIS_CATEGORY: CisCategory = 'labour';

// ===== VALIDATION LIMITS =====

export const VALIDATION_LIMITS = {
  companyNumber: { min: 8, max: 8 },
  accountNumber: { min: 8, max: 8 },
  sortCode: { min: 6, max: 8 }, // 6 digits, up to 8 with dashes
  utr: { min: 10, max: 10 },
  vatNumber: { min: 11, max: 14 }, // GB + 9-12 digits
  eoriNumber: { min: 14, max: 14 }, // GB + 12 digits
  postcode: { min: 5, max: 8 },
} as const;

// ===== UI CONFIGURATION =====

export const TOUCH_TARGET_MIN_SIZE = 44; // pixels (Apple HIG)
export const ANIMATION_DURATION_MS = 300;
export const DEBOUNCE_DELAY_MS = 300;
export const TOAST_DURATION_MS = 4000;

// ===== FILE UPLOAD LIMITS =====

export const LOGO_MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
export const LOGO_ALLOWED_TYPES = ['image/png', 'image/jpeg'] as const;
