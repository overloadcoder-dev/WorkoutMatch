import { expect, test } from '@playwright/test';

test('representative pages run without console or page errors', async ({
  page,
}) => {
  const issues: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') issues.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => issues.push(`page: ${error.message}`));

  for (const path of [
    '/',
    '/generate/',
    '/exercises/',
    '/calculators/bmi/',
    '/my-progress/',
  ]) {
    await page.goto(path);
    if (path === '/generate/') {
      await page.getByRole('button', { name: 'Generate workout' }).click();
      await expect(page.locator('[data-workout-result]')).toBeVisible();
    }
  }

  expect(issues).toEqual([]);
});

test('key routes reflow without horizontal page overflow at 320 CSS pixels', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 800 },
  });
  const page = await context.newPage();

  for (const path of [
    '/',
    '/generate/',
    '/exercises/',
    '/workouts/',
    '/my-progress/',
  ]) {
    await page.goto(path);
    if (path === '/generate/') {
      await page.getByRole('button', { name: 'Generate workout' }).click();
      await expect(page.locator('[data-workout-result]')).toBeVisible();
    }
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow, `${path} overflowed by ${overflow}px`).toBeLessThanOrEqual(
      1,
    );
  }

  await context.close();
});
