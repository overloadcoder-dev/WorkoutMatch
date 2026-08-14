import type { Locale } from './site';

export const UI_MESSAGES = {
  en: {
    skipToContent: 'Skip to main content',
    openMenu: 'Open navigation',
    closeMenu: 'Close navigation',
    theme: 'Theme',
    systemTheme: 'Use system theme',
    lightTheme: 'Use light theme',
    darkTheme: 'Use dark theme',
  },
} satisfies Record<Locale, Record<string, string>>;

export const localePath = (path: string, locale: Locale = 'en'): string => {
  void locale;
  return path;
};

export const hreflangLinks = (path: string) => [
  { hreflang: 'en', href: path },
  { hreflang: 'x-default', href: path },
];
