const basePath = process.env.PUBLIC_BASE_PATH ?? '/';
const normalizedBase = `${basePath.startsWith('/') ? '' : '/'}${basePath}${
  basePath.endsWith('/') ? '' : '/'
}`;

export const sitePath = (path: string): string =>
  `${normalizedBase}${path.replace(/^\/+/, '')}`;
