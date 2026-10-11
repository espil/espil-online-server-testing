from __future__ import annotations

import argparse
import cgi
import json
import re
import threading
import webbrowser
from dataclasses import dataclass
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from io import BytesIO
from pathlib import Path
from typing import Iterable

try:
    from PIL import Image
except ImportError as exc:
    raise SystemExit(
        "Pillow is required. Install it with: pip install -r requirements.txt"
    ) from exc


APP_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = APP_DIR / "outputs"
OUTPUT_DIR.mkdir(exist_ok=True)

PALETTES = {
    "cauldron_land": [
        (245, 234, 224),
        (232, 223, 202),
        (240, 214, 217),
        (218, 221, 231),
        (183, 232, 181),
        (134, 201, 240),
        (234, 232, 230),
    ],
    "minecraftish": [
        (34, 139, 34),
        (85, 107, 47),
        (107, 142, 35),
        (210, 180, 140),
        (112, 128, 144),
        (70, 130, 180),
        (160, 82, 45),
        (245, 245, 245),
    ],
    "gameboy": [
        (15, 56, 15),
        (48, 98, 48),
        (139, 172, 15),
        (155, 188, 15),
    ],
    "grayscale": [
        (24, 24, 24),
        (72, 72, 72),
        (120, 120, 120),
        (176, 176, 176),
        (232, 232, 232),
    ],
}


HTML_PAGE = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Cauldron Pixel Lab</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, Segoe UI, Arial, sans-serif;
      background: #11161d;
      color: #f3f5f8;
    }
    .wrap {
      max-width: 1320px;
      margin: 0 auto;
      padding: 24px;
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 20px;
    }
    .panel {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 18px;
      padding: 18px;
      backdrop-filter: blur(10px);
    }
    h1 { margin: 0 0 6px; font-size: 28px; }
    p { margin: 0 0 14px; color: #b8c0cc; line-height: 1.45; }
    label {
      display: block;
      margin: 12px 0 6px;
      font-size: 13px;
      color: #dce3ed;
    }
    input, select, button {
      width: 100%;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.06);
      color: #fff;
      padding: 12px 14px;
      font-size: 14px;
    }
    button {
      background: linear-gradient(180deg, #67a7ff, #2f68ff);
      border: none;
      font-weight: 700;
      cursor: pointer;
      margin-top: 14px;
    }
    .preview {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .preview-card {
      background: rgba(255,255,255,0.035);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 18px;
      padding: 16px;
      min-height: 320px;
    }
    .preview-card h2 {
      margin: 0 0 10px;
      font-size: 16px;
    }
    .preview-card img {
      width: 100%;
      image-rendering: pixelated;
      border-radius: 10px;
      background: #0d1117;
    }
    .meta {
      margin-top: 10px;
      white-space: pre-wrap;
      font-size: 12px;
      color: #9fb0c4;
    }
    .links {
      margin-top: 12px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .links a {
      color: #a6c5ff;
      text-decoration: none;
      font-size: 13px;
    }
    .status {
      margin-top: 10px;
      font-size: 13px;
      color: #aac2df;
      min-height: 18px;
    }
    @media (max-width: 960px) {
      .wrap, .preview { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="panel">
      <h1>Cauldron Pixel Lab</h1>
      <p>Upload any PNG/JPG and convert it into dense game-like pixel terrain. Outputs PNG, JSON tile matrix, and TXT tile matrix.</p>
      <form id="form">
        <label>Image</label>
        <input name="image" type="file" accept="image/png,image/jpeg,image/webp" required>

        <label>Grid Width</label>
        <input name="grid_width" type="number" min="16" max="2048" value="512" required>

        <label>Grid Height</label>
        <input name="grid_height" type="number" min="16" max="2048" value="512" required>

        <label>Block Size (preview scale)</label>
        <input name="block_size" type="number" min="1" max="16" value="4" required>

        <label>Palette</label>
        <select name="palette">
          <option value="minecraftish">minecraftish</option>
          <option value="cauldron_land">cauldron_land</option>
          <option value="gameboy">gameboy</option>
          <option value="grayscale">grayscale</option>
        </select>

        <label>Posterize Steps</label>
        <input name="posterize_bits" type="number" min="1" max="8" value="5" required>

        <button type="submit">Pixelize</button>
      </form>
      <div class="status" id="status"></div>
    </div>
    <div class="panel">
      <div class="preview">
        <div class="preview-card">
          <h2>Original</h2>
          <img id="original" alt="original preview">
        </div>
        <div class="preview-card">
          <h2>Pixelized</h2>
          <img id="pixelized" alt="pixelized preview">
          <div class="links" id="links"></div>
          <div class="meta" id="meta"></div>
        </div>
      </div>
    </div>
  </div>
  <script>
    const form = document.getElementById('form');
    const statusEl = document.getElementById('status');
    const originalEl = document.getElementById('original');
    const pixelizedEl = document.getElementById('pixelized');
    const metaEl = document.getElementById('meta');
    const linksEl = document.getElementById('links');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      statusEl.textContent = 'Processing...';
      linksEl.innerHTML = '';
      metaEl.textContent = '';
      const data = new FormData(form);
      const file = form.image.files[0];
      if (file) {
        originalEl.src = URL.createObjectURL(file);
      }
      const response = await fetch('/api/pixelize', { method: 'POST', body: data });
      if (!response.ok) {
        statusEl.textContent = await response.text();
        return;
      }
      const payload = await response.json();
      pixelizedEl.src = payload.pixelized_url + '?t=' + Date.now();
      metaEl.textContent = JSON.stringify(payload.summary, null, 2);
      linksEl.innerHTML = [
        ['PNG', payload.pixelized_url],
        ['JSON', payload.matrix_json_url],
        ['TXT', payload.matrix_txt_url]
      ].map(([label, href]) => `<a href="${href}" target="_blank">${label}</a>`).join('');
      statusEl.textContent = 'Done.';
    });
  </script>
</body>
</html>
"""


@dataclass
class PixelResult:
    image: Image.Image
    tile_matrix: list[list[int]]
    rgb_matrix: list[list[tuple[int, int, int]]]
    palette_name: str
    grid_width: int
    grid_height: int
    block_size: int
    posterize_bits: int


def clamp(value: int, lower: int, upper: int) -> int:
    return max(lower, min(upper, value))


def posterize_channel(channel: int, bits: int) -> int:
    bits = clamp(bits, 1, 8)
    levels = 2 ** bits
    step = 255 / max(levels - 1, 1)
    return int(round(round(channel / step) * step))


def posterize_rgb(rgb: tuple[int, int, int], bits: int) -> tuple[int, int, int]:
    return tuple(posterize_channel(channel, bits) for channel in rgb)


def closest_palette_index(rgb: tuple[int, int, int], palette: list[tuple[int, int, int]]) -> int:
    best_index = 0
    best_distance = None
    for index, candidate in enumerate(palette):
        distance = (
            (rgb[0] - candidate[0]) ** 2
            + (rgb[1] - candidate[1]) ** 2
            + (rgb[2] - candidate[2]) ** 2
        )
        if best_distance is None or distance < best_distance:
            best_distance = distance
            best_index = index
    return best_index


def pixelize_image(
    source: Image.Image,
    grid_width: int,
    grid_height: int,
    palette_name: str,
    block_size: int,
    posterize_bits: int,
) -> PixelResult:
    palette = PALETTES[palette_name]
    converted = source.convert("RGB").resize((grid_width, grid_height), Image.Resampling.BOX)
    rgb_matrix: list[list[tuple[int, int, int]]] = []
    tile_matrix: list[list[int]] = []

    for y in range(grid_height):
        rgb_row: list[tuple[int, int, int]] = []
        tile_row: list[int] = []
        for x in range(grid_width):
            rgb = posterize_rgb(converted.getpixel((x, y)), posterize_bits)
            palette_index = closest_palette_index(rgb, palette)
            mapped = palette[palette_index]
            rgb_row.append(mapped)
            tile_row.append(palette_index)
        rgb_matrix.append(rgb_row)
        tile_matrix.append(tile_row)

    out = Image.new("RGB", (grid_width, grid_height))
    for y, row in enumerate(rgb_matrix):
        for x, rgb in enumerate(row):
            out.putpixel((x, y), rgb)

    scaled = out.resize((grid_width * block_size, grid_height * block_size), Image.Resampling.NEAREST)
    return PixelResult(
        image=scaled,
        tile_matrix=tile_matrix,
        rgb_matrix=rgb_matrix,
        palette_name=palette_name,
        grid_width=grid_width,
        grid_height=grid_height,
        block_size=block_size,
        posterize_bits=posterize_bits,
    )


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-") or "image"


def save_result(result: PixelResult, source_name: str) -> dict:
    stem = slugify(Path(source_name).stem)
    payload_name = f"{stem}-{result.grid_width}x{result.grid_height}-{result.palette_name}"
    png_path = OUTPUT_DIR / f"{payload_name}.png"
    json_path = OUTPUT_DIR / f"{payload_name}.tiles.json"
    txt_path = OUTPUT_DIR / f"{payload_name}.tiles.txt"

    result.image.save(png_path)
    json_path.write_text(
        json.dumps(
            {
                "source": source_name,
                "palette": result.palette_name,
                "grid_width": result.grid_width,
                "grid_height": result.grid_height,
                "block_size": result.block_size,
                "posterize_bits": result.posterize_bits,
                "tile_matrix": result.tile_matrix,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    txt_path.write_text(
        "\n".join(" ".join(str(cell) for cell in row) for row in result.tile_matrix),
        encoding="utf-8",
    )
    return {
        "png_path": png_path,
        "json_path": json_path,
        "txt_path": txt_path,
        "summary": {
            "source": source_name,
            "palette": result.palette_name,
            "grid_width": result.grid_width,
            "grid_height": result.grid_height,
            "block_size": result.block_size,
            "posterize_bits": result.posterize_bits,
            "palette_size": len(PALETTES[result.palette_name]),
            "output_png": str(png_path),
            "output_json": str(json_path),
            "output_txt": str(txt_path),
        },
    }


def run_cli(args: argparse.Namespace) -> int:
    image_path = Path(args.input).expanduser().resolve()
    with Image.open(image_path) as source:
        result = pixelize_image(
            source=source,
            grid_width=args.grid_width,
            grid_height=args.grid_height,
            palette_name=args.palette,
            block_size=args.block_size,
            posterize_bits=args.posterize_bits,
        )
    saved = save_result(result, image_path.name)
    print(json.dumps(saved["summary"], ensure_ascii=False, indent=2))
    return 0


class PixelHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        if self.path == "/" or self.path.startswith("/?"):
            body = HTML_PAGE.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        if self.path.startswith("/outputs/"):
            file_path = (APP_DIR / self.path.lstrip("/")).resolve()
            if not str(file_path).startswith(str(OUTPUT_DIR.resolve())) or not file_path.exists():
                self.send_error(404, "Not found")
                return
            content_type = "application/octet-stream"
            if file_path.suffix == ".png":
                content_type = "image/png"
            elif file_path.suffix == ".json":
                content_type = "application/json; charset=utf-8"
            elif file_path.suffix == ".txt":
                content_type = "text/plain; charset=utf-8"
            content = file_path.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return

        self.send_error(404, "Not found")

    def do_POST(self) -> None:
        if self.path != "/api/pixelize":
            self.send_error(404, "Not found")
            return

        form = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={
                "REQUEST_METHOD": "POST",
                "CONTENT_TYPE": self.headers.get("Content-Type", ""),
            },
        )
        upload = form["image"] if "image" in form else None
        if upload is None or getattr(upload, "file", None) is None:
            self.send_error(400, "image is required")
            return

        grid_width = int(form.getfirst("grid_width", "512"))
        grid_height = int(form.getfirst("grid_height", "512"))
        block_size = int(form.getfirst("block_size", "4"))
        posterize_bits = int(form.getfirst("posterize_bits", "5"))
        palette_name = form.getfirst("palette", "minecraftish")
        if palette_name not in PALETTES:
            self.send_error(400, "invalid palette")
            return

        image_bytes = upload.file.read()
        try:
            source = Image.open(BytesIO(image_bytes))
            result = pixelize_image(
                source=source,
                grid_width=grid_width,
                grid_height=grid_height,
                palette_name=palette_name,
                block_size=block_size,
                posterize_bits=posterize_bits,
            )
        except Exception as exc:
            self.send_error(400, f"failed to process image: {exc}")
            return

        saved = save_result(result, upload.filename or "upload.png")
        payload = {
            "pixelized_url": f"/outputs/{saved['png_path'].name}",
            "matrix_json_url": f"/outputs/{saved['json_path'].name}",
            "matrix_txt_url": f"/outputs/{saved['txt_path'].name}",
            "summary": saved["summary"],
        }
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args) -> None:
        return


def run_server(args: argparse.Namespace) -> int:
    host = args.host
    port = args.port
    server = ThreadingHTTPServer((host, port), PixelHandler)
    url = f"http://{host}:{port}/"
    print(f"Cauldron Pixel Lab listening on {url}")
    if not args.no_browser:
        threading.Timer(0.5, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Cauldron Pixel Lab")
    subparsers = parser.add_subparsers(dest="command")

    serve = subparsers.add_parser("serve", help="Start local upload UI")
    serve.add_argument("--host", default="127.0.0.1")
    serve.add_argument("--port", type=int, default=8890)
    serve.add_argument("--no-browser", action="store_true")

    convert = subparsers.add_parser("convert", help="Convert one image from CLI")
    convert.add_argument("--input", required=True)
    convert.add_argument("--grid-width", type=int, default=512)
    convert.add_argument("--grid-height", type=int, default=512)
    convert.add_argument("--block-size", type=int, default=4)
    convert.add_argument("--palette", choices=sorted(PALETTES.keys()), default="minecraftish")
    convert.add_argument("--posterize-bits", type=int, default=5)

    return parser


def main(argv: Iterable[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(list(argv) if argv is not None else None)
    if args.command == "serve":
        return run_server(args)
    if args.command == "convert":
        return run_cli(args)
    parser.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
