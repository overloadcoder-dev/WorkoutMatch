import { sitePath, SITE_CONFIG } from '../config/site';

export function GET(): Response {
  return new Response(
    JSON.stringify({
      name: SITE_CONFIG.name,
      short_name: SITE_CONFIG.shortName,
      description: SITE_CONFIG.description,
      start_url: sitePath('/'),
      display: 'browser',
      background_color: SITE_CONFIG.colors.background,
      theme_color: SITE_CONFIG.themeColor,
      icons: [
        {
          src: sitePath('/favicon.svg'),
          sizes: 'any',
          type: 'image/svg+xml',
        },
      ],
    }),
    {
      headers: {
        'Content-Type': 'application/manifest+json; charset=utf-8',
      },
    },
  );
}
