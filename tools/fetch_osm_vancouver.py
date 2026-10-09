#!/usr/bin/env python3
"""
Fetch OSM data for 5km radius around downtown Vancouver (Canada Place).
Outputs a compact JSON for the Three.js map engine.

Usage:
    python3 fetch_osm_vancouver.py

Output:
    assets/osm/vancouver_5km.json

Data:
    - buildings: footprints (polygon), height (m), levels
    - roads: centerlines with highway type
    - water: polygons (Burrard Inlet, English Bay, False Creek)
"""
import json
import urllib.request
import urllib.parse
import os
import sys

# Map center (Canada Place area)
LAT0 = 49.2827
LNG0 = -123.1207
RADIUS_M = 5000

# Bbox for 5km radius (degrees)
# 1 deg lat ≈ 111320m, 1 deg lng ≈ 111320 * cos(lat)
import math
dlat = RADIUS_M / 111320
dlng = RADIUS_M / (111320 * math.cos(math.radians(LAT0)))
SOUTH, NORTH = LAT0 - dlat, LAT0 + dlat
WEST, EAST = LNG0 - dlng, LNG0 + dlng

print(f"Bbox: {SOUTH:.4f},{WEST:.4f},{NORTH:.4f},{EAST:.4f}", file=sys.stderr)

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

QUERY = f"""[out:json][timeout:90];
(
  way["building"]({SOUTH:.4f},{WEST:.4f},{NORTH:.4f},{EAST:.4f});
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary|residential|unclassified|service)$"]({SOUTH:.4f},{WEST:.4f},{NORTH:.4f},{EAST:.4f});
  way["natural"="water"]({SOUTH:.4f},{WEST:.4f},{NORTH:.4f},{EAST:.4f});
  relation["natural"="water"]({SOUTH:.4f},{WEST:.4f},{NORTH:.4f},{EAST:.4f});
  relation["natural"="bay"]({SOUTH:.4f},{WEST:.4f},{NORTH:.4f},{EAST:.4f});
);
out geom;"""

def latlng_to_xy(lat, lng):
    """Convert lat/lng to map coords (meters, x east, z south-negative)."""
    x = (lng - LNG0) * 111320 * math.cos(math.radians(LAT0))
    z = -(lat - LAT0) * 111320
    return [round(x, 1), round(z, 1)]

def fetch():
    print("Fetching from Overpass API...", file=sys.stderr)
    data = urllib.parse.urlencode({'data': QUERY}).encode('utf-8')
    req = urllib.request.Request(OVERPASS_URL, data=data, method='POST')
    req.add_header('User-Agent', 'EspilOnline/1.0 (map data fetch)')
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.load(resp)

def process(osm):
    buildings = []
    roads = []
    waters = []
    
    for el in osm.get('elements', []):
        el_type = el.get('type')
        tags = el.get('tags', {})
        
        if el_type == 'way':
            geom = el.get('geometry', [])
            if not geom:
                continue
            pts = [latlng_to_xy(p['lat'], p['lon']) for p in geom]
            
            if 'building' in tags:
                # Height: explicit > levels*3 > default by type
                h = None
                if tags.get('height'):
                    try:
                        # Parse "12", "12m", "12 m"
                        hs = tags['height'].replace('m', '').strip().split()[0]
                        h = float(hs)
                    except: pass
                if h is None and tags.get('building:levels'):
                    try:
                        h = float(tags['building:levels']) * 3.0
                    except: pass
                if h is None:
                    # Defaults by building type
                    bt = tags.get('building', '')
                    if bt in ('apartments', 'office', 'commercial', 'hotel'):
                        h = 25.0
                    elif bt in ('house', 'residential', 'detached', 'terrace'):
                        h = 8.0
                    else:
                        h = 12.0
                h = max(4.0, min(150.0, h))  # clamp
                
                buildings.append({
                    'p': pts,  # polygon [[x,z],...]
                    'h': round(h, 1),
                    't': tags.get('building', '')[:20],  # type
                })
            elif 'highway' in tags:
                roads.append({
                    'p': pts,
                    't': tags.get('highway', '')[:15],
                    'n': tags.get('name', '')[:60],
                })
            elif tags.get('natural') == 'water':
                waters.append({'p': pts})
        
        elif el_type == 'relation':
            # Water relations (multipolygons) — use outer members
            if tags.get('natural') in ('water', 'bay'):
                for m in el.get('members', []):
                    if m.get('role') == 'outer' and m.get('geometry'):
                        pts = [latlng_to_xy(p['lat'], p['lon']) for p in m['geometry']]
                        if len(pts) >= 3:
                            waters.append({'p': pts})
    
    return {
        'meta': {
            'center': [LAT0, LNG0],
            'radius_m': RADIUS_M,
            'generated': '2026-10-09',
        },
        'buildings': buildings,
        'roads': roads,
        'waters': waters,
    }

def main():
    osm = fetch()
    print(f"Got {len(osm.get('elements', []))} elements", file=sys.stderr)
    
    data = process(osm)
    print(f"Buildings: {len(data['buildings'])}", file=sys.stderr)
    print(f"Roads: {len(data['roads'])}", file=sys.stderr)
    print(f"Waters: {len(data['waters'])}", file=sys.stderr)
    
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'assets', 'osm')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'vancouver_5km.json')
    
    with open(out_path, 'w') as f:
        json.dump(data, f, separators=(',', ':'))
    
    size_mb = os.path.getsize(out_path) / 1024 / 1024
    print(f"Wrote {out_path} ({size_mb:.1f} MB)", file=sys.stderr)

if __name__ == '__main__':
    main()
