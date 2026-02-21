import { Page, expect } from '@playwright/test';

/**
 * Shared E2E helpers for accordion-based invoice form
 */

/** Set up an onboarded user in localStorage (call page.reload() after) */
export async function setupOnboardedUser(page: Page, overrides?: Record<string, unknown>) {
  await page.evaluate((opts) => {
    localStorage.setItem('invease-company-details', JSON.stringify({
      state: {
        hasSeenWelcome: true,
        isOnboarded: true,
        businessType: 'sole_trader',
        companyName: 'Test Co',
        address: '1 Test St',
        postCode: 'SW1A 1AA',
        companyNumber: '',
        vatNumber: '',
        eoriNumber: '',
        cisStatus: 'not_applicable',
        cisUtr: '',
        ...opts,
      },
      version: 0,
    }));
  }, overrides || {});
}

/** Open an accordion section by its title text */
export async function openSection(page: Page, sectionTitle: string) {
  const btn = page.locator('button[aria-expanded]').filter({ hasText: sectionTitle });
  const expanded = await btn.getAttribute('aria-expanded');
  if (expanded !== 'true') {
    await btn.click();
  }
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
}

/** Navigate through Quick Start flow (sets wizard state, clicks skip) */
export async function quickStart(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem('invease-company-details', JSON.stringify({
      state: {
        hasSeenWelcome: true,
        isOnboarded: false,
        businessType: null,
      },
      version: 0,
    }));
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByText('Skip setup, start invoicing now').click();
  await expect(page.getByText('Customer Details')).toBeVisible({ timeout: 10000 });
}

/** Create a SavedInvoice object for seeding history */
export function createSavedInvoice(overrides: {
  id?: string;
  customerName?: string;
  invoiceNumber?: string;
  total?: number;
  date?: string;
  paymentTerms?: string;
  status?: 'unpaid' | 'paid';
  dueDate?: string;
  documentType?: 'invoice' | 'credit_note';
} = {}) {
  const date = overrides.date || new Date().toISOString().split('T')[0];
  const paymentTerms = overrides.paymentTerms || '30';
  const total = overrides.total || 1000;
  const dueDate = overrides.dueDate || (() => {
    const d = new Date(date);
    d.setDate(d.getDate() + parseInt(paymentTerms, 10));
    return d.toISOString().split('T')[0];
  })();

  return {
    id: overrides.id || `inv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    invoice: {
      invoicer: {
        logo: null, logoFileName: null,
        companyName: 'Test Co', companyNumber: '', vatNumber: '', eoriNumber: '',
        address: '1 Test St', postCode: 'SW1A 1AA',
        cisStatus: 'not_applicable' as const, cisUtr: '',
      },
      customer: {
        name: overrides.customerName || 'Client A',
        email: 'test@test.com', address: '2 Client St', postCode: 'EC1A 1BB',
      },
      details: {
        date, supplyDate: '',
        invoiceNumber: overrides.invoiceNumber || 'INV-001',
        paymentTerms, notes: '',
        documentType: overrides.documentType || 'invoice',
      },
      lineItems: [{
        id: 'item_1', description: 'Test Service', quantity: 1,
        netAmount: total, vatRate: '20' as const, cisCategory: 'not_applicable' as const,
      }],
      bankDetails: { accountNumber: '', sortCode: '', accountName: '', bankName: '', reference: '' },
    },
    totals: {
      subtotal: total,
      vatBreakdown: [{ rate: '20' as const, amount: total * 0.2 }],
      totalVat: total * 0.2,
      total: total * 1.2,
    },
    savedAt: new Date().toISOString(),
    customerName: overrides.customerName || 'Client A',
    invoiceNumber: overrides.invoiceNumber || 'INV-001',
    total: total * 1.2,
    documentType: overrides.documentType || 'invoice',
    status: overrides.status || 'unpaid',
    dueDate,
  };
}

/** Seed the history store in localStorage (call page.reload() after) */
export async function seedHistory(page: Page, invoices: ReturnType<typeof createSavedInvoice>[]) {
  await page.evaluate((invs) => {
    localStorage.setItem('invease-history', JSON.stringify({
      state: { invoices: invs, recentCustomers: [] },
      version: 3,
    }));
  }, invoices);
}
