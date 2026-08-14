import { z } from '../validation/zod';

import {
  CALCULATOR_LIMITS,
  CENTIMETERS_PER_INCH,
  CalculatorValidationError,
  kilogramsToPounds,
  poundsToKilograms,
  type BodyMeasurements,
  type CalculatorValidationIssue,
  type NormalizedBodyMeasurements,
} from './types';

const finiteNumber = (label: string) =>
  z
    .number({ error: `${label} must be a number.` })
    .finite(`${label} must be finite.`);

const metricMeasurementsSchema = z
  .object({
    unitSystem: z.literal('metric'),
    weightKg: finiteNumber('Weight')
      .min(
        CALCULATOR_LIMITS.weightKg.min,
        `Weight must be at least ${CALCULATOR_LIMITS.weightKg.min} kg.`,
      )
      .max(
        CALCULATOR_LIMITS.weightKg.max,
        `Weight must be no more than ${CALCULATOR_LIMITS.weightKg.max} kg.`,
      ),
    heightCm: finiteNumber('Height')
      .min(
        CALCULATOR_LIMITS.heightCm.min,
        `Height must be at least ${CALCULATOR_LIMITS.heightCm.min} cm.`,
      )
      .max(
        CALCULATOR_LIMITS.heightCm.max,
        `Height must be no more than ${CALCULATOR_LIMITS.heightCm.max} cm.`,
      ),
  })
  .strict();

const minimumWeightLb = kilogramsToPounds(CALCULATOR_LIMITS.weightKg.min);
const maximumWeightLb = kilogramsToPounds(CALCULATOR_LIMITS.weightKg.max);

const imperialMeasurementsSchema = z
  .object({
    unitSystem: z.literal('imperial'),
    weightLb: finiteNumber('Weight')
      .min(
        minimumWeightLb,
        `Weight must be at least ${minimumWeightLb.toFixed(1)} lb.`,
      )
      .max(
        maximumWeightLb,
        `Weight must be no more than ${maximumWeightLb.toFixed(1)} lb.`,
      ),
    heightFeet: finiteNumber('Height in feet')
      .int('Height in feet must be a whole number.')
      .min(0, 'Height in feet cannot be negative.')
      .max(9, 'Height in feet must be no more than 9.'),
    heightInches: finiteNumber('Additional inches')
      .min(0, 'Additional inches cannot be negative.')
      .lt(12, 'Additional inches must be less than 12.'),
  })
  .strict()
  .superRefine((value, context) => {
    const heightCm =
      (value.heightFeet * 12 + value.heightInches) * CENTIMETERS_PER_INCH;

    if (
      heightCm < CALCULATOR_LIMITS.heightCm.min ||
      heightCm > CALCULATOR_LIMITS.heightCm.max
    ) {
      context.addIssue({
        code: 'custom',
        path: ['heightFeet'],
        message: `Total height must be between ${CALCULATOR_LIMITS.heightCm.min} and ${CALCULATOR_LIMITS.heightCm.max} cm.`,
      });
    }
  });

export const bodyMeasurementsSchema = z.discriminatedUnion('unitSystem', [
  metricMeasurementsSchema,
  imperialMeasurementsSchema,
]);

export const ageSchema = finiteNumber('Age')
  .int('Age must be a whole number.')
  .min(
    CALCULATOR_LIMITS.ageYears.min,
    `These adult calculators are for ages ${CALCULATOR_LIMITS.ageYears.min} and older.`,
  )
  .max(
    CALCULATOR_LIMITS.ageYears.max,
    `Age must be no more than ${CALCULATOR_LIMITS.ageYears.max}.`,
  );

function issuePath(path: readonly PropertyKey[]): string {
  return path.map(String).join('.');
}

export function toCalculatorIssues(
  error: z.ZodError,
): CalculatorValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issuePath(issue.path),
    message: issue.message,
  }));
}

export function parseWithCalculatorSchema<T>(
  schema: z.ZodType<T>,
  value: unknown,
): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new CalculatorValidationError(toCalculatorIssues(parsed.error));
  }

  return parsed.data;
}

export function normalizeBodyMeasurements(
  input: BodyMeasurements,
): NormalizedBodyMeasurements {
  const measurements = parseWithCalculatorSchema(bodyMeasurementsSchema, input);

  if (measurements.unitSystem === 'metric') {
    return { weightKg: measurements.weightKg, heightCm: measurements.heightCm };
  }

  return {
    weightKg: poundsToKilograms(measurements.weightLb),
    heightCm:
      (measurements.heightFeet * 12 + measurements.heightInches) *
      CENTIMETERS_PER_INCH,
  };
}
