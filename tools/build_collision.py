#!/usr/bin/env python3
"""Prebuild the vancouver_collision map (Han's direction, 2026-10-16):
the collision map is made ONCE from the source data and stored; the
game loads it and only probes it - no runtime mask generation.

Contents: a 9-class mask (Cauldron SATELLITE_TILE_PALETTE ids/rules)
plus a height layer (per-cell roof height in decimeters, 0 = none), so
a building cell reads 'standable on the roof at height h'.

Source for the sample build: the district file (true OSM polygons).
Production runs the same tool per district over the city data.

Grid: origin (-640, -640), cell 2 m, 640 x 640 cells (1280 m square
around the anchor, covering the sample district + margin)."""
import json, math, base64, os

PALETTE = [
    {'id': 0, 'name': 'water',           'walkable': False, 'blocked': True,  'swimmable': True,  'buildable': False},
    {'id': 1, 'name': 'greenspace',      'walkable': True,  'blocked': False, 'swimmable': False, 'buildable': False},
    {'id': 2, 'name': 'greenspace_light','walkable': True,  'blocked': False, 'swimmable': False, 'buildable': False},
    {'id': 3, 'name': 'road',            'walkable': True,  'blocked': False, 'swimmable': False, 'buildable': False},
    {'id': 4, 'name': 'building',        'walkable': False, 'blocked': True,  'swimmable': False, 'buildable': False},
    {'id': 5, 'name': 'land',            'walkable': True,  'blocked': False, 'swimmable': False, 'buildable': True},
    {'id': 6, 'name': 'commercial_land', 'walkable': True,  'blocked': False, 'swimmable': False, 'buildable': True},
    {'id': 7, 'name': 'medical_land',    'walkable': True,  'blocked': False, 'swimmable': False, 'buildable': True},
    {'id': 8, 'name': 'roof',            'walkable': False, 'blocked': True,  'swimmable': False, 'buildable': False},
]
OX, OZ, CELL, W, H = -640.0, -640.0, 2.0, 640, 640
LAND, WATER, ROAD, BUILDING = 5, 0, 3, 4

cls = bytearray([LAND]) * (W * H)
roof = [0] * (W * H)  # uint16 decimeters

def cell_range(minv, maxv, o):
    a = max(0, int(math.floor((minv - o) / CELL)))
    b = min(W - 1, int(math.floor((maxv - o) / CELL)))
    return a, b

def fill_polygon(p, class_id, roof_dm=0):
    xs = [q[0] for q in p]; zs = [q[1] for q in p]
    cx0, cx1 = cell_range(min(xs), max(xs), OX)
    cz0, cz1 = cell_range(min(zs), max(zs), OZ)
    n = len(p)
    for cz in range(cz0, cz1 + 1):
        wz = OZ + (cz + 0.5) * CELL
        # scanline: nodes where polygon edges cross this z
        nodes = []
        j = n - 1
        for i in range(n):
            xi, zi = p[i]; xj, zj = p[j]
            if (zi < wz and zj >= wz) or (zj < wz and zi >= wz):
                nodes.append(xi + (wz - zi) / (zj - zi) * (xj - xi))
            j = i
        nodes.sort()
        for k in range(0, len(nodes) - 1, 2):
            a, b = nodes[k], nodes[k + 1]
            ix0, ix1 = cell_range(a, b, OX)
            for cx in range(max(ix0, cx0), min(ix1, cx1) + 1):
                idx = cz * W + cx
                cls[idx] = class_id
                if roof_dm > roof[idx]:
                    roof[idx] = roof_dm

def stamp_segment(x1, z1, x2, z2, half_w, class_id):
    cx0, cx1 = cell_range(min(x1, x2) - half_w, max(x1, x2) + half_w, OX)
    cz0, cz1 = cell_range(min(z1, z2) - half_w, max(z1, z2) + half_w, OZ)
    dx, dz = x2 - x1, z2 - z1
    L2 = dx * dx + dz * dz or 1.0
    for cz in range(cz0, cz1 + 1):
        wz = OZ + (cz + 0.5) * CELL
        for cx in range(cx0, cx1 + 1):
            wx = OX + (cx + 0.5) * CELL
            t = max(0.0, min(1.0, ((wx - x1) * dx + (wz - z1) * dz) / L2))
            px, pz = x1 + t * dx, z1 + t * dz
            if (wx - px) ** 2 + (wz - pz) ** 2 <= half_w * half_w:
                if cls[cz * W + cx] != BUILDING:
                    cls[cz * W + cx] = class_id

def main():
    here = os.path.dirname(__file__)
    src = os.path.join(here, '..', 'game', 'assets', 'osm', 'vancouver_district_sample.json')
    out_path = os.path.join(here, '..', 'game', 'assets', 'osm', 'vancouver_collision.json')
    d = json.load(open(src))
    for wpoly in d['waters']:
        fill_polygon(wpoly['p'], WATER)
    for r in d['roads']:
        pts = r['p']
        for i in range(len(pts) - 1):
            stamp_segment(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 4.0, ROAD)
    for b in d['buildings']:
        fill_polygon(b['p'], BUILDING, int(round(b['h'] * 10)))
    # Collider strips: merge each building's mask cells into x-runs per
    # z-row. The game registers these as its collision boxes, so the
    # collision it plays with is literally this stored map (2 m fidelity,
    # top = roof height). Core-square buildings are included - the game
    # decides which districts to register.
    strips = []
    for b in d['buildings']:
        xs = [q[0] for q in b['p']]; zs = [q[1] for q in b['p']]
        cx0, cx1 = cell_range(min(xs), max(xs), OX)
        cz0, cz1 = cell_range(min(zs), max(zs), OZ)
        top = round(b['h'], 1)
        rows = []
        for cz in range(cz0, cz1 + 1):
            run = None
            for cx in range(cx0, cx1 + 2):
                inside = cx <= cx1 and cls[cz * W + cx] == BUILDING and abs(roof[cz * W + cx] - int(top * 10)) <= 1
                if inside and run is None:
                    run = cx
                elif not inside and run is not None:
                    rows.append([run, cx, cz, cz + 1])
                    run = None
        # merge identical x-runs across consecutive z-rows
        rows.sort(key=lambda r: (r[0], r[1], r[2]))
        merged = []
        for r in rows:
            if merged and merged[-1][0] == r[0] and merged[-1][1] == r[1] and merged[-1][3] == r[2]:
                merged[-1][3] = r[3]
            else:
                merged.append(list(r))
        for x0c, x1c, z0c, z1c in merged:
            x0 = OX + x0c * CELL; x1 = OX + x1c * CELL
            z0 = OZ + z0c * CELL; z1 = OZ + z1c * CELL
            strips.append([round((x0 + x1) / 2, 1), round((z0 + z1) / 2, 1),
                           round((x1 - x0) / 2, 1), round((z1 - z0) / 2, 1), top])
    print('collider strips:', len(strips))
    roof_bytes = b''.join(int(v).to_bytes(2, 'little') for v in roof)
    out = {
        'name': 'vancouver_collision', 'version': 1,
        'note': 'Prebuilt collision map (9-class mask + roof height layer). The game loads and probes this file; it never generates masks at runtime.',
        'origin': [OX, OZ], 'cell': CELL, 'w': W, 'h': H,
        'palette': PALETTE,
        'colliders': strips,
        'classes_b64': base64.b64encode(bytes(cls)).decode(),
        'roof_dm_b64': base64.b64encode(roof_bytes).decode(),
    }
    json.dump(out, open(out_path, 'w'), separators=(',', ':'))
    from collections import Counter
    print('cells by class:', dict(Counter(cls)))
    print('roof cells:', sum(1 for v in roof if v > 0), '| wrote', out_path, os.path.getsize(out_path), 'bytes')

if __name__ == '__main__':
    main()
