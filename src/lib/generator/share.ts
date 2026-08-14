import { EXERCISE_DATASET_VERSION } from '../../data/exercises';
import type {
  GeneratedWorkout,
  GenerationIssue,
  NormalizedGeneratorInput,
} from '../../types/workout';
import { normalizeGeneratorInput } from './normalize';
import { createVersionedSeed, GENERATOR_VERSION } from './seed';

export const SHARE_QUERY_ALLOWLIST = [
  'v',
  'dataset',
  'seed',
  'duration',
  'equipment',
  'focus',
  'level',
  'goal',
  'space',
  'quiet',
  'noJump',
  'standingOnly',
  'noFloor',
] as const;

export type ShareQueryKey = (typeof SHARE_QUERY_ALLOWLIST)[number];

export interface ParsedShareQuery {
  input: NormalizedGeneratorInput;
  seed: string;
  generatorVersion: string;
  datasetVersion: string;
}

export type ParseShareQueryResult =
  { ok: true; value: ParsedShareQuery } | { ok: false; issue: GenerationIssue };

const booleanParameter = (params: URLSearchParams, key: string): boolean =>
  params.get(key) === '1';

const sourceParts = (
  source: GeneratedWorkout | NormalizedGeneratorInput,
  seed?: string | number,
): { input: NormalizedGeneratorInput; seed: string; datasetVersion: string } =>
  'input' in source
    ? {
        input: source.input,
        seed: source.seed,
        datasetVersion: source.datasetVersion,
      }
    : {
        input: source,
        seed: createVersionedSeed(seed, EXERCISE_DATASET_VERSION),
        datasetVersion: EXERCISE_DATASET_VERSION,
      };

/** Sensitivities and any local history are deliberately absent from this query. */
export const buildSafeShareQuery = (
  source: GeneratedWorkout | NormalizedGeneratorInput,
  seed?: string | number,
): string => {
  const parts = sourceParts(source, seed);
  const { input } = parts;
  const params = new URLSearchParams();
  params.set('v', GENERATOR_VERSION);
  params.set('dataset', parts.datasetVersion);
  params.set('seed', parts.seed);
  params.set('duration', String(input.durationMinutes));
  params.set('equipment', input.equipment.join(','));
  params.set('focus', input.focus);
  params.set('level', input.experience);
  params.set('goal', input.goal);
  params.set('space', input.environment.space);
  if (input.environment.quiet) params.set('quiet', '1');
  if (input.environment.noJump) params.set('noJump', '1');
  if (input.environment.standingOnly) params.set('standingOnly', '1');
  if (input.environment.noFloor) params.set('noFloor', '1');
  return params.toString();
};

export const shareQueryOmitsPrivatePreferences = (
  input: NormalizedGeneratorInput,
): boolean => input.avoidStressTags.length > 0;

export const parseSafeShareQuery = (
  query: string | URLSearchParams,
): ParseShareQueryResult => {
  const raw =
    typeof query === 'string' ? query.replace(/^.*?\?/, '') : query.toString();
  if (raw.length > 1_024) {
    return {
      ok: false,
      issue: {
        code: 'invalid-input',
        message: 'The share link is too long to use safely.',
        reasons: ['Workout share parameters are limited to 1,024 characters.'],
        suggestions: ['Generate a new share link from the workout result.'],
      },
    };
  }
  const params = new URLSearchParams(raw);
  for (const key of SHARE_QUERY_ALLOWLIST) {
    const value = params.get(key);
    if (value !== null && value.length > 128) {
      return {
        ok: false,
        issue: {
          code: 'invalid-input',
          message: 'A share-link value is too long.',
          reasons: [`${key} exceeds the 128-character limit.`],
          suggestions: ['Generate a new share link from the workout result.'],
        },
      };
    }
  }
  if ((params.get('v') ?? GENERATOR_VERSION) !== GENERATOR_VERSION) {
    return {
      ok: false,
      issue: {
        code: 'invalid-input',
        message: 'This share link uses an unsupported generator version.',
        reasons: [
          `Expected ${GENERATOR_VERSION}, received ${params.get('v')}.`,
        ],
        suggestions: ['Open the generator and create a new workout link.'],
      },
    };
  }
  if (
    (params.get('dataset') ?? EXERCISE_DATASET_VERSION) !==
    EXERCISE_DATASET_VERSION
  ) {
    return {
      ok: false,
      issue: {
        code: 'invalid-input',
        message:
          'This share link uses an exercise dataset version that is no longer available.',
        reasons: [
          `Expected ${EXERCISE_DATASET_VERSION}, received ${params.get('dataset')}.`,
        ],
        suggestions: ['Open the generator and create a new workout link.'],
      },
    };
  }

  const normalized = normalizeGeneratorInput({
    durationMinutes: params.get('duration') ?? undefined,
    equipment: (params.get('equipment') ?? 'none').split(','),
    focus: params.get('focus') ?? 'full-body',
    experience: params.get('level') ?? 'beginner',
    goal: params.get('goal') ?? 'general-fitness',
    environment: {
      space: params.get('space') ?? 'medium',
      quiet: booleanParameter(params, 'quiet'),
      noJump: booleanParameter(params, 'noJump'),
      standingOnly: booleanParameter(params, 'standingOnly'),
      noFloor: booleanParameter(params, 'noFloor'),
    },
    // Intentionally never parsed from a URL.
    avoidStressTags: [],
  });
  if (!normalized.ok) return normalized;
  const datasetVersion = EXERCISE_DATASET_VERSION;
  const seed = createVersionedSeed(
    params.get('seed') ?? 'shared',
    datasetVersion,
  );
  return {
    ok: true,
    value: {
      input: normalized.input,
      seed,
      generatorVersion: GENERATOR_VERSION,
      datasetVersion,
    },
  };
};
