import { test, expect } from '@playwright/test';

/**
 * Credit Note E2E Tests
 *
 * Tests the credit note feature:
 * - Toggle between Invoice and Credit Note via segmented control
 * - Credit note fields appear/disappear
 * - CN numbering prefix
 * - PDF preview shows "CREDIT NOTE" title
 */
test.describe('Credit Note Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Use Quick Start flow for sample data
    await page.goto('/', { waitUntil: 'domcontentloaded' });
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

    // Click Quick Start
    await page.getByText('Skip setup, start invoicing now').click();
    await expect(page.getByText('Customer Details')).toBeVisible({ timeout: 10000 });
  });

  test('should toggle to credit note mode via segmented control', async ({ page }) => {
    // Should see the document type selector
    const creditNoteButton = page.getByRole('radio', { name: 'Credit Note' });
    await expect(creditNoteButton).toBeVisible();

    // Toggle to Credit Note
    await creditNoteButton.click();

    // Section heading should change (use heading role for specificity)
    await expect(page.getByRole('heading', { name: 'Credit Note Details' })).toBeVisible();

    // Credit note fields should appear
    await expect(page.getByLabel('Original Invoice Number')).toBeVisible();

    // CN number should have CN prefix
    const invoiceNumberInput = page.locator('#invoiceNumber');
    const cnNumber = await invoiceNumberInput.inputValue();
    expect(cnNumber).toMatch(/^CN/);
  });

  test('should switch back to invoice mode', async ({ page }) => {
    // Toggle to Credit Note first
    await page.getByRole('radio', { name: 'Credit Note' }).click();
    await expect(page.getByRole('heading', { name: 'Credit Note Details' })).toBeVisible();

    // Toggle back to Invoice
    await page.getByRole('radio', { name: 'Invoice' }).click();

    // Should show Invoice Details heading again
    await expect(page.getByRole('heading', { name: 'Invoice Details' })).toBeVisible();

    // Credit note fields should not be visible
    await expect(page.getByLabel('Original Invoice Number')).not.toBeVisible();

    // Number should have INV prefix
    const invoiceNumberInput = page.locator('#invoiceNumber');
    const invNumber = await invoiceNumberInput.inputValue();
    expect(invNumber).toMatch(/^INV/);
  });

  test('should show credit note fields when in CN mode', async ({ page }) => {
    // Toggle to Credit Note
    await page.getByRole('radio', { name: 'Credit Note' }).click();

    // Original invoice number field
    const origInvoiceInput = page.getByLabel('Original Invoice Number');
    await expect(origInvoiceInput).toBeVisible();
    await origInvoiceInput.fill('INV-0001');

    // Reason field
    const reasonInput = page.getByLabel('Reason');
    await expect(reasonInput).toBeVisible();
    await reasonInput.fill('Goods returned');

    // Partial credit checkbox
    const partialCheckbox = page.getByLabel('Partial credit');
    await expect(partialCheckbox).toBeVisible();
  });

  test('should show credit note styling in preview', async ({ page }) => {
    // Toggle to Credit Note
    await page.getByRole('radio', { name: 'Credit Note' }).click();

    // Preview toolbar heading should say Credit Note Preview
    const previewSection = page.getByLabel('Invoice preview');
    await expect(previewSection.getByRole('heading', { name: 'Credit Note Preview' })).toBeVisible();

    // The empty state should mention "credit note" not "invoice"
    await expect(previewSection.getByText('Your credit note preview')).toBeVisible();

    // Totals section should say "Credit Total"
    await expect(previewSection.getByText('Credit Total')).toBeVisible();
  });

  test('should show Credit Note Preview in PDF modal', async ({ page }) => {
    test.slow(); // PDF generation

    // Toggle to Credit Note
    await page.getByRole('radio', { name: 'Credit Note' }).click();

    // Fill required CN field
    await page.getByLabel('Original Invoice Number').fill('INV-0001');

    // Open PDF preview
    await page.getByRole('button', { name: 'Open full PDF preview' }).click();

    // Modal title should say Credit Note Preview (the modal heading, not the toolbar)
    const modalHeading = page.locator('.fixed h2:text-is("Credit Note Preview")');
    await expect(modalHeading).toBeVisible({ timeout: 10000 });
  });

  test('should update New button text in credit note mode', async ({ page }) => {
    // Toggle to Credit Note
    await page.getByRole('radio', { name: 'Credit Note' }).click();

    // New button should say "New Credit Note"
    await expect(page.getByRole('button', { name: 'New Credit Note' })).toBeVisible();
  });
});

test.describe('History Panel - Credit Note Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Set up an onboarded user with some history
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('invease-company-details', JSON.stringify({
        state: {
          hasSeenWelcome: true,
          isOnboarded: true,
          businessType: 'sole_trader',
          companyName: 'Test Company Ltd',
          address: '123 Test Street',
          postCode: 'SW1A 1AA',
        },
        version: 0,
      }));
      // Add a saved invoice to history
      localStorage.setItem('invease-history', JSON.stringify({
        state: {
          invoices: [{
            id: 'inv_test_1',
            invoice: {
              invoicer: {
                companyName: 'Test Company Ltd',
                address: '123 Test Street',
                postCode: 'SW1A 1AA',
              },
              customer: {
                name: 'Customer Ltd',
                address: '456 Client Road',
                postCode: 'EC1A 1BB',
                email: 'client@test.com',
              },
              details: {
                date: '2026-02-01',
                invoiceNumber: 'INV-0001',
                paymentTerms: '30',
                notes: '',
                documentType: 'invoice',
              },
              lineItems: [{
                id: 'li_1',
                description: 'Web Design',
                quantity: 1,
                netAmount: 500,
                vatRate: '20',
                cisCategory: 'not_applicable',
              }],
              bankDetails: {
                bankName: 'Test Bank',
                accountName: 'Test Account',
                accountNumber: '12345678',
                sortCode: '123456',
              },
            },
            totals: { subtotal: 500, totalVat: 100, total: 600, vatBreakdown: [{ rate: '20', amount: 100 }] },
            savedAt: '2026-02-01T12:00:00Z',
            customerName: 'Customer Ltd',
            invoiceNumber: 'INV-0001',
            total: 600,
            documentType: 'invoice',
          }],
          recentCustomers: [],
        },
        version: 2,
      }));
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
  });

  test('should show filter tabs in history panel', async ({ page }) => {
    // Open history panel
    await page.getByRole('button', { name: 'Open invoice history' }).click();

    // Should see filter tabs
    await expect(page.getByRole('tab', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Invoices' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Credit Notes' })).toBeVisible();
  });

  test('should show Create Credit Note button on invoice items', async ({ page }) => {
    // Open history panel
    await page.getByRole('button', { name: 'Open invoice history' }).click();

    // Should see the saved invoice
    await expect(page.getByText('Customer Ltd')).toBeVisible();

    // Should see Create Credit Note button (attached in DOM, may be hidden until hover)
    const cnButton = page.getByRole('button', { name: 'Create credit note' }).first();
    await expect(cnButton).toBeAttached();
  });
});
