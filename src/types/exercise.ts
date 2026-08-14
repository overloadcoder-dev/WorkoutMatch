export const EXPERIENCE_LEVELS = [
  'beginner',
  'intermediate',
  'advanced',
] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const EQUIPMENT_OPTIONS = [
  'none',
  'one-dumbbell',
  'two-dumbbells',
  'resistance-band',
  'chair-or-bench',
  'pull-up-bar',
] as const;
export type Equipment = (typeof EQUIPMENT_OPTIONS)[number];

export const MUSCLE_GROUPS = [
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
  'chest',
  'upper-back',
  'lats',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'abdominals',
  'obliques',
  'lower-back',
  'hip-flexors',
  'adductors',
  'abductors',
  'full-body',
] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const MOVEMENT_PATTERNS = [
  'knee-dominant',
  'hip-dominant',
  'push',
  'pull',
  'core',
  'carry',
  'conditioning',
  'mobility',
] as const;
export type MovementPattern = (typeof MOVEMENT_PATTERNS)[number];

export const EXERCISE_POSITIONS = [
  'standing',
  'seated',
  'kneeling',
  'supine',
  'prone',
  'hanging',
] as const;
export type ExercisePosition = (typeof EXERCISE_POSITIONS)[number];

export const IMPACT_LEVELS = ['none', 'low', 'moderate', 'high'] as const;
export type ImpactLevel = (typeof IMPACT_LEVELS)[number];

export const NOISE_LEVELS = ['quiet', 'moderate', 'loud'] as const;
export type NoiseLevel = (typeof NOISE_LEVELS)[number];

export const SPACE_REQUIREMENTS = ['very-small', 'small', 'medium'] as const;
export type SpaceRequirement = (typeof SPACE_REQUIREMENTS)[number];

export const REP_MODES = ['reps', 'time', 'distance'] as const;
export type RepMode = (typeof REP_MODES)[number];

export const STRESS_TAGS = [
  'wrist-load',
  'knee-flexion',
  'shoulder-overhead',
  'lower-back-load',
  'floor-transition',
] as const;
export type StressTag = (typeof STRESS_TAGS)[number];

export type Difficulty = ExperienceLevel;

export interface RepetitionRange {
  min: number;
  max: number;
}

export interface RepetitionPrescription {
  mode: 'reps';
  sets: number;
  reps: RepetitionRange;
  restSeconds: number;
}

export interface TimePrescription {
  mode: 'time';
  sets: number;
  workSeconds: number;
  restSeconds: number;
}

export interface DistancePrescription {
  mode: 'distance';
  sets: number;
  distanceMeters: number;
  restSeconds: number;
}

export type Prescription =
  RepetitionPrescription | TimePrescription | DistancePrescription;

export interface SourceReference {
  title: string;
  publisher: string;
  url: string;
  accessedOn: `${number}-${number}-${number}`;
}

export interface ExerciseMedia {
  poster?: string;
  mp4?: string;
  webm?: string;
  attribution?: string;
}

/**
 * The single exercise content contract used by library pages and generation.
 * `equipment: ["none"]` means no external equipment. A one-dumbbell exercise
 * can also be performed when a pair is available; a two-dumbbell exercise
 * always requires the explicit `two-dumbbells` availability option.
 */
export interface Exercise {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  summary: string;
  instructions: string[];
  breathing: string[];
  commonMistakes: string[];
  safetyNotes: string[];
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  movementPattern: MovementPattern;
  equipment: Equipment[];
  difficulty: Difficulty;
  position: ExercisePosition;
  impact: ImpactLevel;
  noise: NoiseLevel;
  space: SpaceRequirement;
  unilateral: boolean;
  compound: boolean;
  repMode: RepMode;
  defaultPrescription: Record<ExperienceLevel, Prescription>;
  stressTags: StressTag[];
  easierVariationIds: string[];
  harderVariationIds: string[];
  replacementIds: string[];
  media?: ExerciseMedia;
  reviewed: boolean;
  sources: SourceReference[];
}
