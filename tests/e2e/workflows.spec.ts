import { expect, test } from '@playwright/test';
import { sitePath } from './site-path';

test.describe('static navigation and themes', () => {
  test('home exposes the primary paths and persists an explicit theme', async ({
    page,
  }) => {
    await page.goto(sitePath('/'));
    await expect(page).toHaveTitle(/^WorkoutMatch$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Choose what you have',
    );
    await expect(
      page.getByRole('link', { name: 'Build my workout' }),
    ).toHaveAttribute('href', sitePath('/generate/'));
    await page.getByLabel('Theme').selectOption('dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('important home content exists without JavaScript', async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(sitePath('/'));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByText('From constraints to a usable session'),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Exercise library' }).first(),
    ).toBeVisible();
    await context.close();
  });

  test('missing routes render the useful static 404 document', async ({
    page,
  }) => {
    const response = await page.goto(sitePath('/this-route-does-not-exist/'));
    // Astro preview serves the custom 404 document with a real 404 status.
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Page not found',
    );
    await expect(
      page.getByRole('link', { name: 'Build a workout' }).first(),
    ).toBeVisible();
  });
});

test.describe('workout builders', () => {
  test('full generator supports lock, replace, regenerate, and safe share', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(sitePath('/generate/'));
    const form = page.locator('#full-generator-form');
    await form.getByLabel('One dumbbell').check();
    await form.getByLabel('Bodyweight / no equipment').uncheck();
    await form.getByLabel('Quiet').check();
    await form.getByLabel('No jumping').check();
    await form.getByLabel('Deep knee flexion').check();
    await form.getByRole('button', { name: 'Generate workout' }).click();

    const result = page.locator('[data-workout-result]');
    await expect(result).toBeVisible();
    await expect(result.getByRole('heading', { level: 2 })).toContainText(
      '15-minute',
    );
    const cards = result.locator('article[data-item-id]');
    await expect(cards).toHaveCount(await cards.count());
    expect(await cards.count()).toBeGreaterThan(2);

    const firstCard = cards.first();
    const firstItemId = await firstCard.getAttribute('data-item-id');
    await firstCard.getByRole('button', { name: 'Lock' }).click();
    const lockedCard = result.locator(`article[data-item-id="${firstItemId}"]`);
    await expect(
      lockedCard.getByRole('button', { name: 'Unlock' }),
    ).toBeVisible();
    await result.getByRole('button', { name: 'Regenerate unlocked' }).click();
    await expect(
      result.locator(`article[data-item-id="${firstItemId}"]`),
    ).toBeVisible();

    const replaceCard = result
      .locator('article[data-item-id]')
      .filter({
        has: page.getByRole('button', { name: 'Replace', exact: true }),
      })
      .nth(1);
    const previousItemId = await replaceCard.getAttribute('data-item-id');
    await replaceCard
      .getByRole('button', { name: 'Replace', exact: true })
      .click();
    await expect(
      result.locator(`article[data-item-id="${previousItemId}"]`),
    ).toHaveCount(0);

    page.once('dialog', (dialog) => dialog.accept());
    await result.getByRole('button', { name: 'Copy share link' }).click();
    const shared = await page.evaluate(() => navigator.clipboard.readText());
    expect(shared).toContain('/generate/?');
    expect(shared).not.toContain('knee-flexion');
    expect(shared).not.toContain('sensitivity');

    const workoutTitle = await result
      .getByRole('heading', { level: 2 })
      .textContent();
    await result.getByRole('button', { name: 'Save locally' }).click();
    await expect(result.locator('[data-result-status]')).toContainText(
      'saved in this browser',
    );
    await page.goto(sitePath('/my-progress/'));
    await expect(
      page.locator('#saved-plans-list').getByRole('heading', { level: 3 }),
    ).toHaveText(workoutTitle ?? '');
  });

  test('quick generator uses the shared engine and creates a workout', async ({
    page,
  }) => {
    await page.goto(sitePath('/quick-workout/'));
    await page.locator('#quick-generator-form').getByLabel('10 min').check();
    await page
      .locator('#quick-generator-form')
      .getByLabel('No jumping')
      .check();
    await page.getByRole('button', { name: 'Generate workout' }).click();
    await expect(page.locator('[data-workout-result]')).toBeVisible();
    await expect(page.locator('[data-workout-title]')).toContainText(
      '10-minute',
    );
    const result = page.locator('[data-workout-result]');
    const firstSeed = await result.getAttribute('data-workout-seed');
    await page.getByRole('button', { name: 'Generate workout' }).click();
    await expect(result).not.toHaveAttribute(
      'data-workout-seed',
      firstSeed ?? '',
    );
  });

  test('impossible constraints return an actionable error', async ({
    page,
  }) => {
    await page.goto(sitePath('/generate/'));
    const form = page.locator('#full-generator-form');
    await form.getByLabel('Resistance band').check();
    await form.getByLabel('Bodyweight / no equipment').uncheck();
    await form.getByLabel('Standing only').check();
    await form.getByLabel('Quiet').check();
    await form.getByLabel('Wrist-loading movements').check();
    await form.getByLabel('Deep knee flexion').check();
    await form.getByLabel('Overhead shoulder work').check();
    await form.getByLabel('Higher lower-back loading').check();
    await form.getByLabel('Frequent floor transitions').check();
    await form.getByLabel('Muscle focus').selectOption('core');
    await form.getByRole('button', { name: 'Generate workout' }).click();
    const summary = form.locator('[data-error-summary]');
    await expect(summary).toBeVisible();
    await expect(summary).toContainText(/No exercises|could not|match/i);
    await expect(summary.locator('li')).not.toHaveCount(0);
  });
});

test.describe('calculators', () => {
  test('BMI validates, calculates, and resets', async ({ page }) => {
    await page.goto(sitePath('/calculators/bmi/'));
    await page.getByRole('button', { name: 'Calculate BMI' }).click();
    await expect(page.locator('[data-error-summary]')).toBeVisible();
    await page.getByLabel('Weight in kilograms').fill('70');
    await page.getByLabel('Height in centimetres').fill('175');
    await page.getByRole('button', { name: 'Calculate BMI' }).click();
    await expect(page.locator('#bmi-result')).toBeVisible();
    await expect(page.locator('[data-bmi-value]')).toHaveText('22.9');
    await expect(page.locator('[data-bmi-category]')).toHaveText(
      'Healthy weight',
    );
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.locator('#bmi-result')).toBeHidden();
  });

  test('TDEE shows the formula and neighboring-factor range', async ({
    page,
  }) => {
    await page.goto(sitePath('/calculators/tdee/'));
    await page.getByLabel('Weight in kilograms').fill('70');
    await page.getByLabel('Height in centimetres').fill('175');
    await page.getByLabel('Age in years').fill('35');
    await page.getByLabel('Mifflin–St Jeor equation').selectOption('male');
    await page.getByLabel('Activity level').selectOption('moderately-active');
    await page.getByRole('button', { name: 'Estimate TDEE' }).click();
    await expect(page.locator('#tdee-result')).toBeVisible();
    await expect(page.locator('[data-tdee-formula]')).toContainText('× 1.55');
    await expect(page.getByText('Activity uncertainty range:')).toBeVisible();
  });
});

test.describe('exercise library', () => {
  test('search, filters, URL restoration, empty state, and clear all work', async ({
    page,
  }) => {
    await page.goto(
      sitePath('/exercises/?q=squat&equipment=none&difficulty=beginner'),
    );
    await expect(page.getByLabel('Search the library')).toHaveValue('squat');
    await expect(page.getByLabel('Equipment')).toHaveValue('none');
    await expect(page.getByLabel('Difficulty')).toHaveValue('beginner');
    const visibleCards = page.locator('[data-exercise-card]:visible');
    expect(await visibleCards.count()).toBeGreaterThan(0);
    await page
      .getByLabel('Search the library')
      .fill('definitely not an exercise');
    await expect(page.locator('[data-exercise-empty]')).toBeVisible();
    await page.locator('[data-empty-clear]').click();
    await expect(page.locator('[data-exercise-empty]')).toBeHidden();
    await expect(page.locator('[data-exercise-card]:visible')).toHaveCount(77);
  });

  test('detail pages contain static guidance without JavaScript', async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(sitePath('/exercises/bodyweight-squat/'));
    await expect(
      page.getByRole('heading', { level: 1, name: 'Bodyweight squat' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'How to do Bodyweight Squat' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Common mistakes' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Safety notes' }),
    ).toBeVisible();
    await context.close();
  });
});

test.describe('local progress and guided mode', () => {
  test('progress supports strict import preview, merge, export, and clear', async ({
    page,
    context,
  }) => {
    await page.goto(sitePath('/my-progress/'));
    await expect(page.locator('#progress-dashboard')).toBeVisible();
    const exportPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export JSON' }).click();
    const download = await exportPromise;
    expect(download.suggestedFilename()).toMatch(
      /^workoutmatch-data-\d{4}-\d{2}-\d{2}\.json$/,
    );

    const payload = JSON.stringify({
      format: 'workoutmatch-local-data',
      schemaVersion: 2,
      exportedAt: '2026-08-12T12:00:00.000Z',
      workouts: [],
      savedPlans: [],
      preferences: null,
    });
    await page.locator('#import-file').setInputFiles({
      name: 'backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(payload),
    });
    const dialog = page.locator('#import-dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Import data' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.locator('#data-action-status')).toContainText(
      'Import complete',
    );

    await page.evaluate(() => {
      localStorage.setItem('wm-theme', 'dark');
      localStorage.setItem('wm-units', 'imperial');
      localStorage.setItem('wm-guided-workout', '{"private":"session"}');
      localStorage.setItem('wm-guided-session', '{"private":"state"}');
    });
    page.once('dialog', (nativeDialog) => nativeDialog.accept());
    await page.getByRole('button', { name: 'Clear all data' }).click();
    await expect(page.locator('#data-action-status')).toContainText('cleared');
    expect(
      await page.evaluate(() =>
        ['wm-theme', 'wm-units', 'wm-guided-workout', 'wm-guided-session'].map(
          (key) => localStorage.getItem(key),
        ),
      ),
    ).toEqual([null, null, null, null]);
    await context.clearPermissions();
  });

  test('upgrades version 1 IndexedDB records in place', async ({ page }) => {
    await page.goto(sitePath('/'));
    await page.evaluate(async () => {
      await new Promise<void>((resolve, reject) => {
        const deletion = indexedDB.deleteDatabase('workoutmatch');
        deletion.onsuccess = () => resolve();
        deletion.onerror = () => reject(deletion.error);
      });
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('workoutmatch', 1);
        request.onupgradeneeded = () => {
          const database = request.result;
          const workouts = database.createObjectStore('workouts', {
            keyPath: 'id',
          });
          const plans = database.createObjectStore('savedPlans', {
            keyPath: 'id',
          });
          workouts.put({
            id: 'legacy-workout',
            workoutId: 'generated:legacy',
            workoutVersion: 'generator-v1',
            title: 'Legacy workout',
            completedAt: '2026-08-12T08:00:00.000Z',
            durationSeconds: 600,
            status: 'completed',
            exercises: [
              {
                exerciseId: 'bodyweight-squat',
                name: 'Bodyweight squat',
                status: 'completed',
                sets: [{ setNumber: 1, reps: 10 }],
              },
            ],
          });
          plans.put({
            id: 'legacy-plan',
            title: 'Legacy plan',
            generatorVersion: 'generator-v1',
            seed: 'legacy-seed',
            durationMinutes: 10,
            equipment: ['none'],
            createdAt: '2026-08-12T08:00:00.000Z',
            exercises: [
              {
                exerciseId: 'bodyweight-squat',
                name: 'Bodyweight squat',
                phase: 'main',
                order: 0,
                sets: 1,
                reps: '10',
                restSeconds: 30,
              },
            ],
          });
        };
        request.onsuccess = () => {
          request.result.close();
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    });

    await page.goto(sitePath('/my-progress/'));
    await expect(page.locator('#progress-dashboard')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Legacy workout' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Legacy plan' }),
    ).toBeVisible();
  });

  test('guided mode starts, pauses, skips, and confirms ending', async ({
    page,
  }) => {
    await page.goto(sitePath('/quick-workout/'));
    await page.getByRole('button', { name: 'Generate workout' }).click();
    await page
      .locator('[data-workout-result]')
      .getByRole('button', { name: 'Start guided mode' })
      .click();
    await expect(page).toHaveURL(/\/workout\/player\/$/);
    await expect(page.locator('#guided-player')).toBeVisible();
    const primaryControl = page
      .locator('#guided-player')
      .locator('[data-start]');
    await primaryControl.click();
    await expect(primaryControl).toHaveText('Pause');
    await page.keyboard.press('Space');
    await expect(primaryControl).toHaveText('Resume');
    await page.reload();
    await expect(page.locator('#resume-dialog')).toBeVisible();
    await page
      .locator('#resume-dialog')
      .getByRole('button', { name: 'Resume where I left off' })
      .click();
    await expect(page.locator('[data-player-status]')).toContainText(
      'Recovered session paused',
    );
    await page
      .locator('#guided-player')
      .getByRole('button', { name: 'Skip exercise' })
      .click();
    await expect(page.locator('[data-player-status]')).toContainText('skipped');
    await page
      .locator('#guided-player')
      .getByRole('button', { name: 'End workout' })
      .click();
    await expect(page.locator('#end-dialog')).toBeVisible();
    await page
      .locator('#end-dialog')
      .getByRole('button', { name: 'Keep going' })
      .click();
    await expect(page.locator('#end-dialog')).toBeHidden();
    await page
      .locator('#guided-player')
      .getByRole('button', { name: 'End workout' })
      .click();
    await page
      .locator('#end-dialog')
      .getByRole('button', { name: 'End workout' })
      .click();
    const completion = page.locator('#completion-summary');
    await expect(completion).toBeVisible();
    await completion
      .getByRole('button', { name: 'Save completion locally' })
      .click();
    await expect(completion.locator('[data-save-status]')).toContainText(
      'saved in this browser',
    );
    await completion.getByRole('link', { name: 'View my progress' }).click();
    const history = page.locator('#history-list');
    await expect(history.getByRole('heading', { level: 3 })).toHaveCount(1);
    await history.getByText('Exercise details').click();
    await expect(history.locator('.exercise-log')).toBeVisible();
  });
});
