/**
 * Automated PWA screenshot capture for manifest.json
 * Usage: npx tsx scripts/take-screenshots.ts
 */
import { chromium } from 'playwright';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3456';
const OUT_DIR = path.resolve(__dirname, '../public/screenshots');

// Zustand persist format for invease-company-details store
const COMPANY_STATE = JSON.stringify({
  state: {
    hasSeenWelcome: true,
    isOnboarded: true,
    businessType: 'sole_trader',
    businessTypeConfirmed: true,
    logo: null,
    logoFileName: null,
    companyName: 'Smith & Co Consulting',
    companyNumber: '',
    vatNumber: 'GB123456789',
    eoriNumber: '',
    address: '14 High Street, Westminster',
    postCode: 'SW1A 1AA',
    cisStatus: 'not_applicable',
    cisUtr: '',
  },
  version: 3,
});

import type { Page } from 'playwright';

async function setupLocalStorage(page: Page) {
  // Navigate to a blank page on the same origin so we can set localStorage
  await page.goto(BASE_URL + '/terms'); // lightweight page
  await page.evaluate(
    ({ companyState }: { companyState: string }) => {
      localStorage.setItem('invease-company-details', companyState);
      localStorage.setItem('invease-cookie-consent', 'accepted');
      // Dismiss all first-run hints
      localStorage.setItem('invease-hint-accordion-hint', 'true');
      localStorage.setItem('invease-hint-shortcuts-hint', 'true');
      localStorage.setItem('invease-hint-download-hint', 'true');
      localStorage.setItem('invease-swipe-hint-shown', 'true');
    },
    { companyState: COMPANY_STATE }
  );
}

async function main() {
  const browser = await chromium.launch();

  // --- Desktop screenshots (1280x720) ---
  const desktopCtx = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2,
    colorScheme: 'light',
  });
  const desktopPage = await desktopCtx.newPage();
  await setupLocalStorage(desktopPage);

  // Navigate to main app — should show invoice form (onboarding bypassed)
  await desktopPage.goto(BASE_URL);
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.waitForTimeout(2000);

  await desktopPage.screenshot({
    path: path.join(OUT_DIR, 'desktop-invoice.png'),
    clip: { x: 0, y: 0, width: 1280, height: 720 },
  });
  console.log('Captured: desktop-invoice.png');

  // Click Dashboard tab if visible
  const dashTab = desktopPage.getByRole('tab', { name: /dashboard/i });
  if (await dashTab.isVisible().catch(() => false)) {
    await dashTab.click();
    await desktopPage.waitForTimeout(1500);
  }
  await desktopPage.screenshot({
    path: path.join(OUT_DIR, 'desktop-dashboard.png'),
    clip: { x: 0, y: 0, width: 1280, height: 720 },
  });
  console.log('Captured: desktop-dashboard.png');
  await desktopCtx.close();

  // --- Mobile screenshots (375x812 iPhone viewport) ---
  const mobileCtx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    colorScheme: 'light',
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileCtx.newPage();
  await setupLocalStorage(mobilePage);

  await mobilePage.goto(BASE_URL);
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.waitForTimeout(2000);

  await mobilePage.screenshot({
    path: path.join(OUT_DIR, 'mobile-invoice.png'),
    clip: { x: 0, y: 0, width: 375, height: 500 },
  });
  console.log('Captured: mobile-invoice.png');

  // Click Dashboard tab if visible
  const mobileDash = mobilePage.getByRole('tab', { name: /dashboard/i });
  if (await mobileDash.isVisible().catch(() => false)) {
    await mobileDash.click();
    await mobilePage.waitForTimeout(1500);
  }
  await mobilePage.screenshot({
    path: path.join(OUT_DIR, 'mobile-dashboard.png'),
    clip: { x: 0, y: 0, width: 375, height: 500 },
  });
  console.log('Captured: mobile-dashboard.png');
  await mobileCtx.close();

  await browser.close();
  console.log('\nAll 4 screenshots saved to public/screenshots/');
}

main().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
