# EverPlanet-Style Globe View Implementation Plan

## Goal

Cauldron keeps gameplay, Mapbox coordinates, POI lookup, collision, and navigation on a flat logical plane. The EverPlanet effect is a visual-only projection around the player.

The target shader displacement is:

```text
y' = y - ((x - cx)^2 + (z - cz)^2) / (2R)
```

Where `(cx, cz)` is the player-centered projection point and `R` is the visual curve radius.

## Current Web Prototype

Mapbox GL renders the real-world map as a flat canvas. Because Mapbox's internal terrain/building meshes are not exposed as project-owned vertices, this prototype uses a player-centered parabolic presentation layer:

- CSS variables define projection center and curve radius.
- Gameplay remains flat: collisions, roads, POIs, water, and teleports use original coordinates.
- A curve overlay/horizon/grid provides the mini-planet visual cue without replacing Mapbox.

Files:

- `styles.css`: `#everplanet-curve`, `--curve-radius`, `--curve-drop`
- `app.js`: `updateEverPlanetCurve()`

## Real Shader Roadmap

### 1. Vertex Transformation

In Unity/Unreal/Godot, every map tile/building mesh vertex should be transformed in player-relative space:

```hlsl
float3 relative = worldPos - _CurveCenter;
float drop = dot(relative.xz, relative.xz) / (2.0 * _CurveRadius);
worldPos.y -= drop;
```

`_CurveCenter` updates every frame from the player world position. Logic/physics never receives this displaced position.

### 2. Normal Correction

The curved surface gradient is:

```text
dy/dx = -x / R
dy/dz = -z / R
```

A corrected upward normal can be approximated as:

```hlsl
float3 normal = normalize(float3(relative.x / _CurveRadius, 1.0, relative.z / _CurveRadius));
```

For arbitrary mesh normals, rotate the original normal by the same local bend basis, or reconstruct TBN from the displaced partial derivatives.

### 3. Culling

Standard frustum culling sees the flat bounds, not the visually bent mesh. Strategies:

- Inflate renderer bounds vertically by max displacement.
- Use larger tile chunk bounds near the artificial horizon.
- Cull gameplay/POI data by flat distance, but render by expanded visual bounds.
- Optionally add a custom horizon culler after displacement.

### 4. Shadows

The same displacement must run in shadow caster passes. If shadow maps use flat geometry while the main pass uses curved geometry, shadows float or clip.

- Unity: duplicate vertex displacement in `ShadowCaster` pass.
- Unreal: apply through material world position offset and verify shadow depth pass supports it.
- Cascaded shadows: expand cascade bounds by max curve displacement.

### 5. Mouse Picking

Visual is curved, logic is flat. Picking should solve the inverse problem:

1. Raycast against displaced visual surface for feedback.
2. Convert hit point back to flat logical coordinates by using original tile/mesh UV or map coordinate metadata.
3. If no visual mesh hit exists, raycast against logical plane and map to coordinates.

For Mapbox-web prototype, picking remains Mapbox coordinate-based because the map canvas itself remains flat.

### 6. Performance and Batching

The curve is shader-side and player-centered, so meshes can still be instanced if `_CurveCenter` and `_CurveRadius` are global shader constants.

- Avoid per-object material instances.
- Keep curve params global.
- Batch static map chunks normally.
- Use LOD near artificial horizon.

## Cauldron Next Step

If the project moves from Mapbox canvas to a custom Unity/Unreal renderer, replace the CSS presentation layer with the shader displacement above while keeping the current flat coordinate/collision pipeline.
