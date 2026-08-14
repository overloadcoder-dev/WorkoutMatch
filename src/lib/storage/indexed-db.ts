import {
  LOCAL_DATA_SCHEMA_VERSION,
  type CompletedWorkoutRecord,
  type ImportMode,
  type LocalDataImportPreview,
  type LocalDataSnapshot,
  type SavedWorkoutPlan,
  type UserPreferences,
} from '../../types/storage';
import { normalizeStorageError, WorkoutMatchStorageError } from './errors';
import {
  applyImportMode,
  createImportPreview,
  emptyLocalDataSnapshot,
  parseLocalDataImport,
} from './import-export';
import {
  parseCompletedWorkout,
  parseLocalDataSnapshot,
  parseSavedWorkoutPlan,
  parseUserPreferences,
} from './schema';

export const WORKOUTMATCH_DATABASE_NAME = 'workoutmatch';
export const WORKOUTMATCH_DATABASE_VERSION = 2;
export const STORAGE_STORES = {
  workouts: 'workouts',
  savedPlans: 'savedPlans',
  preferences: 'preferences',
} as const;

export interface OpenStorageOptions {
  databaseName?: string;
  indexedDBFactory?: IDBFactory | null;
}

function requestError<T>(request: IDBRequest<T>): unknown {
  try {
    return request.error;
  } catch {
    return undefined;
  }
}

function requestPromise<T>(
  request: IDBRequest<T>,
  operation: string,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(normalizeStorageError(requestError(request), operation));
  });
}

function transactionPromise(
  transaction: IDBTransaction,
  operation: string,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () =>
      reject(normalizeStorageError(transaction.error, operation));
    transaction.onerror = () =>
      reject(normalizeStorageError(transaction.error, operation));
  });
}

function ensureStores(database: IDBDatabase): void {
  if (!database.objectStoreNames.contains(STORAGE_STORES.workouts)) {
    database.createObjectStore(STORAGE_STORES.workouts, { keyPath: 'id' });
  }
  if (!database.objectStoreNames.contains(STORAGE_STORES.savedPlans)) {
    database.createObjectStore(STORAGE_STORES.savedPlans, { keyPath: 'id' });
  }
  // Database version 2 adds this store to the version 1 workouts/saved-plans database.
  if (!database.objectStoreNames.contains(STORAGE_STORES.preferences)) {
    database.createObjectStore(STORAGE_STORES.preferences, { keyPath: 'id' });
  }
}

function migrateVersionOneRecords(
  transaction: IDBTransaction,
  onFailure: (error: unknown) => void,
): void {
  const migrateStore = <T>(
    storeName:
      typeof STORAGE_STORES.workouts | typeof STORAGE_STORES.savedPlans,
    migrate: (value: unknown) => T,
  ) => {
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onerror = () => onFailure(requestError(request));
    request.onsuccess = () => {
      try {
        for (const value of request.result) {
          const putRequest = store.put(migrate(value));
          putRequest.onerror = () => onFailure(requestError(putRequest));
        }
      } catch (error) {
        onFailure(error);
      }
    };
  };

  migrateStore(STORAGE_STORES.workouts, (value) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new TypeError('A version 1 workout record is malformed.');
    }
    const record = value as Record<string, unknown>;
    return parseCompletedWorkout({
      ...record,
      updatedAt: record.updatedAt ?? record.completedAt,
    });
  });

  migrateStore(STORAGE_STORES.savedPlans, (value) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new TypeError('A version 1 saved-plan record is malformed.');
    }
    const record = value as Record<string, unknown>;
    return parseSavedWorkoutPlan({
      ...record,
      updatedAt: record.updatedAt ?? record.createdAt,
    });
  });
}

export class WorkoutMatchStorage {
  readonly databaseName: string;
  readonly databaseVersion: number;
  #database: IDBDatabase;

  private constructor(database: IDBDatabase) {
    this.#database = database;
    this.databaseName = database.name;
    this.databaseVersion = database.version;
    database.onversionchange = () => database.close();
  }

  static open(options: OpenStorageOptions = {}): Promise<WorkoutMatchStorage> {
    let factory: IDBFactory | null;
    try {
      factory =
        options.indexedDBFactory === undefined
          ? typeof globalThis.indexedDB === 'undefined'
            ? null
            : globalThis.indexedDB
          : options.indexedDBFactory;
    } catch (error) {
      return Promise.reject(normalizeStorageError(error, 'open'));
    }
    const databaseName = options.databaseName ?? WORKOUTMATCH_DATABASE_NAME;

    if (!factory) {
      return Promise.reject(
        new WorkoutMatchStorageError(
          'unavailable',
          'IndexedDB is unavailable in this browser. Local workouts cannot be saved.',
          'open',
        ),
      );
    }

    let request: IDBOpenDBRequest;
    try {
      request = factory.open(databaseName, WORKOUTMATCH_DATABASE_VERSION);
    } catch (error) {
      return Promise.reject(normalizeStorageError(error, 'open'));
    }

    return new Promise<WorkoutMatchStorage>((resolve, reject) => {
      let settled = false;
      let upgradeError: unknown;

      const fail = (error: WorkoutMatchStorageError) => {
        if (settled) return;
        settled = true;
        reject(error);
      };

      request.onupgradeneeded = (event) => {
        try {
          ensureStores(request.result);
          if (event.oldVersion === 1 && request.transaction) {
            migrateVersionOneRecords(request.transaction, (error) => {
              if (upgradeError === undefined) upgradeError = error;
              try {
                request.transaction?.abort();
              } catch {
                // The first failed request may already have aborted the upgrade.
              }
            });
          }
        } catch (error) {
          upgradeError = error;
          request.transaction?.abort();
        }
      };

      request.onblocked = () => {
        fail(
          new WorkoutMatchStorageError(
            'blocked',
            'Another tab is blocking the local data upgrade. Close other WorkoutMatch tabs and try again.',
            'open',
          ),
        );
      };

      request.onerror = () => {
        if (upgradeError !== undefined) {
          fail(
            new WorkoutMatchStorageError(
              'migration-failed',
              'Local data could not be upgraded to the current schema.',
              'open',
              upgradeError,
            ),
          );
          return;
        }
        fail(normalizeStorageError(requestError(request), 'open'));
      };

      request.onsuccess = () => {
        if (settled) {
          request.result.close();
          return;
        }
        settled = true;
        resolve(new WorkoutMatchStorage(request.result));
      };
    });
  }

  close(): void {
    this.#database.close();
  }

  async getSnapshot(): Promise<LocalDataSnapshot> {
    const operation = 'read local data';
    try {
      const transaction = this.#database.transaction(
        Object.values(STORAGE_STORES),
        'readonly',
      );
      const done = transactionPromise(transaction, operation);
      const workoutRequest = transaction
        .objectStore(STORAGE_STORES.workouts)
        .getAll();
      const planRequest = transaction
        .objectStore(STORAGE_STORES.savedPlans)
        .getAll();
      const preferencesRequest = transaction
        .objectStore(STORAGE_STORES.preferences)
        .get('preferences');
      const [workouts, savedPlans, preferences] = await Promise.all([
        requestPromise(workoutRequest, operation),
        requestPromise(planRequest, operation),
        requestPromise(preferencesRequest, operation),
        done,
      ]);

      return parseLocalDataSnapshot({
        schemaVersion: LOCAL_DATA_SCHEMA_VERSION,
        workouts,
        savedPlans,
        preferences: preferences ?? null,
      });
    } catch (error) {
      throw normalizeStorageError(error, operation);
    }
  }

  async saveWorkout(workout: CompletedWorkoutRecord): Promise<void> {
    await this.#put(
      STORAGE_STORES.workouts,
      parseCompletedWorkout(workout),
      'save workout',
    );
  }

  async deleteWorkout(id: string): Promise<void> {
    await this.#delete(STORAGE_STORES.workouts, id, 'delete workout');
  }

  async savePlan(plan: SavedWorkoutPlan): Promise<void> {
    await this.#put(
      STORAGE_STORES.savedPlans,
      parseSavedWorkoutPlan(plan),
      'save plan',
    );
  }

  async deletePlan(id: string): Promise<void> {
    await this.#delete(STORAGE_STORES.savedPlans, id, 'delete plan');
  }

  async savePreferences(preferences: UserPreferences): Promise<void> {
    await this.#put(
      STORAGE_STORES.preferences,
      parseUserPreferences(preferences),
      'save preferences',
    );
  }

  async previewImport(json: string): Promise<LocalDataImportPreview> {
    const parsed = parseLocalDataImport(json);
    const existing = await this.getSnapshot();
    return createImportPreview(parsed, existing);
  }

  async commitImport(
    preview: LocalDataImportPreview,
    mode: ImportMode,
    options: { replaceConfirmed?: boolean } = {},
  ): Promise<LocalDataSnapshot> {
    const existing = await this.getSnapshot();
    const result = applyImportMode(existing, preview, mode, options);
    await this.#replaceAll(result, 'commit import');
    return result;
  }

  async clearAll(options: { confirmed?: boolean } = {}): Promise<void> {
    if (options.confirmed !== true) {
      throw new WorkoutMatchStorageError(
        'confirmation-required',
        'Clearing all local data requires explicit confirmation.',
        'clear all data',
      );
    }
    await this.#replaceAll(emptyLocalDataSnapshot(), 'clear all data');
  }

  async #put(
    storeName: (typeof STORAGE_STORES)[keyof typeof STORAGE_STORES],
    value: object,
    operation: string,
  ): Promise<void> {
    try {
      const transaction = this.#database.transaction(storeName, 'readwrite');
      const done = transactionPromise(transaction, operation);
      const request = transaction.objectStore(storeName).put(value);
      await Promise.all([requestPromise(request, operation), done]);
    } catch (error) {
      throw normalizeStorageError(error, operation);
    }
  }

  async #delete(
    storeName: (typeof STORAGE_STORES)[keyof typeof STORAGE_STORES],
    id: string,
    operation: string,
  ): Promise<void> {
    try {
      const transaction = this.#database.transaction(storeName, 'readwrite');
      const done = transactionPromise(transaction, operation);
      const request = transaction.objectStore(storeName).delete(id);
      await Promise.all([requestPromise(request, operation), done]);
    } catch (error) {
      throw normalizeStorageError(error, operation);
    }
  }

  async #replaceAll(
    snapshot: LocalDataSnapshot,
    operation: string,
  ): Promise<void> {
    const data = parseLocalDataSnapshot(snapshot);

    try {
      const transaction = this.#database.transaction(
        Object.values(STORAGE_STORES),
        'readwrite',
      );
      const done = transactionPromise(transaction, operation);
      const workouts = transaction.objectStore(STORAGE_STORES.workouts);
      const savedPlans = transaction.objectStore(STORAGE_STORES.savedPlans);
      const preferences = transaction.objectStore(STORAGE_STORES.preferences);
      const requests: Array<Promise<unknown>> = [
        requestPromise(workouts.clear(), operation),
        requestPromise(savedPlans.clear(), operation),
        requestPromise(preferences.clear(), operation),
      ];

      for (const workout of data.workouts)
        requests.push(requestPromise(workouts.put(workout), operation));
      for (const plan of data.savedPlans)
        requests.push(requestPromise(savedPlans.put(plan), operation));
      if (data.preferences !== null)
        requests.push(
          requestPromise(preferences.put(data.preferences), operation),
        );

      await Promise.all([...requests, done]);
    } catch (error) {
      throw normalizeStorageError(error, operation);
    }
  }
}

export function openWorkoutMatchStorage(
  options: OpenStorageOptions = {},
): Promise<WorkoutMatchStorage> {
  return WorkoutMatchStorage.open(options);
}
