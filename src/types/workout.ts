import type {
  Equipment,
  Exercise,
  ExperienceLevel,
  MovementPattern,
  MuscleGroup,
  SpaceRequirement,
  StressTag,
} from './exercise';

export const WORKOUT_GOALS = [
  'general-fitness',
  'strength',
  'muscle-gain',
  'endurance',
  'mobility',
  'low-impact-movement',
] as const;
export type WorkoutGoal = (typeof WORKOUT_GOALS)[number];

export const WORKOUT_DURATIONS = [5, 10, 15, 20, 30, 45] as const;
export type WorkoutDuration = (typeof WORKOUT_DURATIONS)[number];

export const WORKOUT_FOCUSES = [
  'full-body',
  'upper-body',
  'lower-body',
  'core',
  'arms',
  'chest',
  'back',
  'shoulders',
  'glutes',
] as const;
export type WorkoutFocus = (typeof WORKOUT_FOCUSES)[number];

export const WORKOUT_SECTIONS = ['warmup', 'main', 'cooldown'] as const;
export type WorkoutSection = (typeof WORKOUT_SECTIONS)[number];

export const WORKOUT_FORMATS = [
  'straight-sets',
  'superset',
  'circuit',
] as const;
export type WorkoutFormat = (typeof WORKOUT_FORMATS)[number];

export interface WorkoutEnvironment {
  space: SpaceRequirement;
  quiet: boolean;
  noJump: boolean;
  standingOnly: boolean;
  noFloor: boolean;
}

export interface GeneratorInput {
  goal: WorkoutGoal;
  experience: ExperienceLevel;
  durationMinutes: WorkoutDuration;
  equipment: Equipment[];
  focus: WorkoutFocus;
  environment: WorkoutEnvironment;
  avoidStressTags: StressTag[];
}

export type NormalizedGeneratorInput = Readonly<{
  goal: WorkoutGoal;
  experience: ExperienceLevel;
  durationMinutes: WorkoutDuration;
  equipment: readonly Equipment[];
  focus: WorkoutFocus;
  environment: Readonly<WorkoutEnvironment>;
  avoidStressTags: readonly StressTag[];
}>;

export type WorkoutTarget =
  | {
      mode: 'reps';
      sets: number;
      reps: number;
      restSeconds: number;
      sideHandling: 'together' | 'each-side' | 'alternate';
    }
  | {
      mode: 'time';
      sets: number;
      workSeconds: number;
      restSeconds: number;
      sideHandling: 'together' | 'each-side' | 'alternate';
    }
  | {
      mode: 'distance';
      sets: number;
      distanceMeters: number;
      restSeconds: number;
      sideHandling: 'together' | 'each-side' | 'alternate';
    };

export interface GeneratedWorkoutExercise {
  itemId: string;
  slotId: string;
  exerciseId: string;
  exercise: Exercise;
  section: WorkoutSection;
  order: number;
  target: WorkoutTarget;
  estimatedSeconds: number;
  locked: boolean;
}

export interface GeneratedWorkoutSection {
  id: WorkoutSection;
  label: string;
  estimatedSeconds: number;
  exercises: GeneratedWorkoutExercise[];
}

export interface GeneratedWorkout {
  id: string;
  generatorVersion: string;
  datasetVersion: string;
  seed: string;
  input: NormalizedGeneratorInput;
  title: string;
  rationale: string;
  format: WorkoutFormat;
  estimatedDurationSeconds: number;
  equipmentNeeded: Equipment[];
  sections: Record<WorkoutSection, GeneratedWorkoutSection>;
  warnings: string[];
  safetyNote: string;
}

export type GenerationIssueCode =
  | 'invalid-input'
  | 'impossible-constraints'
  | 'invalid-lock'
  | 'no-replacement'
  | 'invalid-workout';

export interface GenerationIssue {
  code: GenerationIssueCode;
  message: string;
  reasons: string[];
  suggestions: string[];
  slotId?: string;
  itemId?: string;
}

export type GenerationResult =
  | { ok: true; workout: GeneratedWorkout }
  | { ok: false; issue: GenerationIssue };

export type WorkoutOperationResult = GenerationResult;

export interface GeneratorOptions {
  seed?: string | number;
  recentExerciseIds?: readonly string[] | undefined;
  lockedSlots?: Readonly<Record<string, string>>;
}

export interface RegenerateOptions {
  seed?: string | number;
  recentExerciseIds?: readonly string[] | undefined;
}

export interface ReplaceOptions {
  seed?: string | number;
  recentExerciseIds?: readonly string[] | undefined;
}

export type CompoundPreference = 'required' | 'preferred' | 'neutral';

export interface MovementSlotTemplate {
  id: string;
  patterns: readonly MovementPattern[];
  preferredMuscles?: readonly MuscleGroup[];
  compound: CompoundPreference;
  optional?: boolean;
}

export interface FocusTemplate {
  focus: WorkoutFocus;
  title: string;
  rationale: string;
  shortSlots: readonly MovementSlotTemplate[];
  standardSlots: readonly MovementSlotTemplate[];
  extendedSlots: readonly MovementSlotTemplate[];
}

export interface DurationTemplate {
  durationMinutes: WorkoutDuration;
  warmupSeconds: number;
  cooldownSeconds: number;
  mainSlotCount: number;
  warmupSlotCount: number;
  cooldownSlotCount: number;
}

export interface GoalTemplate {
  goal: WorkoutGoal;
  formatByExperience: Record<ExperienceLevel, WorkoutFormat>;
  compoundBonus: number;
  mobilityBonus: number;
  conditioningBonus: number;
  restAdjustmentSeconds: number;
}
