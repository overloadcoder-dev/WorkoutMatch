import type {
  DurationTemplate,
  FocusTemplate,
  GoalTemplate,
  MovementSlotTemplate,
  WorkoutDuration,
  WorkoutFocus,
  WorkoutGoal,
} from '../types/workout';

const slot = (
  id: string,
  patterns: MovementSlotTemplate['patterns'],
  compound: MovementSlotTemplate['compound'] = 'preferred',
  preferredMuscles?: MovementSlotTemplate['preferredMuscles'],
): MovementSlotTemplate =>
  preferredMuscles === undefined
    ? { id, patterns, compound }
    : { id, patterns, compound, preferredMuscles };

/**
 * Durations reserve the warm-up and cooldown before main-work allocation. The
 * five- and ten-minute templates are intentionally reduced: they alternate
 * broad patterns instead of pretending to fit a full long-session checklist.
 */
export const DURATION_TEMPLATES: Record<WorkoutDuration, DurationTemplate> = {
  5: {
    durationMinutes: 5,
    warmupSeconds: 45,
    cooldownSeconds: 45,
    mainSlotCount: 2,
    warmupSlotCount: 1,
    cooldownSlotCount: 1,
  },
  10: {
    durationMinutes: 10,
    warmupSeconds: 75,
    cooldownSeconds: 60,
    mainSlotCount: 3,
    warmupSlotCount: 1,
    cooldownSlotCount: 1,
  },
  15: {
    durationMinutes: 15,
    warmupSeconds: 90,
    cooldownSeconds: 90,
    mainSlotCount: 5,
    warmupSlotCount: 2,
    cooldownSlotCount: 1,
  },
  20: {
    durationMinutes: 20,
    warmupSeconds: 120,
    cooldownSeconds: 120,
    mainSlotCount: 5,
    warmupSlotCount: 2,
    cooldownSlotCount: 2,
  },
  30: {
    durationMinutes: 30,
    warmupSeconds: 180,
    cooldownSeconds: 180,
    mainSlotCount: 6,
    warmupSlotCount: 2,
    cooldownSlotCount: 2,
  },
  45: {
    durationMinutes: 45,
    warmupSeconds: 240,
    cooldownSeconds: 240,
    mainSlotCount: 7,
    warmupSlotCount: 3,
    cooldownSlotCount: 2,
  },
};

const FOCUS_TEMPLATE_LIST: FocusTemplate[] = [
  {
    focus: 'full-body',
    title: 'Balanced full-body workout',
    rationale:
      'Balances lower-body, push, pull, and trunk patterns within the available time and equipment.',
    shortSlots: [
      slot('broad-lower', ['knee-dominant', 'hip-dominant'], 'required'),
      slot('broad-upper', ['push', 'pull'], 'required'),
      slot('short-trunk', ['core', 'carry'], 'neutral'),
    ],
    standardSlots: [
      slot('knee', ['knee-dominant'], 'required'),
      slot('hinge', ['hip-dominant'], 'required'),
      slot('push', ['push'], 'required'),
      slot('pull', ['pull'], 'required'),
      slot('trunk', ['core', 'carry'], 'neutral'),
    ],
    extendedSlots: [
      slot('knee', ['knee-dominant'], 'required'),
      slot('hinge', ['hip-dominant'], 'required'),
      slot('push', ['push'], 'required'),
      slot('pull', ['pull'], 'required'),
      slot('trunk', ['core', 'carry'], 'neutral'),
      slot(
        'second-compound',
        ['knee-dominant', 'hip-dominant', 'push', 'pull'],
        'required',
      ),
      slot(
        'optional-conditioning',
        ['conditioning', 'carry', 'core'],
        'neutral',
      ),
    ],
  },
  {
    focus: 'upper-body',
    title: 'Balanced upper-body workout',
    rationale:
      'Pairs pushing and pulling work and keeps a trunk movement for a balanced upper-body session.',
    shortSlots: [
      slot('upper-push', ['push'], 'required'),
      slot('upper-pull', ['pull'], 'required'),
      slot('upper-trunk', ['core', 'carry'], 'neutral'),
    ],
    standardSlots: [
      slot('push-one', ['push'], 'required'),
      slot('pull-one', ['pull'], 'required'),
      slot('push-two', ['push'], 'neutral'),
      slot('pull-two', ['pull'], 'neutral'),
      slot('upper-trunk', ['core', 'carry'], 'neutral'),
    ],
    extendedSlots: [
      slot('push-one', ['push'], 'required'),
      slot('pull-one', ['pull'], 'required'),
      slot('push-two', ['push'], 'neutral'),
      slot('pull-two', ['pull'], 'neutral'),
      slot('upper-trunk', ['core', 'carry'], 'neutral'),
      slot('upper-accessory', ['push', 'pull'], 'neutral', [
        'biceps',
        'triceps',
        'shoulders',
      ]),
      slot('upper-finish', ['conditioning', 'carry', 'core'], 'neutral'),
    ],
  },
  {
    focus: 'lower-body',
    title: 'Balanced lower-body workout',
    rationale:
      'Combines knee- and hip-dominant work with trunk stability instead of repeating one leg motion.',
    shortSlots: [
      slot('lower-knee', ['knee-dominant'], 'required'),
      slot('lower-hip', ['hip-dominant'], 'required'),
      slot('lower-trunk', ['core', 'carry'], 'neutral'),
    ],
    standardSlots: [
      slot('knee-one', ['knee-dominant'], 'required'),
      slot('hip-one', ['hip-dominant'], 'required'),
      slot('knee-two', ['knee-dominant'], 'neutral'),
      slot('hip-two', ['hip-dominant'], 'neutral'),
      slot('lower-trunk', ['core', 'carry'], 'neutral'),
    ],
    extendedSlots: [
      slot('knee-one', ['knee-dominant'], 'required'),
      slot('hip-one', ['hip-dominant'], 'required'),
      slot('knee-two', ['knee-dominant'], 'neutral'),
      slot('hip-two', ['hip-dominant'], 'neutral'),
      slot('lower-trunk', ['core', 'carry'], 'neutral'),
      slot('lower-accessory', ['knee-dominant', 'hip-dominant'], 'neutral', [
        'calves',
        'adductors',
        'abductors',
      ]),
      slot('lower-finish', ['conditioning', 'carry'], 'neutral'),
    ],
  },
  {
    focus: 'core',
    title: 'Core and trunk-control workout',
    rationale:
      'Varies trunk control, carries, and supporting hip work instead of relying on repeated crunches.',
    shortSlots: [
      slot('core-one', ['core'], 'neutral'),
      slot('core-two', ['core', 'carry'], 'neutral'),
      slot('core-support', ['hip-dominant', 'mobility'], 'neutral'),
    ],
    standardSlots: [
      slot('core-one', ['core'], 'neutral'),
      slot('core-two', ['core', 'carry'], 'neutral'),
      slot('core-three', ['core'], 'neutral'),
      slot('core-support', ['hip-dominant'], 'preferred'),
      slot('core-move', ['mobility', 'conditioning'], 'neutral'),
    ],
    extendedSlots: [
      slot('core-one', ['core'], 'neutral'),
      slot('core-two', ['core', 'carry'], 'neutral'),
      slot('core-three', ['core'], 'neutral'),
      slot('core-support', ['hip-dominant'], 'preferred'),
      slot('core-move', ['mobility', 'conditioning'], 'neutral'),
      slot('core-four', ['core', 'carry'], 'neutral'),
      slot('core-finish', ['conditioning', 'mobility'], 'neutral'),
    ],
  },
  {
    focus: 'arms',
    title: 'Arms-focused workout',
    rationale:
      'Alternates elbow-flexor and triceps-biased movements while retaining balanced push and pull patterns.',
    shortSlots: [
      slot('arms-pull', ['pull'], 'neutral', ['biceps']),
      slot('arms-push', ['push'], 'neutral', ['triceps']),
      slot('arms-trunk', ['core', 'carry'], 'neutral'),
    ],
    standardSlots: [
      slot('biceps-one', ['pull'], 'neutral', ['biceps']),
      slot('triceps-one', ['push'], 'neutral', ['triceps']),
      slot('biceps-two', ['pull'], 'neutral', ['biceps']),
      slot('triceps-two', ['push'], 'neutral', ['triceps']),
      slot('arms-trunk', ['core', 'carry'], 'neutral'),
    ],
    extendedSlots: [
      slot('biceps-one', ['pull'], 'neutral', ['biceps']),
      slot('triceps-one', ['push'], 'neutral', ['triceps']),
      slot('biceps-two', ['pull'], 'neutral', ['biceps']),
      slot('triceps-two', ['push'], 'neutral', ['triceps']),
      slot('arms-trunk', ['core', 'carry'], 'neutral'),
      slot('arms-compound', ['push', 'pull'], 'required'),
      slot('arms-finish', ['carry', 'conditioning'], 'neutral'),
    ],
  },
  {
    focus: 'chest',
    title: 'Chest-focused workout',
    rationale:
      'Prioritizes chest pressing while keeping pulling and trunk work to avoid a one-pattern session.',
    shortSlots: [
      slot('chest-push', ['push'], 'required', ['chest']),
      slot('chest-balance', ['pull'], 'required'),
      slot('chest-trunk', ['core', 'carry'], 'neutral'),
    ],
    standardSlots: [
      slot('chest-one', ['push'], 'required', ['chest']),
      slot('chest-balance', ['pull'], 'required'),
      slot('chest-two', ['push'], 'neutral', ['chest']),
      slot('chest-three', ['push'], 'neutral', ['chest', 'triceps']),
      slot('chest-trunk', ['core', 'carry'], 'neutral'),
    ],
    extendedSlots: [
      slot('chest-one', ['push'], 'required', ['chest']),
      slot('chest-balance', ['pull'], 'required'),
      slot('chest-two', ['push'], 'neutral', ['chest']),
      slot('chest-three', ['push'], 'neutral', ['chest', 'triceps']),
      slot('chest-trunk', ['core', 'carry'], 'neutral'),
      slot('chest-balance-two', ['pull'], 'neutral'),
      slot('chest-finish', ['conditioning', 'core'], 'neutral'),
    ],
  },
  {
    focus: 'back',
    title: 'Back-focused workout',
    rationale:
      'Prioritizes pulling, adds hip support, and includes a small amount of pushing for pattern balance.',
    shortSlots: [
      slot('back-pull', ['pull'], 'required', ['upper-back', 'lats']),
      slot('back-hip', ['hip-dominant'], 'required'),
      slot('back-trunk', ['core', 'carry'], 'neutral'),
    ],
    standardSlots: [
      slot('back-one', ['pull'], 'required', ['upper-back', 'lats']),
      slot('back-hip', ['hip-dominant'], 'required'),
      slot('back-two', ['pull'], 'neutral', ['upper-back', 'lats']),
      slot('back-balance', ['push'], 'required'),
      slot('back-trunk', ['core', 'carry'], 'neutral'),
    ],
    extendedSlots: [
      slot('back-one', ['pull'], 'required', ['upper-back', 'lats']),
      slot('back-hip', ['hip-dominant'], 'required'),
      slot('back-two', ['pull'], 'neutral', ['upper-back', 'lats']),
      slot('back-balance', ['push'], 'required'),
      slot('back-trunk', ['core', 'carry'], 'neutral'),
      slot('back-three', ['pull'], 'neutral', ['biceps', 'upper-back']),
      slot('back-finish', ['carry', 'conditioning'], 'neutral'),
    ],
  },
  {
    focus: 'shoulders',
    title: 'Shoulder-focused workout',
    rationale:
      'Combines pressing, pulling, and controlled shoulder motion with trunk support.',
    shortSlots: [
      slot('shoulder-push', ['push'], 'neutral', ['shoulders']),
      slot('shoulder-pull', ['pull'], 'neutral', ['shoulders', 'upper-back']),
      slot('shoulder-control', ['mobility', 'core'], 'neutral'),
    ],
    standardSlots: [
      slot('shoulder-push-one', ['push'], 'neutral', ['shoulders']),
      slot('shoulder-pull-one', ['pull'], 'neutral', [
        'shoulders',
        'upper-back',
      ]),
      slot('shoulder-control', ['mobility'], 'neutral', ['shoulders']),
      slot('shoulder-push-two', ['push'], 'neutral', ['shoulders']),
      slot('shoulder-trunk', ['core', 'carry'], 'neutral'),
    ],
    extendedSlots: [
      slot('shoulder-push-one', ['push'], 'neutral', ['shoulders']),
      slot('shoulder-pull-one', ['pull'], 'neutral', [
        'shoulders',
        'upper-back',
      ]),
      slot('shoulder-control', ['mobility'], 'neutral', ['shoulders']),
      slot('shoulder-push-two', ['push'], 'neutral', ['shoulders']),
      slot('shoulder-trunk', ['core', 'carry'], 'neutral'),
      slot('shoulder-pull-two', ['pull'], 'neutral', ['upper-back']),
      slot('shoulder-finish', ['conditioning', 'carry'], 'neutral'),
    ],
  },
  {
    focus: 'glutes',
    title: 'Glute-focused workout',
    rationale:
      'Uses both hip- and knee-dominant patterns so the session is broader than repeated bridge variations.',
    shortSlots: [
      slot('glute-hip', ['hip-dominant'], 'required', ['glutes']),
      slot('glute-knee', ['knee-dominant'], 'required', ['glutes']),
      slot('glute-trunk', ['core', 'carry'], 'neutral'),
    ],
    standardSlots: [
      slot('glute-hip-one', ['hip-dominant'], 'required', ['glutes']),
      slot('glute-knee-one', ['knee-dominant'], 'required', ['glutes']),
      slot('glute-hip-two', ['hip-dominant'], 'neutral', ['glutes']),
      slot('glute-knee-two', ['knee-dominant'], 'neutral', ['glutes']),
      slot('glute-trunk', ['core', 'carry'], 'neutral'),
    ],
    extendedSlots: [
      slot('glute-hip-one', ['hip-dominant'], 'required', ['glutes']),
      slot('glute-knee-one', ['knee-dominant'], 'required', ['glutes']),
      slot('glute-hip-two', ['hip-dominant'], 'neutral', ['glutes']),
      slot('glute-knee-two', ['knee-dominant'], 'neutral', ['glutes']),
      slot('glute-trunk', ['core', 'carry'], 'neutral'),
      slot('glute-accessory', ['hip-dominant', 'knee-dominant'], 'neutral', [
        'abductors',
        'hamstrings',
      ]),
      slot('glute-finish', ['conditioning', 'carry'], 'neutral'),
    ],
  },
];

export const FOCUS_TEMPLATES = Object.fromEntries(
  FOCUS_TEMPLATE_LIST.map((template) => [template.focus, template]),
) as Record<WorkoutFocus, FocusTemplate>;

const GOAL_TEMPLATE_LIST: GoalTemplate[] = [
  {
    goal: 'general-fitness',
    formatByExperience: {
      beginner: 'straight-sets',
      intermediate: 'circuit',
      advanced: 'circuit',
    },
    compoundBonus: 8,
    mobilityBonus: 2,
    conditioningBonus: 3,
    restAdjustmentSeconds: 0,
  },
  {
    goal: 'strength',
    formatByExperience: {
      beginner: 'straight-sets',
      intermediate: 'straight-sets',
      advanced: 'superset',
    },
    compoundBonus: 14,
    mobilityBonus: 0,
    conditioningBonus: -4,
    restAdjustmentSeconds: 20,
  },
  {
    goal: 'muscle-gain',
    formatByExperience: {
      beginner: 'straight-sets',
      intermediate: 'superset',
      advanced: 'superset',
    },
    compoundBonus: 9,
    mobilityBonus: 0,
    conditioningBonus: -2,
    restAdjustmentSeconds: 10,
  },
  {
    goal: 'endurance',
    formatByExperience: {
      beginner: 'straight-sets',
      intermediate: 'circuit',
      advanced: 'circuit',
    },
    compoundBonus: 5,
    mobilityBonus: 1,
    conditioningBonus: 12,
    restAdjustmentSeconds: -15,
  },
  {
    goal: 'mobility',
    formatByExperience: {
      beginner: 'straight-sets',
      intermediate: 'circuit',
      advanced: 'circuit',
    },
    compoundBonus: 1,
    mobilityBonus: 18,
    conditioningBonus: -3,
    restAdjustmentSeconds: -10,
  },
  {
    goal: 'low-impact-movement',
    formatByExperience: {
      beginner: 'straight-sets',
      intermediate: 'circuit',
      advanced: 'circuit',
    },
    compoundBonus: 4,
    mobilityBonus: 10,
    conditioningBonus: 3,
    restAdjustmentSeconds: -10,
  },
];

export const GOAL_TEMPLATES = Object.fromEntries(
  GOAL_TEMPLATE_LIST.map((template) => [template.goal, template]),
) as Record<WorkoutGoal, GoalTemplate>;

export const getMainSlots = (
  focus: WorkoutFocus,
  duration: WorkoutDuration,
): MovementSlotTemplate[] => {
  const template = FOCUS_TEMPLATES[focus];
  const durationTemplate = DURATION_TEMPLATES[duration];
  const source =
    duration <= 10
      ? template.shortSlots
      : duration <= 20
        ? template.standardSlots
        : template.extendedSlots;
  const result: MovementSlotTemplate[] = [];

  for (let index = 0; index < durationTemplate.mainSlotCount; index += 1) {
    const base = source[index % source.length]!;
    result.push({ ...base, id: `main-${index + 1}-${base.id}` });
  }

  return result;
};
