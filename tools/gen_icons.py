#!/usr/bin/env python3
"""gen_icons.py — generate the PWA icons (assets/icons/icon-192.png, icon-512.png)
and a small favicon, with no third-party dependencies (pure stdlib PNG encoder).

The mark: a dark rounded tile with a cyan hub-and-spoke network node — a hub in
the centre linked to three satellite nodes — matching the data-center theme.
Reproducible: rerun `python tools/gen_icons.py` to regenerate identically."""
import os, math, struct, zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "icons")
os.makedirs(OUT, exist_ok=True)

BG = (10, 18, 30, 255)        # deep navy tile
BG2 = (7, 13, 22, 255)        # darker corner
NODE = (53, 224, 241, 255)    # cyan
NODE_DIM = (36, 150, 180, 255)
LINE = (60, 150, 190, 255)


def blend(dst, src):
    a = src[3] / 255.0
    return (int(src[0] * a + dst[0] * (1 - a)), int(src[1] * a + dst[1] * (1 - a)),
            int(src[2] * a + dst[2] * (1 - a)), 255)


def make(size):
    S = size
    buf = [[BG for _ in range(S)] for _ in range(S)]
    # subtle radial darkening toward corners
    cx = cy = S / 2.0
    maxd = math.hypot(cx, cy)
    for y in range(S):
        for x in range(S):
            d = math.hypot(x - cx, y - cy) / maxd
            t = min(1.0, d * 0.9)
            buf[y][x] = (int(BG[0] * (1 - t) + BG2[0] * t), int(BG[1] * (1 - t) + BG2[1] * t),
                         int(BG[2] * (1 - t) + BG2[2] * t), 255)

    def fill_circle(px, py, r, color):
        r2 = r * r
        for y in range(max(0, int(py - r - 1)), min(S, int(py + r + 2))):
            for x in range(max(0, int(px - r - 1)), min(S, int(px + r + 2))):
                dd = (x - px) ** 2 + (y - py) ** 2
                if dd <= r2:
                    buf[y][x] = color
                elif dd <= (r + 1.2) ** 2:  # cheap antialias edge
                    buf[y][x] = blend(buf[y][x], (color[0], color[1], color[2], 130))

    def line(x0, y0, x1, y1, color, w):
        steps = int(max(abs(x1 - x0), abs(y1 - y0)) * 2) + 1
        for i in range(steps + 1):
            t = i / steps
            fill_circle(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, w, color)

    # hub-and-spoke: hub at centre, 3 satellites at 120 deg (safe zone ~ inner 62%)
    R = S * 0.30
    hub = (cx, cy)
    sats = []
    for k in range(3):
        ang = -math.pi / 2 + k * (2 * math.pi / 3)
        sats.append((cx + R * math.cos(ang), cy + R * math.sin(ang)))
    lw = max(1.0, S * 0.012)
    for sx, sy in sats:
        line(hub[0], hub[1], sx, sy, LINE, lw)
    for sx, sy in sats:
        fill_circle(sx, sy, S * 0.055, NODE_DIM)
        fill_circle(sx, sy, S * 0.038, NODE)
    fill_circle(hub[0], hub[1], S * 0.085, (16, 34, 52, 255))
    fill_circle(hub[0], hub[1], S * 0.062, NODE)
    return buf


def write_png(path, buf):
    S = len(buf)
    raw = bytearray()
    for y in range(S):
        raw.append(0)  # filter type 0
        for x in range(S):
            p = buf[y][x]
            raw += bytes((p[0], p[1], p[2], p[3]))

    def chunk(typ, data):
        c = typ + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xffffffff)

    ihdr = struct.pack(">IIBBBBB", S, S, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)
    print("wrote", os.path.relpath(path, ROOT), len(png), "bytes")


for sz, name in [(192, "icon-192.png"), (512, "icon-512.png"), (32, "favicon-32.png")]:
    write_png(os.path.join(OUT, name), make(sz))
print("icons done")
