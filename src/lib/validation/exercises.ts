import { z } from './zod';

import {
  EQUIPMENT_OPTIONS,
  EXPERIENCE_LEVELS,
  EXERCISE_POSITIONS,
  IMPACT_LEVELS,
  MOVEMENT_PATTERNS,
  MUSCLE_GROUPS,
  NOISE_LEVELS,
  REP_MODES,
  SPACE_REQUIREMENTS,
  STRESS_TAGS,
  type Exercise,
} from '../../types/exercise';

const idSchema = z
  .string()
  .regex(
    /^ex-[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Use a stable ex- prefixed kebab-case ID',
  );
const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase kebab-case slug');
const nonEmptyText = z.string().trim().min(1).max(500);
const uniqueTextArray = (minimum: number) =>
  z
    .array(nonEmptyText)
    .min(minimum)
    .superRefine((items, context) => {
      if (
        new Set(items.map((item) => item.toLocaleLowerCase())).size !==
        items.length
      ) {
        context.addIssue({
          code: 'custom',
          message: 'List values must be unique',
        });
      }
    });

const repetitionPrescriptionSchema = z.object({
  mode: z.literal('reps'),
  sets: z.number().int().min(1).max(8),
  reps: z
    .object({
      min: z.number().int().min(1).max(100),
      max: z.number().int().min(1).max(100),
    })
    .refine(
      ({ min, max }) => min <= max,
      'Minimum repetitions cannot exceed maximum repetitions',
    ),
  restSeconds: z.number().int().min(0).max(300),
});

const timePrescriptionSchema = z.object({
  mode: z.literal('time'),
  sets: z.number().int().min(1).max(8),
  workSeconds: z.number().int().min(5).max(600),
  restSeconds: z.number().int().min(0).max(300),
});

const distancePrescriptionSchema = z.object({
  mode: z.literal('distance'),
  sets: z.number().int().min(1).max(8),
  distanceMeters: z.number().int().min(1).max(2_000),
  restSeconds: z.number().int().min(0).max(300),
});

export const prescriptionSchema = z.discriminatedUnion('mode', [
  repetitionPrescriptionSchema,
  timePrescriptionSchema,
  distancePrescriptionSchema,
]);

const sourceReferenceSchema = z.object({
  title: nonEmptyText,
  publisher: nonEmptyText,
  url: z
    .string()
    .url()
    .refine((url) => url.startsWith('https://'), 'Sources must use HTTPS'),
  accessedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use an ISO date'),
});

const localAssetPath = z
  .string()
  .min(2)
  .max(250)
  .refine(
    (path) => path.startsWith('/') && !path.startsWith('//'),
    'Media must use a local root-relative path',
  );

const mediaSchema = z
  .object({
    poster: localAssetPath.optional(),
    mp4: localAssetPath.optional(),
    webm: localAssetPath.optional(),
    attribution: nonEmptyText.optional(),
  })
  .refine(
    ({ poster, mp4, webm }) => Boolean(poster || mp4 || webm),
    'Media requires at least one local asset',
  );

const enumArray = <T extends readonly [string, ...string[]]>(
  values: T,
  minimum = 0,
) =>
  z
    .array(z.enum(values))
    .min(minimum)
    .superRefine((items, context) => {
      if (new Set(items).size !== items.length) {
        context.addIssue({
          code: 'custom',
          message: 'List values must be unique',
        });
      }
    });

export const exerciseSchema = z
  .object({
    id: idSchema,
    slug: slugSchema,
    name: z.string().trim().min(2).max(100),
    aliases: uniqueTextArray(1),
    summary: z.string().trim().min(20).max(300),
    instructions: uniqueTextArray(2),
    breathing: uniqueTextArray(1),
    commonMistakes: uniqueTextArray(1),
    safetyNotes: uniqueTextArray(1),
    primaryMuscles: enumArray([...MUSCLE_GROUPS], 1),
    secondaryMuscles: enumArray([...MUSCLE_GROUPS]),
    movementPattern: z.enum([...MOVEMENT_PATTERNS]),
    equipment: enumArray([...EQUIPMENT_OPTIONS], 1),
    difficulty: z.enum([...EXPERIENCE_LEVELS]),
    position: z.enum([...EXERCISE_POSITIONS]),
    impact: z.enum([...IMPACT_LEVELS]),
    noise: z.enum([...NOISE_LEVELS]),
    space: z.enum([...SPACE_REQUIREMENTS]),
    unilateral: z.boolean(),
    compound: z.boolean(),
    repMode: z.enum([...REP_MODES]),
    defaultPrescription: z.object({
      beginner: prescriptionSchema,
      intermediate: prescriptionSchema,
      advanced: prescriptionSchema,
    }),
    stressTags: enumArray([...STRESS_TAGS]),
    easierVariationIds: z.array(idSchema),
    harderVariationIds: z.array(idSchema),
    replacementIds: z.array(idSchema),
    media: mediaSchema.optional(),
    reviewed: z.boolean(),
    sources: z.array(sourceReferenceSchema).min(1),
  })
  .strict()
  .superRefine((exercise, context) => {
    for (const [level, prescription] of Object.entries(
      exercise.defaultPrescription,
    )) {
      if (prescription.mode !== exercise.repMode) {
        context.addIssue({
          code: 'custom',
          path: ['defaultPrescription', level, 'mode'],
          message: `Prescription mode must match repMode ${exercise.repMode}`,
        });
      }
    }

    const overlap = exercise.primaryMuscles.filter((muscle) =>
      exercise.secondaryMuscles.includes(muscle),
    );
    if (overlap.length > 0) {
      context.addIssue({
        code: 'custom',
        path: ['secondaryMuscles'],
        message: `Primary and secondary muscles overlap: ${overlap.join(', ')}`,
      });
    }

    if (exercise.equipment.includes('none') && exercise.equipment.length > 1) {
      context.addIssue({
        code: 'custom',
        path: ['equipment'],
        message:
          '"none" cannot be combined with external equipment requirements',
      });
    }

    const references = [
      ...exercise.easierVariationIds,
      ...exercise.harderVariationIds,
      ...exercise.replacementIds,
    ];
    if (references.includes(exercise.id)) {
      context.addIssue({
        code: 'custom',
        message: 'An exercise cannot reference itself',
      });
    }
    if (
      new Set(exercise.replacementIds).size !== exercise.replacementIds.length
    ) {
      context.addIssue({
        code: 'custom',
        path: ['replacementIds'],
        message: 'Replacement IDs must be unique',
      });
    }
  });

export const exerciseDatasetSchema = z
  .array(exerciseSchema)
  .min(
    60,
    'The authoritative exercise dataset must contain at least 60 entries',
  )
  .superRefine((exercises, context) => {
    const ids = new Map<string, number>();
    const slugs = new Map<string, number>();

    exercises.forEach((exercise, index) => {
      if (ids.has(exercise.id)) {
        context.addIssue({
          code: 'custom',
          path: [index, 'id'],
          message: `Duplicate exercise ID also used at index ${ids.get(exercise.id)}`,
        });
      } else {
        ids.set(exercise.id, index);
      }

      if (slugs.has(exercise.slug)) {
        context.addIssue({
          code: 'custom',
          path: [index, 'slug'],
          message: `Duplicate exercise slug also used at index ${slugs.get(exercise.slug)}`,
        });
      } else {
        slugs.set(exercise.slug, index);
      }
    });

    exercises.forEach((exercise, index) => {
      const referenceGroups = [
        ['easierVariationIds', exercise.easierVariationIds],
        ['harderVariationIds', exercise.harderVariationIds],
        ['replacementIds', exercise.replacementIds],
      ] as const;

      for (const [field, references] of referenceGroups) {
        references.forEach((reference, referenceIndex) => {
          if (!ids.has(reference)) {
            context.addIssue({
              code: 'custom',
              path: [index, field, referenceIndex],
              message: `Unknown exercise reference: ${reference}`,
            });
          }
        });
      }
    });
  });

export const validateExerciseDataset = (value: unknown) =>
  exerciseDatasetSchema.safeParse(value);

export const parseExerciseDataset = (value: unknown): Exercise[] =>
  exerciseDatasetSchema.parse(value) as Exercise[];
