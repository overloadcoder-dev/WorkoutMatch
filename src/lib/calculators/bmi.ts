import { z } from '../validation/zod';

import {
  CalculatorValidationError,
  CALCULATOR_LIMITS,
  type BodyMeasurements,
} from './types';
import { normalizeBodyMeasurements } from './validation';

export type AdultBmiCategory =
  'underweight' | 'healthy-weight' | 'overweight' | 'obesity';
export type AdultBmiObesityClass = 'class-1' | 'class-2' | 'class-3' | null;

export interface AdultBmiClassification {
  category: AdultBmiCategory;
  label: string;
  obesityClass: AdultBmiObesityClass;
  obesityClassLabel: string | null;
}

export interface BmiResult extends AdultBmiClassification {
  /** Exact computed value. Round only when rendering it. */
  value: number;
}

const computedBmiSchema = z
  .number()
  .finite()
  .min(CALCULATOR_LIMITS.bmi.min)
  .max(CALCULATOR_LIMITS.bmi.max);

export function classifyAdultBmi(bmi: number): AdultBmiClassification {
  const parsed = computedBmiSchema.safeParse(bmi);
  if (!parsed.success) {
    throw new CalculatorValidationError([
      {
        path: 'bmi',
        message: `BMI must be between ${CALCULATOR_LIMITS.bmi.min} and ${CALCULATOR_LIMITS.bmi.max}.`,
      },
    ]);
  }

  if (bmi < 18.5) {
    return {
      category: 'underweight',
      label: 'Underweight',
      obesityClass: null,
      obesityClassLabel: null,
    };
  }

  if (bmi < 25) {
    return {
      category: 'healthy-weight',
      label: 'Healthy weight',
      obesityClass: null,
      obesityClassLabel: null,
    };
  }

  if (bmi < 30) {
    return {
      category: 'overweight',
      label: 'Overweight',
      obesityClass: null,
      obesityClassLabel: null,
    };
  }

  if (bmi < 35) {
    return {
      category: 'obesity',
      label: 'Obesity',
      obesityClass: 'class-1',
      obesityClassLabel: 'Class 1 obesity',
    };
  }

  if (bmi < 40) {
    return {
      category: 'obesity',
      label: 'Obesity',
      obesityClass: 'class-2',
      obesityClassLabel: 'Class 2 obesity',
    };
  }

  return {
    category: 'obesity',
    label: 'Obesity',
    obesityClass: 'class-3',
    obesityClassLabel: 'Class 3 obesity',
  };
}

export function calculateBmi(input: BodyMeasurements): BmiResult {
  const { weightKg, heightCm } = normalizeBodyMeasurements(input);
  const heightM = heightCm / 100;
  const value = weightKg / heightM ** 2;
  const classification = classifyAdultBmi(value);

  return { value, ...classification };
}
