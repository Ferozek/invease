import { test, expect, Page } from '@playwright/test';
import { quickStart, openSection } from './helpers';

/**
 * PDF & Document Type Tests — preview, download, credit notes
 * 5 tests
 */

async function switchDocumentType(page: Page, target: 'Credit Note' | 'Invoice') {
  await page.getByRole('radio', { name: target }).click();
  const switchButton = page.getByRole('button', { name: 'Switch' });
  if (await switchButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await switchButton.click();
  }
}

test.describe('PDF & Documents', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await quickStart(page);
  });

  test('PDF preview modal opens and renders', async ({ page }) => {
    test.slow();

    await page.getByRole('button', { name: 'Open full PDF preview' }).click();

    // Modal should open
    const modalHeading = page.locator('.fixed h2:text-is("Invoice Preview")');
    await expect(modalHeading).toBeVisible({ timeout: 10000 });

    // PDF iframe should render
    const iframe = page.locator('iframe[title="Invoice PDF Preview"]');
    await expect(iframe).toBeVisible({ timeout: 30000 });

    // Download button in modal should be enabled
    const downloadBtn = page.locator('.fixed').getByRole('button', { name: /Download/i }).first();
    await expect(downloadBtn).toBeEnabled({ timeout: 5000 });

    // Close with Escape
    await page.keyboard.press('Escape');
    await expect(iframe).not.toBeVisible();
  });

  test('PDF download triggers file download', async ({ page }) => {
    test.slow();

    await page.getByRole('button', { name: 'Open full PDF preview' }).click();

    const iframe = page.locator('iframe[title="Invoice PDF Preview"]');
    await expect(iframe).toBeVisible({ timeout: 30000 });

    const downloadBtn = page.locator('.fixed').getByRole('button', { name: /Download/i }).first();
    await expect(downloadBtn).toBeEnabled({ timeout: 5000 });

    const downloadPromise = page.waitForEvent('download');
    await downloadBtn.click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^Invoice-.*\.pdf$/);
  });

  test('credit note toggle shows CN fields and prefix', async ({ page }) => {
    // Open Invoice Details section to access document type toggle
    await openSection(page, 'Invoice Details');

    // Toggle to Credit Note
    await switchDocumentType(page, 'Credit Note');

    // Section heading should change
    await expect(page.getByRole('heading', { name: 'Credit Note Details' })).toBeVisible();

    // CN-specific fields should appear
    await expect(page.getByLabel('Original Invoice Number')).toBeVisible();
    await expect(page.getByLabel('Reason')).toBeVisible();

    // Number should have CN prefix
    const invoiceNumberInput = page.locator('#invoiceNumber');
    const cnNumber = await invoiceNumberInput.inputValue();
    expect(cnNumber).toMatch(/^CN/);

    // Toggle back to Invoice
    await switchDocumentType(page, 'Invoice');
    await expect(page.getByRole('heading', { name: 'Invoice Details' })).toBeVisible();
    await expect(page.getByLabel('Original Invoice Number')).not.toBeVisible();

    const invNumber = await invoiceNumberInput.inputValue();
    expect(invNumber).toMatch(/^INV/);
  });

  test('credit note preview styling changes', async ({ page }) => {
    await openSection(page, 'Invoice Details');
    await switchDocumentType(page, 'Credit Note');

    // Preview section should reflect credit note
    const previewSection = page.getByLabel('Invoice preview');
    await expect(previewSection.getByRole('heading', { name: 'Credit Note Preview' })).toBeVisible();
    await expect(previewSection.getByText('Credit Total')).toBeVisible();
  });

  test('credit note PDF preview modal title', async ({ page }) => {
    test.slow();

    await openSection(page, 'Invoice Details');
    await switchDocumentType(page, 'Credit Note');

    await page.getByLabel('Original Invoice Number').fill('INV-0001');

    await page.getByRole('button', { name: 'Open full PDF preview' }).click();

    const modalHeading = page.locator('.fixed h2:text-is("Credit Note Preview")');
    await expect(modalHeading).toBeVisible({ timeout: 10000 });
  });
});
