#!/usr/bin/env node
/* Espil.Online - LOCAL TEST server for the integrated build (PC check only).
 *
 * Serves this repo root statically and answers /api/tiles-session the
 * same way the production Vercel function will: handshake-only, the
 * Cesium ion token stays on this machine (env var CESIUM_ION_TOKEN or
 * a ./.env file next to this script - reuse the one from
 * tiles-prototype/.env), 45-minute session cache, 40 fresh handshakes
 * per day budget. Tile streaming itself goes browser -> Google direct.
 *
 * Run:  node local-server.js     then open http://localhost:8920/vancouver
 * This file is local test tooling only - it is not part of the deploy.
 */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), https = require('https');
const ROOT = __dirname;
const PORT = 8920, ASSET_ID = '2275207';
const TTL = 45 * 60 * 1000, BUDGET = 40;
let tokenSource = '';
function loadToken() {
  if (process.env.CESIUM_ION_TOKEN) { tokenSource = 'env var'; return process.env.CESIUM_ION_TOKEN.trim(); }
  try { const m = fs.readFileSync(path.join(ROOT, '.env'), 'utf8').match(/^\s*CESIUM_ION_TOKEN\s*=\s*(\S+)\s*$/m); if (m) { tokenSource = './.env'; return m[1]; } } catch (e) {}
  /* Reuse the prototype's local credential files if they are already on
     this machine - no new setup needed (both are gitignored locals). */
  try { const m = fs.readFileSync(path.join(ROOT, 'tiles-prototype', '.env'), 'utf8').match(/^\s*CESIUM_ION_TOKEN\s*=\s*(\S+)\s*$/m); if (m) { tokenSource = 'tiles-prototype/.env'; return m[1]; } } catch (e) {}
  try { const m = fs.readFileSync(path.join(ROOT, 'tiles-prototype', 'token.local.js'), 'utf8').match(/CESIUM_ION_TOKEN\s*=\s*'([^']+)'/); if (m) { tokenSource = 'tiles-prototype/token.local.js'; return m[1]; } } catch (e) {}
  return '';
}
const TOKEN = loadToken();
let cache = null, day = new Date().toDateString(), used = 0;
function fetchIon() {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname: 'api.cesium.com', path: `/v1/assets/${ASSET_ID}/endpoint`, method: 'GET', headers: { Authorization: `Bearer ${TOKEN}` } }, (res) => {
      let b = ''; res.on('data', (c) => b += c);
      res.on('end', () => { if (res.statusCode !== 200) return reject(new Error('ion HTTP ' + res.statusCode)); try { resolve(JSON.parse(b)); } catch (e) { reject(e); } });
    });
    req.on('error', reject); req.end();
  });
}
async function session(res) {
  const now = Date.now();
  if (new Date().toDateString() !== day) { day = new Date().toDateString(); used = 0; }
  const send = (code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };
  if (cache && cache.expiresAt > now) return send(200, { ...cache, cached: true, budgetUsed: used });
  if (!TOKEN) return send(503, { error: 'no_token_on_server', detail: 'Put CESIUM_ION_TOKEN in ./.env (same value as tiles-prototype/.env)' });
  if (used >= BUDGET) return send(429, { error: 'daily_root_budget_exhausted', budgetUsed: used });
  try {
    used++;
    const j = await fetchIon();
    let tilesetUrl = null, attributions = [];
    if ('externalType' in j) tilesetUrl = j.options.url;
    else if (j.url) { tilesetUrl = j.url; attributions = (j.attributions || []).map((a) => a.html); }
    cache = { tilesetUrl, attributions, expiresAt: now + TTL };
    console.log(`[tiles-session] fresh handshake (#${used} today), cached 45m`);
    return send(200, { ...cache, cached: false, budgetUsed: used });
  } catch (e) { return send(502, { error: 'handshake_failed', detail: e.message }); }
}
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.wasm': 'application/wasm', '.css': 'text/css', '.glb': 'model/gltf-binary', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/tiles-session') return session(res);
  let file = path.join(ROOT, (url.pathname === '/' || url.pathname === '/vancouver' || url.pathname === '/vancouver/') ? 'index.html' : url.pathname);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`integrated build local server: http://localhost:${PORT}/vancouver (ion token: ${TOKEN ? 'set, from ' + tokenSource : 'NOT set - see ./.env'})`));
