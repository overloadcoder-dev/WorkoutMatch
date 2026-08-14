import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

const environment = loadEnv(
  process.env.NODE_ENV ?? 'development',
  process.cwd(),
  '',
);
const site = environment.PUBLIC_SITE_URL ?? 'https://workoutmatch.example';
const base = environment.PUBLIC_BASE_PATH ?? '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  markdown: {
    syntaxHighlight: false,
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/my-progress/') && !page.includes('/workout/player/'),
    }),
  ],
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "base-uri 'self'",
        "connect-src 'none'",
        "font-src 'self'",
        "form-action 'self'",
        "img-src 'self' data:",
        "media-src 'self'",
        "object-src 'none'",
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
