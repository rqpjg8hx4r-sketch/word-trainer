const http = require('http');
const fs = require('fs');
const path = require('path');
const { englishFiles } = require('./english-index');

const host = '127.0.0.1';
const port = Number(process.env.WORD_TRAINER_PORT || 8765);
const root = path.resolve(__dirname, '..');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendText(response, status, message) {
  response.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(message)
  });
  response.end(message);
}

function createPreviewServer() {
return http.createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, `http://${host}`).pathname);
  } catch {
    sendText(response, 400, 'Bad request');
    return;
  }

  if (pathname.endsWith('/')) pathname += 'index.html';
  if (pathname === '/coding') pathname = '/coding/index.html';
  if (pathname === '/__english-index.json') {
    const category = new URL(request.url, `http://${host}`).searchParams.get('category');
    if (!['word', 'listening', 'writing', 'speaking'].includes(category)) {
      sendText(response, 400, 'Invalid English category');
      return;
    }
    try {
      const body = JSON.stringify({ files:englishFiles(category) });
      response.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
        'Cache-Control': 'no-store'
      });
      response.end(body);
    } catch (error) {
      sendText(response, 500, `Cannot read english/${category} directory`);
    }
    return;
  }
  const filePath = path.resolve(root, `.${pathname}`);
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    sendText(response, 403, 'Forbidden');
    return;
  }

  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) {
      sendText(response, 404, 'Not found');
      return;
    }

    const type = mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    const commonHeaders = {
      'Content-Type': type,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-store'
    };
    const range = request.headers.range;

    if (range) {
      const match = range.match(/^bytes=(\d*)-(\d*)$/);
      if (!match) {
        response.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
        response.end();
        return;
      }
      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Math.min(Number(match[2]), stat.size - 1) : stat.size - 1;
      if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= stat.size) {
        response.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
        response.end();
        return;
      }
      response.writeHead(206, {
        ...commonHeaders,
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Content-Length': end - start + 1
      });
      fs.createReadStream(filePath, { start, end }).pipe(response);
      return;
    }

    response.writeHead(200, { ...commonHeaders, 'Content-Length': stat.size });
    fs.createReadStream(filePath).pipe(response);
  });
});
}

function startPreviewServer() {
const server = createPreviewServer();
server.listen(port, host, () => {
  console.log(`Word Trainer local preview: http://${host}:${port}/index.html`);
  console.log('Close this window to stop the preview server.');
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `Port ${port} is already in use. Run start-word-trainer.cmd to reuse the preview.` : error.message);
  process.exitCode = 1;
});
return server;
}

if (require.main === module) startPreviewServer();
module.exports = { createPreviewServer, startPreviewServer };
