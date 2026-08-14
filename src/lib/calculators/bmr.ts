import { z } from '../validation/zod';

import { type BodyMeasurements } from './types';
import {
  ageSchema,
  normalizeBodyMeasurements,
  parseWithCalculatorSchema,
} from './validation';

export type MifflinStJeorSex = 'male' | 'female';
export type BmrEquationSelection = MifflinStJeorSex | 'both';

export type BmrInput = BodyMeasurements & {
  age: number;
  equation: BmrEquationSelection;
};

export interface BmrResult {
  /** Exact estimates in kcal/day. Round only when rendering them. */
  estimates: Readonly<Record<MifflinStJeorSex, number>>;
  selectedEquation: BmrEquationSelection;
  selectedEstimate: number | null;
}

const equationSchema = z.enum(['male', 'female', 'both']);
const bmrParametersSchema = z
  .object({
    age: ageSchema,
    equation: equationSchema,
  })
  .strict();

export function calculateMifflinStJeor(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: MifflinStJeorSex,
): number {
  const validatedAge = parseWithCalculatorSchema(ageSchema, age);
  const validatedSex = parseWithCalculatorSchema(
    z.enum(['male', 'female']),
    sex,
  );
  const normalized = normalizeBodyMeasurements({
    unitSystem: 'metric',
    weightKg,
    heightCm,
  });
  const base =
    10 * normalized.weightKg + 6.25 * normalized.heightCm - 5 * validatedAge;
  return base + (validatedSex === 'male' ? 5 : -161);
}

export function calculateBmr(input: BmrInput): BmrResult {
  const { age, equation } = parseWithCalculatorSchema(bmrParametersSchema, {
    age: input.age,
    equation: input.equation,
  });
  const measurements: BodyMeasurements =
    input.unitSystem === 'metric'
      ? {
          unitSystem: 'metric',
          weightKg: input.weightKg,
          heightCm: input.heightCm,
        }
      : {
          unitSystem: 'imperial',
          weightLb: input.weightLb,
          heightFeet: input.heightFeet,
          heightInches: input.heightInches,
        };
  const normalized = normalizeBodyMeasurements(measurements);

  const male =
    10 * normalized.weightKg + 6.25 * normalized.heightCm - 5 * age + 5;
  const female =
    10 * normalized.weightKg + 6.25 * normalized.heightCm - 5 * age - 161;
  const estimates = { male, female } as const;

  return {
    estimates,
    selectedEquation: equation,
    selectedEstimate: equation === 'both' ? null : estimates[equation],
  };
}
