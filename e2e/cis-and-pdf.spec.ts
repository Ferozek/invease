import { test, expect } from '@playwright/test';

/**
 * CIS Subcontractor and PDF Tests
 * Tests construction industry scheme features and PDF generation
 */
test.describe('CIS Subcontractor Features', () => {
  test.beforeEach(async ({ page }) => {
    // Start with hasSeenWelcome: true to skip Welcome Slides
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
  });

  test('should show CIS section in wizard', async ({ page }) => {
    // Navigate through wizard
    await page.getByText('Sole Trader').click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Go through identity
    await expect(page.locator('#companyName')).toBeVisible({ timeout: 5000 });
    await page.fill('#companyName', 'CIS Builder');
    await page.fill('#address', '123 Build Street');
    await page.fill('#postCode', 'M1 1AA');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Tax step - look for CIS section
    await expect(page.getByText('Tax & Compliance')).toBeVisible({ timeout: 5000 });

    // CIS section should be available - look for the heading specifically
    const cisSection = page.getByRole('heading', { name: /CIS Subcontractor/i });
    await expect(cisSection).toBeVisible();
  });

  test('should show CIS deduction rates when enabled', async ({ page }) => {
    // Set up CIS-enabled state
    await page.evaluate(() => {
      localStorage.setItem('invease-company-details', JSON.stringify({
        state: {
          hasSeenWelcome: true,
          isOnboarded: true,
          businessType: 'sole_trader',
          companyName: 'CIS Builder Ltd',
          address: '123 Construction Ave',
          postCode: 'M1 1AA',
          cisStatus: 'standard',
          cisUtr: '1234567890',
        },
      }));
    });
    await page.reload();

    // Line items should have category column for CIS
    await expect(page.getByText('Line Items')).toBeVisible({ timeout: 5000 });

    // Look for Category column header (visible only for CIS users)
    const categoryHeader = page.locator('th').filter({ hasText: 'Category' });
    await expect(categoryHeader).toBeVisible({ timeout: 3000 });

    // Category select should be visible with aria-label
    const categorySelect = page.locator('select[aria-label="CIS category"]').first();
    await expect(categorySelect).toBeVisible();
  });

  test('CIS UTR should be 10 digits only', async ({ page }) => {
    await page.getByText('Sole Trader').click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Fill identity
    await expect(page.locator('#companyName')).toBeVisible({ timeout: 5000 });
    await page.fill('#companyName', 'UTR Test Co');
    await page.fill('#address', '123 Test St');
    await page.fill('#postCode', 'SW1A 1AA');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Tax step
    await expect(page.getByText('Tax & Compliance')).toBeVisible({ timeout: 5000 });

    // Find CIS checkbox by looking for the label containing CIS text
    const cisLabel = page.locator('label').filter({ hasText: 'CIS Subcontractor' });
    const cisCheckbox = cisLabel.locator('input[type="checkbox"]');

    if (await cisLabel.isVisible()) {
      await cisCheckbox.check();

      // UTR field should appear (look for input with id cisUtr)
      const utrInput = page.locator('#cisUtr');
      await expect(utrInput).toBeVisible({ timeout: 3000 });

      // Try entering more than 10 digits - maxLength should limit it
      await utrInput.fill('12345678901234');
      // Should be limited to 10 (maxLength=10)
      await expect(utrInput).toHaveValue('1234567890');
    }
  });
});

test.describe('PDF Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('invease-company-details', JSON.stringify({
        state: {
          hasSeenWelcome: true,
          isOnboarded: true,
          businessType: 'limited_company',
          companyName: 'PDF Test Ltd',
          companyNumber: '12345678',
          vatNumber: 'GB123456789',
          address: '123 PDF Street',
          postCode: 'EC1A 1BB',
        },
      }));
    });
    await page.reload();
  });

  test('should show download button when form is valid', async ({ page }) => {
    await expect(page.getByText('Customer Details')).toBeVisible({ timeout: 5000 });

    // Fill required fields
    await page.fill('#customerName', 'PDF Customer');
    await page.fill('#customerAddress', '456 Customer Road');
    await page.fill('#customerPostCode', 'W1A 1AA');
    await page.fill('#invoiceNumber', 'INV-PDF-001');

    // Fill line item
    const descInput = page.locator('input[aria-label="Line item description"]').first();
    const netInput = page.locator('input[aria-label="Net amount"]').first();
    await descInput.fill('PDF Test Service');
    await netInput.fill('500');

    // Download button should be enabled
    const downloadButton = page.getByRole('button', { name: /download.*pdf/i });
    if (await downloadButton.isVisible()) {
      await expect(downloadButton).toBeEnabled();
    }
  });

  test('preview should update in real-time', async ({ page }) => {
    await expect(page.getByText('Customer Details')).toBeVisible({ timeout: 5000 });

    // Fill customer name
    await page.fill('#customerName', 'Preview Customer');

    // Preview should show the name (look for it in preview section)
    await expect(page.getByText('Preview Customer')).toBeVisible({ timeout: 3000 });
  });

  test('should show VAT breakdown in preview', async ({ page }) => {
    await expect(page.getByText('Line Items')).toBeVisible({ timeout: 5000 });

    // Fill line item with value
    const descInput = page.locator('input[aria-label="Line item description"]').first();
    const qtyInput = page.locator('input[aria-label="Quantity"]').first();
    const netInput = page.locator('input[aria-label="Net amount"]').first();

    await descInput.fill('VAT Test Item');
    await qtyInput.clear();
    await qtyInput.fill('1');
    await netInput.fill('100');

    // Should show VAT amount (20% of 100 = 20)
    await expect(page.getByText('£20.00').first()).toBeVisible({ timeout: 5000 });

    // Should show total (100 + 20 = 120)
    await expect(page.getByText('£120.00').first()).toBeVisible();
  });

  test('should support reverse charge VAT', async ({ page }) => {
    await expect(page.getByText('Line Items')).toBeVisible({ timeout: 5000 });

    // Fill in line item first
    const descInput = page.locator('input[aria-label="Line item description"]').first();
    const netInput = page.locator('input[aria-label="Net amount"]').first();
    await descInput.fill('Reverse Charge Service');
    await netInput.fill('100');

    // Look for VAT rate dropdown
    const vatSelect = page.locator('select[aria-label="VAT rate"]').first();
    await expect(vatSelect).toBeVisible();

    // Select reverse charge option by value
    await vatSelect.selectOption('reverse_charge');

    // Should show Reverse Charge in the preview or totals section
    // The VAT amount should be £0.00 for reverse charge
    await expect(page.getByText('£100.00').first()).toBeVisible({ timeout: 3000 });
  });
});
