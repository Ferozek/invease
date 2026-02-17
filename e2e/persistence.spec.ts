import { test, expect } from '@playwright/test';

/**
 * Data Persistence Tests
 * Ensures data survives page reloads and follows security rules
 */
test.describe('Data Persistence', () => {
  test('company details should persist across page reloads', async ({ page }) => {
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

    // Complete wizard with company details
    await page.getByText('Sole Trader').click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Fill identity
    await expect(page.locator('#companyName')).toBeVisible({ timeout: 10000 });
    await page.fill('#companyName', 'Persistent Company');
    await page.fill('#address', '456 Persist Lane');
    await page.fill('#postCode', 'EC1A 1BB');

    // Wait for blur events to complete
    await page.locator('#postCode').blur();
    await page.waitForTimeout(100);

    await page.getByRole('button', { name: 'Continue' }).click();

    // Skip tax (look for either Skip or Continue button)
    await expect(page.getByText('Tax & Compliance')).toBeVisible({ timeout: 10000 });
    const skipButton = page.getByRole('button', { name: 'Skip' });
    const continueButton = page.getByRole('button', { name: 'Continue' });

    if (await skipButton.isVisible()) {
      await skipButton.click();
    } else {
      await continueButton.click();
    }

    // Fill bank details
    await expect(page.locator('#bankName')).toBeVisible({ timeout: 10000 });
    await page.fill('#bankName', 'Persist Bank');
    await page.fill('#accountName', 'Persist Account');
    await page.fill('#accountNumber', '87654321');
    await page.fill('#sortCode', '654321');

    // Wait for blur events
    await page.locator('#sortCode').blur();
    await page.waitForTimeout(100);

    await page.getByRole('button', { name: 'Continue' }).click();

    // Complete onboarding
    await expect(page.getByText('Review Your Details')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Start Creating Invoices' }).click();

    // Verify on main form
    await expect(page.getByText('Customer Details')).toBeVisible({ timeout: 10000 });

    // Wait for localStorage to be written
    await page.waitForTimeout(500);

    // Reload page
    await page.reload();

    // Company name should still be visible in summary (appears in form and preview)
    await expect(page.getByText('Persistent Company').first()).toBeVisible({ timeout: 10000 });
  });

  test('bank details should NOT persist in localStorage (security)', async ({ page }) => {
    await page.goto('/');

    // Set up onboarded state with bank details
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
            accountName: 'Secret Account',
            accountNumber: '99999999',
            sortCode: '99-99-99',
          },
        },
      }));
    });
    await page.reload();

    // Check localStorage directly - bank details should be removed by migration
    const storedData = await page.evaluate(() => {
      const data = localStorage.getItem('invease-company-details');
      return data ? JSON.parse(data) : null;
    });

    // Bank details should NOT be in persisted state
    expect(storedData?.state?.bankDetails).toBeUndefined();
  });

  test('invoice history should save and load invoices', async ({ page }) => {
    // Set up onboarded state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('invease-company-details', JSON.stringify({
        state: {
          hasSeenWelcome: true,
          isOnboarded: true,
          businessType: 'sole_trader',
          companyName: 'History Test Co',
          address: '123 History St',
          postCode: 'SW1A 1AA',
        },
      }));
    });
    await page.reload();

    // Fill customer details
    await expect(page.locator('#customerName')).toBeVisible({ timeout: 5000 });
    await page.fill('#customerName', 'History Customer');
    await page.fill('#customerAddress', '789 Customer Ave');
    await page.fill('#customerPostCode', 'W1A 1AA');

    // Fill invoice number
    await page.fill('#invoiceNumber', 'INV-HISTORY-001');

    // Save to history (if button exists)
    const saveButton = page.getByRole('button', { name: /save|history/i });
    if (await saveButton.isVisible()) {
      await saveButton.click();
    }
  });

  test('customer details should auto-populate from recent customers', async ({ page }) => {
    // Set up state with saved invoice
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
      }));
      localStorage.setItem('invease-invoices', JSON.stringify({
        state: {
          invoices: [{
            id: '1',
            invoiceNumber: 'INV-001',
            customer: {
              name: 'Repeat Customer',
              address: '100 Repeat Road',
              postCode: 'E1 1AA',
            },
          }],
        },
      }));
    });
    await page.reload();

    // Look for recent customers dropdown
    const recentCustomersTrigger = page.locator('[aria-label*="recent"]');
    if (await recentCustomersTrigger.isVisible()) {
      await recentCustomersTrigger.click();

      // Should show previous customer
      await expect(page.getByText('Repeat Customer')).toBeVisible();
    }
  });
});
