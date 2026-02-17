/**
 * Zod Schemas for Invoice Validation
 *
 * Runtime validation for invoice data.
 * Use these schemas to validate user input before processing.
 */

import { z } from 'zod';

// ============================================================================
// ENUMS
// ============================================================================

export const businessTypeSchema = z.enum(['sole_trader', 'partnership', 'limited_company']);
export const cisStatusSchema = z.enum(['not_applicable', 'gross_payment', 'standard', 'unverified']);
export const cisCategorySchema = z.enum(['labour', 'materials', 'not_applicable']);
export const vatRateSchema = z.enum(['0', '5', '20', 'reverse_charge']);

// ============================================================================
// UK-SPECIFIC VALIDATION PATTERNS
// ============================================================================

// UK Postcode: e.g., "SW1A 1AA", "M1 1AA"
const ukPostcodeRegex = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/;

// UK VAT Number: e.g., "GB123456789"
const ukVatNumberRegex = /^GB(\d{9}|\d{12}|GD\d{3}|HA\d{3})$/;

// UK Sort Code: e.g., "12-34-56"
const ukSortCodeRegex = /^\d{2}-?\d{2}-?\d{2}$/;

// UK Account Number: 8 digits
const ukAccountNumberRegex = /^\d{8}$/;

// UTR: 10 digits
const utrRegex = /^\d{10}$/;

// ============================================================================
// ENTITY SCHEMAS
// ============================================================================

export const customerDetailsSchema = z.object({
  name: z.string().min(1, 'Customer name is required').max(200),
  email: z.string().email('Invalid email address').or(z.literal('')),
  address: z.string().min(1, 'Address is required').max(500),
  postCode: z.string()
    .min(1, 'Post code is required')
    .regex(ukPostcodeRegex, 'Invalid UK postcode'),
});

export const invoiceDetailsSchema = z.object({
  date: z.string().min(1, 'Invoice date is required'),
  invoiceNumber: z.string().min(1, 'Invoice number is required').max(50),
  paymentTerms: z.string().min(1, 'Payment terms required'),
  notes: z.string().max(2000).optional().default(''),
});

export const lineItemSchema = z.object({
  id: z.string().uuid(),
  description: z.string().min(1, 'Description is required').max(500),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  netAmount: z.number().min(0.01, 'Amount must be greater than 0'),
  vatRate: vatRateSchema,
  cisCategory: cisCategorySchema,
});

export const bankDetailsSchema = z.object({
  accountNumber: z.string()
    .min(1, 'Account number is required')
    .regex(ukAccountNumberRegex, 'Account number must be 8 digits'),
  sortCode: z.string()
    .min(1, 'Sort code is required')
    .regex(ukSortCodeRegex, 'Sort code must be 6 digits (XX-XX-XX)'),
  accountName: z.string().min(1, 'Account name is required').max(100),
  bankName: z.string().min(1, 'Bank name is required').max(100),
  reference: z.string().max(50).optional().default(''),
});

export const invoicerDetailsSchema = z.object({
  logo: z.string().nullable(),
  logoFileName: z.string().nullable(),
  companyName: z.string().min(1, 'Company name is required').max(200),
  companyNumber: z.string().max(20).optional().default(''),
  vatNumber: z.string()
    .regex(ukVatNumberRegex, 'Invalid UK VAT number')
    .or(z.literal('')),
  eoriNumber: z.string().max(20).optional().default(''),
  address: z.string().min(1, 'Address is required').max(500),
  postCode: z.string()
    .min(1, 'Post code is required')
    .regex(ukPostcodeRegex, 'Invalid UK postcode'),
  cisStatus: cisStatusSchema,
  cisUtr: z.string()
    .regex(utrRegex, 'UTR must be 10 digits')
    .or(z.literal('')),
});

// ============================================================================
// COMPOSITE SCHEMAS
// ============================================================================

export const invoiceDataSchema = z.object({
  invoicer: invoicerDetailsSchema,
  customer: customerDetailsSchema,
  details: invoiceDetailsSchema,
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  bankDetails: bankDetailsSchema,
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate customer details
 */
export function validateCustomer(data: unknown) {
  return customerDetailsSchema.safeParse(data);
}

/**
 * Validate invoice details
 */
export function validateInvoiceDetails(data: unknown) {
  return invoiceDetailsSchema.safeParse(data);
}

/**
 * Validate bank details
 */
export function validateBankDetails(data: unknown) {
  return bankDetailsSchema.safeParse(data);
}

/**
 * Validate a line item
 */
export function validateLineItem(data: unknown) {
  return lineItemSchema.safeParse(data);
}

/**
 * Validate complete invoice data
 */
export function validateInvoice(data: unknown) {
  return invoiceDataSchema.safeParse(data);
}

/**
 * Get human-readable error messages from Zod validation result
 */
export function getValidationErrors(
  result: ReturnType<typeof invoiceDataSchema.safeParse>
): string[] {
  if (result.success) return [];

  return result.error.issues.map((issue) => {
    const path = issue.path.join('.');
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

// ============================================================================
// TYPE EXPORTS (inferred from schemas)
// ============================================================================

export type CustomerDetailsInput = z.infer<typeof customerDetailsSchema>;
export type InvoiceDetailsInput = z.infer<typeof invoiceDetailsSchema>;
export type LineItemInput = z.infer<typeof lineItemSchema>;
export type BankDetailsInput = z.infer<typeof bankDetailsSchema>;
export type InvoicerDetailsInput = z.infer<typeof invoicerDetailsSchema>;
export type InvoiceDataInput = z.infer<typeof invoiceDataSchema>;
