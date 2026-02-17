/**
 * Invoice Types
 * TypeScript interfaces for the invoice system
 */

// Business type for wizard selection
export type BusinessType = 'sole_trader' | 'partnership' | 'limited_company';

// CIS (Construction Industry Scheme) types
export type CisStatus = 'not_applicable' | 'gross_payment' | 'standard' | 'unverified';
export type CisCategory = 'labour' | 'materials' | 'not_applicable';

export interface InvoicerDetails {
  logo: string | null;
  logoFileName: string | null;
  companyName: string;
  companyNumber: string;
  vatNumber: string;
  eoriNumber: string; // Optional EORI number for customs/import-export
  address: string;
  postCode: string;
  // CIS fields
  cisStatus: CisStatus;
  cisUtr: string; // 10-digit Unique Taxpayer Reference
}

export interface CustomerDetails {
  name: string;
  email: string;
  address: string;
  postCode: string;
}

export interface InvoiceDetails {
  date: string;
  invoiceNumber: string;
  paymentTerms: string; // Number of days, e.g., "30"
  notes: string; // Optional notes/terms for the invoice
}

export type VatRate = '0' | '5' | '20' | 'reverse_charge';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  netAmount: number;
  vatRate: VatRate;
  cisCategory: CisCategory; // For CIS subcontractors: labour vs materials
}

export interface BankDetails {
  accountNumber: string;
  sortCode: string;
  accountName: string;
  bankName: string;
  reference: string;
}

export interface InvoiceData {
  invoicer: InvoicerDetails;
  customer: CustomerDetails;
  details: InvoiceDetails;
  lineItems: LineItem[];
  bankDetails: BankDetails;
}

export interface InvoiceTotals {
  subtotal: number;
  vatBreakdown: {
    rate: VatRate;
    amount: number;
  }[];
  totalVat: number;
  total: number;
  // CIS breakdown (only populated for CIS subcontractors)
  cisBreakdown?: {
    labourTotal: number;
    materialsTotal: number;
    deductionRate: number; // 0, 0.20, or 0.30
    deductionAmount: number;
    netPayable: number; // total minus CIS deduction
  };
}

export interface ErrorLog {
  timestamp: string;
  type: 'validation' | 'pdf_generation' | 'storage' | 'unknown';
  message: string;
  context?: Record<string, unknown>;
}
