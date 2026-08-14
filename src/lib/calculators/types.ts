export type UnitSystem = 'metric' | 'imperial';

export interface MetricBodyMeasurements {
  unitSystem: 'metric';
  weightKg: number;
  heightCm: number;
}

export interface ImperialBodyMeasurements {
  unitSystem: 'imperial';
  weightLb: number;
  heightFeet: number;
  heightInches: number;
}

export type BodyMeasurements =
  MetricBodyMeasurements | ImperialBodyMeasurements;

export interface NormalizedBodyMeasurements {
  weightKg: number;
  heightCm: number;
}

export interface CalculatorValidationIssue {
  path: string;
  message: string;
}

export class CalculatorValidationError extends Error {
  readonly issues: readonly CalculatorValidationIssue[];

  constructor(issues: readonly CalculatorValidationIssue[]) {
    super(issues.map((issue) => issue.message).join(' '));
    this.name = 'CalculatorValidationError';
    this.issues = issues;
  }
}

export const CALCULATOR_LIMITS = {
  ageYears: { min: 20, max: 120 },
  heightCm: { min: 100, max: 250 },
  weightKg: { min: 25, max: 350 },
  bmi: { min: 8, max: 100 },
  bmrKcalPerDay: { min: 500, max: 5_000 },
} as const;

export const KILOGRAMS_PER_POUND = 0.453_592_37;
export const CENTIMETERS_PER_INCH = 2.54;

export function poundsToKilograms(pounds: number): number {
  return pounds * KILOGRAMS_PER_POUND;
}

export function kilogramsToPounds(kilograms: number): number {
  return kilograms / KILOGRAMS_PER_POUND;
}

export function inchesToCentimeters(inches: number): number {
  return inches * CENTIMETERS_PER_INCH;
}

export function centimetersToInches(centimeters: number): number {
  return centimeters / CENTIMETERS_PER_INCH;
}

export function roundForDisplay(value: number, fractionDigits = 0): number {
  if (
    !Number.isInteger(fractionDigits) ||
    fractionDigits < 0 ||
    fractionDigits > 10
  ) {
    throw new RangeError('fractionDigits must be an integer from 0 to 10.');
  }

  const scale = 10 ** fractionDigits;
  return Math.round((value + Number.EPSILON) * scale) / scale;
}
