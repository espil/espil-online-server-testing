#!/usr/bin/env python3
"""
TransLink GTFS-RT vehicle-position poller (local dev only — NOT pushed).

Fetches https://gtfsapi.translink.ca/v3/gtfsposition?apikey=KEY every POLL_SEC,
decodes the protobuf VehiclePositions feed with a zero-dependency hand-rolled
decoder, and writes assets/transit/buses.json for the game page to read.

API key: free at https://developer.translink.ca (register -> create app -> key).
Key sources (first hit wins): $TRANSLINK_KEY env, ~/.config/translink/apikey file.
The key NEVER goes into git — same rule as the Google Places key.

Usage:  python3 tools/translink_poller.py [--interval 30] [--once]
The game page fetches assets/transit/buses.json (same origin, no CORS issue)
and dead-reckons bus positions between polls using bearing+speed.
"""
import json, os, sys, time, urllib.request

FEED_URL = "https://gtfsapi.translink.ca/v3/gtfsposition?apikey={key}"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                   "..", "assets", "transit", "buses.json")

# ---------- minimal protobuf decoder (GTFS-RT VehiclePosition subset) ----------
def _varint(buf, i):
    shift = 0; val = 0
    while True:
        b = buf[i]; i += 1
        val |= (b & 0x7F) << shift
        if not (b & 0x80): return val, i
        shift += 7

def _f32(buf, i):
    import struct
    return struct.unpack("<f", bytes(buf[i:i+4]))[0], i + 4

def _fields(buf):
    """Yield (field_no, wire_type, value_start) walking a message; value decoded by caller."""
    i, n = 0, len(buf)
    while i < n:
        tag, i = _varint(buf, i)
        fno, wt = tag >> 3, tag & 7
        if wt == 0:
            v, i = _varint(buf, i); yield fno, wt, v
        elif wt == 1:
            yield fno, wt, bytes(buf[i:i+8]); i += 8
        elif wt == 2:
            ln, i = _varint(buf, i)
            yield fno, wt, bytes(buf[i:i+ln]); i += ln
        elif wt == 5:
            v, i = _f32(buf, i); yield fno, wt, v
        else:
            raise ValueError(f"unsupported wire type {wt}")

def decode_vehicles(pb):
    buses = []
    for fno, wt, val in _fields(pb):
        if fno != 2 or wt != 2:  # FeedMessage.entity
            continue
        ent = {"id": None, "route": None, "lat": None, "lng": None,
               "bearing": None, "speed": None, "ts": None, "label": None}
        for ef, ewt, ev in _fields(val):
            if ef == 1 and ewt == 2:
                ent["id"] = ev.decode("utf-8", "replace")
            elif ef == 4 and ewt == 2:  # vehicle: VehiclePosition
                for vf, vwt, vv in _fields(ev):
                    if vf == 1 and vwt == 2:  # trip
                        for tf, twt, tv in _fields(vv):
                            if tf == 5 and twt == 2:
                                ent["route"] = tv.decode("utf-8", "replace")
                    elif vf == 2 and vwt == 2:  # position
                        for pf, pwt, pv in _fields(vv):
                            if pf == 1: ent["lat"] = pv
                            elif pf == 2: ent["lng"] = pv
                            elif pf == 3: ent["bearing"] = pv
                            elif pf == 5: ent["speed"] = pv
                    elif vf == 8 and vwt == 2:  # vehicle descriptor
                        for df, dwt, dv in _fields(vv):
                            if df == 1 and dwt == 2: ent["id"] = dv.decode("utf-8", "replace")
                            elif df == 2 and dwt == 2: ent["label"] = dv.decode("utf-8", "replace")
                    elif vf == 5 and vwt == 0:  # timestamp
                        ent["ts"] = vv
        if ent["lat"] is not None and ent["lng"] is not None:
            buses.append(ent)
    return buses

# ---------- poller ----------
def get_key():
    k = os.environ.get("TRANSLINK_KEY", "").strip()
    if k: return k
    p = os.path.expanduser("~/.config/translink/apikey")
    if os.path.exists(p):
        return open(p).read().strip()
    return ""

def fetch(key):
    req = urllib.request.Request(
        FEED_URL.format(key=key),
        headers={"User-Agent": "espil-online-transit-poller/1.0",
                 "Accept": "application/x-protobuf"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()

def poll_once(key):
    pb = fetch(key)
    buses = decode_vehicles(pb)
    doc = {"fetched_at": int(time.time()), "count": len(buses), "buses": buses}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    tmp = OUT + ".tmp"
    with open(tmp, "w") as f:
        json.dump(doc, f, separators=(",", ":"))
    os.replace(tmp, OUT)
    return len(buses)

def main():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--interval", type=int, default=30)
    ap.add_argument("--once", action="store_true")
    a = ap.parse_args()
    key = get_key()
    if not key:
        print("No TransLink API key. Get a free one at https://developer.translink.ca "
              "(register -> create app -> key), then either:\n"
              "  export TRANSLINK_KEY=yourkey\n"
              "or put it in ~/.config/translink/apikey", file=sys.stderr)
        sys.exit(2)
    print(f"polling every {a.interval}s -> {OUT}", flush=True)
    while True:
        try:
            n = poll_once(key)
            print(f"{time.strftime('%H:%M:%S')} ok: {n} buses", flush=True)
        except Exception as e:
            print(f"{time.strftime('%H:%M:%S')} ERROR: {e} (keeping last good file)", flush=True)
        if a.once: break
        time.sleep(a.interval)

if __name__ == "__main__":
    main()
