import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const scan = async (page: Page) => {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    results.violations,
    JSON.stringify(results.violations, null, 2),
  ).toEqual([]);
};

test('@a11y home page', async ({ page }) => {
  await page.goto('/');
  await scan(page);
});

test('@a11y generator form and result', async ({ page }) => {
  await page.goto('/generate/');
  await scan(page);
  await page.getByRole('button', { name: 'Generate workout' }).click();
  await expect(page.locator('[data-workout-result]')).toBeVisible();
  await scan(page);
});

test('@a11y BMI calculator', async ({ page }) => {
  await page.goto('/calculators/bmi/');
  await page.getByLabel('Weight in kilograms').fill('70');
  await page.getByLabel('Height in centimetres').fill('175');
  await page.getByRole('button', { name: 'Calculate BMI' }).click();
  await scan(page);
});

test('@a11y exercise index and detail', async ({ page }) => {
  await page.goto('/exercises/');
  await scan(page);
  await page.goto('/exercises/bodyweight-squat/');
  await scan(page);
});

test('@a11y progress page', async ({ page }) => {
  await page.goto('/my-progress/');
  await expect(page.locator('#progress-dashboard')).toBeVisible();
  await scan(page);
});

test('@a11y guided mode', async ({ page }) => {
  await page.goto('/quick-workout/');
  await page.getByRole('button', { name: 'Generate workout' }).click();
  await page
    .locator('[data-workout-result]')
    .getByRole('button', { name: 'Start guided mode' })
    .click();
  await expect(page.locator('#guided-player')).toBeVisible();
  await scan(page);
});
