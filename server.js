const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function safePath(requestPath) {
  const decoded = decodeURIComponent(requestPath);
  const normalized = path.normalize(decoded).replace(/^([.][.][\\/])+/, '');
  const resolved = path.resolve(PUBLIC_DIR, `.${normalized}`);
  return resolved.startsWith(PUBLIC_DIR) ? resolved : null;
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  let pathname = requestUrl.pathname;

  if (pathname === '/') {
    pathname = '/index.html';
  }

  const filePath = pathname === '/code.js'
    ? path.join(__dirname, 'code.js')
    : safePath(pathname);
  if (!filePath) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500, {
        'Content-Type': 'text/plain; charset=utf-8'
      });
      response.end(error.code === 'ENOENT' ? 'Not Found' : 'Internal Server Error');
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      'Content-Type': MIME_TYPES[extension] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    response.end(content);
  });
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} sedang digunakan oleh proses lain.`);
    console.error('Jika aplikasi sudah terbuka, gunakan URL tersebut tanpa menjalankan npm start lagi.');
    console.error('Atau jalankan dengan port lain di PowerShell: $env:PORT=3001; npm start');
    process.exitCode = 1;
    return;
  }

  console.error('Server gagal dijalankan:', error.message);
  process.exitCode = 1;
});

server.listen(PORT, () => {
  console.log(`Kasir UMKM berjalan di http://localhost:${PORT}`);
  console.log('Data demo disimpan di localStorage browser.');
});
