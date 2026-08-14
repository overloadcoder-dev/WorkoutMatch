import { EXERCISE_DATASET_VERSION, EXERCISES } from '../../data/exercises';
import {
  DURATION_TEMPLATES,
  FOCUS_TEMPLATES,
  GOAL_TEMPLATES,
  getMainSlots,
} from '../../data/generator-templates';
import type { Equipment, Exercise, StressTag } from '../../types/exercise';
import type {
  GeneratedWorkout,
  GeneratedWorkoutExercise,
  GeneratedWorkoutSection,
  GenerationIssue,
  GenerationResult,
  GeneratorOptions,
  MovementSlotTemplate,
  NormalizedGeneratorInput,
  WorkoutSection,
} from '../../types/workout';
import { filterExercises } from './filters';
import { normalizeGeneratorInput } from './normalize';
import { estimateWorkoutTarget, prescribeExercise } from './prescription';
import { selectExercisesForSlots, type SelectedSlotExercise } from './scoring';
import { createVersionedSeed, GENERATOR_VERSION } from './seed';
import {
  TRANSITION_SECONDS,
  validateGeneratedWorkout,
} from './validate-workout';

const STRESS_LABELS: Record<StressTag, string> = {
  'wrist-load': 'wrist-loading movements',
  'knee-flexion': 'deep knee-flexion movements',
  'shoulder-overhead': 'overhead shoulder movements',
  'lower-back-load': 'higher lower-back loading',
  'floor-transition': 'floor transitions',
};

const createPreparationSlots = (count: number): MovementSlotTemplate[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `warmup-${index + 1}-prepare`,
    patterns: ['mobility', 'conditioning'],
    compound: 'neutral',
  }));

const createCooldownSlots = (count: number): MovementSlotTemplate[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `cooldown-${index + 1}-mobility`,
    patterns: ['mobility'],
    compound: 'neutral',
  }));

const actionableIssue = (
  input: NormalizedGeneratorInput,
  baseIssue: GenerationIssue,
  compatibleCount: number,
): GenerationIssue => {
  const suggestions = new Set(baseIssue.suggestions);
  if (!input.equipment.includes('resistance-band')) {
    suggestions.add(
      'Add a resistance band for more quiet pushing and pulling choices.',
    );
  }
  if (!input.equipment.includes('pull-up-bar')) {
    suggestions.add('Add a pull-up bar if available for more pulling choices.');
  }
  if (input.environment.standingOnly)
    suggestions.add(
      'Turn off standing only to include seated, kneeling, or floor options.',
    );
  if (input.environment.noFloor)
    suggestions.add(
      'Allow floor exercises to unlock additional push, pull, core, and mobility choices.',
    );
  if (input.environment.quiet)
    suggestions.add(
      'Allow moderate-noise movements if your setting permits them.',
    );
  if (input.environment.noJump)
    suggestions.add(
      'Allow jumping only if impact and noise are acceptable today.',
    );
  if (input.environment.space !== 'medium')
    suggestions.add(
      'Choose a larger space setting to include carries and wider movements.',
    );
  for (const tag of input.avoidStressTags) {
    suggestions.add(
      `Allow ${STRESS_LABELS[tag]} if that preference is not needed today.`,
    );
  }
  if (input.durationMinutes > 5)
    suggestions.add(
      'Choose a shorter duration to use the reduced-slot template.',
    );

  return {
    ...baseIssue,
    reasons: [
      `Only ${compatibleCount} of ${EXERCISES.length} exercises match all current filters.`,
      ...baseIssue.reasons,
    ],
    suggestions: [...suggestions].slice(0, 8),
  };
};

const equipmentNeededFor = (exercises: readonly Exercise[]): Equipment[] => {
  const requirements = new Set<Equipment>();
  for (const exercise of exercises) {
    for (const equipment of exercise.equipment) {
      if (equipment !== 'none') requirements.add(equipment);
    }
  }
  return requirements.size === 0 ? ['none'] : [...requirements];
};

const makeSection = (
  id: WorkoutSection,
  label: string,
  selections: readonly SelectedSlotExercise[],
  input: NormalizedGeneratorInput,
  budgetSeconds: number,
  lockedSlots: Readonly<Record<string, string>>,
): GeneratedWorkoutSection => {
  const transitionBudget =
    Math.max(0, selections.length - 1) * TRANSITION_SECONDS;
  const exerciseBudget = Math.max(
    20,
    Math.floor((budgetSeconds - transitionBudget) / selections.length),
  );
  const exercises = selections.map(
    ({ slot, exercise }, index): GeneratedWorkoutExercise => {
      const target = prescribeExercise(exercise, input, id, exerciseBudget);
      return {
        itemId: `${slot.id}:${exercise.id}`,
        slotId: slot.id,
        exerciseId: exercise.id,
        exercise,
        section: id,
        order: index + 1,
        target,
        estimatedSeconds: estimateWorkoutTarget(target),
        locked: lockedSlots[slot.id] === exercise.id,
      };
    },
  );
  const estimatedSeconds =
    exercises.reduce(
      (total, exercise) => total + exercise.estimatedSeconds,
      0,
    ) +
    Math.max(0, exercises.length - 1) * TRANSITION_SECONDS;
  return { id, label, estimatedSeconds, exercises };
};

export const generateWorkout = (
  rawInput: unknown,
  options: GeneratorOptions = {},
): GenerationResult => {
  const normalized = normalizeGeneratorInput(rawInput);
  if (!normalized.ok) return normalized;
  const input = normalized.input;
  const seed = createVersionedSeed(options.seed, EXERCISE_DATASET_VERSION);
  const pool = filterExercises(input);
  const lockedSlots = options.lockedSlots ?? {};
  const lockedIds = Object.values(lockedSlots);
  const validSlotIds = new Set([
    ...getMainSlots(input.focus, input.durationMinutes).map((slot) => slot.id),
    ...createPreparationSlots(
      DURATION_TEMPLATES[input.durationMinutes].warmupSlotCount,
    ).map((slot) => slot.id),
    ...createCooldownSlots(
      DURATION_TEMPLATES[input.durationMinutes].cooldownSlotCount,
    ).map((slot) => slot.id),
  ]);

  const unknownLockedSlot = Object.keys(lockedSlots).find(
    (slotId) => !validSlotIds.has(slotId),
  );
  if (unknownLockedSlot) {
    return {
      ok: false,
      issue: {
        code: 'invalid-lock',
        message: 'A locked workout slot does not exist in this template.',
        reasons: [`Unknown locked slot: ${unknownLockedSlot}.`],
        suggestions: [
          'Unlock exercises before changing focus or duration, then regenerate.',
        ],
        slotId: unknownLockedSlot,
      },
    };
  }

  if (new Set(lockedIds).size !== lockedIds.length) {
    return {
      ok: false,
      issue: {
        code: 'invalid-lock',
        message:
          'The same exercise cannot be locked into more than one workout slot.',
        reasons: ['At least two locked slots reference the same exercise.'],
        suggestions: ['Unlock one copy and regenerate the workout.'],
      },
    };
  }

  if (pool.length === 0) {
    return {
      ok: false,
      issue: actionableIssue(
        input,
        {
          code: 'impossible-constraints',
          message: 'No exercises match every selected constraint.',
          reasons: [
            'The equipment, environment, level, and movement-to-avoid filters have no overlap.',
          ],
          suggestions: ['Relax one constraint and try again.'],
        },
        0,
      ),
    };
  }

  const durationTemplate = DURATION_TEMPLATES[input.durationMinutes];
  const mainSlots = getMainSlots(input.focus, input.durationMinutes);
  const main = selectExercisesForSlots(mainSlots, pool, {
    input,
    seed: `${seed}|main`,
    recentExerciseIds: options.recentExerciseIds,
    lockedSlots,
    blockedExerciseIds: lockedIds,
  });
  if (!main.ok)
    return {
      ok: false,
      issue: actionableIssue(input, main.issue, pool.length),
    };

  const selectedMain = main.selections.map(({ exercise }) => exercise);
  const cooldown = selectExercisesForSlots(
    createCooldownSlots(durationTemplate.cooldownSlotCount),
    pool,
    {
      input,
      seed: `${seed}|cooldown`,
      recentExerciseIds: options.recentExerciseIds,
      lockedSlots,
      blockedExerciseIds: lockedIds,
      alreadySelected: selectedMain,
      enforceRepetitionLimits: false,
    },
  );
  if (!cooldown.ok)
    return {
      ok: false,
      issue: actionableIssue(input, cooldown.issue, pool.length),
    };

  const selectedBeforeWarmup = [
    ...selectedMain,
    ...cooldown.selections.map(({ exercise }) => exercise),
  ];
  const warmupPool = pool.filter(
    (exercise) =>
      exercise.noise === 'quiet' &&
      (exercise.impact === 'none' || exercise.impact === 'low'),
  );
  const warmup = selectExercisesForSlots(
    createPreparationSlots(durationTemplate.warmupSlotCount),
    warmupPool,
    {
      input,
      seed: `${seed}|warmup`,
      recentExerciseIds: options.recentExerciseIds,
      lockedSlots,
      blockedExerciseIds: lockedIds,
      alreadySelected: selectedBeforeWarmup,
      enforceRepetitionLimits: false,
    },
  );
  if (!warmup.ok)
    return {
      ok: false,
      issue: actionableIssue(input, warmup.issue, pool.length),
    };

  const sections = {
    warmup: makeSection(
      'warmup',
      'Warm-up',
      warmup.selections,
      input,
      durationTemplate.warmupSeconds,
      lockedSlots,
    ),
    main: makeSection(
      'main',
      'Main workout',
      main.selections,
      input,
      input.durationMinutes * 60 -
        durationTemplate.warmupSeconds -
        durationTemplate.cooldownSeconds,
      lockedSlots,
    ),
    cooldown: makeSection(
      'cooldown',
      'Cooldown',
      cooldown.selections,
      input,
      durationTemplate.cooldownSeconds,
      lockedSlots,
    ),
  };
  const allExercises = Object.values(sections).flatMap((section) =>
    section.exercises.map((item) => item.exercise),
  );
  const focusTemplate = FOCUS_TEMPLATES[input.focus];
  const goalTemplate = GOAL_TEMPLATES[input.goal];
  const format =
    input.durationMinutes < 15 || input.experience === 'beginner'
      ? 'straight-sets'
      : goalTemplate.formatByExperience[input.experience];
  const warnings: string[] = [];
  if (input.durationMinutes <= 10) {
    warnings.push(
      'This short session uses a reduced template and rotates broad movement patterns across seeds.',
    );
  }
  if (input.avoidStressTags.length > 0) {
    warnings.push(
      'Movements-to-avoid preferences stay on this device and are intentionally omitted from share links.',
    );
  }

  const workout: GeneratedWorkout = {
    id: `${GENERATOR_VERSION}-${EXERCISE_DATASET_VERSION}-${seed.split(':').at(-1)}`,
    generatorVersion: GENERATOR_VERSION,
    datasetVersion: EXERCISE_DATASET_VERSION,
    seed,
    input,
    title: `${input.durationMinutes}-minute ${focusTemplate.title.toLocaleLowerCase()}`,
    rationale: focusTemplate.rationale,
    format,
    estimatedDurationSeconds: Object.values(sections).reduce(
      (total, section) => total + section.estimatedSeconds,
      0,
    ),
    equipmentNeeded: equipmentNeededFor(allExercises),
    sections,
    warnings,
    safetyNote:
      'Use controlled ranges and stop any movement that feels wrong for you. This workout is general information, not diagnosis or rehabilitation guidance.',
  };

  const validationErrors = validateGeneratedWorkout(workout);
  if (validationErrors.length > 0) {
    return {
      ok: false,
      issue: {
        code: 'invalid-workout',
        message: 'A complete workout could not be validated for these options.',
        reasons: validationErrors,
        suggestions: [
          'Try another seed or relax one of the active constraints.',
        ],
      },
    };
  }
  return { ok: true, workout };
};
