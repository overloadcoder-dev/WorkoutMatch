import { spawn } from 'node:child_process';
import { once } from 'node:events';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const base = process.env.PUBLIC_BASE_PATH ?? '/';
const basePath = `${base.startsWith('/') ? '' : '/'}${base}${
  base.endsWith('/') ? '' : '/'
}`;
const healthUrl = `http://127.0.0.1:4321${basePath}`;
const previewScript = fileURLToPath(
  new URL('./preview-server.mjs', import.meta.url),
);
const playwrightCli = fileURLToPath(
  new URL('../../node_modules/@playwright/test/cli.js', import.meta.url),
);

const preview = spawn(process.execPath, [previewScript], {
  env: process.env,
  stdio: 'inherit',
});

const waitForPreview = async () => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (preview.exitCode !== null) {
      throw new Error(`Preview server exited with code ${preview.exitCode}.`);
    }
    try {
      const response = await fetch(healthUrl);
      if (response.ok) return;
    } catch {
      // The server may still be binding its port.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Preview server did not become ready at ${healthUrl}.`);
};

let exitCode = 1;
try {
  await waitForPreview();
  const playwright = spawn(
    process.execPath,
    [playwrightCli, 'test', ...process.argv.slice(2)],
    { env: process.env, stdio: 'inherit' },
  );
  const [code] = await once(playwright, 'exit');
  exitCode = typeof code === 'number' ? code : 1;
} finally {
  const previewExit = once(preview, 'exit');
  preview.kill();
  await Promise.race([
    previewExit,
    new Promise((resolve) => setTimeout(resolve, 2_000)),
  ]);
  if (preview.exitCode === null) preview.kill('SIGKILL');
}

process.exitCode = exitCode;
