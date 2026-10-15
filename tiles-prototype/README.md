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
- Tiles = the ONLY building visual (Han's ruling 2026-10-14: buildings come
  from Google's 3D data — no fabricated three.js building geometry, no
  extruded masses, no facade murals). The OSM layer is interaction data
  (IDs/proximity); its translucent wireframe overlay is a debug aid for
  alignment checks and is OFF by default.
- Fallback: satellite plane only (the game's own `satellite_z15.jpg`).
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
- **Range gate**: tiles visible only inside the **downtown core boundary
  polygon** (Han's red line on Google Maps, digitized 2026-10-14 into
  `downtown-boundary.json` — 72 vertices, game coords; spans x −2421…1321,
  z −1658…1589, ≈7.8 km²) and below 800 m camera height; OFF beyond the
  1.1×-scaled polygon (hysteresis). Falls back to a 1.5 km radius gate if
  the polygon file fails to load. Landing, far views and mobile default
  to OFF.
- **Device/network gate**: mobile UA, save-data, or 2G → tiles OFF by default.
- **Character**: the Espil.Online male character (`male.glb`, 15 MB, from the
  house-walkthrough set) is summoned with the **Walking** clip playing. It
  grounds itself on the active layer — raycast probe onto the tile surface
  when tiles are on, the y=0 game plane in fallback — and re-grounds as
  tiles stream/toggle. Default camera is a third-person **Character view**;
  the View button toggles to the wide City view.
- **Entry + navigation (Han's vision, COO-confirmed prototype scope)**:
  landing overlay with city select → 7 s continuous zoom-in while tiles
  stream → sky descent → landed. Minimap: **M** cycles small → medium →
  large; on the large map a click **pins** a destination (water nudges
  to land, spawn rules) — guidance is a dashed line + distance/bearing
  readout, a light beacon at the pin, and an arrival state at 15 m.
  **Arrow keys** glide the character over the measured surface with a height
  gate (steps climbing > 2.5 m — walls, roof edges — are refused) so the
  pin loop is provable end-to-end. Movement is the ARROW keys — on the
  ground and during the sky descent alike (drift caps at 250 m from the
  descent start), per Han: the original movement scheme. The UI rise
  after landing follows the UI room's pattern (bottom → side → top,
  28 px + fade, cubic-bezier(.22,.9,.26,1), ~1.4 s total).
- **Sky-descent summon (Han's direction, 2026-10-14)**: a spawn point's
  height is unknowable before its tiles stream, and a character planted
  at y=0 sat ~12 m under downtown streets (invisible until re-summon).
  The character now enters from ~160 m up and descends while the surface
  below is probed continuously, landing on the measured surface; a 2 s
  re-ground follows later LOD refinement so it can never be buried
  again. The camera starts wide and eases into the character framing
  during the descent (prototype form of Han's landing zoom-in).
- **Spawn rules (Han, 2026-10-14)**: “📍 Summon at my location” is the
  in-game pre-prompt (browser permission follows). Inside the downtown
  boundary polygon → spawn at the real location. Outside → nearest point
  on the boundary, walked along the boundary to land if it is water
  (never spawn on water; an in-boundary water position likewise moves to
  the nearest land). Denied/unavailable → downtown anchor. The HUD Spawn
  row always shows the basis + game coordinates. Headless-verified:
  denied→anchor, Granville→inside (414, −89), False Creek water→land
  (−501, 77), Burnaby→boundary clamp (1119, 811).

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

## Coordinate frame — READ THIS (bug found on Han's PC run, 2026-10-14)

`ReorientationPlugin` takes lat/lon in **RADIANS** (the whole
3d-tiles-renderer cartographic API is radians; its display helpers
multiply by RAD2DEG). The first build passed **degrees** — the frame
landed in the South Pacific (the anchor's ECEF point mapped 11,509 km
off origin; open ocean — hence the blue void, the SIO/NOAA/GEBCO
bathymetry attribution, and 0.0 MB of detailed content). The plugin's
default azimuth also mirrors the game axes; `azimuth: Math.PI` fixes
it. Verified numerically with the vendored Ellipsoid itself:

| test point | frame coords (fixed) | game expects |
|---|---|---|
| anchor | (0, 0, 0) | (0, 0, 0) |
| 100 m east | (+100.2, 0, 0) | (+100, 0, 0) |
| 100 m north | (0, 0, −99.9) | (0, 0, −100) |
| 100 m up | (0, +100, 0) | (0, +100, 0) |

The page also carries a **minimap** (bottom-left): satellite image +
boundary polygon + camera/target/spawn markers with a live lat/lng
readout, so the frame can be eyeballed against real geography at any
time. Its mapping was pre-verified offline (polygon hugs the downtown
peninsula; the False Creek box lands on False Creek).

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
