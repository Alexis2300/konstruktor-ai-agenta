import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HOST = '127.0.0.1';
const PORT = 4173;
const root = path.dirname(fileURLToPath(import.meta.url));

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

function safeFilePath(requestUrl) {
  const urlPath = decodeURIComponent(new URL(requestUrl, `http://${HOST}:${PORT}`).pathname);
  const relativePath = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const resolved = path.resolve(root, relativePath);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) return null;
  return resolved;
}

const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method ?? 'GET')) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method Not Allowed');
    return;
  }

  const filePath = safeFilePath(request.url ?? '/');
  if (!filePath) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Forbidden');
    return;
  }

  try {
    const fileInfo = await stat(filePath);
    if (!fileInfo.isFile()) throw new Error('Not a file');
    const body = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream',
      'Content-Length': body.length,
      'Cache-Control': 'no-store',
    });
    if (request.method === 'HEAD') response.end();
    else response.end(body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not Found');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Конструктор открыт по адресу: http://${HOST}:${PORT}/`);
  console.log('Чтобы остановить просмотр, нажмите Ctrl+C.');
});
