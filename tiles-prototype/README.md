# Photorealistic 3D Tiles — Prototype (TESTING ONLY)

Google Photorealistic 3D Tiles streamed into a Three.js scene via
[NASA-AMMOS 3d-tiles-renderer](https://github.com/NASA-AMMOS/3DTilesRendererJS) v0.5.3,
authenticated through **Cesium ion** (asset `2275207` = Google Photorealistic 3D Tiles).
Han decision 2026-10-14. **Do not ship to production from here.**

## What it shows

- Tiles reoriented to Espil.Online's game origin (49.2827, −123.1207) with
  `ReorientationPlugin` — tile local coordinates == game coordinates
  (x east, z south, meters; the same frame as `latLngToMap`). The game’s
  character/building coordinate system does not change.
- Tiles = visual layer only. The translucent blue boxes are real OSM footprints
  (from the game's `vancouver_chunks.json`, 93 buildings within ~280 m of the
  anchor) standing in for the interaction layer — use them to judge alignment.
- Fallback: satellite plane (the game's own `satellite_z15.jpg`) + OSM overlay.
  Tiles auto-fall back after 3 load errors (no retry storms — quota protection),
  and are gated OFF by default on mobile / save-data / 2G (toggle to override).
- HUD measures: first-tile time, FPS + frame ms, session streamed MB,
  JS heap, and a ground probe (raycast at the origin → vertical offset between
  tile ground and the game's y=0 plane; correct with the Y-offset slider).
- Google/Cesium attribution bar is fed from the renderer and must stay visible
  while tiles are on.
- No disk caching of tiles: in-memory LRU only, no CacheStorage/service worker.

## Run it

```bash
cd ~/workspace/tiles-prototype
node dev-server.js          # serves the page AND the handshake endpoint
# open http://localhost:8917
```

`dev-server.js` is the local stand-in for the production Vercel function:
`GET /api/tiles-session` calls the ion asset endpoint **server-side** (master
token from env/`./.env` only), caches the session **45 min** for all users,
and enforces a **daily fresh-handshake budget (40/day)**. The browser receives
only the session tileset URL; tile data streams client → Google directly.

Client behavior (Architecture review, built in from the start):
- **Handshake first** → session URL + `GoogleCloudAuthPlugin` (session renewal).
  Local `token.local.js` direct-ion path exists only as a dev fallback.
- **Any tile error (incl. 403/429) stops tiles immediately** → silent switch
  to satellite/OSM + one small toast. No error modal, no retry storm.
- **Attribution is shown only while tiles are displayed.**
- **Streaming control**: screen-space error floor (`errorTarget` ≥ 8) plus a
  slider (8–64) — raise it to cut detail/streaming; HUD shows session MB.
- **Range gate**: tiles visible only within 1.5 km of the anchor and below
  800 m camera height (hysteresis 1.7 km / 950 m). Landing, far views and
  mobile default to OFF.
- **Device/network gate**: mobile UA, save-data, or 2G → tiles OFF by default.

## Cesium ion setup (Han — one time)

1. Sign up at <https://cesium.com/ion> (free **Community** tier — 1,000 root
   tiles/month + 15 GB streaming; at quota it *stops*, it does not bill).
2. **Asset Depot** → search **“Google Photorealistic 3D Tiles”** →
   **Add to My Assets** (asset ID `2275207`).
3. **Access Tokens** → **Create token** → name it e.g. `espil-tiles-dev` →
   in the token’s asset list select **only** “Google Photorealistic 3D Tiles”
   (scope `assets:read`).
4. Put the token **only** in secret storage — never in git, never in chat:
   - Main project: `CESIUM_ION_TOKEN=<token>` in the project `.env` (gitignored).
   - This prototype: copy `token.local.example.js` → `token.local.js` and paste
     it there (also gitignored).
5. Production will **not** ship the token to browsers: a Vercel handshake
   function will hold the master token, call ion server-side, and return only
   the short-lived session tileset URL (Architecture review 2026-10-14).

## Known integration blockers (for the production phase, not this prototype)

- **Three.js version — RULED (Architecture, 2026-10-14, confirmed via COO): isolated module
  layer.** No whole-game ESM migration. Tiles run as their own importmap +
  vendored three 0.186 in a separate canvas pass *under* the game canvas.
  The ONLY interface between layers is exposed camera state
  (position / quaternion / fov), synced one-way from the game. The tile
  pass is always below; the game pass (transparent background) is above —
  two canvases cannot share a depth buffer, so occlusion stays with the
  game's OSM boxes, exactly as the current 2-layer design assumes. Tiles
  must stay a removable leaf: delete the layer and the game is
  byte-identical.
- **Globe curve — RULED: disabled for the tiles layer + range limit/fade.**
  True-scale geometry is never bent by the player-anchor curve, and no
  per-material curve shader patch on tiles in v1. Near the anchor the
  curve drop converges to ~0 (quadratic: 100 m ≈ 6 m on the
  500 m/145 m curve). Production spec: tiles fade out starting at the
  radius where layer divergence passes ~3 m, overlapping the game's
  existing fog band (200–1500 m). (The prototype approximates this with
  the 1.5 km hard range gate.)
- Vendored here: `three@0.186.1` modules + `3d-tiles-renderer@0.5.3` builds +
  DRACO decoder + Basis/KTX2 transcoder under `vendor/`.
