import { describe, expect, it } from 'vitest';

import {
  EXERCISE_BY_ID,
  EXERCISE_BY_SLUG,
  EXERCISE_DATASET_VERSION,
  EXERCISES,
} from '../../src/data/exercises';
import { exerciseDatasetSchema } from '../../src/lib/validation/exercises';
import { EQUIPMENT_OPTIONS, MOVEMENT_PATTERNS } from '../../src/types/exercise';

describe('authoritative exercise dataset', () => {
  it('contains at least 60 schema-valid, genuinely named entries', () => {
    const parsed = exerciseDatasetSchema.safeParse(EXERCISES);
    expect(parsed.error?.issues).toEqual(undefined);
    expect(EXERCISES.length).toBeGreaterThanOrEqual(60);
    expect(new Set(EXERCISES.map((exercise) => exercise.name)).size).toBe(
      EXERCISES.length,
    );
    expect(EXERCISE_DATASET_VERSION).toMatch(/^\d{4}\.\d{2}\.\d+$/);
  });

  it('has unique IDs and slugs with complete lookup maps', () => {
    const ids = EXERCISES.map((exercise) => exercise.id);
    const slugs = EXERCISES.map((exercise) => exercise.slug);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(EXERCISE_BY_ID.size).toBe(EXERCISES.length);
    expect(EXERCISE_BY_SLUG.size).toBe(EXERCISES.length);
  });

  it('resolves every variation and replacement reference', () => {
    for (const exercise of EXERCISES) {
      const references = [
        ...exercise.easierVariationIds,
        ...exercise.harderVariationIds,
        ...exercise.replacementIds,
      ];
      for (const reference of references) {
        expect(
          EXERCISE_BY_ID.has(reference),
          `${exercise.id} -> ${reference}`,
        ).toBe(true);
        expect(reference).not.toBe(exercise.id);
      }
    }
  });

  it('covers every advertised equipment option and every generator movement pattern', () => {
    for (const equipment of EQUIPMENT_OPTIONS) {
      expect(
        EXERCISES.some((exercise) => exercise.equipment.includes(equipment)),
        equipment,
      ).toBe(true);
    }
    for (const pattern of MOVEMENT_PATTERNS) {
      expect(
        EXERCISES.some((exercise) => exercise.movementPattern === pattern),
        pattern,
      ).toBe(true);
    }
  });

  it('keeps prescriptions complete and aligned to rep mode', () => {
    for (const exercise of EXERCISES) {
      for (const level of ['beginner', 'intermediate', 'advanced'] as const) {
        const prescription = exercise.defaultPrescription[level];
        expect(prescription.mode).toBe(exercise.repMode);
        expect(prescription.sets).toBeGreaterThan(0);
        expect(prescription.restSeconds).toBeGreaterThanOrEqual(0);
      }
      expect(exercise.instructions.length).toBeGreaterThanOrEqual(2);
      expect(exercise.breathing.length).toBeGreaterThan(0);
      expect(exercise.commonMistakes.length).toBeGreaterThan(0);
      expect(exercise.safetyNotes.length).toBeGreaterThan(0);
    }
  });

  it('uses text-only media behavior without invented asset metadata', () => {
    expect(EXERCISES.every((exercise) => exercise.media === undefined)).toBe(
      true,
    );
    expect(EXERCISES.every((exercise) => exercise.reviewed === false)).toBe(
      true,
    );
    expect(EXERCISES.every((exercise) => exercise.sources.length > 0)).toBe(
      true,
    );
  });

  it('rejects duplicate slugs and missing cross-references', () => {
    const duplicate = structuredClone(EXERCISES);
    duplicate[1]!.slug = duplicate[0]!.slug;
    duplicate[1]!.replacementIds = ['ex-does-not-exist'];
    const parsed = exerciseDatasetSchema.safeParse(duplicate);

    expect(parsed.success).toBe(false);
    expect(
      parsed.error?.issues.some((issue) =>
        issue.message.includes('Duplicate exercise slug'),
      ),
    ).toBe(true);
    expect(
      parsed.error?.issues.some((issue) =>
        issue.message.includes('Unknown exercise reference'),
      ),
    ).toBe(true);
  });
});
