import { describe, expect, it } from 'vitest';

import {
  ACTIVITY_LEVELS,
  CalculatorValidationError,
  calculateBmi,
  calculateBmr,
  calculateMifflinStJeor,
  calculateTdee,
  centimetersToInches,
  classifyAdultBmi,
  kilogramsToPounds,
  roundForDisplay,
} from '../../src/lib/calculators';

describe('BMI calculator', () => {
  it('uses the metric BMI formula without rounding the core value', () => {
    const result = calculateBmi({
      unitSystem: 'metric',
      weightKg: 70,
      heightCm: 175,
    });

    expect(result.value).toBeCloseTo(70 / 1.75 ** 2, 12);
    expect(result.category).toBe('healthy-weight');
    expect(roundForDisplay(result.value, 1)).toBe(22.9);
  });

  it('converts imperial input consistently with metric input', () => {
    const metric = calculateBmi({
      unitSystem: 'metric',
      weightKg: 82.4,
      heightCm: 183,
    });
    const imperial = calculateBmi({
      unitSystem: 'imperial',
      weightLb: kilogramsToPounds(82.4),
      heightFeet: 6,
      heightInches: centimetersToInches(183) - 72,
    });

    expect(imperial.value).toBeCloseTo(metric.value, 10);
  });

  it.each([
    [18.499_999, 'underweight', null],
    [18.5, 'healthy-weight', null],
    [24.999_999, 'healthy-weight', null],
    [25, 'overweight', null],
    [29.999_999, 'overweight', null],
    [30, 'obesity', 'class-1'],
    [34.999_999, 'obesity', 'class-1'],
    [35, 'obesity', 'class-2'],
    [39.999_999, 'obesity', 'class-2'],
    [40, 'obesity', 'class-3'],
  ] as const)(
    'classifies the adult boundary %s',
    (value, category, obesityClass) => {
      expect(classifyAdultBmi(value)).toMatchObject({ category, obesityClass });
    },
  );

  it('rejects non-finite and unrealistic measurements', () => {
    expect(() =>
      calculateBmi({
        unitSystem: 'metric',
        weightKg: Number.NaN,
        heightCm: 175,
      }),
    ).toThrow(CalculatorValidationError);
    expect(() =>
      calculateBmi({ unitSystem: 'metric', weightKg: 70, heightCm: 99 }),
    ).toThrow(/Height must be at least 100 cm/);
    expect(() =>
      calculateBmi({
        unitSystem: 'imperial',
        weightLb: 160,
        heightFeet: 5,
        heightInches: 12,
      }),
    ).toThrow(/less than 12/);
  });
});

describe('Mifflin–St Jeor BMR calculator', () => {
  it('calculates both published equation estimates', () => {
    expect(calculateMifflinStJeor(70, 175, 40, 'male')).toBe(1_598.75);
    expect(calculateMifflinStJeor(70, 175, 40, 'female')).toBe(1_432.75);
  });

  it('offers both estimates without choosing a selected estimate', () => {
    const result = calculateBmr({
      unitSystem: 'metric',
      weightKg: 70,
      heightCm: 175,
      age: 40,
      equation: 'both',
    });

    expect(result.estimates).toEqual({ male: 1_598.75, female: 1_432.75 });
    expect(result.selectedEstimate).toBeNull();
  });

  it('uses the chosen estimate and normalizes imperial measurements', () => {
    const metric = calculateBmr({
      unitSystem: 'metric',
      weightKg: 70,
      heightCm: 175,
      age: 40,
      equation: 'female',
    });
    const imperial = calculateBmr({
      unitSystem: 'imperial',
      weightLb: kilogramsToPounds(70),
      heightFeet: 5,
      heightInches: centimetersToInches(175) - 60,
      age: 40,
      equation: 'female',
    });

    expect(imperial.selectedEstimate).toBeCloseTo(
      metric.selectedEstimate ?? 0,
      10,
    );
    expect(metric.selectedEstimate).toBe(metric.estimates.female);
  });

  it('enforces the adult age and realistic measurement ranges', () => {
    expect(() =>
      calculateBmr({
        unitSystem: 'metric',
        weightKg: 70,
        heightCm: 175,
        age: 19,
        equation: 'male',
      }),
    ).toThrow(/ages 20 and older/);
    expect(() =>
      calculateBmr({
        unitSystem: 'metric',
        weightKg: 351,
        heightCm: 175,
        age: 40,
        equation: 'male',
      }),
    ).toThrow(/no more than 350 kg/);
  });

  it('returns field-addressable issues for inline validation', () => {
    try {
      calculateBmr({
        unitSystem: 'metric',
        weightKg: 70,
        heightCm: 175,
        age: 19,
        equation: 'male',
      });
      expect.unreachable('Expected invalid age to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(CalculatorValidationError);
      expect((error as CalculatorValidationError).issues[0]?.path).toBe('age');
    }
  });
});

describe('TDEE calculator', () => {
  it('uses the centralized selected factor and exposes exact arithmetic scenarios', () => {
    const result = calculateTdee({
      bmr: 1_600,
      activityLevel: 'moderately-active',
    });

    expect(ACTIVITY_LEVELS.map((level) => level.factor)).toEqual([
      1.2, 1.375, 1.55, 1.725, 1.9,
    ]);
    expect(result.factor).toBe(1.55);
    expect(result.estimate).toBe(2_480);
    expect(result.formula).toBe('BMR * 1.55');
    expect(result.arithmeticScenarios).toEqual({
      minusTenPercent: 2_232,
      maintenance: 2_480,
      plusTenPercent: 2_728,
    });
  });

  it('uses both neighboring activity factors for an interior level', () => {
    const result = calculateTdee({
      bmr: 1_600,
      activityLevel: 'moderately-active',
    });

    expect(result.uncertaintyRange.lower).toEqual({
      activityLevel: 'lightly-active',
      factor: 1.375,
      value: 2_200,
    });
    expect(result.uncertaintyRange.upper).toEqual({
      activityLevel: 'very-active',
      factor: 1.725,
      value: 2_760,
    });
  });

  it('clamps an edge range to the selected factor where no outer neighbor exists', () => {
    const low = calculateTdee({ bmr: 1_600, activityLevel: 'sedentary' });
    const high = calculateTdee({ bmr: 1_600, activityLevel: 'extra-active' });

    expect(low.uncertaintyRange.lower.activityLevel).toBe('sedentary');
    expect(low.uncertaintyRange.upper.activityLevel).toBe('lightly-active');
    expect(high.uncertaintyRange.lower.activityLevel).toBe('very-active');
    expect(high.uncertaintyRange.upper.activityLevel).toBe('extra-active');
  });

  it('rejects unrealistic BMR values and unknown factors', () => {
    expect(() =>
      calculateTdee({ bmr: 499, activityLevel: 'sedentary' }),
    ).toThrow(/at least 500/);
    expect(() =>
      calculateTdee({ bmr: 1_600, activityLevel: 'invented' as 'sedentary' }),
    ).toThrow(CalculatorValidationError);
  });

  it('associates invalid activity input with the activity field', () => {
    try {
      calculateTdee({ bmr: 1_600, activityLevel: 'invented' as 'sedentary' });
      expect.unreachable('Expected invalid activity level to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(CalculatorValidationError);
      expect((error as CalculatorValidationError).issues[0]?.path).toBe(
        'activityLevel',
      );
    }
  });
});
