# Cauldron Test Version (Espil port, 2026-10-16)

The archived Cauldron (Mapbox GL JS v3.4.0, the build that ran at
cauldron.usedesign.rf.gd) plus the systems built for Espil Online's
own city, ported in by the map room at Han's direction.

## Run it

1. Pull this repo (espil/espil-online-server-testing).
2. Put YOUR Mapbox token in `cauldron-test/local-config.js`
   (the `mapboxToken` field - the file ships with a placeholder;
   no real token is tracked in this repo).
3. From the repo root: `node local-server.js`
4. Open http://localhost:8920/cauldron-test/?autoplay=1&port=1
   - `autoplay=1` skips the creator with the built-in test profile.
   - `port=1` teleports you to the climb-test spot: a street south
     of a 12 m building face (the same building used to verify the
     Espil city climb). Walk north into the wall, press Shift to
     jump into it, and the climb starts.

Without a token the Mapbox underlay stays blank, but every ported
system still runs (the character, collision and HUD work).

## What was ported

- **Prebuilt collision store**: `espil-port.js` loads the shared
  `assets/osm/vancouver_collision.json` (9-class mask + per-building
  roof-height layer + polygon scanline strips) and only probes it -
  no runtime mask generation. Inside the store's district the store
  is the collision authority (Cauldron's own production runtime
  only ships a 100 m demo chunk and refuses every move outside it).
- **Rooftops**: building cells stand and land at their real roof
  height (highest surface within the player's radius - the same
  landing law as the Espil city). Walls block; stepping off an
  edge drops you to the surface below.
- **Wall climbing**: airborne wall contact with input toward the
  wall attaches the climb (Shift is already Cauldron's jump).
  Rise 12 m/s, lateral movement at 0.6x walk speed, Space is the
  wall jump, and the top steps onto the roof.
- **Curvature k=1400**: Cauldron's everplanet-curve overlay now
  computes its drop with the same law as the Three.js builds
  (drop = 0.0014 x groundDistance^2), and `curveK` is published on
  the app dataset. The Mapbox base map is a closed renderer, so
  the vertex curve itself cannot be applied to the map tiles -
  the law is applied to the character/horizon layer. This is the
  one structural limit of the port.

The ESPIL PORT sections are marked in `app.js` (four small hooks)
and the system itself lives in `espil-port.js`. Verticality runs
in metres there and is written back into the sprite's jumpZ at a
2.7 units-per-metre display scale.

## Verified in the sandbox VM (no Mapbox token there)

Boot into play, store loaded, curveK = 0.0014, teleport spot
probes as road; walked north to the wall, Shift-jumped into it -
climb attached (9.5 m sampled mid-climb) - topped out and, after
releasing every key, still standing on the roof at exactly
12.0 m (probe: building, roofH 12, surface 12).
