export const LOCAL_DATA_SCHEMA_VERSION = 2 as const;
export const WORKOUTMATCH_EXPORT_FORMAT = 'workoutmatch-local-data' as const;

export type LocalDataSchemaVersion = typeof LOCAL_DATA_SCHEMA_VERSION;
export type IsoDateTime = string;

export interface LoggedSet {
  setNumber: number;
  reps?: number;
  durationSeconds?: number;
  weight?: {
    value: number;
    unit: 'kg' | 'lb';
  };
}

export interface CompletedExerciseRecord {
  exerciseId: string;
  name: string;
  status: 'completed' | 'skipped';
  sets: LoggedSet[];
}

export interface CompletedWorkoutRecord {
  id: string;
  workoutId: string;
  workoutVersion: string;
  title: string;
  completedAt: IsoDateTime;
  updatedAt: IsoDateTime;
  durationSeconds: number;
  status: 'completed' | 'ended-early';
  exercises: CompletedExerciseRecord[];
}

export interface SavedPlanExercise {
  exerciseId: string;
  name: string;
  phase: 'warmup' | 'main' | 'cooldown';
  order: number;
  sets?: number;
  reps?: string;
  workSeconds?: number;
  restSeconds: number;
}

export interface SavedWorkoutPlan {
  id: string;
  title: string;
  generatorVersion: string;
  seed?: string;
  durationMinutes: number;
  equipment: string[];
  exercises: SavedPlanExercise[];
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface GeneratorDefaults {
  goal?:
    | 'general-fitness'
    | 'strength'
    | 'muscle-gain'
    | 'endurance'
    | 'mobility'
    | 'low-impact';
  experience?: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes?: 5 | 10 | 15 | 20 | 30 | 45;
  focus?:
    | 'full-body'
    | 'upper-body'
    | 'lower-body'
    | 'core'
    | 'arms'
    | 'chest'
    | 'back'
    | 'shoulders'
    | 'glutes';
  equipment?: string[];
  quiet?: boolean;
  noJumping?: boolean;
  standingOnly?: boolean;
  noFloor?: boolean;
}

export interface UserPreferences {
  id: 'preferences';
  theme: 'system' | 'light' | 'dark';
  units: 'metric' | 'imperial';
  generatorDefaults?: GeneratorDefaults;
  updatedAt: IsoDateTime;
}

export interface LocalDataSnapshot {
  schemaVersion: LocalDataSchemaVersion;
  workouts: CompletedWorkoutRecord[];
  savedPlans: SavedWorkoutPlan[];
  preferences: UserPreferences | null;
}

export interface LocalDataExport extends LocalDataSnapshot {
  format: typeof WORKOUTMATCH_EXPORT_FORMAT;
  exportedAt: IsoDateTime;
}

export type ImportMode = 'merge' | 'replace';

export interface ImportCollectionCounts {
  workouts: number;
  savedPlans: number;
  preferences: number;
}

export interface LocalDataImportPreview {
  kind: 'workoutmatch-import-preview';
  sourceSchemaVersion: number;
  migrated: boolean;
  data: LocalDataSnapshot;
  incoming: ImportCollectionCounts;
  existing: ImportCollectionCounts;
  conflicts: ImportCollectionCounts;
}
