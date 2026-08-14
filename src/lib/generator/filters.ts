import { EXERCISES } from '../../data/exercises';
import type { Equipment, Exercise } from '../../types/exercise';
import type { NormalizedGeneratorInput } from '../../types/workout';

const difficultyRank = { beginner: 0, intermediate: 1, advanced: 2 } as const;
const spaceRank = { 'very-small': 0, small: 1, medium: 2 } as const;

export const equipmentRequirementIsAvailable = (
  requirement: Equipment,
  available: readonly Equipment[],
): boolean => {
  if (requirement === 'none') return true;
  if (requirement === 'one-dumbbell') {
    return (
      available.includes('one-dumbbell') || available.includes('two-dumbbells')
    );
  }
  return available.includes(requirement);
};

export const exerciseMatchesEquipment = (
  exercise: Exercise,
  available: readonly Equipment[],
): boolean =>
  exercise.equipment.every((requirement) =>
    equipmentRequirementIsAvailable(requirement, available),
  );

export const exerciseMatchesConstraints = (
  exercise: Exercise,
  input: NormalizedGeneratorInput,
): boolean => {
  if (!exerciseMatchesEquipment(exercise, input.equipment)) return false;
  if (spaceRank[exercise.space] > spaceRank[input.environment.space])
    return false;
  if (input.environment.quiet && exercise.noise !== 'quiet') return false;
  if (input.environment.noJump && exercise.impact === 'high') return false;
  if (
    input.goal === 'low-impact-movement' &&
    exercise.impact !== 'none' &&
    exercise.impact !== 'low'
  ) {
    return false;
  }
  if (
    (input.environment.standingOnly || input.environment.noFloor) &&
    exercise.position !== 'standing'
  ) {
    return false;
  }
  if (difficultyRank[exercise.difficulty] > difficultyRank[input.experience])
    return false;
  if (exercise.stressTags.some((tag) => input.avoidStressTags.includes(tag)))
    return false;
  return true;
};

export const filterExercises = (
  input: NormalizedGeneratorInput,
  exercises: readonly Exercise[] = EXERCISES,
): Exercise[] =>
  exercises.filter((exercise) => exerciseMatchesConstraints(exercise, input));
