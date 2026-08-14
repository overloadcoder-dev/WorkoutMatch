import { z } from '../validation/zod';

import { CALCULATOR_LIMITS } from './types';
import { parseWithCalculatorSchema } from './validation';

export const ACTIVITY_LEVELS = [
  {
    id: 'sedentary',
    label: 'Sedentary',
    factor: 1.2,
    description: 'Little structured exercise.',
  },
  {
    id: 'lightly-active',
    label: 'Lightly active',
    factor: 1.375,
    description: 'Light exercise or sport about 1 to 3 days per week.',
  },
  {
    id: 'moderately-active',
    label: 'Moderately active',
    factor: 1.55,
    description: 'Moderate exercise or sport about 3 to 5 days per week.',
  },
  {
    id: 'very-active',
    label: 'Very active',
    factor: 1.725,
    description: 'Hard exercise or sport about 6 to 7 days per week.',
  },
  {
    id: 'extra-active',
    label: 'Extra active',
    factor: 1.9,
    description: 'Very hard exercise, physical work, or twice-daily training.',
  },
] as const;

export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number]['id'];

export interface TdeeInput {
  bmr: number;
  activityLevel: ActivityLevel;
}

export interface TdeeUncertaintyBoundary {
  activityLevel: ActivityLevel;
  factor: number;
  value: number;
}

export interface TdeeResult {
  bmr: number;
  activityLevel: ActivityLevel;
  factor: number;
  /** Exact estimate in kcal/day. Round only when rendering it. */
  estimate: number;
  uncertaintyRange: {
    lower: TdeeUncertaintyBoundary;
    upper: TdeeUncertaintyBoundary;
  };
  arithmeticScenarios: {
    minusTenPercent: number;
    maintenance: number;
    plusTenPercent: number;
  };
  formula: string;
}

const activityLevelSchema = z.enum(ACTIVITY_LEVELS.map((level) => level.id));
const bmrSchema = z
  .number({ error: 'BMR must be a number.' })
  .finite('BMR must be finite.')
  .min(
    CALCULATOR_LIMITS.bmrKcalPerDay.min,
    `BMR must be at least ${CALCULATOR_LIMITS.bmrKcalPerDay.min} kcal/day.`,
  )
  .max(
    CALCULATOR_LIMITS.bmrKcalPerDay.max,
    `BMR must be no more than ${CALCULATOR_LIMITS.bmrKcalPerDay.max} kcal/day.`,
  );
const tdeeInputSchema = z
  .object({
    bmr: bmrSchema,
    activityLevel: activityLevelSchema,
  })
  .strict();

export function getActivityLevel(
  activityLevel: ActivityLevel,
): (typeof ACTIVITY_LEVELS)[number] {
  const id = parseWithCalculatorSchema(activityLevelSchema, activityLevel);
  const level = ACTIVITY_LEVELS.find((candidate) => candidate.id === id);

  // The validated enum and the table are derived from the same constant.
  if (!level) {
    throw new Error(`Activity factor is missing for ${id}.`);
  }

  return level;
}

export function calculateTdee(input: TdeeInput): TdeeResult {
  const validated = parseWithCalculatorSchema(tdeeInputSchema, input);
  const bmr = validated.bmr;
  const selected = getActivityLevel(validated.activityLevel);
  const selectedIndex = ACTIVITY_LEVELS.findIndex(
    (level) => level.id === selected.id,
  );
  const lower = ACTIVITY_LEVELS[Math.max(0, selectedIndex - 1)];
  const upper =
    ACTIVITY_LEVELS[Math.min(ACTIVITY_LEVELS.length - 1, selectedIndex + 1)];

  if (!lower || !upper) {
    throw new Error('Activity factor table must contain at least one level.');
  }

  const estimate = bmr * selected.factor;

  return {
    bmr,
    activityLevel: selected.id,
    factor: selected.factor,
    estimate,
    uncertaintyRange: {
      lower: {
        activityLevel: lower.id,
        factor: lower.factor,
        value: bmr * lower.factor,
      },
      upper: {
        activityLevel: upper.id,
        factor: upper.factor,
        value: bmr * upper.factor,
      },
    },
    arithmeticScenarios: {
      minusTenPercent: estimate * 0.9,
      maintenance: estimate,
      plusTenPercent: estimate * 1.1,
    },
    formula: `BMR * ${selected.factor}`,
  };
}
