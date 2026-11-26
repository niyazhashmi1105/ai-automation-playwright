import { defineConfig, devices, type Project, type ReporterDescription } from '@playwright/test';
import { env } from './config/env';
import { STORAGE_STATE, TEST_ID_ATTR, TIMEOUTS } from './config/constants';

const reporters: ReporterDescription[] = env.isCI
  ? [['list'], ['blob'], ['junit', { outputFile: 'junit/results.xml' }], ['github']]
  : [['list'], ['html', { open: 'never' }]];

const webProject = (name: string, device: (typeof devices)[string]): Project => ({
  name,
  testDir: './tests/web',
  dependencies: ['setup'],
  use: { ...device, baseURL: env.webBaseUrl, storageState: STORAGE_STATE },
});

const extraBrowsers: Project[] = env.extraBrowsers
  ? [webProject('web-firefox', devices['Desktop Firefox']), webProject('web-mobile', devices['Pixel 7'])]
  : [];

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: env.isCI,
  retries: env.isCI ? 2 : 0,
  workers: env.isCI ? 2 : undefined,
  timeout: TIMEOUTS.test,
  expect: { timeout: TIMEOUTS.expect },
  reporter: reporters,
  use: {
    testIdAttribute: TEST_ID_ATTR,
    actionTimeout: TIMEOUTS.action,
    navigationTimeout: TIMEOUTS.navigation,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testDir: './tests/setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: env.webBaseUrl },
    },
    webProject('web-chromium', devices['Desktop Chrome']),
    ...extraBrowsers,
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: env.apiBaseUrl },
    },
  ],
});
