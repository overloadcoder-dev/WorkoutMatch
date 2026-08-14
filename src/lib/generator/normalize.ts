import { z } from '../validation/zod';

import {
  EQUIPMENT_OPTIONS,
  EXPERIENCE_LEVELS,
  SPACE_REQUIREMENTS,
  STRESS_TAGS,
  type Equipment,
  type StressTag,
} from '../../types/exercise';
import {
  WORKOUT_DURATIONS,
  WORKOUT_FOCUSES,
  WORKOUT_GOALS,
  type GenerationIssue,
  type NormalizedGeneratorInput,
} from '../../types/workout';

const generatorInputSchema = z.object({
  goal: z.enum([...WORKOUT_GOALS]),
  experience: z.enum([...EXPERIENCE_LEVELS]),
  durationMinutes: z.union(
    WORKOUT_DURATIONS.map((duration) => z.literal(duration)) as [
      z.ZodLiteral<5>,
      z.ZodLiteral<10>,
      z.ZodLiteral<15>,
      z.ZodLiteral<20>,
      z.ZodLiteral<30>,
      z.ZodLiteral<45>,
    ],
  ),
  equipment: z.array(z.enum([...EQUIPMENT_OPTIONS])).min(1),
  focus: z.enum([...WORKOUT_FOCUSES]),
  environment: z.object({
    space: z.enum([...SPACE_REQUIREMENTS]),
    quiet: z.boolean(),
    noJump: z.boolean(),
    standingOnly: z.boolean(),
    noFloor: z.boolean(),
  }),
  avoidStressTags: z.array(z.enum([...STRESS_TAGS])),
});

export type NormalizeGeneratorResult =
  | { ok: true; input: NormalizedGeneratorInput }
  | { ok: false; issue: GenerationIssue };

const own = (record: Record<string, unknown>, key: string): unknown =>
  Object.prototype.hasOwnProperty.call(record, key) ? record[key] : undefined;

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const booleanOrDefault = (value: unknown, fallback = false): unknown =>
  value === undefined ? fallback : value;

const uniqueInCanonicalOrder = <T extends string>(
  values: readonly T[],
  order: readonly T[],
): T[] => {
  const selected = new Set(values);
  return order.filter((value) => selected.has(value));
};

export const normalizeGeneratorInput = (
  raw: unknown,
): NormalizeGeneratorResult => {
  const source = asRecord(raw);
  const environmentSource = asRecord(own(source, 'environment'));
  const durationRaw = own(source, 'durationMinutes') ?? own(source, 'duration');
  const numericDuration =
    typeof durationRaw === 'string' && /^\d{1,2}$/.test(durationRaw)
      ? Number(durationRaw)
      : durationRaw;

  const candidate = {
    goal: own(source, 'goal') ?? 'general-fitness',
    experience: own(source, 'experience') ?? own(source, 'level') ?? 'beginner',
    durationMinutes: numericDuration ?? 15,
    equipment: own(source, 'equipment') ?? ['none'],
    focus: own(source, 'focus') ?? 'full-body',
    environment: {
      space:
        own(environmentSource, 'space') ?? own(source, 'space') ?? 'medium',
      quiet: booleanOrDefault(
        own(environmentSource, 'quiet') ?? own(source, 'quiet'),
      ),
      noJump: booleanOrDefault(
        own(environmentSource, 'noJump') ?? own(source, 'noJump'),
      ),
      standingOnly: booleanOrDefault(
        own(environmentSource, 'standingOnly') ?? own(source, 'standingOnly'),
      ),
      noFloor: booleanOrDefault(
        own(environmentSource, 'noFloor') ?? own(source, 'noFloor'),
      ),
    },
    avoidStressTags:
      own(source, 'avoidStressTags') ?? own(source, 'sensitivities') ?? [],
  };

  const parsed = generatorInputSchema.safeParse(candidate);
  if (!parsed.success) {
    const reasons = parsed.error.issues.map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
      return `${path}${issue.message}`;
    });
    return {
      ok: false,
      issue: {
        code: 'invalid-input',
        message: 'Check the workout options before generating.',
        reasons,
        suggestions: [
          'Choose a supported duration between 5 and 45 minutes.',
          'Select at least one equipment option, including no equipment when appropriate.',
        ],
      },
    };
  }

  let equipment = uniqueInCanonicalOrder(
    parsed.data.equipment as Equipment[],
    EQUIPMENT_OPTIONS,
  );
  if (equipment.length > 1) {
    equipment = equipment.filter((item) => item !== 'none');
  }
  const avoidStressTags = uniqueInCanonicalOrder(
    parsed.data.avoidStressTags as StressTag[],
    STRESS_TAGS,
  );

  return {
    ok: true,
    input: Object.freeze({
      ...parsed.data,
      equipment: Object.freeze(equipment),
      environment: Object.freeze({ ...parsed.data.environment }),
      avoidStressTags: Object.freeze(avoidStressTags),
    }),
  };
};

export const isNormalizedGeneratorInput = (
  value: unknown,
): value is NormalizedGeneratorInput =>
  generatorInputSchema.safeParse(value).success;
