import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

/**
 * Playwright E2E Test Configuration
 *
 * Local dev: Desktop Chrome only (~54 tests, fast)
 * CI: Full 17-project matrix (~918 tests, comprehensive)
 *
 * To run the full matrix locally: CI=1 npx playwright test
 * To run a specific project: npx playwright test --project="iPhone 14"
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: isCI,
  /* Retry on CI only */
  retries: isCI ? 2 : 0,
  /* Opt out of parallel tests on CI */
  workers: isCI ? 1 : undefined,
  /* Reporter to use */
  reporter: [
    ['html'],
    ['list'],
    // JSON report for CI integration
    ...(isCI ? [['json', { outputFile: 'test-results/results.json' }] as const] : []),
  ],
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:3000',
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    /* Video on failure for debugging */
    video: 'on-first-retry',
  },

  /* Local dev: Chrome only. CI: full browser/device matrix */
  projects: [
    // ===== DESKTOP BROWSERS =====
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    // ===== CI-ONLY: Full browser/device matrix =====
    ...(isCI ? [
      {
        name: 'Desktop Firefox',
        use: { ...devices['Desktop Firefox'] },
      },
      {
        name: 'Desktop Safari',
        use: { ...devices['Desktop Safari'] },
      },
      {
        name: 'Desktop Edge',
        use: { ...devices['Desktop Edge'] },
      },

      // ===== iOS DEVICES (iPhone 12 and newer, 2020+) =====
      {
        name: 'iPhone 12',
        use: { ...devices['iPhone 12'] },
      },
      {
        name: 'iPhone 13',
        use: { ...devices['iPhone 13'] },
      },
      {
        name: 'iPhone 14',
        use: { ...devices['iPhone 14'] },
      },
      {
        name: 'iPhone 15',
        use: { ...devices['iPhone 15'] },
      },
      {
        name: 'iPhone SE (3rd gen)',
        use: { ...devices['iPhone SE'] },
      },

      // ===== iPAD DEVICES =====
      {
        name: 'iPad Pro 11',
        use: { ...devices['iPad Pro 11'] },
      },
      {
        name: 'iPad Mini',
        use: { ...devices['iPad Mini'] },
      },

      // ===== ANDROID DEVICES (2019+) =====
      {
        name: 'Pixel 5',
        use: { ...devices['Pixel 5'] },
      },
      {
        name: 'Pixel 7',
        use: { ...devices['Pixel 7'] },
      },
      {
        name: 'Galaxy S20',
        use: {
          ...devices['Galaxy S9+'],
          viewport: { width: 412, height: 915 },
          deviceScaleFactor: 3.5,
          userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        },
      },
      {
        name: 'Galaxy S23',
        use: {
          ...devices['Galaxy S9+'],
          viewport: { width: 412, height: 915 },
          deviceScaleFactor: 3,
          userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        },
      },

      // ===== ACCESSIBILITY =====
      {
        name: 'Desktop Chrome (Reduced Motion)',
        use: {
          ...devices['Desktop Chrome'],
          contextOptions: {
            reducedMotion: 'reduce' as const,
          },
        },
      },
      {
        name: 'iPhone 14 (Dark Mode)',
        use: {
          ...devices['iPhone 14'],
          colorScheme: 'dark' as const,
        },
      },
    ] : []),
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.env.CI ? 'npm start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes for server startup
  },
});
