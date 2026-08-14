export type StorageErrorCode =
  | 'unavailable'
  | 'blocked'
  | 'quota-exceeded'
  | 'migration-failed'
  | 'operation-failed'
  | 'confirmation-required';

export class WorkoutMatchStorageError extends Error {
  readonly code: StorageErrorCode;
  readonly operation: string;
  readonly originalCause: unknown;

  constructor(
    code: StorageErrorCode,
    message: string,
    operation: string,
    originalCause?: unknown,
  ) {
    super(message);
    this.name = 'WorkoutMatchStorageError';
    this.code = code;
    this.operation = operation;
    this.originalCause = originalCause;
  }
}

export type ImportErrorCode =
  | 'too-large'
  | 'invalid-json'
  | 'unsafe-key'
  | 'too-deep'
  | 'invalid-schema'
  | 'unsupported-version';

export class LocalDataImportError extends Error {
  readonly code: ImportErrorCode;
  readonly issues: readonly string[];

  constructor(
    code: ImportErrorCode,
    message: string,
    issues: readonly string[] = [],
  ) {
    super(message);
    this.name = 'LocalDataImportError';
    this.code = code;
    this.issues = issues;
  }
}

export function normalizeStorageError(
  error: unknown,
  operation: string,
): WorkoutMatchStorageError {
  if (error instanceof WorkoutMatchStorageError) {
    return error;
  }

  const name =
    typeof DOMException !== 'undefined' && error instanceof DOMException
      ? error.name
      : getErrorName(error);

  if (name === 'QuotaExceededError') {
    return new WorkoutMatchStorageError(
      'quota-exceeded',
      'This browser could not save the data because its local storage quota is full.',
      operation,
      error,
    );
  }

  if (
    name === 'SecurityError' ||
    name === 'InvalidStateError' ||
    name === 'NotSupportedError'
  ) {
    return new WorkoutMatchStorageError(
      'unavailable',
      'Local browser storage is unavailable. Private browsing or browser settings may be the cause.',
      operation,
      error,
    );
  }

  if (name === 'VersionError') {
    return new WorkoutMatchStorageError(
      'migration-failed',
      'Local data could not be upgraded to the current schema.',
      operation,
      error,
    );
  }

  return new WorkoutMatchStorageError(
    'operation-failed',
    `Local data operation failed: ${operation}.`,
    operation,
    error,
  );
}

function getErrorName(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('name' in error)) {
    return undefined;
  }

  return typeof error.name === 'string' ? error.name : undefined;
}
