#!/usr/bin/env node
/*
 * Espil.Online — 3D Tiles DEV server + handshake proxy prototype (TESTING ONLY)
 *
 * Architecture (per Architecture review 2026-10-14):
 *  - The Cesium ion MASTER token lives ONLY on the server (env var).
 *  - GET /api/tiles-session calls the ion asset endpoint server-side and
 *    returns just the session tileset URL (which carries its own session
 *    credential) + attributions. The master token never reaches the browser.
 *  - Tile streaming itself is client -> Google DIRECT (never proxied:
 *    bandwidth, latency, and Google ToS bar re-serving tile geometry).
 *  - The session is cached server-side (TTL 45 min) and shared by all
 *    users, so root-tile consumption scales with TIME, not user count —
 *    this is the core quota defense (free tier: 1,000 root tiles/month).
 *  - A daily fresh-fetch budget caps runaway handshakes early in the month.
 *
 * Run:  CESIUM_ION_TOKEN=<token> node dev-server.js     (or put it in ./.env)
 * Then: http://localhost:8917
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = process.env.PORT || 8917;
const ROOT = __dirname;
const ASSET_ID = '2275207'; // Google Photorealistic 3D Tiles on Cesium ion
const SESSION_TTL_MS = 45 * 60 * 1000;      // 45 min (below session expiry)
const DAILY_ROOT_BUDGET = 40;               // fresh ion endpoint fetches/day

/* --- token: env or ./.env (never tracked, never logged) --- */
function loadToken() {
  if (process.env.CESIUM_ION_TOKEN) return process.env.CESIUM_ION_TOKEN.trim();
  try {
    const env = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
    const m = env.match(/^\s*CESIUM_ION_TOKEN\s*=\s*(\S+)\s*$/m);
    if (m) return m[1];
  } catch (e) {}
  return '';
}
const ION_TOKEN = loadToken();

/* --- session cache + daily budget --- */
let sessionCache = null; // { tilesetUrl, attributions, expiresAt }
let budgetDay = new Date().toDateString();
let budgetUsed = 0;

function fetchIonEndpoint() {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.cesium.com',
      path: `/v1/assets/${ASSET_ID}/endpoint`,
      method: 'GET',
      headers: { Authorization: `Bearer ${ION_TOKEN}` },
    }, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error(`ion endpoint HTTP ${res.statusCode}`));
        try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function handleTilesSession(res) {
  const now = Date.now();
  if (new Date().toDateString() !== budgetDay) { budgetDay = new Date().toDateString(); budgetUsed = 0; }

  if (sessionCache && sessionCache.expiresAt > now) {
    return sendJson(res, 200, { ...sessionCache, cached: true, budgetUsed });
  }
  if (!ION_TOKEN) {
    return sendJson(res, 503, { error: 'no_token_on_server', detail: 'Set CESIUM_ION_TOKEN in env or tiles-prototype/.env' });
  }
  if (budgetUsed >= DAILY_ROOT_BUDGET) {
    return sendJson(res, 429, { error: 'daily_root_budget_exhausted', budgetUsed });
  }
  try {
    budgetUsed++;
    const json = await fetchIonEndpoint();
    let tilesetUrl = null, attributions = [];
    if ('externalType' in json) {
      tilesetUrl = json.options.url; // Google tileset URL (session credential in ?key=)
    } else if (json.url) {
      tilesetUrl = json.url;
      attributions = (json.attributions || []).map(a => a.html);
    }
    sessionCache = { tilesetUrl, attributions, expiresAt: now + SESSION_TTL_MS };
    console.log(`[tiles-session] fresh handshake (#${budgetUsed} today), cached for 45m`);
    return sendJson(res, 200, { ...sessionCache, cached: false, budgetUsed });
  } catch (e) {
    console.warn('[tiles-session] handshake failed:', e.message);
    return sendJson(res, 502, { error: 'handshake_failed', detail: e.message });
  }
}

function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(body);
}

const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.wasm': 'application/wasm', '.css': 'text/css' };

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/tiles-session') return handleTilesSession(res);
  let file = path.join(ROOT, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`tiles-prototype dev server on http://localhost:${PORT} (ion token: ${ION_TOKEN ? 'set' : 'NOT set'})`);
});
