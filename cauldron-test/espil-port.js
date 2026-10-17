/* ============================================================
   ESPIL PORT for the Cauldron test version (2026-10-16)
   Ports the systems built for Espil Online's own city into the
   archived Cauldron (Mapbox GL JS + sprite character):

   - PREBUILT COLLISION STORE: loads vancouver_collision.json
     (9-class mask + per-building roof-height layer + polygon
     scanline collider strips). The runtime only probes it.
   - ROOFTOPS: a building cell's roof is a standable, landable
     surface at its real height (highest surface within the
     player's radius - the same descent/landing law).
   - WALL CLIMBING: Shift is Cauldron's jump (unchanged). While
     AIRBORNE, pressing into a building wall attaches the climb:
     rise 12 m/s, lateral movement at 0.6x walk speed, Space is
     the wall jump, and reaching the top steps onto the roof.
   - Verticality runs in METRES in this module and is written
     back into state.sprite.jumpZ (x2.7 display scale) so
     Cauldron's own sprite drawing, shadow and status show it.

   The store is fetched from the testing repo's shared assets
   (../assets/osm/) so this folder stays small; a copy placed at
   ./vancouver_collision.json next to this file also works.
   ============================================================ */
(function () {
  'use strict';
  var LAT0 = 49.2827, LNG0 = -123.1207;
  var COS0 = Math.cos(LAT0 * Math.PI / 180);
  var PX_M = 2.7;               /* sprite jumpZ units per metre */
  var STEP = 0.55;              /* step-up slack, metres */
  var CLIMB_RISE = 12;          /* m/s */
  var CLIMB_LAT = 0.6;          /* x walk speed */
  var GRAV = 26;                /* m/s^2 */
  var JUMP_V = [8.6, 7.2];      /* first / double jump, m/s */

  var store = null;             /* {cls, roof, strips, origin, cell, w, h} */
  var P = {
    ready: false, alt: 0, vel: 0, mode: 'ground',
    face: null, lastWallAt: 0, detachT: 0,
    push: null, teleported: false
  };

  function toStore(lngLat) {
    return {
      x: (lngLat[0] - LNG0) * 111320 * COS0,
      z: -(lngLat[1] - LAT0) * 111320
    };
  }
  function toLngLat(x, z) {
    return [LNG0 + x / (111320 * COS0), LAT0 - z / 111320];
  }
  function b64ToU8(b64) {
    var bin = atob(b64), u8 = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  }
  function cellAt(x, z) {
    if (!store) return null;
    var cx = Math.floor((x - store.origin[0]) / store.cell);
    var cz = Math.floor((z - store.origin[1]) / store.cell);
    if (cx < 0 || cz < 0 || cx >= store.w || cz >= store.h) return null;
    var i = cz * store.w + cx;
    return { cls: store.cls[i], roofH: (store.roof[i] || 0) / 10 };
  }
  /* Highest standable surface within the player radius - the
     descent/landing law. Building and roof cells contribute their
     roof height; everything else is ground (0). */
  function surfaceAt(x, z) {
    var best = 0;
    var pts = [[0, 0], [STEP, 0], [-STEP, 0], [0, STEP], [0, -STEP]];
    for (var i = 0; i < pts.length; i++) {
      var c = cellAt(x + pts[i][0], z + pts[i][1]);
      if (c && (c.cls === 4 || c.cls === 8) && c.roofH > best) best = c.roofH;
    }
    return best;
  }
  function probe(lngLat) {
    var s = toStore(lngLat);
    var c = cellAt(s.x, s.z);
    if (!c) return null;
    var names = ['water', 'greenspace', 'greenspace_light', 'road', 'building', 'land', 'commercial_land', 'medical_land', 'roof'];
    return { cls: names[c.cls] || c.cls, roofH: c.roofH, surface: surfaceAt(s.x, s.z) };
  }

  function inputVec() {
    var e = 0, n = 0;
    if (state.keys.has('ArrowUp')) n += 1;
    if (state.keys.has('ArrowDown')) n -= 1;
    if (state.keys.has('ArrowRight')) e += 1;
    if (state.keys.has('ArrowLeft')) e -= 1;
    var l = Math.hypot(e, n);
    if (l > 0) { e /= l; n /= l; }
    return { e: e, n: n, x: e, z: -n }; /* store frame: x east, z south */
  }
  function movePlayerBy(dx, dz) {
    var ll = offsetLngLat(state.playerLngLat, dx, -dz);
    state.playerLngLat = ll;
  }

  /* ---------- wall / roof gate (called from tryMovePlayer) --- */
  function gateMove(nextLngLat) {
    if (!P.ready || state.isFlying) return null;
    if (P.mode === 'climb') return false; /* the climb tick moves the player */
    var s = toStore(nextLngLat);
    var cell = cellAt(s.x, s.z);
    if (!cell) return null;                 /* outside the store grid: Cauldron decides */
    if (cell.cls === 0) return null;        /* water: Cauldron's swim/collision decides */
    /* Inside the prebuilt store the store is the collision
       authority (it is the full-district upgrade of Cauldron's
       own demo-chunk masks, which otherwise refuse every move
       outside their 100 m sample). */
    var sN = surfaceAt(s.x, s.z);
    if (sN - P.alt > STEP) {
      P.lastWallAt = performance.now();
      P.lastWallSurface = sN;
      return false;
    }
    return true;
  }

  /* ---------- climbing -------------------------------------- */
  function tryAttach(inp) {
    var p = toStore(state.playerLngLat);
    var best = null;
    for (var i = 0; i < store.strips.length; i++) {
      var st = store.strips[i];
      var x0 = st[0] - st[2], x1 = st[0] + st[2], z0 = st[1] - st[3], z1 = st[1] + st[3], top = st[4];
      if (top - P.alt < 1) continue;
      if (p.x < x0 - 2 || p.x > x1 + 2 || p.z < z0 - 2 || p.z > z1 + 2) continue;
      var faces = [
        { nx: -1, nz: 0, plane: x0, axis: 'x', lo: z0, hi: z1 },
        { nx: 1, nz: 0, plane: x1, axis: 'x', lo: z0, hi: z1 },
        { nx: 0, nz: -1, plane: z0, axis: 'z', lo: x0, hi: x1 },
        { nx: 0, nz: 1, plane: z1, axis: 'z', lo: x0, hi: x1 }
      ];
      for (var f = 0; f < 4; f++) {
        var F = faces[f];
        if (F.hi - F.lo < 1.5) continue;
        var along = (F.axis === 'x') ? p.z : p.x;
        if (along < F.lo + 0.1 || along > F.hi - 0.1) continue;
        var d = (F.axis === 'x') ? (p.x - F.plane) * F.nx : (p.z - F.plane) * F.nz;
        if (d < 0.5 || d > 1.0) continue;
        if (-(inp.x * F.nx + inp.z * F.nz) < 0.45) continue;
        if (!best || d < best.d) best = { F: F, d: d, top: top };
      }
    }
    if (!best) return false;
    /* Widen the face span across coplanar strip seams (same law
       as the Espil city climb). */
    var F = best.F, wLo = F.lo, wHi = F.hi, grew = true, guard = 0;
    while (grew && guard++ < 24) {
      grew = false;
      for (var wi = 0; wi < store.strips.length; wi++) {
        var wst = store.strips[wi];
        if (Math.abs(wst[4] - best.top) > 0.15) continue;
        var wx0 = wst[0] - wst[2], wx1 = wst[0] + wst[2], wz0 = wst[1] - wst[3], wz1 = wst[1] + wst[3];
        var wPlane = (F.axis === 'x') ? (F.nx < 0 ? wx0 : wx1) : (F.nz < 0 ? wz0 : wz1);
        if (Math.abs(wPlane - F.plane) > 0.03) continue;
        var wlo = (F.axis === 'x') ? wz0 : wx0, whi = (F.axis === 'x') ? wz1 : wx1;
        if (wlo < wLo + 0.01 && whi > wLo - 2.3) { wLo = wlo; grew = true; }
        if (whi > wHi - 0.01 && wlo < wHi + 2.3) { wHi = whi; grew = true; }
      }
    }
    P.face = { nx: F.nx, nz: F.nz, plane: F.plane, axis: F.axis, lo: wLo, hi: wHi, top: best.top };
    P.mode = 'climb'; P.detachT = 0; P.vel = 0;
    return true;
  }

  function climbTick(dt, inp) {
    var F = P.face;
    var toward = -(inp.x * F.nx + inp.z * F.nz);
    if (toward < 0.45) {
      P.detachT += dt;
      if (P.detachT > 0.25) { P.mode = 'air'; P.face = null; P.vel = 0; return; }
    } else P.detachT = 0;
    P.alt += CLIMB_RISE * dt;
    if (P.alt >= F.top) {
      /* Top-out: step inward onto the roof and stand on it. */
      movePlayerBy(-F.nx * (STEP + 0.35), -F.nz * (STEP + 0.35));
      P.alt = F.top; P.mode = 'ground'; P.face = null;
      state.sprite.jumps = 0;
      return;
    }
    /* Lateral travel along the face at 0.6x walk speed. */
    var lat = (F.axis === 'x') ? inp.z : inp.x;
    if (lat) {
      var p = toStore(state.playerLngLat);
      var along = (F.axis === 'x') ? p.z : p.x;
      var next = Math.max(F.lo + 0.15, Math.min(F.hi - 0.15, along + lat * PLAYER_WALK_METERS_PER_SECOND * CLIMB_LAT * dt));
      var delta = next - along;
      if (F.axis === 'x') movePlayerBy(0, delta); else movePlayerBy(delta, 0);
    }
    /* Pin the player at arm's length from the face plane. */
    var q = toStore(state.playerLngLat);
    var dNow = (F.axis === 'x') ? (q.x - F.plane) * F.nx : (q.z - F.plane) * F.nz;
    var corr = dNow - STEP;
    if (Math.abs(corr) > 0.01) movePlayerBy(-F.nx * corr, -F.nz * corr);
    if (typeof syncPlayerMapPosition === 'function') syncPlayerMapPosition();
  }

  function wallJump() {
    var F = P.face;
    P.mode = 'air'; P.face = null;
    P.vel = 7.5;
    P.push = { x: F.nx * 3.2, z: F.nz * 3.2, t: 0.28 };
    state.sprite.jumps = 1;
  }

  function onSpace() {
    if (P.mode === 'climb') { wallJump(); return true; }
    return false;
  }

  /* ---------- vertical tick (called from tickCharacter) ------ */
  function verticalTick(dt) {
    if (!P.ready || state.isFlying) return false;
    var inp = inputVec();

    /* One-shot port test teleport (?port=1): the verified climb
       building from the Espil city tests - street point south of
       a 12 m face. */
    if (!P.teleported && /[?&]port=1/.test(location.search) &&
        state.app.classList.contains('is-playing')) {
      P.teleported = true;
      state.playerLngLat = toLngLat(918.3, 605.1);
      if (typeof syncPlayerMapPosition === 'function') syncPlayerMapPosition(true);
    }

    /* Jump trigger: jumpPlayer() (Shift) parks a native impulse
       in jumpVelocity - translate it into metres. */
    if (state.sprite.jumpVelocity > 0) {
      if (P.mode === 'climb') { state.sprite.jumpVelocity = 0; wallJump(); }
      else {
        P.vel = JUMP_V[state.sprite.jumps >= 2 ? 1 : 0];
        state.sprite.jumpVelocity = 0;
        if (P.mode === 'ground') P.mode = 'air';
      }
    }

    if (P.mode === 'climb') { climbTick(dt, inp); }
    else {
      var p = toStore(state.playerLngLat);
      var surface = surfaceAt(p.x, p.z);
      if (P.push) {
        movePlayerBy(P.push.x * dt * 4, P.push.z * dt * 4);
        P.push.t -= dt; if (P.push.t <= 0) P.push = null;
        p = toStore(state.playerLngLat); surface = surfaceAt(p.x, p.z);
      }
      if (P.mode === 'air' || P.alt > surface + 0.001 || P.vel > 0) {
        P.mode = 'air';
        P.vel -= GRAV * dt;
        P.alt += P.vel * dt;
        /* Airborne wall contact + input toward it = climb. */
        if (P.vel <= 1 && performance.now() - P.lastWallAt < 140 &&
            (inp.x || inp.z) && tryAttach(inp)) {
          /* attached this tick */
        } else if (P.alt <= surface) {
          P.alt = surface; P.vel = 0; P.mode = 'ground';
          state.sprite.jumps = 0;
        }
      } else {
        P.alt = surface; /* grounded: follow the surface (roofs included) */
      }
    }

    state.sprite.jumpZ = P.alt * PX_M;
    state.app.dataset.espilAlt = P.alt.toFixed(2);
    state.app.dataset.espilMode = P.mode;
    if (hud) hud.textContent = 'ESPIL PORT · alt ' + P.alt.toFixed(1) + ' m · ' + P.mode +
      ' · surface ' + (P.ready ? surfaceAt(toStore(state.playerLngLat).x, toStore(state.playerLngLat).z).toFixed(1) : '-') + ' m';
    return true;
  }

  /* ---------- boot ------------------------------------------- */
  var hud = null;
  function makeHud() {
    hud = document.createElement('div');
    hud.id = 'espil-port-hud';
    hud.style.cssText = 'position:fixed;left:10px;bottom:10px;z-index:200;background:rgba(8,12,18,.82);color:#cfe3f5;font:600 12px/1.5 monospace;padding:6px 10px;border-radius:8px;pointer-events:none;';
    hud.textContent = 'ESPIL PORT · loading collision store...';
    document.body.appendChild(hud);
  }
  function loadStore() {
    var urls = ['../assets/osm/vancouver_collision.json', './vancouver_collision.json'];
    var i = 0;
    (function next() {
      if (i >= urls.length) {
        if (hud) hud.textContent = 'ESPIL PORT · collision store NOT found - native physics';
        return;
      }
      fetch(urls[i++]).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) {
        store = {
          cls: b64ToU8(d.classes_b64),
          roof: new Uint16Array(b64ToU8(d.roof_dm_b64).buffer),
          strips: d.colliders || [],
          origin: d.origin, cell: d.cell, w: d.w, h: d.h
        };
        P.ready = true;
        window.EspilPort.store = store;
        if (hud) hud.textContent = 'ESPIL PORT · store loaded (' + store.strips.length + ' strips) · alt 0 m · ground';
      }).catch(next);
    })();
  }

  window.EspilPort = {
    gateMove: gateMove, verticalTick: verticalTick, onSpace: onSpace,
    probe: probe, state: P, toStore: toStore, toLngLat: toLngLat
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { makeHud(); loadStore(); });
  else { makeHud(); loadStore(); }
})();
