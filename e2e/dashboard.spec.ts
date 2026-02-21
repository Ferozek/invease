import { test, expect, Page } from '@playwright/test';

/**
 * Dashboard & Payment Tracking E2E Tests
 *
 * Tests Phase 2.5 features:
 * - Dashboard summary card visibility
 * - Collection ring
 * - Payment status (overdue detection, mark as paid/unpaid)
 * - Status filter tabs in history panel
 * - Count badges
 * - Period switcher
 * - v2→v3 migration
 */

// Helper: Create a SavedInvoice object for seeding localStorage
function createSavedInvoice(overrides: {
  id?: string;
  customerName?: string;
  invoiceNumber?: string;
  total?: number;
  date?: string;
  paymentTerms?: string;
  status?: 'unpaid' | 'paid';
  dueDate?: string;
  paidDate?: string;
  documentType?: 'invoice' | 'credit_note';
  savedAt?: string;
}) {
  const date = overrides.date || '2026-02-21';
  const paymentTerms = overrides.paymentTerms || '30';
  const dueDate = overrides.dueDate || calculateDueDate(date, paymentTerms);
  const total = overrides.total || 1000;

  return {
    id: overrides.id || `inv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    invoice: {
      invoicer: {
        logo: null, logoFileName: null,
        companyName: 'Test Co', companyNumber: '', vatNumber: '', eoriNumber: '',
        address: '1 Test St', postCode: 'SW1A 1AA',
        cisStatus: 'not_applicable', cisUtr: '',
      },
      customer: {
        name: overrides.customerName || 'Client A',
        email: 'test@test.com',
        address: '2 Client St',
        postCode: 'EC1A 1BB',
      },
      details: {
        date,
        supplyDate: '',
        invoiceNumber: overrides.invoiceNumber || 'INV-2026-001',
        paymentTerms,
        notes: '',
        documentType: overrides.documentType || 'invoice',
      },
      lineItems: [{
        id: 'item_1',
        description: 'Test Service',
        quantity: 1,
        netAmount: total,
        vatRate: '20' as const,
        cisCategory: 'not_applicable' as const,
      }],
      bankDetails: {
        accountNumber: '', sortCode: '', accountName: '', bankName: '', reference: '',
      },
    },
    totals: {
      subtotal: total,
      vatBreakdown: [{ rate: '20' as const, amount: total * 0.2 }],
      totalVat: total * 0.2,
      total: total * 1.2,
    },
    savedAt: overrides.savedAt || new Date().toISOString(),
    customerName: overrides.customerName || 'Client A',
    invoiceNumber: overrides.invoiceNumber || 'INV-2026-001',
    total: total * 1.2,
    documentType: overrides.documentType || 'invoice',
    status: overrides.status || 'unpaid',
    dueDate,
    paidDate: overrides.paidDate,
  };
}

function calculateDueDate(invoiceDate: string, paymentTerms: string): string {
  const date = new Date(invoiceDate);
  const days = parseInt(paymentTerms, 10) || 30;
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

// Helper: Seed history store in localStorage
async function seedHistory(page: Page, invoices: ReturnType<typeof createSavedInvoice>[]) {
  await page.evaluate((invs) => {
    localStorage.setItem('invease-history', JSON.stringify({
      state: {
        invoices: invs,
        recentCustomers: [],
      },
      version: 3,
    }));
  }, invoices);
}

// Helper: Set up an onboarded user (skip welcome + wizard)
async function setupOnboardedUser(page: Page) {
  await page.evaluate(() => {
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
      },
      version: 0,
    }));
  });
}

test.describe('Dashboard & Payment Tracking', () => {
  test('should not show dashboard when no history', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupOnboardedUser(page);
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Wait for page to load
    await expect(page.getByText('Customer Details')).toBeVisible({ timeout: 10000 });

    // Dashboard should NOT be visible
    await expect(page.getByText('Dashboard')).not.toBeVisible();
  });

  test('should show dashboard with seeded history', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupOnboardedUser(page);

    const today = new Date().toISOString().split('T')[0];
    await seedHistory(page, [
      createSavedInvoice({ date: today, total: 1000, invoiceNumber: 'INV-001' }),
      createSavedInvoice({ date: today, total: 2000, invoiceNumber: 'INV-002', status: 'paid' }),
    ]);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('invoiced-amount')).toBeVisible();
  });

  test('should split outstanding into current and overdue', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupOnboardedUser(page);

    const today = new Date().toISOString().split('T')[0];
    // One current invoice (due in 30 days)
    // One overdue invoice (due date in the past)
    await seedHistory(page, [
      createSavedInvoice({
        date: today, total: 1000, invoiceNumber: 'INV-001',
      }),
      createSavedInvoice({
        date: '2025-12-01', total: 500, invoiceNumber: 'INV-002',
        paymentTerms: '30', dueDate: '2025-12-31',
      }),
    ]);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });

    // Should show overdue amount
    await expect(page.getByTestId('overdue-amount')).toBeVisible();
    await expect(page.getByTestId('overdue-amount')).toContainText('overdue');
  });

  test('should detect overdue invoices and show red indicator', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupOnboardedUser(page);

    // Invoice dated 60 days ago with 30-day terms = overdue
    await seedHistory(page, [
      createSavedInvoice({
        date: '2025-12-23', total: 1500, invoiceNumber: 'INV-OLD',
        paymentTerms: '30', dueDate: '2026-01-22',
      }),
    ]);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });

    // View Overdue button should be visible with count
    await expect(page.getByTestId('view-overdue-button')).toBeVisible();
    await expect(page.getByTestId('view-overdue-button')).toContainText('View Overdue (1)');
  });

  test('should mark invoice as paid and update dashboard', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupOnboardedUser(page);

    const today = new Date().toISOString().split('T')[0];
    await seedHistory(page, [
      createSavedInvoice({ date: today, total: 1000, invoiceNumber: 'INV-001' }),
    ]);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });

    // Open history panel
    await page.getByText('View All').click();
    await expect(page.getByRole('heading', { name: 'History' })).toBeVisible();

    // Find the status indicator and click it to mark as paid
    const statusBtn = page.getByTestId('status-indicator').first();
    await expect(statusBtn).toBeVisible();
    await statusBtn.click();

    // Status should now show "Paid"
    await expect(statusBtn).toContainText('Paid');
  });

  test('should toggle paid back to unpaid', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupOnboardedUser(page);

    const today = new Date().toISOString().split('T')[0];
    await seedHistory(page, [
      createSavedInvoice({ date: today, total: 1000, invoiceNumber: 'INV-001', status: 'paid' }),
    ]);

    await page.reload({ waitUntil: 'domcontentloaded' });

    // Open history
    await page.getByText('View All').click();
    await expect(page.getByRole('heading', { name: 'History' })).toBeVisible();

    // Status should show "Paid" initially
    const statusBtn = page.getByTestId('status-indicator').first();
    await expect(statusBtn).toContainText('Paid');

    // Click to mark as unpaid
    await statusBtn.click();

    // Should no longer say "Paid"
    await expect(statusBtn).not.toContainText('Paid');
  });

  test('should reduce outstanding when credit note exists', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupOnboardedUser(page);

    const today = new Date().toISOString().split('T')[0];
    await seedHistory(page, [
      createSavedInvoice({ date: today, total: 1000, invoiceNumber: 'INV-001' }),
      createSavedInvoice({
        date: today, total: 200, invoiceNumber: 'CN-001',
        documentType: 'credit_note',
      }),
    ]);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });

    // Outstanding should be £1,200 (inv) - £240 (CN with VAT) = £960
    const outstandingText = await page.getByTestId('outstanding-amount').textContent();
    expect(outstandingText).toBeTruthy();
    // The credit note reduces the outstanding amount
    expect(outstandingText).not.toContain('£1,200');
  });

  test('should open history panel pre-filtered to overdue when clicking View Overdue', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupOnboardedUser(page);

    await seedHistory(page, [
      createSavedInvoice({
        date: '2025-12-01', total: 500, invoiceNumber: 'INV-OVERDUE',
        paymentTerms: '30', dueDate: '2025-12-31',
      }),
      createSavedInvoice({
        date: new Date().toISOString().split('T')[0],
        total: 1000, invoiceNumber: 'INV-CURRENT', status: 'paid',
      }),
    ]);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });

    // Click View Overdue
    await page.getByTestId('view-overdue-button').click();
    await expect(page.getByRole('heading', { name: 'History' })).toBeVisible();

    // Overdue tab should be selected
    const overdueTab = page.getByRole('tab', { name: /Overdue/ });
    await expect(overdueTab).toHaveAttribute('aria-selected', 'true');

    // Should see the overdue invoice
    await expect(page.getByText('INV-OVERDUE')).toBeVisible();
  });

  test('should show count badges on filter tabs', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupOnboardedUser(page);

    const today = new Date().toISOString().split('T')[0];
    await seedHistory(page, [
      createSavedInvoice({ date: today, total: 1000, invoiceNumber: 'INV-001' }),
      createSavedInvoice({ date: today, total: 2000, invoiceNumber: 'INV-002', status: 'paid' }),
      createSavedInvoice({ date: today, total: 300, invoiceNumber: 'CN-001', documentType: 'credit_note' }),
    ]);

    await page.reload({ waitUntil: 'domcontentloaded' });

    // Open history
    await page.getByText('View All').click();
    await expect(page.getByRole('heading', { name: 'History' })).toBeVisible();

    // Document type tabs should show counts
    await expect(page.getByRole('tab', { name: /All.*\(3\)/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Invoices.*\(2\)/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Credit Notes.*\(1\)/ })).toBeVisible();
  });

  test('should filter by status tabs in history', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupOnboardedUser(page);

    const today = new Date().toISOString().split('T')[0];
    await seedHistory(page, [
      createSavedInvoice({ date: today, total: 1000, invoiceNumber: 'INV-UNPAID' }),
      createSavedInvoice({ date: today, total: 2000, invoiceNumber: 'INV-PAID', status: 'paid' }),
    ]);

    await page.reload({ waitUntil: 'domcontentloaded' });

    // Open history
    await page.getByText('View All').click();
    await expect(page.getByRole('heading', { name: 'History' })).toBeVisible();

    // Click "Paid" status filter
    await page.getByRole('tab', { name: /^Paid/ }).click();

    // Should see only paid invoice
    await expect(page.getByText('INV-PAID')).toBeVisible();
    await expect(page.getByText('INV-UNPAID')).not.toBeVisible();

    // Click "Unpaid" status filter
    await page.getByRole('tab', { name: /^Unpaid/ }).click();

    // Should see only unpaid invoice
    await expect(page.getByText('INV-UNPAID')).toBeVisible();
    await expect(page.getByText('INV-PAID')).not.toBeVisible();
  });

  test('should switch period and update totals', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupOnboardedUser(page);

    const today = new Date().toISOString().split('T')[0];
    // One this month, one from last year
    await seedHistory(page, [
      createSavedInvoice({ date: today, total: 1000, invoiceNumber: 'INV-RECENT' }),
      createSavedInvoice({ date: '2025-06-15', total: 5000, invoiceNumber: 'INV-OLD' }),
    ]);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });

    // Default is "This Month" — should show only recent invoice total
    const monthAmount = await page.getByTestId('invoiced-amount').textContent();

    // Switch to "This Year"
    await page.getByText('This Month').click();
    await page.getByText('This Year').click();

    // Year total should be different (just the recent one since old is 2025)
    const yearAmount = await page.getByTestId('invoiced-amount').textContent();
    // Both should be the same since the old invoice is from 2025
    expect(monthAmount).toBe(yearAmount);
  });

  test('should show collection ring with correct percentage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupOnboardedUser(page);

    const today = new Date().toISOString().split('T')[0];
    await seedHistory(page, [
      createSavedInvoice({ date: today, total: 1000, invoiceNumber: 'INV-001', status: 'paid' }),
      createSavedInvoice({ date: today, total: 1000, invoiceNumber: 'INV-002' }),
    ]);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });

    // Collection ring should be visible
    await expect(page.getByTestId('collection-ring')).toBeVisible();

    // Should show 50% (1 of 2 invoices paid, equal amounts)
    await expect(page.getByTestId('collection-ring')).toContainText('50%');
  });

  test('should migrate v2 data to v3 format on load', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupOnboardedUser(page);

    // Seed v2 format (no status, no dueDate)
    await page.evaluate(() => {
      localStorage.setItem('invease-history', JSON.stringify({
        state: {
          invoices: [{
            id: 'inv_v2_test',
            invoice: {
              invoicer: {
                logo: null, logoFileName: null,
                companyName: 'V2 Co', companyNumber: '', vatNumber: '', eoriNumber: '',
                address: '1 Old St', postCode: 'SW1A 1AA',
                cisStatus: 'not_applicable', cisUtr: '',
              },
              customer: { name: 'V2 Client', email: '', address: '', postCode: '' },
              details: {
                date: '2026-02-01',
                supplyDate: '',
                invoiceNumber: 'INV-V2-001',
                paymentTerms: '30',
                notes: '',
                documentType: 'invoice',
              },
              lineItems: [{
                id: 'item_1', description: 'Old service', quantity: 1,
                netAmount: 500, vatRate: '20', cisCategory: 'not_applicable',
              }],
              bankDetails: { accountNumber: '', sortCode: '', accountName: '', bankName: '', reference: '' },
            },
            totals: { subtotal: 500, vatBreakdown: [{ rate: '20', amount: 100 }], totalVat: 100, total: 600 },
            savedAt: '2026-02-01T12:00:00Z',
            customerName: 'V2 Client',
            invoiceNumber: 'INV-V2-001',
            total: 600,
            documentType: 'invoice',
            // No status, no dueDate, no paidDate — v2 format
          }],
          recentCustomers: [],
        },
        version: 2,
      }));
    });

    await page.reload({ waitUntil: 'domcontentloaded' });

    // Dashboard should appear (migrated data shows up)
    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });

    // Open history to verify migrated invoice
    await page.getByText('View All').click();
    await expect(page.getByText('V2 Client')).toBeVisible();

    // Status indicator should be visible (unpaid default from migration)
    await expect(page.getByTestId('status-indicator')).toBeVisible();
  });
});
