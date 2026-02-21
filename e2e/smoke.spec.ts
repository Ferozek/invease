import { test, expect } from '@playwright/test';
import { setupOnboardedUser } from './helpers';

/**
 * Smoke Tests — critical path, run before every commit
 * 2 tests, ~10 seconds
 */
test.describe('Smoke Tests', () => {
  test('app loads without crashing', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByText(/Create professional invoices|Invease/)).toBeVisible();
  });

  test('accordion form renders when onboarded', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupOnboardedUser(page);
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Accordion sections should be visible
    await expect(page.getByText('Customer Details')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Invoice Details')).toBeVisible();
    await expect(page.getByText('Line Items')).toBeVisible();
    await expect(page.getByText('Bank Details')).toBeVisible();

    // First section should be expanded by default
    const firstSection = page.locator('button[aria-expanded="true"]').first();
    await expect(firstSection).toBeVisible();
  });
});
