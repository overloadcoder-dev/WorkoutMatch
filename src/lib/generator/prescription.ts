import { GOAL_TEMPLATES } from '../../data/generator-templates';
import type { Exercise, Prescription } from '../../types/exercise';
import type {
  NormalizedGeneratorInput,
  WorkoutSection,
  WorkoutTarget,
} from '../../types/workout';

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, Math.round(value)));

const sideHandlingFor = (exercise: Exercise): WorkoutTarget['sideHandling'] => {
  if (!exercise.unilateral) return 'together';
  if (
    exercise.movementPattern === 'conditioning' ||
    exercise.id === 'ex-standing-cross-body-knee-drive'
  ) {
    return 'alternate';
  }
  return 'each-side';
};

const sideMultiplier = (sideHandling: WorkoutTarget['sideHandling']): number =>
  sideHandling === 'each-side' ? 2 : 1;

export const estimateWorkoutTarget = (target: WorkoutTarget): number => {
  const multiplier = sideMultiplier(target.sideHandling);
  let workPerSet: number;
  if (target.mode === 'reps') workPerSet = target.reps * 3 * multiplier;
  else if (target.mode === 'time') workPerSet = target.workSeconds * multiplier;
  else workPerSet = target.distanceMeters * multiplier;
  return (
    workPerSet * target.sets + target.restSeconds * Math.max(0, target.sets - 1)
  );
};

const createCandidate = (
  prescription: Prescription,
  sets: number,
  work: number,
  restSeconds: number,
  sideHandling: WorkoutTarget['sideHandling'],
): WorkoutTarget => {
  if (prescription.mode === 'reps') {
    return { mode: 'reps', sets, reps: work, restSeconds, sideHandling };
  }
  if (prescription.mode === 'time') {
    return { mode: 'time', sets, workSeconds: work, restSeconds, sideHandling };
  }
  return {
    mode: 'distance',
    sets,
    distanceMeters: work,
    restSeconds,
    sideHandling,
  };
};

export const prescribeExercise = (
  exercise: Exercise,
  input: NormalizedGeneratorInput,
  section: WorkoutSection,
  budgetSeconds: number,
): WorkoutTarget => {
  const base = exercise.defaultPrescription[input.experience];
  const sideHandling = sideHandlingFor(exercise);
  const multiplier = sideMultiplier(sideHandling);

  if (section !== 'main') {
    const work =
      base.mode === 'reps'
        ? clamp(
            Math.min(base.reps.max, budgetSeconds / (3 * multiplier)),
            4,
            16,
          )
        : base.mode === 'time'
          ? clamp(
              Math.min(base.workSeconds, budgetSeconds / multiplier),
              15,
              60,
            )
          : clamp(
              Math.min(base.distanceMeters, budgetSeconds / multiplier),
              5,
              30,
            );
    return createCandidate(base, 1, work, 0, sideHandling);
  }

  const goal = GOAL_TEMPLATES[input.goal];
  const baseWork =
    base.mode === 'reps'
      ? Math.round((base.reps.min + base.reps.max) / 2)
      : base.mode === 'time'
        ? base.workSeconds
        : base.distanceMeters;
  const minimumWork = base.mode === 'reps' ? 4 : base.mode === 'time' ? 10 : 5;
  const maximumWork =
    base.mode === 'reps'
      ? Math.max(base.reps.max + 4, 12)
      : base.mode === 'time'
        ? Math.max(base.workSeconds + 20, 45)
        : Math.max(base.distanceMeters + 10, 20);
  const secondsPerWorkUnit = base.mode === 'reps' ? 3 * multiplier : multiplier;
  const preferredRest = clamp(
    base.restSeconds + goal.restAdjustmentSeconds,
    10,
    120,
  );
  const maximumSets = Math.min(5, Math.max(2, base.sets + 1));
  const candidates: WorkoutTarget[] = [];

  for (let sets = 1; sets <= maximumSets; sets += 1) {
    const restGaps = Math.max(0, sets - 1);
    let work = clamp(baseWork, minimumWork, maximumWork);
    let rest = restGaps === 0 ? 0 : preferredRest;
    let estimate = work * secondsPerWorkUnit * sets + rest * restGaps;

    if (estimate > budgetSeconds && restGaps > 0) {
      rest = clamp(
        (budgetSeconds - work * secondsPerWorkUnit * sets) / restGaps,
        10,
        preferredRest,
      );
      estimate = work * secondsPerWorkUnit * sets + rest * restGaps;
    }
    if (estimate > budgetSeconds) {
      work = clamp(
        (budgetSeconds - rest * restGaps) / (secondsPerWorkUnit * sets),
        minimumWork,
        maximumWork,
      );
      estimate = work * secondsPerWorkUnit * sets + rest * restGaps;
    }
    if (estimate <= budgetSeconds + 1) {
      if (restGaps > 0) {
        rest = clamp(
          (budgetSeconds - work * secondsPerWorkUnit * sets) / restGaps,
          10,
          120,
        );
      }
      candidates.push(createCandidate(base, sets, work, rest, sideHandling));
    }
  }

  const fallback = createCandidate(base, 1, minimumWork, 0, sideHandling);
  return (
    candidates.sort((left, right) => {
      const leftDistance = Math.abs(
        budgetSeconds - estimateWorkoutTarget(left),
      );
      const rightDistance = Math.abs(
        budgetSeconds - estimateWorkoutTarget(right),
      );
      if (leftDistance !== rightDistance) return leftDistance - rightDistance;
      return right.sets - left.sets;
    })[0] ?? fallback
  );
};
