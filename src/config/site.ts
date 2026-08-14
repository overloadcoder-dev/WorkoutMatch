export type Locale = 'en';

const basePath = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

export const sitePath = (path: string): string => {
  if (/^(?:[a-z]+:|\/\/|#)/i.test(path)) return path;
  return `${basePath}${path.replace(/^\/+/, '')}`;
};

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
  new URL(sitePath(path), SITE_CONFIG.siteUrl).toString();
