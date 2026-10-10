#!/usr/bin/env python3
"""
Fetch Esri World Imagery satellite tiles for downtown Vancouver and stitch
into a single ground texture for Espil.Online (Han QA 2026-10-09, item 2).

Replaces procedural ground (grass/water/cobble/tree sprites) with real
satellite imagery. Buildings/cars/buses/props stay as-is on top.

Usage: python3 tools/fetch_satellite.py [--zoom 15] [--tiles 13]
Output: assets/ground/satellite_z15.jpg + satellite_meta.json

Tile math: z15 at lat 49.28 = 3.12m/px, 798m/tile. 13x13 tiles = 10.4km.
Center: 49.2827, -123.1207 (Canada Place).
"""
import math, os, sys, json, time, urllib.request

LAT0, LNG0 = 49.2827, -123.1207
TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
OUTDIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "ground")

def deg2num(lat, lng, z):
    n = 2 ** z
    xt = (lng + 180) / 360 * n
    yt = (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n
    return xt, yt

def num2deg(xt, yt, z):
    n = 2 ** z
    lng = xt / n * 360 - 180
    lat = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * yt / n))))
    return lat, lng

def fetch_tile(z, x, y, dest):
    if os.path.exists(dest) and os.path.getsize(dest) > 1000:
        return True  # cached
    url = TILE_URL.format(z=z, x=x, y=y)
    req = urllib.request.Request(url, headers={"User-Agent": "espil-online/1.0 (game asset bake)"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r, open(dest, "wb") as f:
            f.write(r.read())
        return True
    except Exception as e:
        print(f"  tile {z}/{x}/{y} FAILED: {e}", flush=True)
        return False

def main():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--zoom", type=int, default=15)
    ap.add_argument("--tiles", type=int, default=13, help="odd number, tiles across")
    ap.add_argument("--quality", type=int, default=82)
    a = ap.parse_args()
    z, n = a.zoom, a.tiles
    assert n % 2 == 1

    cx, cy = deg2num(LAT0, LNG0, z)
    ctx, cty = int(cx), int(cy)
    half = n // 2
    x0, y0 = ctx - half, cty - half

    cache = os.path.join(OUTDIR, f"_tiles_z{z}")
    os.makedirs(cache, exist_ok=True)
    os.makedirs(OUTDIR, exist_ok=True)

    print(f"fetching {n}x{n}={n*n} tiles z{z} around ({ctx},{cty})", flush=True)
    ok = 0
    for dy in range(n):
        for dx in range(n):
            x, y = x0 + dx, y0 + dy
            if fetch_tile(z, x, y, os.path.join(cache, f"{x}_{y}.jpg")):
                ok += 1
            time.sleep(0.15)  # be polite
        print(f"  row {dy+1}/{n} ({ok} ok)", flush=True)

    # stitch
    from PIL import Image
    S = 256
    stitched = Image.new("RGB", (n * S, n * S))
    missing = []
    for dy in range(n):
        for dx in range(n):
            x, y = x0 + dx, y0 + dy
            p = os.path.join(cache, f"{x}_{y}.jpg")
            try:
                t = Image.open(p).convert("RGB")
                if t.size != (S, S):
                    t = t.resize((S, S))
            except Exception:
                t = Image.new("RGB", (S, S), (20, 40, 60))
                missing.append([x, y])
            stitched.paste(t, (dx * S, dy * S))

    # geographic bounds of the stitched image
    lat_top, lng_left = num2deg(x0, y0, z)
    lat_bot, lng_right = num2deg(x0 + n, y0 + n, z)

    out_jpg = os.path.join(OUTDIR, f"satellite_z{z}.jpg")
    stitched.save(out_jpg, quality=a.quality)
    meta = {
        "zoom": z, "tiles": n, "tile_px": S,
        "image_px": n * S,
        "center": [LAT0, LNG0],
        "bounds": {"north": lat_top, "south": lat_bot, "west": lng_left, "east": lng_right},
        "meters_per_px": 156543.03392 * math.cos(math.radians(LAT0)) / 2 ** z,
        "missing_tiles": missing,
        "attribution": "Esri World Imagery",
        "note": "One-time bake for local testing. Check Esri ToS before production use.",
    }
    with open(os.path.join(OUTDIR, "satellite_meta.json"), "w") as f:
        json.dump(meta, f, indent=1)
    size_mb = os.path.getsize(out_jpg) / 1e6
    print(f"wrote {out_jpg} ({size_mb:.1f} MB), {ok}/{n*n} tiles ok", flush=True)

if __name__ == "__main__":
    main()
