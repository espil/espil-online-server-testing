# Cauldron Pixel Lab

This is a standalone Python test environment for turning an input image into a dense pixel-style terrain image and tile matrix.

## What it does

- Upload a PNG/JPG in a local browser UI
- Convert it into a game-like pixel map
- Export:
  - pixelized PNG
  - tile matrix JSON
  - tile matrix TXT

## Install

1. Install Python 3.11 or newer.
2. Open a terminal in this folder.
3. Run:

```powershell
py -m pip install -r requirements.txt
```

If `py` is not available:

```powershell
python -m pip install -r requirements.txt
```

## Start the local test environment

```powershell
py pixel_lab.py serve
```

Or double-click:

```text
run_pixel_lab.bat
```

Default URL:

```text
http://127.0.0.1:8890/
```

## CLI conversion

```powershell
py pixel_lab.py convert --input "C:\path\to\image.png" --grid-width 512 --grid-height 512 --block-size 2 --palette minecraftish --posterize-bits 5
```

## Good presets

- `256 x 256`: quick preview
- `512 x 512`: denser 50m-area tests
- `1024 x 1024`: heavy detail test

## Output folder

Generated files are written to:

```text
outputs\
```

## Intended use

Use this before wiring the image into the main Cauldron runtime:

1. capture or supply an image
2. pixelize it here
3. inspect the exported PNG
4. inspect the JSON/TXT tile matrix
5. feed the matrix into the game terrain pipeline
