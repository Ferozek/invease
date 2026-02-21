import { test, expect } from '@playwright/test';
import { setupOnboardedUser, createSavedInvoice, seedHistory } from './helpers';

/**
 * Dashboard & Payment Tracking Tests
 * 6 tests
 */
test.describe('Dashboard', () => {
  test('no dashboard when no history', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupOnboardedUser(page);
    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Customer Details')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Dashboard')).not.toBeVisible();
  });

  test('dashboard shows with seeded history', async ({ page }) => {
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

  test('overdue detection and View Overdue button', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupOnboardedUser(page);

    await seedHistory(page, [
      createSavedInvoice({
        date: '2025-12-23', total: 1500, invoiceNumber: 'INV-OLD',
        paymentTerms: '30', dueDate: '2026-01-22',
      }),
    ]);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });

    // View Overdue button with count
    await expect(page.getByTestId('view-overdue-button')).toBeVisible();
    await expect(page.getByTestId('view-overdue-button')).toContainText('View Overdue (1)');

    // Click opens history filtered to overdue
    await page.getByTestId('view-overdue-button').click();
    await expect(page.getByRole('heading', { name: 'History' })).toBeVisible();
    const overdueTab = page.getByRole('tab', { name: /Overdue/ });
    await expect(overdueTab).toHaveAttribute('aria-selected', 'true');
  });

  test('mark paid/unpaid toggle', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupOnboardedUser(page);

    const today = new Date().toISOString().split('T')[0];
    await seedHistory(page, [
      createSavedInvoice({ date: today, total: 1000, invoiceNumber: 'INV-001' }),
    ]);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });

    // Open history
    await page.getByText('View All').click();
    await expect(page.getByRole('heading', { name: 'History' })).toBeVisible();

    // Mark as paid
    const statusBtn = page.getByTestId('status-indicator').first();
    await expect(statusBtn).toBeVisible();
    await statusBtn.click();
    await expect(statusBtn).toContainText('Paid');

    // Toggle back to unpaid
    await statusBtn.click();
    await expect(statusBtn).not.toContainText('Paid');
  });

  test('history filter tabs with counts', async ({ page }) => {
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

    // Document type tabs with counts
    await expect(page.getByRole('tab', { name: /All.*\(3\)/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Invoices.*\(2\)/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Credit Notes.*\(1\)/ })).toBeVisible();

    // Status filter works
    await page.getByRole('tab', { name: /^Paid/ }).click();
    await expect(page.getByText('INV-002')).toBeVisible();
    await expect(page.getByText('INV-001')).not.toBeVisible();
  });

  test('collection ring shows correct percentage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupOnboardedUser(page);

    const today = new Date().toISOString().split('T')[0];
    await seedHistory(page, [
      createSavedInvoice({ date: today, total: 1000, invoiceNumber: 'INV-001', status: 'paid' }),
      createSavedInvoice({ date: today, total: 1000, invoiceNumber: 'INV-002' }),
    ]);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });

    await expect(page.getByTestId('collection-ring')).toBeVisible();
    await expect(page.getByTestId('collection-ring')).toContainText('50%');
  });
});
