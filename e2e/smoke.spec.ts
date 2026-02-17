import { test, expect } from '@playwright/test';

/**
 * Smoke Tests - Critical Path Only
 * Run these before commits: npm run test:smoke
 * ~10 seconds total
 */
test.describe('Smoke Tests', () => {
  test('app loads without crashing', async ({ page }) => {
    await page.goto('/');
    // Should see Welcome Slides for first-time users
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByText(/Create professional invoices|Invease/)).toBeVisible();
  });

  test('can navigate through wizard', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // First: Skip the Welcome Slides
    await expect(page.getByText('Create professional invoices')).toBeVisible();
    await page.getByRole('button', { name: 'Get Started' }).click();

    // Now on main page with sample data - this is the new quick flow
    await expect(page.getByText('Customer Details')).toBeVisible({ timeout: 5000 });
  });

  test('invoice form renders when onboarded', async ({ page }) => {
    // Set up onboarded state (including hasSeenWelcome: true)
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
          bankDetails: {
            bankName: 'Test Bank',
            accountName: 'Test',
            accountNumber: '12345678',
            sortCode: '12-34-56',
          },
        },
        version: 0,
      }));
    });
    await page.reload();

    // Should see invoice form
    await expect(page.getByText('Customer Details')).toBeVisible();
  });
});
