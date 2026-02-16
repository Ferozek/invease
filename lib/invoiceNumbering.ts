/**
 * Invoice Numbering System
 * Generates invoice numbers based on customizable patterns
 *
 * Design: Pure functions, pattern-based, easily testable
 *
 * Patterns support:
 * - {PREFIX} - Custom prefix text
 * - {YEAR} - 4-digit year (2026)
 * - {YY} - 2-digit year (26)
 * - {MONTH} - 2-digit month (01-12)
 * - {SEQ} - Sequence number (auto-padded)
 * - {SEQ:4} - Sequence with specific padding (0001)
 */

// ===== Types =====

export interface NumberingConfig {
  pattern: string;
  prefix: string;
  startNumber: number;
  currentNumber: number;
  resetYearly: boolean;
  lastResetYear: number;
}

export interface NumberingPreset {
  id: string;
  name: string;
  pattern: string;
  example: string;
}

// ===== Presets =====

export const NUMBERING_PRESETS: NumberingPreset[] = [
  {
    id: 'simple',
    name: 'Simple',
    pattern: 'INV-{SEQ:4}',
    example: 'INV-0001',
  },
  {
    id: 'yearly',
    name: 'Yearly',
    pattern: 'INV-{YEAR}-{SEQ:3}',
    example: 'INV-2026-001',
  },
  {
    id: 'monthly',
    name: 'Monthly',
    pattern: '{PREFIX}/{YEAR}/{MONTH}/{SEQ:3}',
    example: 'INV/2026/02/001',
  },
  {
    id: 'compact',
    name: 'Compact',
    pattern: '{PREFIX}{YY}{MONTH}{SEQ:3}',
    example: 'INV2602001',
  },
  {
    id: 'custom',
    name: 'Custom',
    pattern: '{PREFIX}-{SEQ}',
    example: 'CUSTOM-1',
  },
];

// ===== Default Config =====

export const DEFAULT_NUMBERING_CONFIG: NumberingConfig = {
  pattern: 'INV-{SEQ:4}',
  prefix: 'INV',
  startNumber: 1,
  currentNumber: 1,
  resetYearly: false,
  lastResetYear: new Date().getFullYear(),
};

// ===== Pattern Processing =====

/**
 * Generates next invoice number from pattern
 */
export function generateInvoiceNumber(
  config: NumberingConfig,
  date: Date = new Date()
): string {
  let { pattern, prefix, currentNumber, resetYearly, lastResetYear, startNumber } = config;

  // Check for yearly reset
  const currentYear = date.getFullYear();
  if (resetYearly && currentYear > lastResetYear) {
    currentNumber = startNumber;
  }

  // Replace pattern tokens
  let result = pattern;

  // Prefix
  result = result.replace(/{PREFIX}/g, prefix);

  // Year formats
  result = result.replace(/{YEAR}/g, String(currentYear));
  result = result.replace(/{YY}/g, String(currentYear).slice(-2));

  // Month (zero-padded)
  const month = String(date.getMonth() + 1).padStart(2, '0');
  result = result.replace(/{MONTH}/g, month);

  // Sequence with optional padding
  result = result.replace(/{SEQ:(\d+)}/g, (_, padding) => {
    return String(currentNumber).padStart(parseInt(padding), '0');
  });
  result = result.replace(/{SEQ}/g, String(currentNumber));

  return result;
}

/**
 * Increments the current number in config
 */
export function incrementNumber(config: NumberingConfig): NumberingConfig {
  const currentYear = new Date().getFullYear();
  let newNumber = config.currentNumber + 1;

  // Reset if yearly reset is enabled and year changed
  if (config.resetYearly && currentYear > config.lastResetYear) {
    newNumber = config.startNumber + 1;
  }

  return {
    ...config,
    currentNumber: newNumber,
    lastResetYear: currentYear,
  };
}

/**
 * Validates a pattern has required tokens
 */
export function validatePattern(pattern: string): { valid: boolean; error?: string } {
  if (!pattern.trim()) {
    return { valid: false, error: 'Pattern cannot be empty' };
  }

  if (!pattern.includes('{SEQ')) {
    return { valid: false, error: 'Pattern must include {SEQ} or {SEQ:n}' };
  }

  // Check for valid tokens only
  const tokenPattern = /\{(PREFIX|YEAR|YY|MONTH|SEQ(:\d+)?)\}/g;
  const strippedPattern = pattern.replace(tokenPattern, '');

  if (strippedPattern.includes('{') || strippedPattern.includes('}')) {
    return { valid: false, error: 'Pattern contains invalid tokens' };
  }

  return { valid: true };
}

/**
 * Preview what numbers would look like
 */
export function previewPattern(pattern: string, prefix: string, count = 3): string[] {
  const config: NumberingConfig = {
    ...DEFAULT_NUMBERING_CONFIG,
    pattern,
    prefix,
    currentNumber: 1,
  };

  const previews: string[] = [];
  let tempConfig = config;

  for (let i = 0; i < count; i++) {
    previews.push(generateInvoiceNumber(tempConfig));
    tempConfig = incrementNumber(tempConfig);
  }

  return previews;
}

/**
 * Extracts sequence number from an invoice number (for importing)
 */
export function extractSequence(invoiceNumber: string): number | null {
  // Try to find the last number sequence
  const match = invoiceNumber.match(/(\d+)(?!.*\d)/);
  return match ? parseInt(match[1]) : null;
}
