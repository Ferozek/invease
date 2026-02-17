/**
 * Sample Invoice Data
 * Pre-filled placeholder data for first-time users
 * Following Apple/Google's "starter content" pattern
 */

import type { BankDetails, CustomerDetails, InvoiceDetails, LineItem } from '@/types/invoice';

export const SAMPLE_COMPANY = {
  companyName: 'Your Company Name',
  address: '123 Business Street\nLondon',
  postCode: 'SW1A 1AA',
  vatNumber: '',
  companyNumber: '',
};

export const SAMPLE_BANK_DETAILS: BankDetails = {
  bankName: 'Your Bank',
  accountName: 'Your Account Name',
  accountNumber: '12345678',
  sortCode: '00-00-00',
  reference: '',
};

export const SAMPLE_CUSTOMER: CustomerDetails = {
  name: 'Sample Customer Ltd',
  address: '456 Client Road\nManchester',
  postCode: 'M1 1AA',
};

export const SAMPLE_INVOICE_DETAILS: Partial<InvoiceDetails> = {
  paymentTerms: '30',
  notes: 'Thank you for your business.',
};

export const SAMPLE_LINE_ITEM: Omit<LineItem, 'id'> = {
  description: 'Professional Services',
  quantity: 1,
  netAmount: 500,
  vatRate: '20',
  cisCategory: 'not_applicable',
};

/**
 * Check if data looks like sample/placeholder data
 */
export function isSampleCompanyName(name: string): boolean {
  return name === SAMPLE_COMPANY.companyName || name === '';
}

export function isSampleBankDetails(bank: BankDetails): boolean {
  return (
    bank.bankName === SAMPLE_BANK_DETAILS.bankName ||
    bank.accountNumber === SAMPLE_BANK_DETAILS.accountNumber ||
    bank.bankName === ''
  );
}

export function isSampleCustomer(customer: CustomerDetails): boolean {
  return customer.name === SAMPLE_CUSTOMER.name || customer.name === '';
}
