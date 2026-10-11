#!/usr/bin/env python3
"""
generate_sprites.py — bulk-generate game sprites via the Plushy AI sprite API.

=========================== WHERE THE API GOES ===========================
Set PLUSHY_API_URL below (or export PLUSHY_API_URL) to your Plushy server:

    export PLUSHY_API_URL="http://localhost:8000"   # Plushy docker on your PC
    # export PLUSHY_API_URL="http://192.168.1.50:8000"  # Plushy on another machine

The script uses these endpoints (see Plushy AI repo, espil/plushy-ai):
    POST {PLUSHY_API_URL}/api/sprite          JSON {prompt, seed, size, steps, negative_prompt} -> {job_id}
    GET  {PLUSHY_API_URL}/api/status/{job_id} -> {status, progress, message}
    GET  {PLUSHY_API_URL}/api/result/{job_id} -> transparent PNG download
==========================================================================

Reads a manifest JSON (default: tools/sprite_manifest.json):
    {"sprites": [{"name": "car_side_red", "prompt": "...", "seed": 101,
                  "size": 512, "steps": 4, "negative_prompt": "..."}, ...]}

Downloads transparent PNGs into assets/sprites/ and writes
assets/sprites/manifest.json (name -> file), which the game loads
automatically (see loadCarSprites() in index.html).

Usage:
    python3 tools/generate_sprites.py
    python3 tools/generate_sprites.py --manifest tools/sprite_manifest.json --out assets/sprites
    python3 tools/generate_sprites.py --dry-run          # list what would be generated
    python3 tools/generate_sprites.py --workers 2         # parallel jobs (1 = sequential, safer on 8GB VRAM)

Stdlib only — no pip packages needed.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

# ============================ WHERE THE API GOES ============================
PLUSHY_API_URL = os.environ.get("PLUSHY_API_URL", "http://localhost:8000").rstrip("/")
# ============================================================================

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_MANIFEST = REPO_ROOT / "tools" / "sprite_manifest.json"
DEFAULT_OUT = REPO_ROOT / "assets" / "sprites"


def api_post(path: str, payload: dict, timeout: int = 30) -> dict:
    req = urllib.request.Request(
        PLUSHY_API_URL + path,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")[:300]
        raise RuntimeError(f"POST {path} -> HTTP {e.code}: {body}")


def api_get_json(path: str, timeout: int = 30) -> dict:
    with urllib.request.urlopen(PLUSHY_API_URL + path, timeout=timeout) as r:
        return json.load(r)


def api_download(path: str, dest: Path, timeout: int = 120) -> None:
    tmp = dest.with_suffix(".tmp")
    with urllib.request.urlopen(PLUSHY_API_URL + path, timeout=timeout) as r, \
            open(tmp, "wb") as f:
        while True:
            chunk = r.read(65536)
            if not chunk:
                break
            f.write(chunk)
    tmp.replace(dest)


def wait_for_job(job_id: str, timeout: int = 900, poll: float = 2.0) -> dict:
    t0 = time.time()
    while time.time() - t0 < timeout:
        s = api_get_json(f"/api/status/{job_id}")
        status = s.get("status")
        if status == "completed":
            return s
        if status in ("failed", "cancelled"):
            raise RuntimeError(f"job {job_id} {status}: {s.get('error')}")
        time.sleep(poll)
    raise TimeoutError(f"job {job_id} did not finish in {timeout}s")


def generate_one(entry: dict, outdir: Path, skip_existing: bool) -> dict:
    name = entry["name"]
    dest = outdir / f"{name}.png"
    rec = {"name": name, "file": f"{name}.png",
           "prompt": entry["prompt"], "seed": entry.get("seed", 0)}
    if skip_existing and dest.exists() and dest.stat().st_size > 0:
        rec["status"] = "skipped"
        return rec
    payload = {
        "prompt": entry["prompt"],
        "seed": entry.get("seed", 0),
        "size": entry.get("size", 512),
        "steps": entry.get("steps", 4),
    }
    if entry.get("negative_prompt"):
        payload["negative_prompt"] = entry["negative_prompt"]
    last_err = None
    for attempt in range(3):
        try:
            job = api_post("/api/sprite", payload)
            wait_for_job(job["job_id"])
            api_download(f"/api/result/{job['job_id']}", dest)
            rec["status"] = "ok"
            return rec
        except Exception as e:  # noqa: BLE001 - retry then record
            last_err = f"{type(e).__name__}: {e}"
            time.sleep(5)
    rec["status"] = "failed"
    rec["error"] = last_err
    return rec


def main() -> int:
    ap = argparse.ArgumentParser(description="Bulk-generate game sprites via the Plushy API.")
    ap.add_argument("--manifest", default=str(DEFAULT_MANIFEST))
    ap.add_argument("--out", default=str(DEFAULT_OUT))
    ap.add_argument("--url", default=None, help="override PLUSHY_API_URL")
    ap.add_argument("--workers", type=int, default=1)
    ap.add_argument("--skip-existing", action="store_true", default=True)
    ap.add_argument("--no-skip-existing", action="store_false", dest="skip_existing")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    global PLUSHY_API_URL
    if args.url:
        PLUSHY_API_URL = args.url.rstrip("/")

    manifest_path = Path(args.manifest)
    if not manifest_path.exists():
        print(f"manifest not found: {manifest_path}", file=sys.stderr)
        return 1
    entries = json.loads(manifest_path.read_text())["sprites"]
    outdir = Path(args.out)
    outdir.mkdir(parents=True, exist_ok=True)

    print(f"Plushy API: {PLUSHY_API_URL}")
    if not args.dry_run:
        try:
            health = api_get_json("/health")
            print(f"server: {health.get('status')} (mode={health.get('mode')}, mock={health.get('mock')})")
        except Exception as e:  # noqa: BLE001
            print(f"WARNING: cannot reach Plushy API at {PLUSHY_API_URL}: {e}", file=sys.stderr)
            print("Start it first: docker run --rm --gpus all -p 8000:8000 plushy-ai", file=sys.stderr)
            return 1

    if args.dry_run:
        for e in entries:
            print(f"  would generate: {e['name']}  (seed {e.get('seed', 0)}): {e['prompt'][:70]}")
        print(f"{len(entries)} sprite(s), nothing generated (--dry-run)")
        return 0

    print(f"generating {len(entries)} sprite(s) -> {outdir} ({args.workers} worker(s))")
    results = []
    t0 = time.time()
    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as ex:
        futs = [ex.submit(generate_one, e, outdir, args.skip_existing) for e in entries]
        for i, f in enumerate(futs, 1):
            rec = f.result()
            results.append(rec)
            print(f"  [{i}/{len(entries)}] {rec['name']}: {rec['status']}")

    manifest_out = {"generated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
                    "api": PLUSHY_API_URL, "sprites": results}
    (outdir / "manifest.json").write_text(json.dumps(manifest_out, indent=1))
    ok = sum(1 for r in results if r["status"] == "ok")
    failed = sum(1 for r in results if r["status"] == "failed")
    skipped = sum(1 for r in results if r["status"] == "skipped")
    print(f"\ndone: {ok} ok, {skipped} skipped, {failed} failed, {time.time()-t0:.0f}s")
    print(f"manifest -> {outdir}/manifest.json")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
