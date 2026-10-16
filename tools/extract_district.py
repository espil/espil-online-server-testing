#!/usr/bin/env python3
"""Extract the sample district (downtown core + first OSM ring) from
vancouver_5km.json - the polygon source the AABB chunk file was
derived from. District = radius 550 m around the spawn (19, -57),
matching SELF-CITY-PLAN.md. Output keeps TRUE polygon footprints."""
import json, math, os

SRC = os.path.join(os.path.dirname(__file__), '..', 'game', 'assets', 'osm', 'vancouver_5km.json')
OUT = os.path.join(os.path.dirname(__file__), '..', 'game', 'assets', 'osm', 'vancouver_district_sample.json')
SX, SZ, R = 19.0, -57.0, 2000.0  # expansion steps 2026-10-16: 550 (sample) -> 1000 -> 2000 m (= the OSM render radius)
M = 60.0  # bbox margin for roads/waters crossing the rim

def centroid(p):
    return (sum(q[0] for q in p) / len(p), sum(q[1] for q in p) / len(p))

def near(p, r):
    cx, cz = centroid(p)
    return math.hypot(cx - SX, cz - SZ) <= r

def touches(p):
    return any(SX - R - M <= q[0] <= SX + R + M and SZ - R - M <= q[1] <= SZ + R + M for q in p)

d = json.load(open(SRC))
out = {
    'meta': {'district': 'downtown core + OSM rings to 2000 m (full OSM render radius)', 'center': [SX, SZ], 'radius': R,
             'source': 'vancouver_5km.json (OSM, polygon footprints)'},
    'buildings': [b for b in d['buildings'] if near(b['p'], R)],
    'roads': [r for r in d['roads'] if touches(r['p'])],
    'waters': [w for w in d['waters'] if touches(w['p'])],
}
json.dump(out, open(OUT, 'w'), separators=(',', ':'))
print('district:', len(out['buildings']), 'buildings,', len(out['roads']), 'roads,', len(out['waters']), 'waters ->', OUT)
