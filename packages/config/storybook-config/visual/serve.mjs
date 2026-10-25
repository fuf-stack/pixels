import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../storybook-static/', import.meta.url));
const types = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

// serve the built stories, never fall back to a development build
createServer(async (request, response) => {
  if (new URL(request.url, 'http://localhost').pathname === '/visual.html') {
    const id = new URL(request.url, 'http://localhost').searchParams.get('id');
    const theme = new URL(request.url, 'http://localhost').searchParams.get(
      'theme',
    );
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(
      `<!doctype html><html><body style="margin:0"><iframe id="visual-story" title="Visual story" style="display:block;border:0;width:100vw;height:100vh" src="/iframe.html?id=${encodeURIComponent(id ?? '')}&amp;viewMode=story&amp;visual-test=true&amp;visual-theme=${encodeURIComponent(theme ?? 'light')}"></iframe></body></html>`,
    );
    return;
  }

  const path = resolve(
    root,
    `.${new URL(request.url, 'http://localhost').pathname}`,
  );

  if (!path.startsWith(`${root.replace(/\/$/, '')}${sep}`)) {
    response.writeHead(403).end();
    return;
  }

  try {
    const content = await readFile(path);
    response.writeHead(200, {
      'Content-Type': types[extname(path)] ?? 'application/octet-stream',
    });
    response.end(content);
  } catch {
    response
      .writeHead(404)
      .end(
        'Build Storybook with pnpm --filter @repo/storybook-config storybook:build first',
      );
  }
}).listen(6008, '0.0.0.0');
