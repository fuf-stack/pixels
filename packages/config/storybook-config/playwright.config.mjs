import { defineConfig } from '@playwright/test';

if (process.platform !== 'linux' || process.arch !== 'arm64') {
  throw new Error(
    'Visual baselines require Linux arm64, use pnpm test:visual:docker',
  );
}

export default defineConfig({
  testDir: './visual',
  testMatch: 'stories.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  outputDir: './test-results/visual',
  snapshotPathTemplate: '{testDir}/../../../{arg}{ext}',
  updateSnapshots: 'none',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixels: 0,
    },
  },
  use: {
    baseURL: 'http://127.0.0.1:6008',
    browserName: 'chromium',
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    locale: 'en-GB',
    timezoneId: 'UTC',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'light', use: { colorScheme: 'light' } },
    { name: 'dark', use: { colorScheme: 'dark' } },
  ],
  webServer: {
    command: 'node visual/serve.mjs',
    url: 'http://127.0.0.1:6008/iframe.html',
    reuseExistingServer: false,
  },
});
