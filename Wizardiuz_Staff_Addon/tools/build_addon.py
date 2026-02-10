#!/usr/bin/env python3
"""Build Wizardiuz Staff binary assets locally (PNGs + .mcaddon).

This script exists so the git repo can stay text-only for PR systems
that do not accept binary files.
"""
from __future__ import annotations

import shutil
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RP_ITEMS = ROOT / "RP" / "textures" / "items"
DIST = ROOT / "dist"


def png_write(path: Path, w: int, h: int, rgba: bytearray) -> None:
    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    raw = bytearray()
    for y in range(h):
        raw.append(0)
        start = y * w * 4
        raw.extend(rgba[start : start + w * 4])

    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)
    payload = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(payload)


def blank(w: int, h: int) -> bytearray:
    return bytearray([0, 0, 0, 0] * (w * h))


def setpx(buf: bytearray, w: int, x: int, y: int, c: tuple[int, int, int, int]) -> None:
    if 0 <= x < w and 0 <= y < len(buf) // (w * 4):
        i = (y * w + x) * 4
        buf[i : i + 4] = bytes(c)


def draw_staff(path: Path, crystal: tuple[int, int, int, int]) -> None:
    w = h = 16
    b = blank(w, h)
    wood = (92, 62, 35, 255)
    gold = (196, 156, 74, 255)

    for y in range(3, 16):
        setpx(b, w, 7, y, wood)
        setpx(b, w, 8, y, wood)
    for p in [(7, 2), (8, 2), (9, 2), (10, 3), (10, 4), (9, 5), (8, 5)]:
        setpx(b, w, *p, wood)
    for p in [(8, 6), (9, 6), (8, 7), (9, 7), (8, 8), (9, 8), (7, 9), (8, 9)]:
        setpx(b, w, *p, gold)
    for p in [(11, 1), (12, 2), (11, 3), (10, 2), (11, 2)]:
        setpx(b, w, *p, crystal)
    setpx(b, w, 11, 2, (255, 255, 255, 200))

    png_write(path, w, h, b)


def draw_scroll(path: Path, color: tuple[int, int, int]) -> None:
    w = h = 16
    b = blank(w, h)
    paper = (224, 210, 172, 255)
    edge = (161, 126, 74, 255)
    tint = (color[0], color[1], color[2], 180)

    for y in range(2, 14):
        for x in range(3, 13):
            setpx(b, w, x, y, paper)
    for x in range(3, 13):
        setpx(b, w, x, 2, edge)
        setpx(b, w, x, 13, edge)
    for y in range(2, 14):
        setpx(b, w, 3, y, edge)
        setpx(b, w, 12, y, edge)
    for y in range(4, 12):
        for x in range(4, 12):
            setpx(b, w, x, y, tint)
    for x in range(5, 11):
        setpx(b, w, x, 6, edge)
        setpx(b, w, x, 8, edge)
    for x in range(5, 10):
        setpx(b, w, x, 10, edge)

    png_write(path, w, h, b)


def solid(path: Path, w: int, h: int, c: tuple[int, int, int, int]) -> None:
    b = bytearray(list(c) * (w * h))
    png_write(path, w, h, b)


def main() -> None:
    draw_staff(RP_ITEMS / "wizardiuz_staff_water.png", (55, 160, 255, 255))
    draw_staff(RP_ITEMS / "wizardiuz_staff_fire.png", (255, 72, 32, 255))
    draw_staff(RP_ITEMS / "wizardiuz_staff_wind.png", (193, 255, 236, 255))
    draw_staff(RP_ITEMS / "wizardiuz_staff_sand.png", (255, 215, 120, 255))
    draw_staff(RP_ITEMS / "wizardiuz_staff_hail.png", (150, 224, 255, 255))

    draw_scroll(RP_ITEMS / "wizardiuz_scroll_banished_sun.png", (255, 98, 64))
    draw_scroll(RP_ITEMS / "wizardiuz_scroll_tide_warden.png", (72, 132, 255))
    draw_scroll(RP_ITEMS / "wizardiuz_scroll_gale_sigil.png", (117, 255, 208))
    draw_scroll(RP_ITEMS / "wizardiuz_scroll_dune_aegis.png", (233, 196, 124))
    draw_scroll(RP_ITEMS / "wizardiuz_scroll_hail_requiem.png", (168, 221, 255))

    solid(ROOT / "BP" / "pack_icon.png", 256, 256, (255, 98, 64, 255))
    solid(ROOT / "RP" / "pack_icon.png", 256, 256, (55, 160, 255, 255))

    DIST.mkdir(exist_ok=True)
    out = DIST / "Wizardiuz_Staff"
    if (DIST / "Wizardiuz_Staff.mcaddon").exists():
        (DIST / "Wizardiuz_Staff.mcaddon").unlink()
    if out.exists():
        shutil.rmtree(out)
    out.mkdir()
    shutil.copytree(ROOT / "BP", out / "BP")
    shutil.copytree(ROOT / "RP", out / "RP")
    shutil.make_archive(str(DIST / "Wizardiuz_Staff"), "zip", root_dir=out)
    (DIST / "Wizardiuz_Staff.zip").rename(DIST / "Wizardiuz_Staff.mcaddon")
    shutil.rmtree(out)
    print("Built:", DIST / "Wizardiuz_Staff.mcaddon")


if __name__ == "__main__":
    main()
