import { test, expect } from '@playwright/test';
import { setupOnboardedUser, openSection } from './helpers';

/**
 * Invoice Form Tests — accordion interaction, form filling, validation, CIS
 * 7 tests
 */
test.describe('Invoice Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupOnboardedUser(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Customer Details')).toBeVisible({ timeout: 10000 });
  });

  test('accordion sections toggle open/closed', async ({ page }) => {
    // Customer Details should be open by default
    const customerBtn = page.locator('button[aria-expanded]').filter({ hasText: 'Customer Details' });
    await expect(customerBtn).toHaveAttribute('aria-expanded', 'true');

    // Click Line Items — should open it and close Customer
    await openSection(page, 'Line Items');
    await expect(customerBtn).toHaveAttribute('aria-expanded', 'false');

    const lineItemsBtn = page.locator('button[aria-expanded]').filter({ hasText: 'Line Items' });
    await expect(lineItemsBtn).toHaveAttribute('aria-expanded', 'true');

    // Click Line Items again — should close it
    await lineItemsBtn.click();
    await expect(lineItemsBtn).toHaveAttribute('aria-expanded', 'false');
  });

  test('fills customer details and calculates totals', async ({ page }) => {
    // Customer section is open by default
    await page.fill('#customerName', 'Acme Ltd');
    await page.fill('#customerAddress', '100 Business Road');
    await page.fill('#customerPostCode', 'EC1A 1BB');

    // Open Line Items and fill
    await openSection(page, 'Line Items');
    const descInput = page.locator('input[aria-label="Line item description"]').first();
    const qtyInput = page.locator('input[aria-label="Quantity"]').first();
    const netInput = page.locator('input[aria-label="Net amount"]').first();

    await expect(descInput).toBeVisible({ timeout: 5000 });
    await descInput.fill('Consulting');
    await qtyInput.clear();
    await qtyInput.fill('2');
    await netInput.fill('100');

    // Totals should calculate correctly
    await expect(page.getByText('£200.00').first()).toBeVisible({ timeout: 5000 }); // Subtotal
    await expect(page.getByText('£40.00').first()).toBeVisible(); // VAT (20%)
    await expect(page.getByText('£240.00').first()).toBeVisible(); // Total
  });

  test('wizard validates UK postcode format', async ({ page }) => {
    // Re-enter wizard for validation tests
    await page.getByText('Edit Details').first().click();
    await expect(page.locator('#companyName')).toBeVisible({ timeout: 5000 });

    // Enter invalid postcode
    await page.fill('#postCode', 'invalid');
    await page.locator('#postCode').blur();
    await expect(page.getByText(/valid.*postcode/i)).toBeVisible({ timeout: 3000 });

    // Enter valid postcode — should normalize
    await page.fill('#postCode', 'sw1a1aa');
    await page.locator('#postCode').blur();
    await expect(page.locator('#postCode')).toHaveValue('SW1A 1AA');
    await expect(page.getByText(/valid.*postcode/i)).not.toBeVisible();
  });

  test('CIS category column shows when CIS enabled', async ({ page, isMobile }) => {
    // Override with CIS-enabled user
    await setupOnboardedUser(page, { cisStatus: 'standard', cisUtr: '1234567890' });
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Open Line Items
    await openSection(page, 'Line Items');
    await expect(page.getByText('Line Items')).toBeVisible({ timeout: 5000 });

    if (!isMobile) {
      const categoryHeader = page.locator('th').filter({ hasText: 'Category' });
      await expect(categoryHeader).toBeVisible({ timeout: 3000 });
    }

    const categorySelect = page.locator('select[aria-label="CIS category"]').first();
    await expect(categorySelect).toBeVisible();
  });

  test('new invoice confirmation clears form', async ({ page }) => {
    // Fill some data so confirmation triggers
    await page.fill('#customerName', 'Test Customer');

    // Click the New Invoice toolbar button
    await page.getByRole('button', { name: /start new invoice/i }).click();

    // Confirmation dialog
    await expect(page.getByText('Start New Invoice?')).toBeVisible();

    // Cancel keeps data
    await page.getByRole('button', { name: 'Keep Current' }).click();
    await expect(page.locator('#customerName')).toHaveValue('Test Customer');

    // Try again and confirm
    await page.getByRole('button', { name: /start new invoice/i }).click();
    await page.getByRole('button', { name: 'Clear & Start New' }).click();

    // Form should be cleared
    await expect(page.locator('#customerName')).toHaveValue('');
  });

  test('bank details NOT persisted in localStorage', async ({ page }) => {
    // Set up state with bank details in localStorage (should be stripped)
    await page.evaluate(() => {
      localStorage.setItem('invease-company-details', JSON.stringify({
        state: {
          hasSeenWelcome: true,
          isOnboarded: true,
          businessType: 'sole_trader',
          companyName: 'Security Test Co',
          address: '123 Secure St',
          postCode: 'SW1A 1AA',
          bankDetails: {
            bankName: 'Should Not Persist',
            accountNumber: '99999999',
            sortCode: '99-99-99',
          },
        },
      }));
    });
    await page.reload();

    const storedData = await page.evaluate(() => {
      const data = localStorage.getItem('invease-company-details');
      return data ? JSON.parse(data) : null;
    });

    expect(storedData?.state?.bankDetails).toBeUndefined();
  });

  test('download button disabled when form incomplete', async ({ page }) => {
    // With empty customer name, download should be disabled
    const downloadButton = page.getByRole('button', { name: /download.*pdf/i });
    const buttonCount = await downloadButton.count();

    if (buttonCount > 0) {
      await expect(downloadButton.first()).toBeDisabled();

      // Fill required fields
      await page.fill('#customerName', 'Test Customer');
      await page.fill('#customerAddress', '123 Test St');
      await page.fill('#customerPostCode', 'SW1A 1AA');

      // Fill a line item
      await openSection(page, 'Line Items');
      const descInput = page.locator('input[aria-label="Line item description"]').first();
      const netInput = page.locator('input[aria-label="Net amount"]').first();
      await descInput.fill('Service');
      await netInput.fill('100');

      await expect(downloadButton.first()).toBeEnabled({ timeout: 5000 });
    }
  });
});
