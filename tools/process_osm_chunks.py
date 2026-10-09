#!/usr/bin/env python3
"""
Process OSM data into chunk-indexed compact format for the game.

Input: assets/osm/vancouver_5km.json (from fetch_osm_vancouver.py)
Output: assets/osm/vancouver_chunks.json

Format:
{
  "meta": {...},
  "chunks": {
    "cx,cz": {
      "b": [[x,z,w,d,h], ...],  # buildings (center x,z, width, depth, height)
      "r": [[x1,z1,x2,z2], ...]  # road segments (simplified)
    }
  }
}

Chunk size: 250m (matches game CHUNK_SIZE)
"""
import json
import os
import sys
import math

CHUNK = 250

def polygon_to_box(pts):
    """Convert polygon to (cx, cz, w, d, angle). Uses PCA for orientation."""
    if len(pts) < 3:
        return None
    # Centroid
    cx = sum(p[0] for p in pts) / len(pts)
    cz = sum(p[1] for p in pts) / len(pts)
    # Simple axis-aligned bbox (fast, good enough for game)
    xs = [p[0] for p in pts]
    zs = [p[1] for p in pts]
    minx, maxx = min(xs), max(xs)
    minz, maxz = min(zs), max(zs)
    w, d = maxx - minx, maxz - minz
    # Skip tiny slivers
    if w < 2 or d < 2 or w > 300 or d > 300:
        return None
    return [(minx+maxx)/2, (minz+maxz)/2, round(w,1), round(d,1)]

def main():
    src = os.path.join(os.path.dirname(__file__), '..', 'assets', 'osm', 'vancouver_5km.json')
    print(f"Loading {src}...", file=sys.stderr)
    with open(src) as f:
        data = json.load(f)
    
    chunks = {}
    
    def get_chunk(x, z):
        cx = math.floor(x / CHUNK)
        cz = math.floor(z / CHUNK)
        key = f"{cx},{cz}"
        if key not in chunks:
            chunks[key] = {'b': [], 'r': []}
        return chunks[key]
    
    # Buildings
    n_b = 0
    for b in data['buildings']:
        box = polygon_to_box(b['p'])
        if not box:
            continue
        cx, cz, w, d = box
        h = b['h']
        # Skip if inside downtown core (|x|,|z| < 130) — hand-built area preserved
        if abs(cx) < 130 and abs(cz) < 130:
            continue
        # Skip if outside 5km radius
        if cx*cx + cz*cz > 5000*5000:
            continue
        chunk = get_chunk(cx, cz)
        chunk['b'].append([round(cx,1), round(cz,1), w, d, h])
        n_b += 1
    
    # Roads (simplify: store as segments, only major roads to keep size down)
    n_r = 0
    for r in data['roads']:
        pts = r['p']
        if len(pts) < 2:
            continue
        # Only keep primary/secondary/tertiary for the game (residential too dense)
        if r['t'] not in ('motorway', 'trunk', 'primary', 'secondary', 'tertiary'):
            continue
        for i in range(len(pts)-1):
            x1, z1 = pts[i]
            x2, z2 = pts[i+1]
            # Skip if outside 5km
            mx, mz = (x1+x2)/2, (z1+z2)/2
            if mx*mx + mz*mz > 5000*5000:
                continue
            # Add to chunks that the segment touches (simplified: midpoint chunk)
            chunk = get_chunk(mx, mz)
            chunk['r'].append([round(x1,1), round(z1,1), round(x2,1), round(z2,1)])
            n_r += 1
    
    out = {
        'meta': {
            'chunk_size': CHUNK,
            'center': data['meta']['center'],
            'radius_m': 5000,
            'building_count': n_b,
            'road_segment_count': n_r,
            'chunk_count': len(chunks),
        },
        'chunks': chunks,
    }
    
    out_path = os.path.join(os.path.dirname(__file__), '..', 'assets', 'osm', 'vancouver_chunks.json')
    with open(out_path, 'w') as f:
        json.dump(out, f, separators=(',', ':'))
    
    size_mb = os.path.getsize(out_path) / 1024 / 1024
    print(f"Buildings: {n_b}, Road segs: {n_r}, Chunks: {len(chunks)}", file=sys.stderr)
    print(f"Wrote {out_path} ({size_mb:.1f} MB)", file=sys.stderr)

if __name__ == '__main__':
    main()
