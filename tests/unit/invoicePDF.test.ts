import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import InvoicePDF from '@/components/pdf/InvoicePDF';
import type { InvoiceData, InvoiceTotals } from '@/types/invoice';

// Minimal valid invoice data
const validInvoice: InvoiceData = {
  invoicer: {
    companyName: 'Test Company Ltd',
    address: '123 Test Street',
    postCode: 'SW1A 1AA',
    companyNumber: '',
    vatNumber: '',
    eoriNumber: '',
    cisStatus: 'not_applicable',
    cisUtr: '',
    logo: null,
    logoFileName: null,
  },
  customer: {
    name: 'Customer Ltd',
    address: '456 Client Road',
    postCode: 'M1 1AA',
    email: 'client@example.com',
  },
  details: {
    invoiceNumber: 'INV-0001',
    date: '2026-02-15',
    supplyDate: '2026-02-15',
    paymentTerms: '30',
    notes: 'Thank you for your business',
    documentType: 'invoice',
  },
  lineItems: [
    {
      id: '1',
      description: 'Web Development',
      quantity: 2,
      netAmount: 500,
      vatRate: '20',
      cisCategory: 'not_applicable',
    },
  ],
  bankDetails: {
    accountNumber: '12345678',
    sortCode: '12-34-56',
    accountName: 'Test Company',
    bankName: 'Barclays',
    reference: 'INV-0001',
  },
};

const validTotals: InvoiceTotals = {
  subtotal: 1000,
  vatBreakdown: [{ rate: '20', amount: 200 }],
  totalVat: 200,
  total: 1200,
};

describe('InvoicePDF', () => {
  it('creates a valid element with standard invoice data', () => {
    const element = createElement(InvoicePDF, {
      invoice: validInvoice,
      totals: validTotals,
    });
    expect(element).toBeDefined();
    expect(element.type).toBe(InvoicePDF);
  });

  it('accepts brand color prop', () => {
    const element = createElement(InvoicePDF, {
      invoice: validInvoice,
      totals: validTotals,
      brandColor: '#FF0000',
    });
    expect(element.props.brandColor).toBe('#FF0000');
  });

  it('accepts watermark prop', () => {
    const element = createElement(InvoicePDF, {
      invoice: validInvoice,
      totals: validTotals,
      watermark: 'PAID',
    });
    expect(element.props.watermark).toBe('PAID');
  });

  it('creates valid element for credit note', () => {
    const creditNoteInvoice: InvoiceData = {
      ...validInvoice,
      details: {
        ...validInvoice.details,
        documentType: 'credit_note',
        creditNoteFields: {
          relatedInvoiceNumber: 'INV-0001',
          reason: 'Duplicate charge',
          isPartial: false,
        },
      },
    };
    const element = createElement(InvoicePDF, {
      invoice: creditNoteInvoice,
      totals: validTotals,
    });
    expect(element).toBeDefined();
  });

  it('creates valid element with CIS data', () => {
    const cisInvoice: InvoiceData = {
      ...validInvoice,
      invoicer: {
        ...validInvoice.invoicer,
        cisStatus: 'standard',
        cisUtr: '1234567890',
      },
      lineItems: [
        {
          id: '1',
          description: 'Plastering work',
          quantity: 1,
          netAmount: 1000,
          vatRate: '20',
          cisCategory: 'labour',
        },
        {
          id: '2',
          description: 'Plaster materials',
          quantity: 1,
          netAmount: 200,
          vatRate: '20',
          cisCategory: 'materials',
        },
      ],
    };
    const cisTotals: InvoiceTotals = {
      ...validTotals,
      cisBreakdown: {
        labourTotal: 1000,
        materialsTotal: 200,
        deductionRate: 0.20,
        deductionAmount: 200,
        netPayable: 1000,
      },
    };
    const element = createElement(InvoicePDF, {
      invoice: cisInvoice,
      totals: cisTotals,
    });
    expect(element).toBeDefined();
  });

  it('creates valid element with exempt VAT rate', () => {
    const exemptInvoice: InvoiceData = {
      ...validInvoice,
      lineItems: [
        {
          id: '1',
          description: 'Education Services',
          quantity: 1,
          netAmount: 500,
          vatRate: 'exempt',
          cisCategory: 'not_applicable',
        },
      ],
    };
    const exemptTotals: InvoiceTotals = {
      subtotal: 500,
      vatBreakdown: [{ rate: 'exempt', amount: 0 }],
      totalVat: 0,
      total: 500,
    };
    const element = createElement(InvoicePDF, {
      invoice: exemptInvoice,
      totals: exemptTotals,
    });
    expect(element).toBeDefined();
  });

  it('creates valid element with line item discounts', () => {
    const discountInvoice: InvoiceData = {
      ...validInvoice,
      lineItems: [
        {
          id: '1',
          description: 'Web Development',
          quantity: 2,
          netAmount: 500,
          vatRate: '20',
          cisCategory: 'not_applicable',
          discountType: 'percentage',
          discountValue: 10,
        },
      ],
    };
    const element = createElement(InvoicePDF, {
      invoice: discountInvoice,
      totals: validTotals,
    });
    expect(element).toBeDefined();
  });

  it('creates valid element with no bank details', () => {
    const noBankInvoice: InvoiceData = {
      ...validInvoice,
      bankDetails: {
        accountNumber: '',
        sortCode: '',
        accountName: '',
        bankName: '',
        reference: '',
      },
    };
    const element = createElement(InvoicePDF, {
      invoice: noBankInvoice,
      totals: validTotals,
    });
    expect(element).toBeDefined();
  });

  it('creates valid element with DRAFT watermark', () => {
    const element = createElement(InvoicePDF, {
      invoice: validInvoice,
      totals: validTotals,
      watermark: 'DRAFT',
    });
    expect(element).toBeDefined();
  });

  it('creates valid element with CANCELLED watermark', () => {
    const element = createElement(InvoicePDF, {
      invoice: validInvoice,
      totals: validTotals,
      watermark: 'CANCELLED',
    });
    expect(element).toBeDefined();
  });
});
