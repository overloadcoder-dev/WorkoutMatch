import { describe, expect, it, vi } from 'vitest';

import {
  LOCAL_DATA_SCHEMA_VERSION,
  MAX_IMPORT_BYTES,
  WORKOUTMATCH_LOCAL_STORAGE_KEYS,
  applyImportMode,
  clearWorkoutMatchLocalStorage,
  createExportDownload,
  createImportPreview,
  emptyLocalDataSnapshot,
  mergeLocalData,
  normalizeStorageError,
  openWorkoutMatchStorage,
  parseLocalDataImport,
  safeExportFilename,
  serializeLocalData,
  type CompletedWorkoutRecord,
  type LocalDataImportError,
  type LocalDataExport,
  type LocalDataSnapshot,
  type SavedWorkoutPlan,
  type UserPreferences,
  type WorkoutMatchStorageError,
} from '../../src/lib/storage';

const NOW = '2026-08-12T08:00:00.000Z';

function workout(id: string, title = `Workout ${id}`): CompletedWorkoutRecord {
  return {
    id,
    workoutId: `generated:${id}`,
    workoutVersion: 'generator-v1',
    title,
    completedAt: NOW,
    updatedAt: NOW,
    durationSeconds: 900,
    status: 'completed',
    exercises: [
      {
        exerciseId: 'bodyweight-squat',
        name: 'Bodyweight squat',
        status: 'completed',
        sets: [{ setNumber: 1, reps: 10 }],
      },
    ],
  };
}

function plan(id: string, title = `Plan ${id}`): SavedWorkoutPlan {
  return {
    id,
    title,
    generatorVersion: 'generator-v1',
    seed: `seed-${id}`,
    durationMinutes: 15,
    equipment: ['bodyweight'],
    exercises: [
      {
        exerciseId: 'bodyweight-squat',
        name: 'Bodyweight squat',
        phase: 'main',
        order: 0,
        sets: 2,
        reps: '10',
        restSeconds: 30,
      },
    ],
    createdAt: NOW,
    updatedAt: NOW,
  };
}

function preferences(
  theme: UserPreferences['theme'] = 'system',
): UserPreferences {
  return { id: 'preferences', theme, units: 'metric', updatedAt: NOW };
}

function snapshot(
  overrides: Partial<LocalDataSnapshot> = {},
): LocalDataSnapshot {
  return {
    schemaVersion: LOCAL_DATA_SCHEMA_VERSION,
    workouts: [],
    savedPlans: [],
    preferences: null,
    ...overrides,
  };
}

function exportJson(data: LocalDataSnapshot): string {
  return serializeLocalData(data, new Date(NOW));
}

describe('strict local-data import', () => {
  it('accepts the generator token alphabet used by regenerated saved plans', () => {
    const regeneratedPlan = plan('wm1-2026.08.1-seed~regen');
    regeneratedPlan.seed = 'wm1:2026.08.1:seed~regen';
    expect(() =>
      exportJson(snapshot({ savedPlans: [regeneratedPlan] })),
    ).not.toThrow();
  });

  it('validates current exports and returns a preview without committing', () => {
    const existing = snapshot({ workouts: [workout('existing')] });
    const parsed = parseLocalDataImport(
      exportJson(
        snapshot({
          workouts: [workout('incoming')],
          savedPlans: [plan('one')],
          preferences: preferences(),
        }),
      ),
    );
    const preview = createImportPreview(parsed, existing);

    expect(parsed.migrated).toBe(false);
    expect(preview.incoming).toEqual({
      workouts: 1,
      savedPlans: 1,
      preferences: 1,
    });
    expect(preview.existing).toEqual({
      workouts: 1,
      savedPlans: 0,
      preferences: 0,
    });
    expect(preview.conflicts).toEqual({
      workouts: 0,
      savedPlans: 0,
      preferences: 0,
    });
    expect(existing.workouts).toHaveLength(1);
  });

  it('rejects malformed JSON, oversized input, unknown fields, and body-weight history', () => {
    expect(() => parseLocalDataImport('{')).toThrowError(
      expect.objectContaining<Partial<LocalDataImportError>>({
        code: 'invalid-json',
      }),
    );
    expect(() =>
      parseLocalDataImport(' '.repeat(MAX_IMPORT_BYTES + 1)),
    ).toThrowError(
      expect.objectContaining<Partial<LocalDataImportError>>({
        code: 'too-large',
      }),
    );

    const unknown = JSON.parse(exportJson(emptyLocalDataSnapshot())) as Record<
      string,
      unknown
    >;
    unknown.extra = true;
    expect(() => parseLocalDataImport(JSON.stringify(unknown))).toThrowError(
      expect.objectContaining<Partial<LocalDataImportError>>({
        code: 'invalid-schema',
      }),
    );

    const bodyWeight = JSON.parse(
      exportJson(emptyLocalDataSnapshot()),
    ) as Record<string, unknown>;
    bodyWeight.bodyWeightHistory = [{ date: NOW, weightKg: 70 }];
    expect(() => parseLocalDataImport(JSON.stringify(bodyWeight))).toThrowError(
      expect.objectContaining<Partial<LocalDataImportError>>({
        code: 'invalid-schema',
      }),
    );
  });

  it.each(['__proto__', 'constructor', 'prototype'])(
    'rejects prototype-pollution key %s at any depth',
    (key) => {
      const json = exportJson(emptyLocalDataSnapshot());
      const dangerousJson = json.replace(
        '"workouts": []',
        `"workouts": [], "nested": {"${key}": {"polluted": true}}`,
      );

      expect(() => parseLocalDataImport(dangerousJson)).toThrowError(
        expect.objectContaining<Partial<LocalDataImportError>>({
          code: 'unsafe-key',
        }),
      );
      expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
    },
  );

  it('rejects unsupported schema versions explicitly', () => {
    const value = JSON.parse(
      exportJson(emptyLocalDataSnapshot()),
    ) as LocalDataExport;
    Object.assign(value, { schemaVersion: 99 });

    expect(() => parseLocalDataImport(JSON.stringify(value))).toThrowError(
      expect.objectContaining<Partial<LocalDataImportError>>({
        code: 'unsupported-version',
      }),
    );
  });

  it('rejects duplicate record identifiers instead of silently collapsing data', () => {
    const duplicated = JSON.parse(
      exportJson(emptyLocalDataSnapshot()),
    ) as LocalDataExport;
    duplicated.workouts = [workout('duplicate'), workout('duplicate')];

    expect(() => parseLocalDataImport(JSON.stringify(duplicated))).toThrow(
      expect.objectContaining<Partial<LocalDataImportError>>({
        code: 'invalid-schema',
      }),
    );
  });
});

describe('schema migration', () => {
  it('migrates the known version 1 shape to current records', () => {
    const currentWorkout = workout('old-workout');
    const { updatedAt: _workoutUpdatedAt, ...legacyWorkout } = currentWorkout;
    const currentPlan = plan('old-plan');
    const { updatedAt: _planUpdatedAt, ...legacyPlan } = currentPlan;
    expect(_workoutUpdatedAt).toBe(NOW);
    expect(_planUpdatedAt).toBe(NOW);

    const parsed = parseLocalDataImport(
      JSON.stringify({
        format: 'workoutmatch-local-data',
        schemaVersion: 1,
        exportedAt: NOW,
        workouts: [legacyWorkout],
        savedWorkouts: [legacyPlan],
        preferences: { theme: 'dark', units: 'imperial' },
      }),
    );

    expect(parsed).toMatchObject({ sourceSchemaVersion: 1, migrated: true });
    expect(parsed.data.schemaVersion).toBe(LOCAL_DATA_SCHEMA_VERSION);
    expect(parsed.data.workouts[0]?.updatedAt).toBe(NOW);
    expect(parsed.data.savedPlans[0]?.updatedAt).toBe(NOW);
    expect(parsed.data.preferences).toEqual({
      id: 'preferences',
      theme: 'dark',
      units: 'imperial',
      updatedAt: NOW,
    });
  });
});

describe('merge and replace semantics', () => {
  const existing = snapshot({
    workouts: [workout('same', 'Existing'), workout('kept')],
    savedPlans: [plan('same', 'Existing plan')],
    preferences: preferences('light'),
  });
  const incoming = snapshot({
    workouts: [workout('same', 'Imported'), workout('added')],
    savedPlans: [plan('same', 'Imported plan'), plan('added')],
    preferences: preferences('dark'),
  });

  it('merges by stable ID, keeps non-conflicts, and lets incoming conflicts win', () => {
    const merged = mergeLocalData(existing, incoming);

    expect(merged.workouts.map(({ id }) => id)).toEqual([
      'same',
      'kept',
      'added',
    ]);
    expect(merged.workouts.find(({ id }) => id === 'same')?.title).toBe(
      'Imported',
    );
    expect(merged.savedPlans.map(({ id }) => id)).toEqual(['same', 'added']);
    expect(merged.savedPlans[0]?.title).toBe('Imported plan');
    expect(merged.preferences?.theme).toBe('dark');
  });

  it('requires explicit confirmation before replacing all collections', () => {
    const preview = createImportPreview(
      {
        sourceSchemaVersion: LOCAL_DATA_SCHEMA_VERSION,
        migrated: false,
        data: incoming,
      },
      existing,
    );

    expect(() => applyImportMode(existing, preview, 'replace')).toThrowError(
      expect.objectContaining<Partial<WorkoutMatchStorageError>>({
        code: 'confirmation-required',
      }),
    );
    expect(
      applyImportMode(existing, preview, 'replace', { replaceConfirmed: true }),
    ).toEqual(incoming);
  });
});

describe('export safety', () => {
  it('creates a safe filename and an idempotently revocable object URL', () => {
    const createObjectURL = vi.fn(() => 'blob:workoutmatch-test');
    const revokeObjectURL = vi.fn();
    const download = createExportDownload(emptyLocalDataSnapshot(), {
      date: new Date(NOW),
      prefix: '../../My Workout Data<script>',
      objectUrlApi: { createObjectURL, revokeObjectURL },
    });

    expect(download.filename).toBe('my-workout-data-script-2026-08-12.json');
    expect(download.blob.type).toBe('application/json;charset=utf-8');
    expect(download.url).toBe('blob:workoutmatch-test');
    download.revoke();
    download.revoke();
    expect(revokeObjectURL).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:workoutmatch-test');
  });

  it('never emits path separators in the generated filename', () => {
    expect(safeExportFilename(new Date(NOW), '..\\/bad:name')).toMatch(
      /^[a-z0-9-]+-2026-08-12\.json$/,
    );
  });
});

describe('storage failure boundaries', () => {
  it('clears every known localStorage key and reports blocked removals', () => {
    const removeItem = vi.fn((key: string) => {
      if (key === 'wm-units')
        throw new DOMException('Blocked', 'SecurityError');
    });

    expect(clearWorkoutMatchLocalStorage({ removeItem })).toEqual(['wm-units']);
    expect(removeItem.mock.calls.map(([key]) => key)).toEqual(
      WORKOUTMATCH_LOCAL_STORAGE_KEYS,
    );
  });

  it('reports IndexedDB absence without throwing synchronously', async () => {
    await expect(
      openWorkoutMatchStorage({ indexedDBFactory: null }),
    ).rejects.toMatchObject({
      code: 'unavailable',
      operation: 'open',
    });
  });

  it('reports a blocked database upgrade through a small factory mock', async () => {
    const request = {} as IDBOpenDBRequest;
    const factory = {
      open: vi.fn(() => {
        queueMicrotask(() =>
          request.onblocked?.({
            oldVersion: 1,
            newVersion: 2,
          } as IDBVersionChangeEvent),
        );
        return request;
      }),
    } as unknown as IDBFactory;

    await expect(
      openWorkoutMatchStorage({ indexedDBFactory: factory }),
    ).rejects.toMatchObject({
      code: 'blocked',
      operation: 'open',
    });
  });

  it.each([
    ['QuotaExceededError', 'quota-exceeded'],
    ['SecurityError', 'unavailable'],
    ['InvalidStateError', 'unavailable'],
    ['VersionError', 'migration-failed'],
    ['UnknownError', 'operation-failed'],
  ] as const)('normalizes %s failures as %s', (name, code) => {
    const error = { name };
    expect(normalizeStorageError(error, 'test operation')).toMatchObject({
      code,
      operation: 'test operation',
    });
  });
});
