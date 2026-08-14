import { GOAL_TEMPLATES } from '../../data/generator-templates';
import type { Exercise, MuscleGroup, StressTag } from '../../types/exercise';
import type {
  GenerationIssue,
  MovementSlotTemplate,
  NormalizedGeneratorInput,
} from '../../types/workout';
import { deterministicUnit } from './seed';

const FOCUS_MUSCLES: Record<
  NormalizedGeneratorInput['focus'],
  readonly MuscleGroup[]
> = {
  'full-body': [
    'full-body',
    'quadriceps',
    'glutes',
    'chest',
    'lats',
    'upper-back',
    'abdominals',
  ],
  'upper-body': [
    'chest',
    'lats',
    'upper-back',
    'shoulders',
    'biceps',
    'triceps',
  ],
  'lower-body': [
    'quadriceps',
    'hamstrings',
    'glutes',
    'calves',
    'adductors',
    'abductors',
  ],
  core: ['abdominals', 'obliques', 'lower-back'],
  arms: ['biceps', 'triceps', 'forearms'],
  chest: ['chest', 'triceps'],
  back: ['lats', 'upper-back', 'lower-back', 'biceps'],
  shoulders: ['shoulders', 'upper-back', 'triceps'],
  glutes: ['glutes', 'hamstrings', 'abductors'],
};

export interface ScoringContext {
  input: NormalizedGeneratorInput;
  seed: string;
  recentExerciseIds: ReadonlySet<string>;
  selected: readonly Exercise[];
}

const countPrimaryMuscle = (
  selected: readonly Exercise[],
  muscle: MuscleGroup,
): number =>
  selected.filter((exercise) => exercise.primaryMuscles.includes(muscle))
    .length;

const countStressTag = (
  selected: readonly Exercise[],
  tag: StressTag,
): number =>
  selected.filter((exercise) => exercise.stressTags.includes(tag)).length;

export const scoreExerciseForSlot = (
  exercise: Exercise,
  slot: MovementSlotTemplate,
  context: ScoringContext,
): number => {
  const goal = GOAL_TEMPLATES[context.input.goal];
  let score = 100;

  if (
    slot.preferredMuscles?.some((muscle) =>
      exercise.primaryMuscles.includes(muscle),
    )
  )
    score += 28;
  else if (
    slot.preferredMuscles?.some((muscle) =>
      exercise.secondaryMuscles.includes(muscle),
    )
  )
    score += 10;

  const focusMuscles = FOCUS_MUSCLES[context.input.focus];
  score +=
    exercise.primaryMuscles.filter((muscle) => focusMuscles.includes(muscle))
      .length * 9;
  score +=
    exercise.secondaryMuscles.filter((muscle) => focusMuscles.includes(muscle))
      .length * 2;

  if (exercise.compound) score += goal.compoundBonus;
  if (slot.compound === 'required') score += exercise.compound ? 14 : -10;
  if (slot.compound === 'preferred') score += exercise.compound ? 7 : 0;
  if (exercise.movementPattern === 'mobility') score += goal.mobilityBonus;
  if (exercise.movementPattern === 'conditioning')
    score += goal.conditioningBonus;
  if (exercise.difficulty === context.input.experience) score += 4;
  if (context.recentExerciseIds.has(exercise.id)) score -= 18;

  for (const muscle of exercise.primaryMuscles) {
    score -= countPrimaryMuscle(context.selected, muscle) * 13;
  }
  for (const tag of exercise.stressTags) {
    score -= countStressTag(context.selected, tag) * 6;
  }

  score += deterministicUnit(`${context.seed}|${slot.id}|${exercise.id}`) * 5;
  return score;
};

export interface SelectedSlotExercise {
  slot: MovementSlotTemplate;
  exercise: Exercise;
}

export type SelectionResult =
  | { ok: true; selections: SelectedSlotExercise[] }
  | { ok: false; issue: GenerationIssue };

export interface SelectForSlotsOptions {
  input: NormalizedGeneratorInput;
  seed: string;
  recentExerciseIds?: readonly string[] | undefined;
  lockedSlots?: Readonly<Record<string, string>>;
  blockedExerciseIds?: readonly string[];
  alreadySelected?: readonly Exercise[];
  enforceRepetitionLimits?: boolean;
}

const maximumPrimaryRepeats = (input: NormalizedGeneratorInput): number =>
  input.focus === 'full-body' || input.focus === 'upper-body' ? 2 : 3;

const maximumStressRepeats = (input: NormalizedGeneratorInput): number =>
  input.focus === 'core' ||
  input.focus === 'lower-body' ||
  input.focus === 'glutes'
    ? 3
    : 2;

const fitsRepetitionLimits = (
  exercise: Exercise,
  selected: readonly Exercise[],
  input: NormalizedGeneratorInput,
): boolean => {
  const primaryLimit = maximumPrimaryRepeats(input);
  const stressLimit = maximumStressRepeats(input);
  if (
    exercise.primaryMuscles.some(
      (muscle) => countPrimaryMuscle(selected, muscle) >= primaryLimit,
    )
  ) {
    return false;
  }
  if (
    exercise.stressTags.some(
      (tag) => countStressTag(selected, tag) >= stressLimit,
    )
  ) {
    return false;
  }
  return true;
};

export const selectExercisesForSlots = (
  slots: readonly MovementSlotTemplate[],
  pool: readonly Exercise[],
  options: SelectForSlotsOptions,
): SelectionResult => {
  const recent = new Set(options.recentExerciseIds ?? []);
  const lockedSlots = options.lockedSlots ?? {};
  const blocked = new Set(options.blockedExerciseIds ?? []);
  const initialSelected = [...(options.alreadySelected ?? [])];

  for (const slot of slots) {
    const lockedId = lockedSlots[slot.id];
    if (lockedId === undefined) continue;
    const exercise = pool.find((candidate) => candidate.id === lockedId);
    if (!exercise) {
      return {
        ok: false,
        issue: {
          code: 'invalid-lock',
          message:
            'A locked exercise no longer matches the current constraints.',
          reasons: [`${lockedId} is unavailable for locked slot ${slot.id}.`],
          suggestions: [
            'Unlock that exercise or restore the equipment and environment options used before.',
          ],
          slotId: slot.id,
        },
      };
    }
    if (!slot.patterns.includes(exercise.movementPattern)) {
      return {
        ok: false,
        issue: {
          code: 'invalid-lock',
          message: 'A locked exercise does not fit its workout slot.',
          reasons: [
            `${exercise.name} is a ${exercise.movementPattern} movement, but ${slot.id} needs ${slot.patterns.join(' or ')}.`,
          ],
          suggestions: [
            'Unlock the exercise before changing the workout focus.',
          ],
          slotId: slot.id,
        },
      };
    }
  }

  const recurse = (
    slotIndex: number,
    selections: SelectedSlotExercise[],
    selectedExercises: Exercise[],
  ): SelectedSlotExercise[] | undefined => {
    if (slotIndex >= slots.length) return selections;
    const slot = slots[slotIndex]!;
    const lockedId = lockedSlots[slot.id];
    const usedIds = new Set(selectedExercises.map((exercise) => exercise.id));
    const candidates = pool
      .filter((exercise) => slot.patterns.includes(exercise.movementPattern))
      .filter(
        (exercise) => !blocked.has(exercise.id) || exercise.id === lockedId,
      )
      .filter((exercise) => !usedIds.has(exercise.id))
      .filter((exercise) => lockedId === undefined || exercise.id === lockedId)
      .filter(
        (exercise) =>
          options.enforceRepetitionLimits === false ||
          fitsRepetitionLimits(exercise, selectedExercises, options.input),
      )
      .map((exercise) => ({
        exercise,
        score: scoreExerciseForSlot(exercise, slot, {
          input: options.input,
          seed: options.seed,
          recentExerciseIds: recent,
          selected: selectedExercises,
        }),
      }))
      .sort(
        (left, right) =>
          right.score - left.score ||
          left.exercise.id.localeCompare(right.exercise.id),
      );

    for (const candidate of candidates) {
      const next = recurse(
        slotIndex + 1,
        [...selections, { slot, exercise: candidate.exercise }],
        [...selectedExercises, candidate.exercise],
      );
      if (next) return next;
    }
    return undefined;
  };

  const selections = recurse(0, [], initialSelected);
  if (selections) return { ok: true, selections };

  const firstUnfillableSlot = slots.find(
    (slot) =>
      !pool.some(
        (exercise) =>
          slot.patterns.includes(exercise.movementPattern) &&
          !blocked.has(exercise.id),
      ),
  );
  const slot = firstUnfillableSlot ?? slots[0];
  return {
    ok: false,
    issue: {
      code: 'impossible-constraints',
      message:
        'These options do not leave enough distinct movements for a balanced workout.',
      reasons: slot
        ? [
            `No non-duplicate combination can fill ${slot.patterns.join(' or ')} slot ${slot.id}.`,
          ]
        : ['No workout slots could be filled.'],
      suggestions: [
        'Add another equipment option or allow a different exercise position.',
        'Try a shorter duration, which uses a reduced balanced template.',
      ],
      ...(slot ? { slotId: slot.id } : {}),
    },
  };
};
