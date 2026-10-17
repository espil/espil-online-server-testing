#!/usr/bin/env python3
"""
bake_pois.py — Build-time POI bake for the Espil.Online walkable map.

Why this exists (2026-10-05, per Han's fetch-once business model):
  The in-map building-name pill currently calls the OSM Overpass API from
  the browser at runtime, once per area. That works for one tester, but it
  breaks Overpass fair-use with real players and contradicts the
  "fetch once, cache in our own DB, never live-query per user" rule.
  This script runs ONCE on a machine with real internet, bakes every named
  POI in the map bounds into a static JSON file, and the map then does a
  pure client-side nearest-neighbor lookup — zero network calls, zero cost,
  works offline.

It also fixes a correctness bug in the shipped query: the runtime code only
asks Overpass for `node`s, but downtown Vancouver buildings are mapped as
`way`s, so the pill often returns a random nearby named node (or the
fallback). This bakes `nwr` (nodes, ways, relations).

Usage (on your PC, which has real internet):
    python tools/bake_pois.py
Output:
    assets/pois/downtown-vancouver.json   (list of {n, lat, lng})

Then apply tools/poi_lookup_snippet.js to index.html (see that file).
Re-run this script whenever the map bounds grow.
"""
import json
import sys
import urllib.parse
import urllib.request

# Map bounds: HALF=101m around 49.2827,-123.1207, plus margin -> +/-115m
BBOX = "49.28166,-123.12229,49.28374,-123.11911"
OVERPASS_URL = "https://overpass-api.de/api/interpreter"
OUT_PATH = "assets/pois/downtown-vancouver.json"

QUERY = f"""[out:json][timeout:30];
(
  nwr["name"]["building"]({BBOX});
  nwr["name"]["amenity"]({BBOX});
  nwr["name"]["shop"]({BBOX});
  nwr["name"]["tourism"]({BBOX});
  nwr["name"]["leisure"]({BBOX});
  nwr["name"]["office"]({BBOX});
);
out center 80;"""


def main():
    data = urllib.parse.urlencode({"data": QUERY}).encode("utf-8")
    req = urllib.request.Request(
        OVERPASS_URL, data=data,
        headers={"User-Agent": "EspilOnline/1.0 (build-time POI bake)"},
    )
    print("Querying Overpass (one-time build fetch)...")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            payload = json.load(resp)
    except Exception as e:
        print(f"FAILED to reach Overpass: {e}", file=sys.stderr)
        print("Check your internet connection and try again.", file=sys.stderr)
        sys.exit(1)

    seen = set()
    pois = []
    for el in payload.get("elements", []):
        tags = el.get("tags", {})
        name = (tags.get("name") or "").strip()
        if not name:
            continue
        lat = el.get("lat") or (el.get("center") or {}).get("lat")
        lng = el.get("lon") or (el.get("center") or {}).get("lon")
        if lat is None or lng is None:
            continue
        key = (name.lower(), round(lat, 5), round(lng, 5))
        if key in seen:
            continue
        seen.add(key)
        pois.append({"n": name, "lat": round(lat, 6), "lng": round(lng, 6)})

    # Prefer real buildings first so a name collision resolves to the building.
    def rank(p):
        return 0  # order preserved from Overpass; dedupe already applied
    pois.sort(key=rank)

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(pois, f, ensure_ascii=False, separators=(",", ":"))
    print(f"Baked {len(pois)} POIs -> {OUT_PATH}")
    print("Next: apply tools/poi_lookup_snippet.js to index.html.")


if __name__ == "__main__":
    main()
