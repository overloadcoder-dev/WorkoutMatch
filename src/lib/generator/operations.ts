import { EXERCISES } from '../../data/exercises';
import { getMainSlots } from '../../data/generator-templates';
import type { Equipment, Exercise } from '../../types/exercise';
import type {
  GeneratedWorkout,
  GeneratedWorkoutExercise,
  MovementSlotTemplate,
  RegenerateOptions,
  ReplaceOptions,
  WorkoutOperationResult,
  WorkoutSection,
} from '../../types/workout';
import { filterExercises } from './filters';
import { generateWorkout } from './generate';
import { prescribeExercise, estimateWorkoutTarget } from './prescription';
import { selectExercisesForSlots } from './scoring';
import { nextSeed } from './seed';
import {
  TRANSITION_SECONDS,
  validateGeneratedWorkout,
} from './validate-workout';

const allItems = (workout: GeneratedWorkout): GeneratedWorkoutExercise[] => [
  ...workout.sections.warmup.exercises,
  ...workout.sections.main.exercises,
  ...workout.sections.cooldown.exercises,
];

const externalEquipmentFor = (
  items: readonly GeneratedWorkoutExercise[],
): Equipment[] => {
  const equipment = new Set<Equipment>();
  for (const item of items) {
    for (const requirement of item.exercise.equipment) {
      if (requirement !== 'none') equipment.add(requirement);
    }
  }
  return equipment.size === 0 ? ['none'] : [...equipment];
};

const rebuildWorkout = (
  workout: GeneratedWorkout,
  changedSection: WorkoutSection,
  exercises: GeneratedWorkoutExercise[],
): GeneratedWorkout => {
  const estimatedSeconds =
    exercises.reduce((total, item) => total + item.estimatedSeconds, 0) +
    Math.max(0, exercises.length - 1) * TRANSITION_SECONDS;
  const sections = {
    ...workout.sections,
    [changedSection]: {
      ...workout.sections[changedSection],
      exercises,
      estimatedSeconds,
    },
  };
  const items = Object.values(sections).flatMap((section) => section.exercises);
  return {
    ...workout,
    sections,
    estimatedDurationSeconds: Object.values(sections).reduce(
      (total, section) => total + section.estimatedSeconds,
      0,
    ),
    equipmentNeeded: externalEquipmentFor(items),
  };
};

export const setExerciseLock = (
  workout: GeneratedWorkout,
  itemId: string,
  locked: boolean,
): WorkoutOperationResult => {
  const target = allItems(workout).find((item) => item.itemId === itemId);
  if (!target) {
    return {
      ok: false,
      issue: {
        code: 'invalid-lock',
        message: 'That workout exercise could not be found.',
        reasons: [`Unknown workout item: ${itemId}`],
        suggestions: [
          'Refresh the result and choose an exercise shown in the current workout.',
        ],
        itemId,
      },
    };
  }
  const exercises = workout.sections[target.section].exercises.map((item) =>
    item.itemId === itemId ? { ...item, locked } : item,
  );
  return {
    ok: true,
    workout: rebuildWorkout(workout, target.section, exercises),
  };
};

export const toggleExerciseLock = (
  workout: GeneratedWorkout,
  itemId: string,
): WorkoutOperationResult => {
  const target = allItems(workout).find((item) => item.itemId === itemId);
  return setExerciseLock(workout, itemId, !(target?.locked ?? false));
};

export const regenerateWorkout = (
  workout: GeneratedWorkout,
  options: RegenerateOptions = {},
): WorkoutOperationResult => {
  const lockedSlots = Object.fromEntries(
    allItems(workout)
      .filter((item) => item.locked)
      .map((item) => [item.slotId, item.exerciseId]),
  );
  const recentExerciseIds = [
    ...(options.recentExerciseIds ?? []),
    ...allItems(workout)
      .filter((item) => !item.locked)
      .map((item) => item.exerciseId),
  ];
  return generateWorkout(workout.input, {
    seed: options.seed ?? nextSeed(workout.seed, 'regen'),
    recentExerciseIds,
    lockedSlots,
  });
};

const slotForItem = (
  workout: GeneratedWorkout,
  item: GeneratedWorkoutExercise,
): MovementSlotTemplate => {
  if (item.section === 'main') {
    const match = getMainSlots(
      workout.input.focus,
      workout.input.durationMinutes,
    ).find((slot) => slot.id === item.slotId);
    if (match) return match;
  }
  return {
    id: item.slotId,
    patterns:
      item.section === 'cooldown' ? ['mobility'] : ['mobility', 'conditioning'],
    compound: 'neutral',
  };
};

export const replaceExercise = (
  workout: GeneratedWorkout,
  itemId: string,
  options: ReplaceOptions = {},
): WorkoutOperationResult => {
  const currentItems = allItems(workout);
  const target = currentItems.find((item) => item.itemId === itemId);
  if (!target) {
    return {
      ok: false,
      issue: {
        code: 'no-replacement',
        message: 'That workout exercise could not be found.',
        reasons: [`Unknown workout item: ${itemId}`],
        suggestions: ['Choose an exercise shown in the current workout.'],
        itemId,
      },
    };
  }
  if (target.locked) {
    return {
      ok: false,
      issue: {
        code: 'invalid-lock',
        message: 'Unlock this exercise before replacing it.',
        reasons: [`${target.exercise.name} is currently locked.`],
        suggestions: ['Unlock the exercise, then choose Replace again.'],
        itemId,
        slotId: target.slotId,
      },
    };
  }

  const pool = filterExercises(workout.input, EXERCISES);
  const otherItems = currentItems.filter((item) => item.itemId !== itemId);
  const selection = selectExercisesForSlots(
    [slotForItem(workout, target)],
    pool,
    {
      input: workout.input,
      seed: `${options.seed ?? nextSeed(workout.seed, `replace-${target.slotId}`)}|replacement`,
      recentExerciseIds: options.recentExerciseIds,
      blockedExerciseIds: currentItems.map((item) => item.exerciseId),
      alreadySelected: otherItems.map((item) => item.exercise),
    },
  );
  if (!selection.ok) {
    const samePatternCount = pool.filter(
      (exercise) =>
        exercise.movementPattern === target.exercise.movementPattern &&
        !currentItems.some((item) => item.exerciseId === exercise.id),
    ).length;
    return {
      ok: false,
      issue: {
        code: 'no-replacement',
        message: `No compatible replacement is available for ${target.exercise.name}.`,
        reasons: [
          `${samePatternCount} unused ${target.exercise.movementPattern} movements match the current filters.`,
          ...selection.issue.reasons,
        ],
        suggestions: [
          'Add another equipment option.',
          workout.input.environment.standingOnly ||
          workout.input.environment.noFloor
            ? 'Allow seated or floor exercises.'
            : 'Relax one movement-to-avoid preference.',
        ],
        itemId,
        slotId: target.slotId,
      },
    };
  }

  const replacement: Exercise = selection.selections[0]!.exercise;
  const newTarget = prescribeExercise(
    replacement,
    workout.input,
    target.section,
    target.estimatedSeconds,
  );
  const replacementItem: GeneratedWorkoutExercise = {
    ...target,
    itemId: `${target.slotId}:${replacement.id}`,
    exerciseId: replacement.id,
    exercise: replacement,
    target: newTarget,
    estimatedSeconds: estimateWorkoutTarget(newTarget),
    locked: false,
  };
  const sectionItems = workout.sections[target.section].exercises.map((item) =>
    item.itemId === itemId ? replacementItem : item,
  );
  const updated = rebuildWorkout(workout, target.section, sectionItems);
  const errors = validateGeneratedWorkout(updated);
  if (errors.length > 0) {
    return {
      ok: false,
      issue: {
        code: 'invalid-workout',
        message: 'The replacement would make the workout invalid.',
        reasons: errors,
        suggestions: [
          'Try Replace again with another seed or regenerate the unlocked workout.',
        ],
        itemId,
        slotId: target.slotId,
      },
    };
  }
  return { ok: true, workout: updated };
};
