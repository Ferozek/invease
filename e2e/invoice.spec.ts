import { test, expect } from '@playwright/test';

test.describe('Invoice Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Set up completed onboarding state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('invease-company-details', JSON.stringify({
        state: {
          hasSeenWelcome: true,
          isOnboarded: true,
          businessType: 'sole_trader',
          companyName: 'Test Company',
          companyNumber: '',
          vatNumber: '',
          eoriNumber: '',
          address: '123 Test Street',
          postCode: 'SW1A 1AA',
          cisStatus: 'not_applicable',
          cisUtr: '',
          bankDetails: {
            bankName: 'Test Bank',
            accountName: 'Test Account',
            accountNumber: '12345678',
            sortCode: '12-34-56',
            reference: '',
          },
          logo: null,
          logoFileName: null,
        },
        version: 0,
      }));
    });
    await page.reload();
  });

  test('should show invoice form after onboarding', async ({ page }) => {
    await expect(page.getByText('Customer Details')).toBeVisible();
    await expect(page.getByText('Invoice Details')).toBeVisible();
    await expect(page.getByText('Line Items')).toBeVisible();
  });

  test('should add line items', async ({ page }) => {
    // Click Add Line Item button
    await page.getByRole('button', { name: /add line item/i }).click();
    
    // Should have 2 line items now
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(2);
  });

  test('should calculate totals correctly', async ({ page }) => {
    // Wait for line items table to be ready
    await expect(page.getByText('Line Items')).toBeVisible({ timeout: 5000 });

    // Fill first line item (using aria-labels from LineItemsTable.tsx)
    const descInput = page.locator('input[aria-label="Line item description"]').first();
    const qtyInput = page.locator('input[aria-label="Quantity"]').first();
    const netInput = page.locator('input[aria-label="Net amount"]').first();

    await expect(descInput).toBeVisible({ timeout: 5000 });
    await descInput.fill('Test Service');
    await qtyInput.clear();
    await qtyInput.fill('2');
    await netInput.fill('100');

    // Totals should update (use .first() as values appear in multiple places)
    await expect(page.getByText('£200.00').first()).toBeVisible({ timeout: 5000 }); // Subtotal
    await expect(page.getByText('£40.00').first()).toBeVisible(); // VAT at 20%
    await expect(page.getByText('£240.00').first()).toBeVisible(); // Total
  });

  test('should show confirmation when clearing invoice', async ({ page }) => {
    // Fill some data
    await page.locator('#customerName').fill('Test Customer');
    
    // Click New Invoice
    await page.getByRole('button', { name: 'New Invoice' }).click();
    
    // Should show confirmation dialog
    await expect(page.getByText('Start New Invoice?')).toBeVisible();
    
    // Cancel should keep data
    await page.getByRole('button', { name: 'Keep Current' }).click();
    await expect(page.locator('#customerName')).toHaveValue('Test Customer');
  });
});
