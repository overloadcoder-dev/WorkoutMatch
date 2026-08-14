export const WORKOUTMATCH_LOCAL_STORAGE_KEYS = [
  'wm-theme',
  'wm-units',
  'wm-guided-workout',
  'wm-guided-session',
] as const;

/**
 * Best-effort removal for the small state kept outside IndexedDB.
 * Returns keys that could not be removed so the UI can report a partial clear.
 */
export function clearWorkoutMatchLocalStorage(
  storage: Pick<Storage, 'removeItem'>,
): string[] {
  const failures: string[] = [];
  for (const key of WORKOUTMATCH_LOCAL_STORAGE_KEYS) {
    try {
      storage.removeItem(key);
    } catch {
      failures.push(key);
    }
  }
  return failures;
}
