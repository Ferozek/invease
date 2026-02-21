import { test, expect } from '@playwright/test';

/**
 * PDF Generation E2E Tests
 *
 * Tests the full PDF preview and download flow.
 * Uses Quick Start to pre-fill sample data (including in-memory bank details).
 * These tests catch CSP regressions that block @react-pdf/renderer.
 *
 * Note: test.slow() doubles the timeout because PDF generation with
 * @react-pdf/renderer takes 15-30s.
 */
test.describe('PDF Preview and Download', () => {
  test.beforeEach(async ({ page }) => {
    // Use Quick Start flow: skip welcome → skip wizard → sample data loaded
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

    // Click Quick Start to get sample data (sets bank details in memory)
    await page.getByText('Skip setup, start invoicing now').click();
    await expect(page.getByText('Customer Details')).toBeVisible({ timeout: 10000 });
  });

  test('should open PDF preview modal and render PDF', async ({ page }) => {
    test.slow(); // PDF generation needs extra time

    // Verify sample data is loaded
    await expect(page.getByText('Line Items')).toBeVisible();

    // Click the full preview button
    await page.getByRole('button', { name: 'Open full PDF preview' }).click();

    // Modal should open — use specific locator for the modal heading (inside .fixed overlay)
    const modalHeading = page.locator('.fixed h2:text-is("Invoice Preview")');
    await expect(modalHeading).toBeVisible({ timeout: 10000 });

    // Wait for PDF to generate - iframe should appear
    const iframe = page.locator('iframe[title="Invoice PDF Preview"]');
    await expect(iframe).toBeVisible({ timeout: 30000 });

    // Download button in modal should be enabled once PDF is ready
    const downloadBtn = page.locator('.fixed').getByRole('button', { name: /Download/i }).first();
    await expect(downloadBtn).toBeEnabled({ timeout: 5000 });

    // Close modal with close button
    await page.getByRole('button', { name: 'Close preview' }).click();
    await expect(iframe).not.toBeVisible();
  });

  test('should download PDF via modal download button', async ({ page }) => {
    test.slow();

    // Open preview
    await page.getByRole('button', { name: 'Open full PDF preview' }).click();

    // Wait for PDF to render in iframe
    const iframe = page.locator('iframe[title="Invoice PDF Preview"]');
    await expect(iframe).toBeVisible({ timeout: 30000 });

    // Wait for download button to be enabled (PDF must be fully generated)
    const downloadBtn = page.locator('.fixed').getByRole('button', { name: /Download/i }).first();
    await expect(downloadBtn).toBeEnabled({ timeout: 5000 });

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');

    // Click download in modal
    await downloadBtn.click();

    // Verify download triggered
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^Invoice-.*\.pdf$/);
  });

  test('should download PDF via main download button', async ({ page }) => {
    test.slow();

    // Override with fully onboarded user that has all required fields
    await page.evaluate(() => {
      localStorage.setItem('invease-company-details', JSON.stringify({
        state: {
          hasSeenWelcome: true,
          isOnboarded: true,
          businessType: 'sole_trader',
          companyName: 'Test Company Ltd',
          address: '123 Business Street\nLondon',
          postCode: 'SW1A 1AA',
        },
        version: 0,
      }));
    });
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Fill customer details
    await page.getByLabel('Customer Name').fill('Test Client Ltd');
    await page.locator('#customerAddress').fill('456 Client Road\nLondon');
    await page.getByLabel('Post Code').last().fill('EC1A 1BB');

    // Fill a line item
    const descInput = page.getByPlaceholder('Service description').first();
    await descInput.scrollIntoViewIfNeeded();
    await descInput.fill('Consulting');
    const amountInput = page.getByPlaceholder('0.00').first();
    await amountInput.fill('500');

    // Now the form is valid — download button should show "Download Invoice PDF"
    const downloadButton = page.getByRole('button', { name: /Download.*PDF/i });
    await expect(downloadButton).toBeVisible({ timeout: 10000 });
    await expect(downloadButton).toBeEnabled({ timeout: 10000 });

    // Set up download listener
    const downloadPromise = page.waitForEvent('download');

    // Click download
    await downloadButton.click();

    // Verify download triggered
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^Invoice-.*\.pdf$/);
  });

  test('should close preview modal with Escape key', async ({ page }) => {
    test.slow();

    // Open preview
    await page.getByRole('button', { name: 'Open full PDF preview' }).click();

    // Wait for modal heading (specific to modal overlay)
    const modalHeading = page.locator('.fixed h2:text-is("Invoice Preview")');
    await expect(modalHeading).toBeVisible({ timeout: 10000 });

    // Press Escape
    await page.keyboard.press('Escape');

    // Modal should close
    await expect(modalHeading).not.toBeVisible();
  });
});
