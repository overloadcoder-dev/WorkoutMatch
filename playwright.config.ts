import { defineConfig, devices } from '@playwright/test';

const basePath = `${process.env.PUBLIC_BASE_PATH ?? '/'}${
  (process.env.PUBLIC_BASE_PATH ?? '/').endsWith('/') ? '' : '/'
}`;
const previewUrl = `http://127.0.0.1:4321${basePath}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: previewUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
