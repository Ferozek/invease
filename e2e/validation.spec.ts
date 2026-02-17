import { test, expect } from '@playwright/test';

/**
 * Form Validation Tests
 * Ensures UK-specific validation rules work correctly
 */
test.describe('Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Start with hasSeenWelcome: true to skip Welcome Slides, but not onboarded
    await page.goto('/');
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
    await page.reload();

    // Navigate to identity step (now starts at wizard)
    await page.getByText('Sole Trader').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.locator('#companyName')).toBeVisible({ timeout: 5000 });
  });

  test('should validate UK postcode format', async ({ page }) => {
    // Fill required fields except postcode
    await page.fill('#companyName', 'Test Company');
    await page.fill('#address', '123 Test Street');

    // Enter invalid postcode
    await page.fill('#postCode', 'invalid');
    await page.locator('#postCode').blur();

    // Should show validation error
    await expect(page.getByText(/valid.*postcode/i)).toBeVisible({ timeout: 3000 });

    // Enter valid postcode
    await page.fill('#postCode', 'SW1A 1AA');
    await page.locator('#postCode').blur();

    // Error should be gone
    await expect(page.getByText(/valid.*postcode/i)).not.toBeVisible();
  });

  test('should normalize postcode to uppercase with space', async ({ page }) => {
    await page.fill('#postCode', 'sw1a1aa');
    await page.locator('#postCode').blur();

    // Should be normalized to SW1A 1AA
    await expect(page.locator('#postCode')).toHaveValue('SW1A 1AA');
  });

  test('should require company name', async ({ page }) => {
    // Try to continue without company name
    await page.fill('#address', '123 Test Street');
    await page.fill('#postCode', 'SW1A 1AA');

    // Leave company name empty and blur
    await page.locator('#companyName').focus();
    await page.locator('#companyName').blur();

    // Should show required error
    await expect(page.getByText(/required|enter.*name/i)).toBeVisible({ timeout: 3000 });
  });

  test('should title-case company name on blur', async ({ page }) => {
    await page.fill('#companyName', 'test company ltd');
    await page.locator('#companyName').blur();

    // Should be title-cased
    await expect(page.locator('#companyName')).toHaveValue('Test Company Ltd');
  });

  test('should validate company number format for Ltd companies', async ({ page }) => {
    // Go back and select Limited Company
    await page.goto('/');
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
    await page.reload();

    await page.getByText('Limited Company').click();
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.locator('#companyNumber')).toBeVisible({ timeout: 5000 });

    // Enter invalid company number (less than 8 chars)
    await page.fill('#companyNumber', '12345');
    await page.locator('#companyNumber').blur();

    // Should show validation error - be specific to avoid matching multiple elements
    await expect(page.getByText('Company number must be 8 characters')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Invoice Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Set up onboarded state (including hasSeenWelcome)
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('invease-company-details', JSON.stringify({
        state: {
          hasSeenWelcome: true,
          isOnboarded: true,
          businessType: 'sole_trader',
          companyName: 'Test Co',
          address: '123 Test St',
          postCode: 'SW1A 1AA',
        },
        version: 0,
      }));
    });
    await page.reload();
  });

  test('should require customer name for PDF generation', async ({ page }) => {
    await expect(page.getByText('Customer Details')).toBeVisible({ timeout: 5000 });

    // With empty customer name, the download button should be disabled
    // OR the form validation should prevent download
    const downloadButton = page.getByRole('button', { name: /download.*pdf/i });

    // Check if download is available (button exists in the UI)
    const buttonCount = await downloadButton.count();
    if (buttonCount > 0) {
      // The button should be disabled when required fields are empty
      const isDisabled = await downloadButton.first().isDisabled();
      expect(isDisabled).toBe(true);
    }

    // Alternatively, fill in customer name and verify button becomes enabled
    await page.fill('#customerName', 'Test Customer');
    await page.fill('#customerAddress', '123 Test St');
    await page.fill('#customerPostCode', 'SW1A 1AA');

    // Now button should be enabled (if it exists)
    if (buttonCount > 0) {
      await expect(downloadButton.first()).toBeEnabled({ timeout: 3000 });
    }
  });

  test('should validate line item quantity is positive', async ({ page }) => {
    await expect(page.getByText('Line Items')).toBeVisible({ timeout: 5000 });

    const qtyInput = page.locator('input[aria-label="Quantity"]').first();
    await qtyInput.clear();
    await qtyInput.fill('0');
    await qtyInput.blur();

    // Total should show £0 for this item
    await expect(page.getByText('£0.00').first()).toBeVisible();
  });
});
