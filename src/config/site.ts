export type Locale = 'en';

export const SITE_CONFIG = {
  name: 'WorkoutMatch',
  shortName: 'WorkoutMatch',
  tagline: 'Choose what you have. Get a balanced workout you can start now.',
  description:
    'Build a practical workout around your time, space, equipment, experience, and movement preferences.',
  siteUrl: import.meta.env.PUBLIC_SITE_URL ?? 'https://workoutmatch.example',
  locale: 'en' as const,
  themeColor: '#087f6b',
  colors: {
    primary: '#087f6b',
    accent: '#d96c3d',
    background: '#f6f2e9',
    text: '#202522',
  },
  socialImage: '/social-card.svg',
  supportEmail: null,
  ads: {
    enabled: false,
  },
} as const;

export const absoluteUrl = (path: string): string =>
  new URL(path, SITE_CONFIG.siteUrl).toString();
