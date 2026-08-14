import { getMainSlots } from '../../data/generator-templates';
import type {
  GeneratedWorkout,
  GeneratedWorkoutExercise,
  MovementSlotTemplate,
} from '../../types/workout';
import { exerciseMatchesConstraints } from './filters';
import { estimateWorkoutTarget } from './prescription';

const TRANSITION_SECONDS = 10;

const sectionEstimate = (items: readonly GeneratedWorkoutExercise[]): number =>
  items.reduce((total, item) => total + estimateWorkoutTarget(item.target), 0) +
  Math.max(0, items.length - 1) * TRANSITION_SECONDS;

export const validateGeneratedWorkout = (
  workout: GeneratedWorkout,
): string[] => {
  const errors: string[] = [];
  const allItems = [
    ...workout.sections.warmup.exercises,
    ...workout.sections.main.exercises,
    ...workout.sections.cooldown.exercises,
  ];
  const ids = allItems.map((item) => item.exerciseId);

  if (new Set(ids).size !== ids.length)
    errors.push('Workout contains a duplicate exercise.');
  if (workout.sections.warmup.exercises.length === 0)
    errors.push('Workout has no warm-up.');
  if (workout.sections.main.exercises.length === 0)
    errors.push('Workout has no main section.');
  if (workout.sections.cooldown.exercises.length === 0)
    errors.push('Workout has no cooldown.');

  for (const item of allItems) {
    if (item.exercise.id !== item.exerciseId) {
      errors.push(`Exercise snapshot mismatch for ${item.itemId}.`);
    }
    if (!exerciseMatchesConstraints(item.exercise, workout.input)) {
      errors.push(
        `${item.exercise.name} violates the normalized workout constraints.`,
      );
    }
    const estimate = estimateWorkoutTarget(item.target);
    if (estimate !== item.estimatedSeconds) {
      errors.push(`Duration estimate mismatch for ${item.exercise.name}.`);
    }
  }

  const mainSlots = new Map<string, MovementSlotTemplate>(
    getMainSlots(workout.input.focus, workout.input.durationMinutes).map(
      (slot) => [slot.id, slot],
    ),
  );
  for (const item of workout.sections.main.exercises) {
    const slot = mainSlots.get(item.slotId);
    if (!slot || !slot.patterns.includes(item.exercise.movementPattern)) {
      errors.push(
        `${item.exercise.name} does not fill its required movement-pattern slot.`,
      );
    }
  }

  for (const section of Object.values(workout.sections)) {
    const estimate = sectionEstimate(section.exercises);
    if (estimate !== section.estimatedSeconds) {
      errors.push(
        `${section.label} duration does not match its exercise prescriptions.`,
      );
    }
  }

  const recomputedTotal = Object.values(workout.sections).reduce(
    (total, section) => total + section.estimatedSeconds,
    0,
  );
  if (recomputedTotal !== workout.estimatedDurationSeconds) {
    errors.push('Total workout duration does not match its sections.');
  }
  const requestedSeconds = workout.input.durationMinutes * 60;
  if (workout.estimatedDurationSeconds > requestedSeconds + 5) {
    errors.push('Workout exceeds the selected duration.');
  }
  if (workout.estimatedDurationSeconds < requestedSeconds * 0.65) {
    errors.push('Workout estimate is too short for the selected duration.');
  }

  if (
    workout.input.equipment.includes('one-dumbbell') &&
    !workout.input.equipment.includes('two-dumbbells') &&
    allItems.some((item) => item.exercise.equipment.includes('two-dumbbells'))
  ) {
    errors.push('A one-dumbbell workout contains a two-dumbbell movement.');
  }

  return errors;
};

export { TRANSITION_SECONDS };
