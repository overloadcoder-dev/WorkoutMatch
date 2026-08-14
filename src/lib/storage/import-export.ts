import type { z } from 'zod';

import {
  LOCAL_DATA_SCHEMA_VERSION,
  WORKOUTMATCH_EXPORT_FORMAT,
  type ImportCollectionCounts,
  type ImportMode,
  type LocalDataExport,
  type LocalDataImportPreview,
  type LocalDataSnapshot,
} from '../../types/storage';
import { LocalDataImportError, WorkoutMatchStorageError } from './errors';
import {
  localDataExportSchema,
  localDataExportV1Schema,
  parseLocalDataSnapshot,
} from './schema';

export const MAX_IMPORT_BYTES = 1_048_576;
const MAX_IMPORT_DEPTH = 24;
const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

export interface ParsedLocalDataImport {
  sourceSchemaVersion: number;
  migrated: boolean;
  data: LocalDataSnapshot;
}

export interface ExportObjectUrlApi {
  createObjectURL(blob: Blob): string;
  revokeObjectURL(url: string): void;
}

export interface ExportDownload {
  blob: Blob;
  filename: string;
  url: string;
  revoke(): void;
}

function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

function inspectImportedGraph(root: unknown): void {
  const stack: Array<{ value: unknown; depth: number }> = [
    { value: root, depth: 0 },
  ];

  while (stack.length > 0) {
    const item = stack.pop();
    if (!item) continue;

    if (item.depth > MAX_IMPORT_DEPTH) {
      throw new LocalDataImportError(
        'too-deep',
        `Imported JSON cannot be nested more than ${MAX_IMPORT_DEPTH} levels.`,
      );
    }

    if (typeof item.value !== 'object' || item.value === null) continue;

    if (Array.isArray(item.value)) {
      for (const value of item.value) {
        stack.push({ value, depth: item.depth + 1 });
      }
      continue;
    }

    const prototype = Object.getPrototypeOf(item.value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new LocalDataImportError(
        'invalid-schema',
        'Imported JSON contains an unsupported object structure.',
      );
    }

    for (const [key, value] of Object.entries(item.value)) {
      if (DANGEROUS_KEYS.has(key)) {
        throw new LocalDataImportError(
          'unsafe-key',
          `Imported JSON contains the unsafe key "${key}".`,
        );
      }
      stack.push({ value, depth: item.depth + 1 });
    }
  }
}

function zodIssues(error: z.ZodError): string[] {
  return error.issues.slice(0, 20).map((issue) => {
    const path = issue.path.map(String).join('.');
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

function schemaVersionOf(value: unknown): number | null {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('schemaVersion' in value)
  )
    return null;
  return typeof value.schemaVersion === 'number' &&
    Number.isInteger(value.schemaVersion)
    ? value.schemaVersion
    : null;
}

export function migrateLocalDataImport(value: unknown): ParsedLocalDataImport {
  inspectImportedGraph(value);
  const sourceSchemaVersion = schemaVersionOf(value);

  if (sourceSchemaVersion === LOCAL_DATA_SCHEMA_VERSION) {
    const parsed = localDataExportSchema.safeParse(value);
    if (!parsed.success) {
      throw new LocalDataImportError(
        'invalid-schema',
        'The import does not match the current WorkoutMatch data schema.',
        zodIssues(parsed.error),
      );
    }

    const { workouts, savedPlans, preferences } = parsed.data;
    return {
      sourceSchemaVersion,
      migrated: false,
      data: parseLocalDataSnapshot({
        schemaVersion: LOCAL_DATA_SCHEMA_VERSION,
        workouts,
        savedPlans,
        preferences,
      }),
    };
  }

  if (sourceSchemaVersion === 1) {
    const parsed = localDataExportV1Schema.safeParse(value);
    if (!parsed.success) {
      throw new LocalDataImportError(
        'invalid-schema',
        'The version 1 import is malformed.',
        zodIssues(parsed.error),
      );
    }

    const migrated = {
      schemaVersion: LOCAL_DATA_SCHEMA_VERSION,
      workouts: parsed.data.workouts.map((workout) => ({
        ...workout,
        updatedAt: workout.completedAt,
      })),
      savedPlans: parsed.data.savedWorkouts.map((plan) => ({
        ...plan,
        updatedAt: plan.createdAt,
      })),
      preferences:
        parsed.data.preferences === null
          ? null
          : {
              ...parsed.data.preferences,
              id: 'preferences' as const,
              updatedAt: parsed.data.exportedAt,
            },
    };

    return {
      sourceSchemaVersion,
      migrated: true,
      data: parseLocalDataSnapshot(migrated),
    };
  }

  throw new LocalDataImportError(
    'unsupported-version',
    sourceSchemaVersion === null
      ? 'The import is missing a valid schema version.'
      : `Schema version ${sourceSchemaVersion} is not supported.`,
  );
}

export function parseLocalDataImport(json: string): ParsedLocalDataImport {
  if (utf8ByteLength(json) > MAX_IMPORT_BYTES) {
    throw new LocalDataImportError(
      'too-large',
      'The import exceeds the 1 MB limit.',
    );
  }

  let value: unknown;
  try {
    value = JSON.parse(json) as unknown;
  } catch {
    throw new LocalDataImportError(
      'invalid-json',
      'The selected file is not valid JSON.',
    );
  }

  return migrateLocalDataImport(value);
}

function counts(data: LocalDataSnapshot): ImportCollectionCounts {
  return {
    workouts: data.workouts.length,
    savedPlans: data.savedPlans.length,
    preferences: data.preferences === null ? 0 : 1,
  };
}

export function emptyLocalDataSnapshot(): LocalDataSnapshot {
  return {
    schemaVersion: LOCAL_DATA_SCHEMA_VERSION,
    workouts: [],
    savedPlans: [],
    preferences: null,
  };
}

export function createImportPreview(
  imported: ParsedLocalDataImport,
  existing: LocalDataSnapshot = emptyLocalDataSnapshot(),
): LocalDataImportPreview {
  const current = parseLocalDataSnapshot(existing);
  const importedData = parseLocalDataSnapshot(imported.data);
  const incomingWorkoutIds = new Set(
    importedData.workouts.map((workout) => workout.id),
  );
  const incomingPlanIds = new Set(
    importedData.savedPlans.map((plan) => plan.id),
  );

  return {
    kind: 'workoutmatch-import-preview',
    sourceSchemaVersion: imported.sourceSchemaVersion,
    migrated: imported.migrated,
    data: importedData,
    incoming: counts(importedData),
    existing: counts(current),
    conflicts: {
      workouts: current.workouts.filter((workout) =>
        incomingWorkoutIds.has(workout.id),
      ).length,
      savedPlans: current.savedPlans.filter((plan) =>
        incomingPlanIds.has(plan.id),
      ).length,
      preferences:
        current.preferences !== null && importedData.preferences !== null
          ? 1
          : 0,
    },
  };
}

function mergeById<T extends { id: string }>(
  existing: readonly T[],
  incoming: readonly T[],
): T[] {
  const merged = new Map(existing.map((item) => [item.id, item]));
  for (const item of incoming) merged.set(item.id, item);
  return [...merged.values()];
}

export function mergeLocalData(
  existing: LocalDataSnapshot,
  incoming: LocalDataSnapshot,
): LocalDataSnapshot {
  const current = parseLocalDataSnapshot(existing);
  const imported = parseLocalDataSnapshot(incoming);

  return parseLocalDataSnapshot({
    schemaVersion: LOCAL_DATA_SCHEMA_VERSION,
    workouts: mergeById(current.workouts, imported.workouts),
    savedPlans: mergeById(current.savedPlans, imported.savedPlans),
    preferences: imported.preferences ?? current.preferences,
  });
}

export function applyImportMode(
  existing: LocalDataSnapshot,
  preview: LocalDataImportPreview,
  mode: ImportMode,
  options: { replaceConfirmed?: boolean } = {},
): LocalDataSnapshot {
  if (preview.kind !== 'workoutmatch-import-preview') {
    throw new LocalDataImportError(
      'invalid-schema',
      'A validated import preview is required.',
    );
  }

  if (mode !== 'merge' && mode !== 'replace') {
    throw new LocalDataImportError(
      'invalid-schema',
      'Import mode must be merge or replace.',
    );
  }

  if (mode === 'replace') {
    if (options.replaceConfirmed !== true) {
      throw new WorkoutMatchStorageError(
        'confirmation-required',
        'Replacing local data requires explicit confirmation.',
        'replace import',
      );
    }
    return parseLocalDataSnapshot(preview.data);
  }

  return mergeLocalData(existing, preview.data);
}

export function serializeLocalData(
  snapshot: LocalDataSnapshot,
  exportedAt: Date = new Date(),
): string {
  if (!Number.isFinite(exportedAt.getTime())) {
    throw new RangeError('exportedAt must be a valid date.');
  }

  const current = parseLocalDataSnapshot(snapshot);
  const data: LocalDataExport = {
    format: WORKOUTMATCH_EXPORT_FORMAT,
    schemaVersion: LOCAL_DATA_SCHEMA_VERSION,
    exportedAt: exportedAt.toISOString(),
    workouts: current.workouts,
    savedPlans: current.savedPlans,
    preferences: current.preferences,
  };

  return JSON.stringify(data, null, 2);
}

export function safeExportFilename(
  date: Date = new Date(),
  prefix = 'workoutmatch-data',
): string {
  if (!Number.isFinite(date.getTime()))
    throw new RangeError('date must be valid.');
  const safePrefix = prefix
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  const resolvedPrefix = safePrefix || 'workoutmatch-data';
  return `${resolvedPrefix}-${date.toISOString().slice(0, 10)}.json`;
}

export function createExportDownload(
  snapshot: LocalDataSnapshot,
  options: {
    date?: Date;
    prefix?: string;
    objectUrlApi?: ExportObjectUrlApi;
  } = {},
): ExportDownload {
  const date = options.date ?? new Date();
  const json = serializeLocalData(snapshot, date);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const objectUrlApi = options.objectUrlApi ?? globalThis.URL;

  if (
    typeof objectUrlApi?.createObjectURL !== 'function' ||
    typeof objectUrlApi.revokeObjectURL !== 'function'
  ) {
    throw new WorkoutMatchStorageError(
      'unavailable',
      'Object URL downloads are unavailable in this browser.',
      'export',
    );
  }

  const url = objectUrlApi.createObjectURL(blob);
  let revoked = false;

  return {
    blob,
    filename: safeExportFilename(date, options.prefix),
    url,
    revoke() {
      if (revoked) return;
      revoked = true;
      objectUrlApi.revokeObjectURL(url);
    },
  };
}
