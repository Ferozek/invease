import { test, expect } from '@playwright/test';
import { setupOnboardedUser } from './helpers';

/**
 * Onboarding Tests — welcome slides, wizard, edit details, start over
 * 5 tests
 */
test.describe('Onboarding', () => {
  test('welcome slides show for first-time users', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await expect(page.getByText('Create professional invoices')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
  });

  test('Quick Start skips wizard and loads sample data', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('invease-company-details', JSON.stringify({
        state: { hasSeenWelcome: true, isOnboarded: false, businessType: null },
        version: 0,
      }));
    });
    await page.reload({ waitUntil: 'domcontentloaded' });

    await page.getByText('Skip setup, start invoicing now').click();

    // Should see invoice form with sample data indicator
    await expect(page.getByText('This is sample data')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Customer Details')).toBeVisible();
  });

  test('full wizard flow completes', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('invease-company-details', JSON.stringify({
        state: { hasSeenWelcome: true, isOnboarded: false, businessType: null },
        version: 0,
      }));
    });
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Step 1: Business type
    await page.getByText('Sole Trader').click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 2: Identity
    await expect(page.locator('#companyName')).toBeVisible({ timeout: 5000 });
    await page.fill('#companyName', 'Test Business');
    await page.fill('#address', '123 Test Street');
    await page.fill('#postCode', 'SW1A 1AA');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 3: Tax (skip)
    await expect(page.getByText('Tax & Compliance')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Skip' }).click();

    // Step 4: Bank details
    await expect(page.getByRole('heading', { name: 'Bank Details' })).toBeVisible({ timeout: 5000 });
    await page.fill('#bankName', 'Test Bank');
    await page.fill('#accountName', 'Test Account');
    await page.fill('#accountNumber', '12345678');
    await page.fill('#sortCode', '123456');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 5: Review
    await expect(page.getByText('Review Your Details')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Start Creating Invoices' }).click();

    // Should see accordion invoice form
    await expect(page.getByLabel('Invoice form').getByText('Test Business')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Customer Details')).toBeVisible();
  });

  test('Edit Details re-enters wizard with pre-filled data', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupOnboardedUser(page, { companyName: 'Original Co' });
    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page.getByLabel('Invoice form').getByText('Original Co')).toBeVisible({ timeout: 10000 });

    // Click Edit Details
    await page.getByText('Edit Details').first().click();

    // Should go directly to Identity step (skips business type)
    await expect(page.locator('#companyName')).toHaveValue('Original Co', { timeout: 5000 });
  });

  test('Start Over resets everything', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupOnboardedUser(page);
    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page.getByLabel('Invoice form').getByText('Test Co')).toBeVisible({ timeout: 10000 });

    // Click Start Over
    await page.getByText('Start Over').click();

    // Confirm dialog
    await expect(page.getByText('Clear Everything')).toBeVisible();
    await page.getByRole('button', { name: 'Clear Everything' }).click();

    // Should return to welcome slides
    await expect(page.getByText('Create professional invoices')).toBeVisible({ timeout: 5000 });
  });
});
