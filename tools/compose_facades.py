#!/usr/bin/env python3
"""Compose the game's archetype facade tiles from Han's building_texture
kit (pixel_facades_100): each archetype gets one seamless, repeatable
512-px-tall facade tile - the style's wall tile as the ground, its
window sprites stamped in the archetype grid (variants mixed by a
stable hash, some lit). Output: game/assets/facades/facade_<kind>.png
at 256x512, matching the proportions of the game's canvas facades and
the ESPIL_TILE sizes in the district builder (tower 6x8 bays over
28.8x24 m, midrise 5x8 over 21.6x24, lowrise 4x8 over 18x24,
warehouse 3x3 over 14.4x12, house 3x4 over 10.8x12)."""
import os
from PIL import Image

KIT = os.path.join(os.path.dirname(__file__), '..', 'texture-kit', 'pixel_facades_100', 'assets')
OUT = os.path.join(os.path.dirname(__file__), '..', 'game', 'assets', 'facades')
STYLE = {'tower': 'modern', 'midrise': 'art_deco', 'lowrise': 'limestone', 'warehouse': 'warehouse', 'house': 'brownstone'}
GRID = {'tower': (6, 8), 'midrise': (5, 8), 'lowrise': (4, 8), 'warehouse': (3, 3), 'house': (3, 4)}
W, H = 256, 512

os.makedirs(OUT, exist_ok=True)
for kind, style in STYLE.items():
    wall = Image.open(os.path.join(KIT, f'{style}_wall.png')).convert('RGB')
    wall_big = wall.resize((128, 128), Image.NEAREST)
    canvas = Image.new('RGB', (W, H))
    for ty in range(0, H, 128):
        for tx in range(0, W, 128):
            canvas.paste(wall_big, (tx, ty))
    wins = [Image.open(os.path.join(KIT, f'{style}_window_{i}.png')).convert('RGB') for i in range(4)]
    cols, rows = GRID[kind]
    cw, ch = W / cols, H / rows
    for r in range(rows):
        for c in range(cols):
            hsh = (r * 7 + c * 13 + (7 if kind == 'tower' else 3)) % 9
            var = 0 if hsh < 4 else (2 if hsh < 7 else (1 if hsh == 7 else 3))
            win = wins[var]
            ww = int(cw * 0.62); wh = int(win.height * ww / win.width)
            if wh > ch * 0.78:
                wh = int(ch * 0.78); ww = int(win.width * wh / win.height)
            win_r = win.resize((ww, wh), Image.NEAREST)
            x = int(c * cw + (cw - ww) / 2); y = int(r * ch + (ch - wh) / 2)
            canvas.paste(win_r, (x, y))
    out = os.path.join(OUT, f'facade_{kind}.png')
    canvas.save(out)
    print(kind, '<-', style, '->', out, os.path.getsize(out), 'bytes')
