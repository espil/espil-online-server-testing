#!/usr/bin/env node
/* Espil.Online - LOCAL TEST server for the merged build (PC check only).
 *
 * Serves this repo root statically and applies the same rewrites as
 * vercel.json: /vancouver and /vancouver/store/:placeId -> /index.html.
 * No tokens or build steps are involved; if a /local-config.js exists
 * in this directory (your own Google Places key, gitignored) it is
 * served like any other file.
 *
 * Run:  node local-server.js     then open http://localhost:8920/vancouver
 */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname;
const PORT = 8920;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.gif': 'image/gif',
  '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.bin': 'application/octet-stream',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.woff': 'font/woff', '.woff2': 'font/woff2'
};
http.createServer((req, res) => {
  let u = decodeURIComponent((req.url || '/').split('?')[0]);
  if (u === '/vancouver' || u === '/vancouver/' || /^\/vancouver\/store\/[A-Za-z0-9_-]+$/.test(u)) u = '/index.html';
  if (u === '/') u = '/index.html';
  const f = path.normalize(path.join(ROOT, u));
  if (!f.startsWith(ROOT)) { res.writeHead(403); res.end('forbidden'); return; }
  /* Directory requests serve their index.html (e.g. /cauldron-test/
     and /cauldron-test both open the Cauldron test version). */
  fs.stat(f, (se, st) => {
    const file = (!se && st.isDirectory()) ? path.join(f, 'index.html') : f;
    fs.readFile(file, (e, data) => {
      if (e) { res.writeHead(404); res.end('not found: ' + u); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
  });
}).listen(PORT, () => console.log('Espil merged build at http://localhost:' + PORT + '/vancouver'));
