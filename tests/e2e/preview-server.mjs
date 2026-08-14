import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import process from 'node:process';
import { URL } from 'node:url';

const host = '127.0.0.1';
const port = 4321;
const dist = resolve('dist');
const configuredBase = process.env.PUBLIC_BASE_PATH ?? '/';
const base = `/${configuredBase.replace(/^\/+|\/+$/g, '')}`;
const basePath = base === '/' ? '/' : `${base}/`;

/** @type {Record<string, string>} */
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://${host}:${port}`);
  if (basePath !== '/' && !url.pathname.startsWith(basePath)) {
    response.writeHead(404).end('Not found');
    return;
  }

  const relativePath = decodeURIComponent(
    basePath === '/' ? url.pathname : url.pathname.slice(basePath.length - 1),
  ).replace(/^\/+/, '');
  let target = resolve(dist, relativePath || 'index.html');

  if (!target.startsWith(`${dist}${sep}`) && target !== dist) {
    response.writeHead(400).end('Invalid path');
    return;
  }
  if (existsSync(target) && statSync(target).isDirectory()) {
    target = resolve(target, 'index.html');
  } else if (!existsSync(target) && !extname(target)) {
    target = resolve(target, 'index.html');
  }

  const found = existsSync(target) && statSync(target).isFile();
  if (!found) target = resolve(dist, '404.html');
  const status = found ? 200 : 404;
  const contentType =
    contentTypes[extname(target)] ?? 'application/octet-stream';
  response.writeHead(status, { 'Content-Type': contentType });
  if (request.method === 'HEAD') response.end();
  else createReadStream(target).pipe(response);
});

server.listen(port, host, () => {
  process.stdout.write(
    `Static preview ready at http://${host}:${port}${basePath}\n`,
  );
});
