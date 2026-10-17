#!/usr/bin/env python3
"""
Fetch OSM outer ring (5km-15km) for Vancouver.
Only major roads and water — no buildings (too much data).
Supplements the 5km detailed dataset.

Output: assets/osm/vancouver_15km_outer.json
"""
import json
import urllib.request
import urllib.parse
import math
import sys

LAT0 = 49.2827
LNG0 = -123.1207
RADIUS_INNER = 5000
RADIUS_OUTER = 15000

def deg_bbox(radius_m):
    dlat = radius_m / 111320
    dlng = radius_m / (111320 * math.cos(math.radians(LAT0)))
    return (LAT0 - dlat, LNG0 - dlng, LAT0 + dlat, LNG0 + dlng)

# Outer bbox
s, w, n, e = deg_bbox(RADIUS_OUTER)
print(f"Outer bbox: {s:.4f},{w:.4f},{n:.4f},{e:.4f}", file=sys.stderr)

# Overpass QL: major roads + water in 15km bbox
# Excluding the inner 5km is complex; we'll filter in post
ql = f"""
[out:json][timeout:180];
(
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"]({s},{w},{n},{e});
  way["natural"="water"]({s},{w},{n},{e});
  relation["natural"="water"]({s},{w},{n},{e});
  relation["waterway"="riverbank"]({s},{w},{n},{e});
);
out geom;
"""

url = "https://overpass-api.de/api/interpreter"
data = urllib.parse.urlencode({"data": ql}).encode()
print("Fetching from Overpass...", file=sys.stderr)
req = urllib.request.Request(url, data=data)
with urllib.request.urlopen(req, timeout=200) as resp:
    result = json.load(resp)

print(f"Got {len(result.get('elements', []))} elements", file=sys.stderr)

# Convert to our compact format
# (Simplified — just store raw for now, process later)
with open("assets/osm/vancouver_15km_outer.json", "w") as f:
    json.dump(result, f)

print("Saved to assets/osm/vancouver_15km_outer.json", file=sys.stderr)
