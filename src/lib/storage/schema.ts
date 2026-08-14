import { z } from '../validation/zod';

import {
  LOCAL_DATA_SCHEMA_VERSION,
  WORKOUTMATCH_EXPORT_FORMAT,
  type CompletedWorkoutRecord,
  type LocalDataExport,
  type LocalDataSnapshot,
  type SavedWorkoutPlan,
  type UserPreferences,
} from '../../types/storage';

const MAX_ID_LENGTH = 120;
const MAX_TITLE_LENGTH = 160;
const MAX_WORKOUTS = 5_000;
const MAX_SAVED_PLANS = 500;
const MAX_EXERCISES_PER_WORKOUT = 200;
const SAFE_TOKEN = /^[a-zA-Z0-9][a-zA-Z0-9._:~-]*$/;

const ISO_DATE_TIME =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;

const isoDateTimeSchema = z
  .string()
  .max(40)
  .regex(ISO_DATE_TIME, 'Expected an ISO date-time string with a time zone.')
  .refine((value) => Number.isFinite(Date.parse(value)), {
    message: 'Expected a valid date and time.',
  });

const idSchema = z
  .string()
  .min(1)
  .max(MAX_ID_LENGTH)
  .regex(SAFE_TOKEN, 'Expected a safe identifier.');
const titleSchema = z.string().trim().min(1).max(MAX_TITLE_LENGTH);

const loggedSetSchema = z
  .object({
    setNumber: z.number().int().min(1).max(100),
    reps: z.number().int().min(0).max(10_000).optional(),
    durationSeconds: z.number().int().min(0).max(86_400).optional(),
    weight: z
      .object({
        value: z.number().finite().min(0).max(2_000),
        unit: z.enum(['kg', 'lb']),
      })
      .strict()
      .optional(),
  })
  .strict();

const completedExerciseSchema = z
  .object({
    exerciseId: idSchema,
    name: z.string().trim().min(1).max(120),
    status: z.enum(['completed', 'skipped']),
    sets: z.array(loggedSetSchema).max(100),
  })
  .strict();

export const completedWorkoutSchema = z
  .object({
    id: idSchema,
    workoutId: idSchema,
    workoutVersion: z
      .string()
      .min(1)
      .max(40)
      .regex(SAFE_TOKEN, 'Expected a safe workout version.'),
    title: titleSchema,
    completedAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
    durationSeconds: z.number().int().min(0).max(86_400),
    status: z.enum(['completed', 'ended-early']),
    exercises: z
      .array(completedExerciseSchema)
      .min(1)
      .max(MAX_EXERCISES_PER_WORKOUT),
  })
  .strict();

const savedPlanExerciseSchema = z
  .object({
    exerciseId: idSchema,
    name: z.string().trim().min(1).max(120),
    phase: z.enum(['warmup', 'main', 'cooldown']),
    order: z.number().int().min(0).max(500),
    sets: z.number().int().min(1).max(100).optional(),
    reps: z.string().trim().min(1).max(80).optional(),
    workSeconds: z.number().int().min(1).max(86_400).optional(),
    restSeconds: z.number().int().min(0).max(3_600),
  })
  .strict();

export const savedWorkoutPlanSchema = z
  .object({
    id: idSchema,
    title: titleSchema,
    generatorVersion: z
      .string()
      .min(1)
      .max(40)
      .regex(SAFE_TOKEN, 'Expected a safe generator version.'),
    seed: z
      .string()
      .min(1)
      .max(120)
      .regex(SAFE_TOKEN, 'Expected a safe seed.')
      .optional(),
    durationMinutes: z.number().int().min(1).max(180),
    equipment: z.array(idSchema).max(20),
    exercises: z
      .array(savedPlanExerciseSchema)
      .min(1)
      .max(MAX_EXERCISES_PER_WORKOUT),
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
  })
  .strict();

const generatorDefaultsSchema = z
  .object({
    goal: z
      .enum([
        'general-fitness',
        'strength',
        'muscle-gain',
        'endurance',
        'mobility',
        'low-impact',
      ])
      .optional(),
    experience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    durationMinutes: z
      .union([
        z.literal(5),
        z.literal(10),
        z.literal(15),
        z.literal(20),
        z.literal(30),
        z.literal(45),
      ])
      .optional(),
    focus: z
      .enum([
        'full-body',
        'upper-body',
        'lower-body',
        'core',
        'arms',
        'chest',
        'back',
        'shoulders',
        'glutes',
      ])
      .optional(),
    equipment: z.array(idSchema).max(20).optional(),
    quiet: z.boolean().optional(),
    noJumping: z.boolean().optional(),
    standingOnly: z.boolean().optional(),
    noFloor: z.boolean().optional(),
  })
  .strict();

export const userPreferencesSchema = z
  .object({
    id: z.literal('preferences'),
    theme: z.enum(['system', 'light', 'dark']),
    units: z.enum(['metric', 'imperial']),
    generatorDefaults: generatorDefaultsSchema.optional(),
    updatedAt: isoDateTimeSchema,
  })
  .strict();

function addDuplicateIdIssues(
  items: readonly { id: string }[],
  context: z.RefinementCtx,
): void {
  const ids = new Set<string>();
  items.forEach((item, index) => {
    if (ids.has(item.id)) {
      context.addIssue({
        code: 'custom',
        path: [index, 'id'],
        message: `Duplicate identifier: ${item.id}.`,
      });
    }
    ids.add(item.id);
  });
}

const completedWorkoutsSchema = z
  .array(completedWorkoutSchema)
  .max(MAX_WORKOUTS)
  .superRefine(addDuplicateIdIssues);
const savedWorkoutPlansSchema = z
  .array(savedWorkoutPlanSchema)
  .max(MAX_SAVED_PLANS)
  .superRefine(addDuplicateIdIssues);

export const localDataSnapshotSchema = z
  .object({
    schemaVersion: z.literal(LOCAL_DATA_SCHEMA_VERSION),
    workouts: completedWorkoutsSchema,
    savedPlans: savedWorkoutPlansSchema,
    preferences: userPreferencesSchema.nullable(),
  })
  .strict();

export const localDataExportSchema = localDataSnapshotSchema
  .extend({
    format: z.literal(WORKOUTMATCH_EXPORT_FORMAT),
    exportedAt: isoDateTimeSchema,
  })
  .strict();

const legacyWorkoutSchema = completedWorkoutSchema.omit({ updatedAt: true });
const legacySavedPlanSchema = savedWorkoutPlanSchema.omit({ updatedAt: true });
const legacyPreferencesSchema = userPreferencesSchema.omit({
  id: true,
  updatedAt: true,
});
const legacyWorkoutsSchema = z
  .array(legacyWorkoutSchema)
  .max(MAX_WORKOUTS)
  .superRefine(addDuplicateIdIssues);
const legacySavedPlansSchema = z
  .array(legacySavedPlanSchema)
  .max(MAX_SAVED_PLANS)
  .superRefine(addDuplicateIdIssues);

export const localDataExportV1Schema = z
  .object({
    format: z.literal(WORKOUTMATCH_EXPORT_FORMAT),
    schemaVersion: z.literal(1),
    exportedAt: isoDateTimeSchema,
    workouts: legacyWorkoutsSchema,
    savedWorkouts: legacySavedPlansSchema,
    preferences: legacyPreferencesSchema.nullable(),
  })
  .strict();

export function parseCompletedWorkout(value: unknown): CompletedWorkoutRecord {
  return completedWorkoutSchema.parse(value) as CompletedWorkoutRecord;
}

export function parseSavedWorkoutPlan(value: unknown): SavedWorkoutPlan {
  return savedWorkoutPlanSchema.parse(value) as SavedWorkoutPlan;
}

export function parseUserPreferences(value: unknown): UserPreferences {
  return userPreferencesSchema.parse(value) as UserPreferences;
}

export function parseLocalDataSnapshot(value: unknown): LocalDataSnapshot {
  return localDataSnapshotSchema.parse(value) as LocalDataSnapshot;
}

export function parseLocalDataExport(value: unknown): LocalDataExport {
  return localDataExportSchema.parse(value) as LocalDataExport;
}
