/* ============================================================
   Espil.Online — Google Photorealistic 3D Tiles, ISOLATED module
   (Architecture rulings 2026-10-14/15; integration lead: map room)

   - Own importmap, own three@0.186 ESM, own renderer + scene +
     camera on a SEPARATE canvas that sits UNDER the game canvas.
   - The ONLY crossings with the game are two window state objects:
       window.__espilCamState   game -> module (camera + character)
       window.__espilTilesState module -> game (active flag, probe)
     Delete the two script tags in index.html and the game is back
     to its exact standalone behaviour (kill switch).
   - Tiles are VISUAL only. Interaction (colliders, building IDs,
     stores) stays with the game's OSM data.
   - Auth: handshake-only. GET /api/tiles-session returns just the
     session tileset URL; the master token never reaches the browser.
     Streaming is client -> Google direct.
   - Any tile load error -> stop immediately, silent switch back to
     the game's own city, ONE small toast (quota protection).
   - World law matches the game: drop = k * d^2 from the CHARACTER,
     k = 1.5e-3 (Han-confirmed), one shared vertex-shader bend, so the
     tiles surface and the game's curved world coincide.
   ============================================================ */
import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { TilesRenderer } from '3d-tiles-renderer/three';
import { ReorientationPlugin, GLTFExtensionsPlugin } from '3d-tiles-renderer/three/plugins';
import { GoogleCloudAuthPlugin } from '3d-tiles-renderer/core/plugins';

const ANCHOR = { lat: 49.2827, lon: -123.1207 };
const SSE_FLOOR = 16;
const GROUND_TOLERANCE_M = 60;
/* Session endpoint, hostname-gated like the Places proxy: on the
   production hosts the Vercel /api function answers; anywhere else the
   local dev server answers on the same path. There is deliberately NO
   direct-token browser flow on any host (handshake-only ruling). */
const SESSION_URL = (typeof window !== 'undefined' && window.__ESPIL_TILES_SESSION_URL__) || '/api/tiles-session';

/* ---------- kill switch ---------- */
const KILLED = /[?&]tiles=off\b/.test(location.search) ||
  (() => { try { return localStorage.getItem('espil-tiles') === 'off'; } catch (e) { return false; } })();

const state = window.__espilTilesState ||
  (window.__espilTilesState = { active: false, ready: false, gated: false, streamedMB: 0, probe: null,
    failed: false, rendered: false, loadProgress: 0, settled: false });

/* ---------- streamed-bytes metering ----------
   The prototype's counter read 0.0 MB in real runs: tile responses
   are chunked and carry no content-length. Count the ACTUAL body
   bytes by teeing the stream for tile hosts only. Quota math in the
   COO reports depends on this number being real. */
let streamedBytes = 0;
{
  const origFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const res = await origFetch(...args);
    try {
      const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || '';
      if (/tile\.googleapis\.com|api\.cesium\.com/i.test(url) && res.body) {
        const counter = new TransformStream({
          transform(chunk, ctl) { streamedBytes += chunk.byteLength; ctl.enqueue(chunk); },
        });
        return new Response(res.body.pipeThrough(counter), {
          status: res.status, statusText: res.statusText, headers: res.headers,
        });
      }
    } catch (e) { /* metering must never break a load */ }
    return res;
  };
}

/* ---------- device / network gate (tiles OFF by default) ---------- */
function deviceAllowsTiles() {
  const ua = navigator.userAgent || '';
  if (/Android|iPhone|iPad|Mobi/i.test(ua)) return false;
  const c = navigator.connection;
  if (c && (c.saveData || /(^|-)2g$/i.test(c.effectiveType || ''))) return false;
  return true;
}

/* ---------- DOM: canvas under the game canvas, attribution, toast ---------- */
const gameCanvas = document.getElementById('globe-canvas');
const canvas = document.createElement('canvas');
canvas.id = 'espil-tiles-canvas';
canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:none;';
if (gameCanvas && gameCanvas.parentNode) {
  /* Sibling order does the layering: both canvases are positioned, so
     the later sibling (the game canvas) paints above. The module does
     not write to the game's elements. */
  gameCanvas.parentNode.insertBefore(canvas, gameCanvas);
} else {
  document.body.appendChild(canvas);
}
const attrBar = document.createElement('div');
attrBar.style.cssText = 'position:fixed;left:10px;bottom:8px;z-index:36;display:none;gap:8px;' +
  'font:500 .62rem "Manrope",sans-serif;color:rgba(255,255,255,.6);text-shadow:0 1px 3px rgba(0,0,0,.7);pointer-events:none;';
document.body.appendChild(attrBar);
const toastEl = document.createElement('div');
toastEl.style.cssText = 'position:fixed;left:50%;bottom:96px;transform:translateX(-50%);z-index:60;display:none;' +
  'background:rgba(10,14,20,.88);color:#e8eef4;padding:8px 14px;border-radius:10px;font:500 .8rem "Manrope",sans-serif;';
document.body.appendChild(toastEl);
let toastShown = false;
function toastOnce(msg) {
  if (toastShown) return;
  toastShown = true;
  toastEl.textContent = msg;
  toastEl.style.display = 'block';
  setTimeout(() => { toastEl.style.display = 'none'; }, 4200);
}
/* Persistent plain-language status line (2026-10-15: tile state must
   never fail silently - the player always sees whether the 3D tiles
   are on, starting, or off and why, in ordinary words). */
const statusEl = document.createElement('div');
statusEl.style.cssText = 'position:fixed;left:50%;bottom:64px;transform:translateX(-50%);z-index:58;display:none;' +
  'background:rgba(10,14,20,.78);color:#dfe9f2;padding:5px 12px;border-radius:9px;' +
  'font:500 .76rem "Manrope",sans-serif;pointer-events:none;white-space:nowrap;';
document.body.appendChild(statusEl);
let failText = '';

/* ---------- renderer / scene ---------- */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9ec8e8);
scene.fog = new THREE.Fog(0x9ec8e8, 200, 1500);
const camera = new THREE.PerspectiveCamera(55, 1, 0.5, 9000);
const occluderRoot = new THREE.Group();
scene.add(occluderRoot);
function resize() {
  const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / Math.max(1, h);
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

/* ---------- globe bend (Han's law, character-anchored) ---------- */
const BEND_K = { value: 0.0015 };
const BEND_CENTER = { value: new THREE.Vector2(0, 0) };
const bendPatched = new WeakSet();
const BEND_CHUNK = [
  'vec4 bwp = vec4( transformed, 1.0 );',
  '#ifdef USE_INSTANCING',
  '  bwp = instanceMatrix * bwp;',
  '#endif',
  'bwp = modelMatrix * bwp;',
  'float bd = distance( bwp.xz, uBendCenter );',
  'bwp.y -= min( uBendK * bd * bd, 1000.0 );',
  'vec4 mvPosition = viewMatrix * bwp;',
  'gl_Position = projectionMatrix * mvPosition;'
].join('\n');
function patchBendMaterial(mat) {
  if (!mat || bendPatched.has(mat)) return;
  bendPatched.add(mat);
  mat.side = THREE.DoubleSide; /* dome crest tilts past 65 deg at k=1500 */
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uBendK = BEND_K;
    shader.uniforms.uBendCenter = BEND_CENTER;
    shader.vertexShader = 'uniform float uBendK;\nuniform vec2 uBendCenter;\n' +
      shader.vertexShader.replace('#include <project_vertex>', BEND_CHUNK);
  };
  mat.needsUpdate = true;
}
let lastBendSweep = 0;
function sweepBend(now) {
  if (now - lastBendSweep < 300) return;
  lastBendSweep = now;
  scene.traverse((o) => {
    if (!o.material) return;
    if (Array.isArray(o.material)) o.material.forEach(patchBendMaterial);
    else patchBendMaterial(o.material);
  });
}
/* Underlay: exact twin of the game's satellite plane (same size/grid/
   transform, 3 m lower, dark) - floors the hollow tiles shell so a
   faded mesh never shows the far side of the world. */
{
  const under = new THREE.Mesh(
    new THREE.PlaneGeometry(5356 - (-5008), 4854 - (-5521), 96, 96),
    new THREE.MeshBasicMaterial({ color: 0x0c1016 })
  );
  under.rotation.x = -Math.PI / 2;
  under.rotation.z = Math.PI;
  under.position.set(174, -3.0, -333.5);
  scene.add(under);
}

/* ---------- downtown boundary gate (polygon + hysteresis) ---------- */
let boundaryPoly = null;
fetch('tiles/downtown-boundary.json')
  .then((r) => r.json())
  .then((j) => {
    /* The boundary file stores vertices as {lat,lng,x,z} objects;
       the gate math wants [x,z] pairs - normalize at load. */
    const raw = j.vertices || j.polygon || j;
    boundaryPoly = (raw && raw.map) ? raw.map((v) => Array.isArray(v) ? v : [v.x, v.z]) : raw;
  })
  .catch(() => { boundaryPoly = null; /* radius fallback below */ });
function pointInPoly(x, z, poly) {
  let inside = false;
  for (let i = 0, k = poly.length - 1; i < poly.length; k = i++) {
    const xi = poly[i][0], zi = poly[i][1], xk = poly[k][0], zk = poly[k][1];
    if (((zi > z) !== (zk > z)) && (x < (xk - xi) * (z - zi) / (zk - zi) + xi)) inside = !inside;
  }
  return inside;
}
function insideBoundary(x, z, scale) {
  if (!boundaryPoly) return Math.hypot(x, z) < 1500 * scale;
  if (scale === 1) return pointInPoly(x, z, boundaryPoly);
  return pointInPoly(x / scale, z / scale, boundaryPoly);
}

/* ---------- tiles lifecycle ---------- */
let tiles = null, tilesBuilt = false, failed = false, firstModelAt = 0;
function failTiles(reason) {
  if (failed) return;
  failed = true;
  if (tiles) tiles.group.visible = false;
  state.active = false;
  state.ready = false;
  canvas.style.display = 'none';
  attrBar.style.display = 'none';
  const r = String(reason || '');
  if (r.indexOf('no_token') >= 0) failText = '3D tiles are off: no map token on the local server.';
  else if (r.indexOf('session') >= 0 || r.indexOf('handshake') >= 0) failText = '3D tiles are off: the map session could not start.';
  else failText = '3D tiles are off: the map data could not be loaded.';
  toastOnce('3D tiles unavailable - showing the regular city.');
  console.warn('[EspilTiles] OFF:', r || 'load error');
}
async function buildTiles() {
  if (tilesBuilt || KILLED) return;
  tilesBuilt = true;
  let session = null, sessionErr = 'session';
  try {
    const r = await fetch(SESSION_URL);
    if (r.ok) session = await r.json();
    else {
      try { const j = await r.json(); if (j && j.error) sessionErr = 'session ' + j.error; } catch (e) {}
    }
  } catch (e) { /* handled below */ }
  if (!session || !session.tilesetUrl) { failTiles(sessionErr); return; }
  const key = new URL(session.tilesetUrl).searchParams.get('key');
  tiles = new TilesRenderer();
  tiles.rootURL = session.tilesetUrl;
  if (key) tiles.registerPlugin(new GoogleCloudAuthPlugin({
    apiToken: key, autoRefreshToken: true, useRecommendedSettings: true,
  }));
  tiles.registerPlugin(new ReorientationPlugin({
    lat: ANCHOR.lat * Math.PI / 180,   /* RADIANS - degrees land in the South Pacific */
    lon: ANCHOR.lon * Math.PI / 180,
    height: 0,
    azimuth: Math.PI,                  /* tile axes == game axes (east +X, north -Z) */
  }));
  const draco = new DRACOLoader();
  draco.setDecoderPath('tiles/vendor/three/addons/libs/draco/gltf/');
  const ktx2 = new KTX2Loader();
  ktx2.setTranscoderPath('tiles/vendor/three/addons/libs/basis/');
  ktx2.detectSupport(renderer);
  tiles.registerPlugin(new GLTFExtensionsPlugin({ dracoLoader: draco, ktxLoader: ktx2 }));
  tiles.errorTarget = SSE_FLOOR;
  tiles.setCamera(camera);
  tiles.setResolutionFromRenderer(camera, renderer);
  tiles.addEventListener('load-model', () => {
    if (!firstModelAt) { firstModelAt = performance.now(); state.ready = true; }
  });
  tiles.addEventListener('load-error', (e) => {
    console.warn('[EspilTiles] load error', e && e.error && e.error.message);
    failTiles();
  });
  occluderRoot.add(tiles.group);
}

/* Occlusion fade REMOVED (Han 2026-10-16): the sightline ghosting
   darkened the whole view around the character. Tile meshes are
   never material-swapped or faded by this module anymore. */

/* ---------- ground probe (module -> game, via state) ---------- */
const _prc = new THREE.Raycaster();
function probeSurfaceY(x, z) {
  if (!tiles || failed || !tiles.group.visible) return null;
  _prc.set(new THREE.Vector3(x, 500, z), new THREE.Vector3(0, -1, 0));
  const hits = _prc.intersectObject(tiles.group, true);
  if (!hits.length) return null;
  const y = hits[0].point.y;
  return Math.abs(y) <= GROUND_TOLERANCE_M ? y : null;
}
state.probe = probeSurfaceY;

/* ---------- main loop: follow the game camera ---------- */
const clock = new THREE.Clock();
let gateOn = false, attrTick = 0;
function loop() {
  requestAnimationFrame(loop);
  const cs = window.__espilCamState;
  if (!cs || KILLED) return;
  const dt = Math.min(0.05, clock.getDelta());

  /* debug/QA override: state.debugForce pins the layer on (renders the
     module scene - sky + underlay - even with no tile stream), so the
     game-side bridge can be verified anywhere. Not a user feature. */
  if (state.debugForce) {
    if (!state.active) { state.active = true; canvas.style.display = 'block'; }
    camera.position.set(cs.px, cs.py, cs.pz);
    camera.quaternion.set(cs.qx, cs.qy, cs.qz, cs.qw);
    if (cs.curveK) BEND_K.value = cs.curveK;
    BEND_CENTER.value.set(cs.charX, cs.charZ);
    const fc = new THREE.Color(cs.fogColor);
    scene.background.copy(fc); scene.fog.color.copy(fc);
    scene.fog.near = cs.fogNear; scene.fog.far = cs.fogFar;
    sweepBend(performance.now());
    renderer.render(scene, camera);
    return;
  }

  /* start/stop with the city phase + gates */
  const want = !!cs.tilesRequested && !!cs.cityPhase;
  if (want && !tilesBuilt && !failed) {
    if (!deviceAllowsTiles()) { state.gated = true; return; }
    buildTiles();
  }
  /* persistent status line (plain words, never silent) */
  if (!cs.cityPhase) statusEl.style.display = 'none';
  else if (failed) { statusEl.textContent = failText; statusEl.style.display = 'block'; }
  else if (state.gated) { statusEl.textContent = '3D tiles are off on this device.'; statusEl.style.display = 'block'; }
  else if (state.active) { statusEl.textContent = '3D tiles · ' + state.streamedMB.toFixed(1) + ' MB'; statusEl.style.display = 'block'; }
  else if (want && !tilesBuilt) { statusEl.textContent = '3D tiles: starting...'; statusEl.style.display = 'block'; }
  else if (want && tilesBuilt) { statusEl.textContent = '3D tiles: available in the downtown core.'; statusEl.style.display = 'block'; }
  else statusEl.style.display = 'none';
  if (!tiles || failed) { state.active = false; return; }

  const inGate = insideBoundary(cs.px, cs.pz, gateOn ? 1.1 : 1.0);
  const heightOk = gateOn ? cs.py < 950 : cs.py < 800;
  gateOn = inGate && heightOk;
  const active = want && gateOn;
  if (active !== state.active) {
    state.active = active;
    tiles.group.visible = active;
    canvas.style.display = active ? 'block' : 'none';
    attrBar.style.display = active ? 'flex' : 'none';
  }
  if (!active) return;

  /* camera sync (the module renders the game's exact view) */
  camera.position.set(cs.px, cs.py, cs.pz);
  camera.quaternion.set(cs.qx, cs.qy, cs.qz, cs.qw);
  if (cs.fov && camera.fov !== cs.fov) { camera.fov = cs.fov; camera.updateProjectionMatrix(); }
  if (cs.curveK) BEND_K.value = cs.curveK; /* single source: the game's curveStrength */
  BEND_CENTER.value.set(cs.charX, cs.charZ);
  const fogColor = new THREE.Color(cs.fogColor);
  scene.background.copy(fogColor);
  scene.fog.color.copy(fogColor);
  scene.fog.near = cs.fogNear; scene.fog.far = cs.fogFar;

  sweepBend(performance.now());

  tiles.setCamera(camera);
  tiles.setResolutionFromRenderer(camera, renderer);
  tiles.update();
  renderer.render(scene, camera);

  /* The fetch tee alone undercounts: part of the library's tile
     traffic passes URL objects (no .url string to match) and bypasses
     the interception - Han's counter sat at 0.0 MB while tiles were
     visibly streaming. The renderer's own LRU cache accounts every
     downloaded tile payload, so the published figure takes the max
     of both real-byte sources and can only climb as data arrives. */
  const cacheBytes = (tiles && tiles.lruCache && tiles.lruCache.cachedBytes) || 0;
  if (cacheBytes > streamedBytes) streamedBytes = cacheBytes;
  state.streamedMB = streamedBytes / 1048576;

  /* Entry-settle signals for the game's map loading screen (Han
     2026-10-16): failed / rendered / loadProgress / settled are how
     the bridge knows the tile side of loading is done. settled means
     the entry no longer needs to wait on tiles: they failed, they are
     rendering, the device gate keeps them off, or the character is
     far outside the gated area where nothing will stream. */
  state.failed = failed;
  if (tiles && tiles.stats) {
    const st = tiles.stats;
    const pend = st.queued + st.downloading + st.parsing;
    if (st.loaded > 0) state.loadProgress = st.loaded / Math.max(1, st.loaded + pend);
    if (state.active && st.loaded > 0) state.rendered = true;
  }
  state.settled = failed || !deviceAllowsTiles() || (state.active && state.rendered)
    || (cs && !insideBoundary(cs.charX || 0, cs.charZ || 0, 1.25));
  if (++attrTick % 30 === 0) {
    try {
      const list = [];
      tiles.getAttributions(list);
      if (list.length) {
        attrBar.innerHTML = '';
        list.forEach((a) => {
          const s = document.createElement('span');
          if (a.type === 'html') s.innerHTML = a.value;
          else s.textContent = String((a.value && a.value.html) || a.value || a);
          attrBar.appendChild(s);
        });
      }
    } catch (e) {}
  }
}
loop();
