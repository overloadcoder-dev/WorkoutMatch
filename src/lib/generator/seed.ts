export const GENERATOR_VERSION = 'wm1';

const hash32 = (text: string): number => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

export const normalizeSeedToken = (
  seed: string | number | undefined,
): string => {
  const raw = String(seed ?? 'workout').trim();
  if (raw.length === 0) return 'workout';
  const safe = raw.replace(/[^A-Za-z0-9._~-]/g, '-').slice(0, 64);
  return safe || hash32(raw).toString(36);
};

export const createVersionedSeed = (
  seed: string | number | undefined,
  datasetVersion: string,
): string => {
  const source = String(seed ?? '');
  const prefix = `${GENERATOR_VERSION}:${datasetVersion}:`;
  if (source.startsWith(prefix)) {
    return `${prefix}${normalizeSeedToken(source.slice(prefix.length))}`;
  }
  return `${prefix}${normalizeSeedToken(seed)}`;
};

/** Stable pseudo-random unit value without mutable PRNG state. */
export const deterministicUnit = (key: string): number => {
  let state = hash32(key) + 0x6d2b79f5;
  state = Math.imul(state ^ (state >>> 15), state | 1);
  state ^= state + Math.imul(state ^ (state >>> 7), state | 61);
  return ((state ^ (state >>> 14)) >>> 0) / 4_294_967_296;
};

export const nextSeed = (seed: string, operation: string): string =>
  `${seed.split(':').slice(0, 2).join(':')}:${normalizeSeedToken(`${seed.split(':').slice(2).join(':')}~${operation}`)}`;
