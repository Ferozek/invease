import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { setupOnboardedUser } from './helpers';

/**
 * Smoke Tests — critical path, run before every commit
 * 3 tests, ~15 seconds
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

  test('no critical accessibility violations (axe-core WCAG 2.1 AA)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await setupOnboardedUser(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Customer Details')).toBeVisible({ timeout: 10000 });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    // Log violations for debugging (visible in CI artifacts)
    if (results.violations.length > 0) {
      console.log('Accessibility violations:', JSON.stringify(results.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      })), null, 2));
    }

    // Fail on critical and serious violations only
    const critical = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    expect(critical).toEqual([]);
  });
});
