import {resolve} from 'node:path';
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.browsers');
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: 'tests', testMatch: ['*.spec.ts'], timeout: 45_000, retries: 0, workers: 1,
  use: { ...devices['Desktop Chrome'], launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}, baseURL: 'http://127.0.0.1:4209', viewport: {width: 1440, height: 900}, video: 'on', screenshot: 'on' },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:4209', reuseExistingServer: !process.env.CI, timeout: 90_000 },
  outputDir: process.env.DEMO_RECORDING ? 'artifacts/playwright/demo' : 'artifacts/playwright/e2e', reporter: [['list']],
});
