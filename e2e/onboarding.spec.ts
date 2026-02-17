import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should show welcome slides for first-time users', async ({ page }) => {
    await page.goto('/');

    // Should see welcome slides first
    await expect(page.getByText('Create professional invoices')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
  });

  test('should skip welcome slides and show sample invoice', async ({ page }) => {
    await page.goto('/');

    // Click Get Started on welcome slides
    await page.getByRole('button', { name: 'Get Started' }).click();

    // Should now see main invoice page with sample data indicator
    await expect(page.getByText('This is sample data')).toBeVisible({ timeout: 5000 });
    // Check form section specifically (not preview which also shows company name)
    await expect(page.getByLabel('Invoice form').getByText('Your Company Name')).toBeVisible();
  });

  test('should allow skipping welcome via Skip button', async ({ page }) => {
    await page.goto('/');

    // Click Skip button (the one in welcome slides, not skip link)
    await page.getByRole('button', { name: 'Skip' }).click();

    // Should now see main invoice page
    await expect(page.getByText('This is sample data')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Edit Details Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start with a completed onboarding
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('invease-company-details', JSON.stringify({
        state: {
          hasSeenWelcome: true,
          isOnboarded: true,
          businessType: 'sole_trader',
          companyName: 'Test Company Ltd',
          address: '123 Test Street',
          postCode: 'SW1A 1AA',
          companyNumber: '',
          vatNumber: '',
          eoriNumber: '',
          cisStatus: 'not_applicable',
          cisUtr: '',
          rememberBankDetails: false,
          bankDetails: {
            bankName: 'Test Bank',
            accountName: 'Test Account',
            accountNumber: '12345678',
            sortCode: '12-34-56',
            reference: '',
          },
        },
        version: 0,
      }));
    });
    await page.reload();
  });

  test('should show main invoice page when onboarded', async ({ page }) => {
    await page.goto('/');

    // Should see company details summary (not wizard) - check form section
    await expect(page.getByLabel('Invoice form').getByText('Test Company Ltd')).toBeVisible();
    await expect(page.getByText('Edit Details').first()).toBeVisible();
  });

  test('should open wizard at Identity step when clicking Edit Details (Apple HIG)', async ({ page }) => {
    await page.goto('/');

    // Click Edit Details
    await page.getByText('Edit Details').first().click();

    // Should skip Business Type step and go directly to Identity step (Apple-style)
    // Business type was already set, so no need to ask again
    await expect(page.getByText(/Your.*Identity/)).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#companyName')).toBeVisible();
  });

  test('should preserve data when editing and returning', async ({ page }) => {
    await page.goto('/');

    // Click Edit Details
    await page.getByText('Edit Details').first().click();

    // Should skip Business Type and go directly to Identity step (Apple HIG: don't ask again)
    // Should see identity step with pre-filled data
    await expect(page.locator('#companyName')).toHaveValue('Test Company Ltd', { timeout: 5000 });

    // Change the company name
    await page.fill('#companyName', 'Updated Company Ltd');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Skip tax step
    await expect(page.getByText('Tax & Compliance')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Skip' }).click();

    // Bank details step - fill if empty and continue
    await expect(page.getByRole('heading', { name: 'Bank Details' })).toBeVisible({ timeout: 5000 });
    // Bank details may need to be re-entered if not remembered
    const bankNameInput = page.locator('#bankName');
    if (await bankNameInput.inputValue() === '') {
      await page.fill('#bankName', 'Test Bank');
      await page.fill('#accountName', 'Test Account');
      await page.fill('#accountNumber', '12345678');
      await page.fill('#sortCode', '123456');
    }
    await page.getByRole('button', { name: 'Continue' }).click();

    // Review step - complete
    await expect(page.getByText('Review Your Details')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Start Creating Invoices' }).click();

    // Back to main page - should see updated name in form section
    await expect(page.getByLabel('Invoice form').getByText('Updated Company Ltd')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Onboarding Wizard Steps', () => {
  test.beforeEach(async ({ page }) => {
    // Start after welcome slides (hasSeenWelcome: true, isOnboarded: false)
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('invease-company-details', JSON.stringify({
        state: {
          hasSeenWelcome: true,
          isOnboarded: false,
          businessType: null,
          companyName: '',
          address: '',
          postCode: '',
        },
        version: 0,
      }));
    });
    await page.reload();
  });

  test('should show wizard when hasSeenWelcome but not onboarded', async ({ page }) => {
    await page.goto('/');

    // Should see wizard (not welcome slides)
    await expect(page.getByText('What type of business are you?')).toBeVisible();
  });

  test('should allow selecting business type and continue', async ({ page }) => {
    await page.goto('/');

    // Select Sole Trader
    await page.getByText('Sole Trader').click();
    await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled();

    // Click continue
    await page.getByRole('button', { name: 'Continue' }).click();

    // Should move to identity step
    await expect(page.getByText(/Your.*Identity/)).toBeVisible({ timeout: 5000 });
  });

  test('should allow Quick Start to skip entire wizard', async ({ page }) => {
    await page.goto('/');

    // Click Quick Start
    await page.getByText('Skip setup, start invoicing now').click();

    // Should immediately go to main invoice page
    await expect(page.getByText('Customer Details')).toBeVisible({ timeout: 5000 });
  });

  test('should complete full wizard flow', async ({ page }) => {
    await page.goto('/');

    // Step 1: Select business type
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

    // Should now see main invoice page - check form section
    await expect(page.getByLabel('Invoice form').getByText('Test Business')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Customer Details')).toBeVisible();
  });
});

test.describe('Start Over Flow', () => {
  test('should reset everything when clicking Start Over', async ({ page }) => {
    // Setup: onboarded user
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('invease-company-details', JSON.stringify({
        state: {
          hasSeenWelcome: true,
          isOnboarded: true,
          businessType: 'sole_trader',
          companyName: 'Test Company',
          address: '123 Test St',
          postCode: 'SW1A 1AA',
        },
        version: 0,
      }));
    });
    await page.reload();

    // Should see main page - check form section
    await expect(page.getByLabel('Invoice form').getByText('Test Company')).toBeVisible();

    // Click Start Over
    await page.getByText('Start Over').click();

    // Confirm dialog should appear
    await expect(page.getByText('Clear Everything')).toBeVisible();
    await page.getByRole('button', { name: 'Clear Everything' }).click();

    // Should go back to welcome slides
    await expect(page.getByText('Create professional invoices')).toBeVisible({ timeout: 5000 });
  });
});
