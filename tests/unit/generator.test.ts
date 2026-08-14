import { describe, expect, it } from 'vitest';

import { EXERCISES } from '../../src/data/exercises';
import {
  buildSafeShareQuery,
  filterExercises,
  generateWorkout,
  normalizeGeneratorInput,
  parseSafeShareQuery,
  regenerateWorkout,
  replaceExercise,
  setExerciseLock,
  shareQueryOmitsPrivatePreferences,
  validateGeneratedWorkout,
} from '../../src/lib/generator';
import type { GeneratedWorkout, GeneratorInput } from '../../src/types/workout';

const baseInput: GeneratorInput = {
  goal: 'general-fitness',
  experience: 'beginner',
  durationMinutes: 20,
  equipment: ['none'],
  focus: 'full-body',
  environment: {
    space: 'medium',
    quiet: false,
    noJump: false,
    standingOnly: false,
    noFloor: false,
  },
  avoidStressTags: [],
};

const mustGenerate = (
  input: unknown = baseInput,
  seed: string | number = 'unit-seed',
): GeneratedWorkout => {
  const result = generateWorkout(input, { seed });
  expect(
    result.ok,
    !result.ok ? JSON.stringify(result.issue, null, 2) : undefined,
  ).toBe(true);
  if (!result.ok) throw new Error(result.issue.message);
  return result.workout;
};

const items = (workout: GeneratedWorkout) =>
  Object.values(workout.sections).flatMap((section) => section.exercises);

describe('generator input normalization', () => {
  it('normalizes defaults, duration strings, order, and redundant none equipment', () => {
    const result = normalizeGeneratorInput({
      duration: '15',
      equipment: ['two-dumbbells', 'none', 'resistance-band', 'two-dumbbells'],
      focus: 'full-body',
      environment: { standingOnly: false },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.input.durationMinutes).toBe(15);
    expect(result.input.goal).toBe('general-fitness');
    expect(result.input.experience).toBe('beginner');
    expect(result.input.equipment).toEqual([
      'two-dumbbells',
      'resistance-band',
    ]);
    expect(result.input.environment.space).toBe('medium');
  });

  it('returns useful validation messages for invalid values', () => {
    const result = normalizeGeneratorInput({
      ...baseInput,
      durationMinutes: 12,
      equipment: [],
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issue.code).toBe('invalid-input');
    expect(result.issue.reasons.join(' ')).toContain('durationMinutes');
    expect(result.issue.suggestions.length).toBeGreaterThan(0);
  });
});

describe('constraint filtering', () => {
  const normalized = (
    overrides: Partial<GeneratorInput>,
  ): ReturnType<typeof normalizeGeneratorInput> =>
    normalizeGeneratorInput({ ...baseInput, ...overrides });

  it('allows bodyweight with any selection and distinguishes one from two dumbbells', () => {
    const oneResult = normalized({ equipment: ['one-dumbbell'] });
    const twoResult = normalized({ equipment: ['two-dumbbells'] });
    expect(oneResult.ok && twoResult.ok).toBe(true);
    if (!oneResult.ok || !twoResult.ok) return;
    const onePool = filterExercises(oneResult.input);
    const twoPool = filterExercises(twoResult.input);

    expect(
      onePool.some((exercise) => exercise.equipment.includes('none')),
    ).toBe(true);
    expect(
      onePool.some((exercise) => exercise.equipment.includes('one-dumbbell')),
    ).toBe(true);
    expect(
      onePool.some((exercise) => exercise.equipment.includes('two-dumbbells')),
    ).toBe(false);
    expect(
      twoPool.some((exercise) => exercise.equipment.includes('one-dumbbell')),
    ).toBe(true);
    expect(
      twoPool.some((exercise) => exercise.equipment.includes('two-dumbbells')),
    ).toBe(true);
  });

  it('enforces quiet, no-jump, standing/no-floor, difficulty, space, and stress filters', () => {
    const result = normalizeGeneratorInput({
      ...baseInput,
      experience: 'beginner',
      environment: {
        space: 'very-small',
        quiet: true,
        noJump: true,
        standingOnly: true,
        noFloor: true,
      },
      avoidStressTags: ['wrist-load', 'shoulder-overhead'],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const pool = filterExercises(result.input);
    expect(pool.length).toBeGreaterThan(0);
    for (const exercise of pool) {
      expect(exercise.noise).toBe('quiet');
      expect(exercise.impact).not.toBe('high');
      expect(exercise.position).toBe('standing');
      expect(exercise.space).toBe('very-small');
      expect(exercise.difficulty).toBe('beginner');
      expect(exercise.stressTags).not.toContain('wrist-load');
      expect(exercise.stressTags).not.toContain('shoulder-overhead');
    }
  });
});

describe('deterministic balanced generation', () => {
  it('returns byte-for-byte equivalent workouts for the same normalized input and seed', () => {
    const first = mustGenerate(baseInput, 'same');
    const second = mustGenerate(
      { ...baseInput, equipment: ['none', 'none'] },
      'same',
    );
    expect(second).toEqual(first);
  });

  it('fills the full-body pattern checklist at sufficient duration', () => {
    const workout = mustGenerate({
      ...baseInput,
      experience: 'intermediate',
      equipment: ['two-dumbbells', 'resistance-band'],
      durationMinutes: 30,
    });
    const patterns = workout.sections.main.exercises.map(
      (item) => item.exercise.movementPattern,
    );
    expect(patterns).toContain('knee-dominant');
    expect(patterns).toContain('hip-dominant');
    expect(patterns).toContain('push');
    expect(patterns).toContain('pull');
    expect(
      patterns.some((pattern) => pattern === 'core' || pattern === 'carry'),
    ).toBe(true);
  });

  it('prevents duplicate exercises and excessive primary-muscle repetition', () => {
    const workout = mustGenerate({
      ...baseInput,
      experience: 'advanced',
      equipment: ['two-dumbbells', 'resistance-band', 'pull-up-bar'],
      durationMinutes: 45,
    });
    const selected = items(workout);
    expect(new Set(selected.map((item) => item.exerciseId)).size).toBe(
      selected.length,
    );
    const main = workout.sections.main.exercises;
    const primaryCounts = new Map<string, number>();
    for (const item of main) {
      for (const muscle of item.exercise.primaryMuscles) {
        primaryCounts.set(muscle, (primaryCounts.get(muscle) ?? 0) + 1);
      }
    }
    expect(Math.max(...primaryCounts.values())).toBeLessThanOrEqual(2);
  });

  it('keeps warm-up, main, and cooldown inside and reasonably near requested duration', () => {
    for (const durationMinutes of [5, 10, 15, 20, 30, 45] as const) {
      const workout = mustGenerate(
        { ...baseInput, durationMinutes },
        `duration-${durationMinutes}`,
      );
      expect(workout.sections.warmup.exercises.length).toBeGreaterThan(0);
      expect(workout.sections.main.exercises.length).toBeGreaterThan(0);
      expect(workout.sections.cooldown.exercises.length).toBeGreaterThan(0);
      expect(workout.estimatedDurationSeconds).toBeLessThanOrEqual(
        durationMinutes * 60 + 5,
      );
      expect(workout.estimatedDurationSeconds).toBeGreaterThanOrEqual(
        durationMinutes * 60 * 0.65,
      );
      expect(validateGeneratedWorkout(workout)).toEqual([]);
    }
  });

  it('never violates one-dumbbell, quiet, no-jump, or no-floor output constraints', () => {
    const workout = mustGenerate({
      ...baseInput,
      equipment: ['one-dumbbell'],
      experience: 'intermediate',
      environment: {
        space: 'small',
        quiet: true,
        noJump: true,
        standingOnly: false,
        noFloor: true,
      },
    });
    for (const item of items(workout)) {
      expect(item.exercise.equipment).not.toContain('two-dumbbells');
      expect(item.exercise.position).toBe('standing');
      expect(item.exercise.noise).toBe('quiet');
      expect(item.exercise.impact).not.toBe('high');
    }
  });

  it.each([
    'none',
    'one-dumbbell',
    'two-dumbbells',
    'resistance-band',
    'chair-or-bench',
    'pull-up-bar',
  ] as const)(
    'builds a practical workout when %s is the only selected equipment',
    (equipment) => {
      const workout = mustGenerate(
        {
          ...baseInput,
          equipment: [equipment],
          experience: 'intermediate',
          durationMinutes: 15,
        },
        `equipment-${equipment}`,
      );
      expect(workout.sections.main.exercises.length).toBe(5);
      for (const item of items(workout)) {
        const requirement = item.exercise.equipment[0];
        expect(
          requirement === 'none' ||
            requirement === equipment ||
            (requirement === 'one-dumbbell' && equipment === 'two-dumbbells'),
        ).toBe(true);
      }
    },
  );

  it.each([
    ['quiet', { quiet: true }],
    ['no jumping', { noJump: true }],
    ['very small space', { space: 'very-small' as const }],
    ['standing only', { standingOnly: true }],
    ['no floor', { noFloor: true }],
  ] as const)(
    'builds a balanced no-equipment workout with the %s preference',
    (label, override) => {
      const workout = mustGenerate(
        {
          ...baseInput,
          experience: 'intermediate',
          durationMinutes: 15,
          environment: { ...baseInput.environment, ...override },
        },
        `environment-${label}`,
      );
      expect(validateGeneratedWorkout(workout)).toEqual([]);
    },
  );
});

describe('lock, regenerate, and replace operations', () => {
  it('keeps locked exercises while regenerating unlocked slots', () => {
    const original = mustGenerate(
      {
        ...baseInput,
        equipment: ['two-dumbbells', 'resistance-band'],
        experience: 'intermediate',
      },
      'original',
    );
    const lockedItem = original.sections.main.exercises[0]!;
    const locked = setExerciseLock(original, lockedItem.itemId, true);
    expect(locked.ok).toBe(true);
    if (!locked.ok) return;

    const regenerated = regenerateWorkout(locked.workout, { seed: 'new-seed' });
    expect(regenerated.ok).toBe(true);
    if (!regenerated.ok) return;
    const sameSlot = regenerated.workout.sections.main.exercises.find(
      (item) => item.slotId === lockedItem.slotId,
    );
    expect(sameSlot?.exerciseId).toBe(lockedItem.exerciseId);
    expect(sameSlot?.locked).toBe(true);
    const oldUnlocked = new Map(
      locked.workout.sections.main.exercises
        .filter((item) => !item.locked)
        .map((item) => [item.slotId, item.exerciseId]),
    );
    expect(
      regenerated.workout.sections.main.exercises.some(
        (item) =>
          !item.locked && oldUnlocked.get(item.slotId) !== item.exerciseId,
      ),
    ).toBe(true);
  });

  it('replaces within the same slot without duplicating the session', () => {
    const original = mustGenerate(
      {
        ...baseInput,
        equipment: ['two-dumbbells', 'resistance-band'],
        experience: 'intermediate',
      },
      'replace-source',
    );
    const target = original.sections.main.exercises[0]!;
    const result = replaceExercise(original, target.itemId, {
      seed: 'replacement',
    });
    expect(
      result.ok,
      !result.ok ? JSON.stringify(result.issue) : undefined,
    ).toBe(true);
    if (!result.ok) return;
    const replacement = result.workout.sections.main.exercises.find(
      (item) => item.slotId === target.slotId,
    )!;
    expect(replacement.exerciseId).not.toBe(target.exerciseId);
    expect(replacement.exercise.movementPattern).toBe(
      target.exercise.movementPattern,
    );
    expect(
      new Set(items(result.workout).map((item) => item.exerciseId)).size,
    ).toBe(items(result.workout).length);
  });

  it('returns an actionable error instead of replacing a locked item', () => {
    const original = mustGenerate(baseInput, 'locked-replace');
    const target = original.sections.main.exercises[0]!;
    const locked = setExerciseLock(original, target.itemId, true);
    if (!locked.ok) throw new Error('Lock failed');
    const result = replaceExercise(locked.workout, target.itemId);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issue.code).toBe('invalid-lock');
    expect(result.issue.suggestions[0]).toMatch(/Unlock/);
  });
});

describe('impossible states and privacy-safe sharing', () => {
  it('explains impossible constraints and suggests a specific relaxation', () => {
    const result = generateWorkout(
      {
        ...baseInput,
        durationMinutes: 45,
        focus: 'chest',
        environment: {
          space: 'very-small',
          quiet: true,
          noJump: true,
          standingOnly: true,
          noFloor: true,
        },
        avoidStressTags: [
          'wrist-load',
          'knee-flexion',
          'shoulder-overhead',
          'lower-back-load',
          'floor-transition',
        ],
      },
      { seed: 'impossible' },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issue.code).toBe('impossible-constraints');
    expect(result.issue.reasons.length).toBeGreaterThan(0);
    expect(
      result.issue.suggestions.some((suggestion) =>
        suggestion.includes('standing only'),
      ),
    ).toBe(true);
    expect(
      result.issue.suggestions.some((suggestion) =>
        suggestion.includes('resistance band'),
      ),
    ).toBe(true);
  });

  it('serializes only the explicit allowlist and excludes sensitivities', () => {
    const workout = mustGenerate({
      ...baseInput,
      equipment: ['resistance-band'],
      avoidStressTags: ['wrist-load', 'floor-transition'],
    });
    expect(shareQueryOmitsPrivatePreferences(workout.input)).toBe(true);
    const query = buildSafeShareQuery(workout);
    expect(query).not.toContain('wrist');
    expect(query).not.toContain('floor-transition');
    expect(query).not.toContain('sensitiv');
    const keys = [...new URLSearchParams(query).keys()];
    expect(keys).toEqual(
      expect.arrayContaining([
        'v',
        'dataset',
        'seed',
        'duration',
        'equipment',
        'focus',
        'level',
        'goal',
        'space',
      ]),
    );

    const parsed = parseSafeShareQuery(
      `${query}&sensitivities=wrist-load&name=private`,
    );
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.input.avoidStressTags).toEqual([]);
    expect(parsed.value.input.durationMinutes).toBe(
      workout.input.durationMinutes,
    );
  });

  it('rejects unsupported generator and dataset versions', () => {
    const wrongGenerator = parseSafeShareQuery(
      'v=wm999&duration=15&equipment=none',
    );
    expect(wrongGenerator.ok).toBe(false);

    const wrongDataset = parseSafeShareQuery(
      'v=wm1&dataset=1900.01.1&duration=15&equipment=none',
    );
    expect(wrongDataset.ok).toBe(false);
  });
});

describe('dataset integration smoke coverage', () => {
  it('can consider every source entry without mutating the authoritative array', () => {
    const snapshot = JSON.stringify(EXERCISES);
    for (const focus of [
      'full-body',
      'upper-body',
      'lower-body',
      'core',
      'arms',
      'chest',
      'back',
      'shoulders',
      'glutes',
    ] as const) {
      const result = generateWorkout(
        {
          ...baseInput,
          focus,
          experience: 'advanced',
          equipment: [
            'two-dumbbells',
            'resistance-band',
            'chair-or-bench',
            'pull-up-bar',
          ],
          durationMinutes: 15,
        },
        { seed: `focus-${focus}` },
      );
      expect(result.ok, !result.ok ? JSON.stringify(result.issue) : focus).toBe(
        true,
      );
    }
    expect(JSON.stringify(EXERCISES)).toBe(snapshot);
  });
});
