const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.m4a': 'audio/mp4', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

function homeworkIndex() {
  const files = fs.readdirSync(path.join(root, 'homework'))
    .filter(file => file !== 'index.json')
    .sort((a, b) => b.localeCompare(a));
  return { files };
}

function practiceIndex() {
  const directory = path.join(root, 'practice');
  const files = fs.existsSync(directory)
    ? fs.readdirSync(directory).filter(file => file !== 'index.json').sort((a, b) => b.localeCompare(a))
    : [];
  return { files };
}

function createTestServer() {
  return http.createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  if (url.pathname === '/__homework-index.json') {
    response.writeHead(200, { 'Content-Type':mime['.json'] });
    return response.end(JSON.stringify(homeworkIndex()));
  }
  if (url.pathname === '/__practice-index.json') {
    response.writeHead(200, { 'Content-Type':mime['.json'] });
    return response.end(JSON.stringify(practiceIndex()));
  }

  const relative = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const file = path.resolve(root, `.${relative}`);
  if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404);
    return response.end('Not found');
  }

  const stat = fs.statSync(file);
  const headers = {
    'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'Accept-Ranges': 'bytes'
  };
  const range = request.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), stat.size - 1) : stat.size - 1;
    response.writeHead(206, { ...headers, 'Content-Range':`bytes ${start}-${end}/${stat.size}`, 'Content-Length':end-start+1 });
    if (request.method === 'HEAD') return response.end();
    return fs.createReadStream(file, { start, end }).pipe(response);
  }
  response.writeHead(200, { ...headers, 'Content-Length':stat.size });
  if (request.method === 'HEAD') return response.end();
  fs.createReadStream(file).pipe(response);
  });
}

if (require.main === module) {
  createTestServer().listen(8770, '127.0.0.1');
}

module.exports = { createTestServer };
