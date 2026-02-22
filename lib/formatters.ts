/**
 * Shared Formatters
 * Centralized formatting utilities used across components
 */

import type { VatRate, DiscountType } from '@/types/invoice';

/**
 * Format amount as GBP currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

/**
 * Calculate line item net extended price (qty × unit price, minus any discount, no VAT)
 * This is the standard UK invoice line total — VAT is shown once at the bottom.
 */
export function calculateLineNet(
  quantity: number,
  netAmount: number,
  discountType?: DiscountType,
  discountValue?: number,
): number {
  const gross = quantity * netAmount;
  if (!discountType || !discountValue) return gross;
  const discount = discountType === 'percentage'
    ? gross * (discountValue / 100)
    : discountValue;
  return Math.max(0, gross - discount);
}

/**
 * Calculate the discount amount for a line item
 */
export function calculateLineDiscount(
  quantity: number,
  netAmount: number,
  discountType?: DiscountType,
  discountValue?: number,
): number {
  if (!discountType || !discountValue) return 0;
  const gross = quantity * netAmount;
  const discount = discountType === 'percentage'
    ? gross * (discountValue / 100)
    : discountValue;
  return Math.min(gross, Math.max(0, discount));
}

/**
 * Calculate line item gross total including VAT
 * Used for internal calculations where VAT-inclusive figure is needed.
 */
export function calculateLineGross(
  quantity: number,
  netAmount: number,
  vatRate: VatRate
): number {
  const net = quantity * netAmount;
  const vatPercent = vatRate === 'reverse_charge' ? 0 : parseInt(vatRate);
  const vat = net * (vatPercent / 100);
  return net + vat;
}

/**
 * Get VAT percentage from rate
 */
export function getVatPercent(vatRate: VatRate): number {
  return vatRate === 'reverse_charge' ? 0 : parseInt(vatRate);
}

/**
 * Format date to UK format (DD/MM/YYYY)
 */
export function formatDateUK(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB');
}

/**
 * Calculate due date from invoice date and payment terms
 */
export function calculateDueDate(invoiceDate: string, paymentTerms: string): Date {
  const date = new Date(invoiceDate);
  const days = parseInt(paymentTerms) || 0;
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Get payment terms display text
 */
export function getPaymentTermsText(paymentTerms: string): string {
  if (paymentTerms === '0') return 'Due on receipt';
  return `${paymentTerms} days`;
}

/**
 * Get VAT rate display text for invoices
 */
export function getVatRateDisplay(vatRate: VatRate): string {
  if (vatRate === 'reverse_charge') return 'RC';
  return `${vatRate}%`;
}

/**
 * Get VAT rate label for UI
 */
export function getVatRateLabel(vatRate: VatRate): string {
  if (vatRate === 'reverse_charge') return 'Reverse Charge (0%)';
  return `VAT (${vatRate}%)`;
}
