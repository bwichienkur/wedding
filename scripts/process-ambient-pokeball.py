#!/usr/bin/env python3
"""
Remove the solid red Pokéball center from the ambient drone hero video.

Uses polar ring sampling (clone sky/drone-ring pixels by angle) plus red-key
cleanup — similar to masking the red fill in OpenArt VFX inpaint, but runs
locally on every frame.

Replace `public/videos/ambient-atmosphere.source.mp4` with your clip (or an
OpenArt export), then run: python3 scripts/process-ambient-pokeball.py
"""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public/videos/ambient-atmosphere.source.mp4"
OUT = ROOT / "public/videos/ambient-atmosphere.mp4"
POSTER = ROOT / "public/videos/ambient-atmosphere-poster.jpg"
TMP = Path("/tmp/ambient-pokeball-frames")


def pokeball_masks(
    frame: np.ndarray,
    cx: int,
    cy: int,
) -> np.ndarray:
    """Pixels to replace: solid red core, red wash, and warm light leak."""
    h, w = frame.shape[:2]
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

    yy, xx = np.mgrid[0:h, 0:w]
    dx = xx.astype(np.float32) - cx
    dy = yy.astype(np.float32) - cy
    dist = np.sqrt(dx * dx + dy * dy)

    pokeball_zone = dist < 98
    core = dist < 54

    red_low = cv2.inRange(hsv, (0, 45, 45), (18, 255, 255))
    red_high = cv2.inRange(hsv, (160, 45, 45), (180, 255, 255))
    red = cv2.bitwise_or(red_low, red_high)

    warm_glow = cv2.inRange(hsv, (5, 35, 40), (35, 255, 255))

    upper_ball = dy < 18
    upper_semi = (dy < 12) & pokeball_zone
    replace = pokeball_zone & (core | red | (warm_glow & upper_ball) | (upper_semi & (red | warm_glow)))

    # Vertical warm streak under the button
    streak = (
        (np.abs(xx - cx) < 22)
        & (yy > cy - 5)
        & (yy < cy + 75)
        & (warm_glow | red)
    )
    replace = replace | streak

    return replace.astype(np.uint8) * 255


def heal_from_ring(frame: np.ndarray, mask: np.ndarray, cx: int, cy: int, r_sample: float) -> np.ndarray:
    """Fill masked pixels by sampling the drone ring / sky at a fixed radius."""
    out = frame.copy()
    h, w = frame.shape[:2]
    ys, xs = np.where(mask > 0)
    if len(xs) == 0:
        return out

    dx = xs.astype(np.float32) - cx
    dy = ys.astype(np.float32) - cy
    angles = np.arctan2(dy, dx)
    sx = np.clip((cx + np.cos(angles) * r_sample).astype(int), 0, w - 1)
    sy = np.clip((cy + np.sin(angles) * r_sample).astype(int), 0, h - 1)
    out[ys, xs] = frame[sy, sx]
    return out


def heal_from_sky_strip(frame: np.ndarray, mask: np.ndarray, cx: int, sky_y: int) -> np.ndarray:
    """Fill remaining warm pixels using the sky column above the Pokéball."""
    out = frame.copy()
    h, w = frame.shape[:2]
    ys, xs = np.where(mask > 0)
    if len(xs) == 0:
        return out

    sy = np.clip(np.full_like(xs, sky_y), 0, h - 1)
    sx = np.clip(xs, 0, w - 1)
    out[ys, xs] = frame[sy, sx]
    return out


def heal_core_from_sky(
    frame: np.ndarray, mask: np.ndarray, cx: int, cy: int, core_radius: float
) -> np.ndarray:
    """Replace the solid fill with night-sky pixels from above the formation."""
    out = frame.copy()
    h, w = frame.shape[:2]
    ys, xs = np.where(mask > 0)
    if len(xs) == 0:
        return out

    dx = xs.astype(np.float32) - cx
    dy = ys.astype(np.float32) - cy
    dist = np.sqrt(dx * dx + dy * dy)
    core = dist < core_radius
    if not np.any(core):
        return out

    xs_c = xs[core]
    ys_c = ys[core]
    # Pull from a band of sky above the Pokéball (same column = keeps cloud texture)
    lift = 88 + (cy - ys_c) * 0.35
    sy = np.clip(cy - lift, 0, h - 1).astype(int)
    sx = np.clip(xs_c, 0, w - 1)
    out[ys_c, xs_c] = frame[sy, sx]
    return out


def process_frame(frame: np.ndarray, cx: int, cy: int) -> np.ndarray:
    mask = pokeball_masks(frame, cx, cy)
    if cv2.countNonZero(mask) == 0:
        return frame

    healed = heal_core_from_sky(frame, mask, cx, cy, core_radius=58.0)
    ring_mask = cv2.bitwise_and(mask, cv2.bitwise_not(cv2.circle(
        np.zeros(mask.shape, np.uint8), (cx, cy), 58, 255, -1
    )))
    if cv2.countNonZero(ring_mask) > 0:
        healed = heal_from_ring(healed, ring_mask, cx, cy, r_sample=84.0)

    # Soften inpaint boundaries only on leftover saturated red
    hsv = cv2.cvtColor(healed, cv2.COLOR_BGR2HSV)
    leftover = cv2.inRange(hsv, (0, 50, 50), (25, 255, 255))
    leftover = cv2.bitwise_and(leftover, mask)
    if cv2.countNonZero(leftover) > 0:
        healed = heal_from_sky_strip(healed, leftover, cx, sky_y=max(8, cy - 95))
        healed = cv2.inpaint(healed, leftover, 3, cv2.INPAINT_TELEA)

    return healed


def main() -> int:
    if not SRC.exists():
        print("Missing source video:", SRC, file=sys.stderr)
        return 1

    if TMP.exists():
        shutil.rmtree(TMP)
    TMP.mkdir()

    cap = cv2.VideoCapture(str(SRC))
    fps = cap.get(cv2.CAP_PROP_FPS) or 24
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    cx, cy = width // 2, int(height * 0.302)

    index = 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        frame = process_frame(frame, cx, cy)
        cv2.imwrite(str(TMP / f"frame_{index:05d}.png"), frame)
        index += 1

    cap.release()

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-framerate",
            str(fps),
            "-i",
            str(TMP / "frame_%05d.png"),
            "-c:v",
            "libx264",
            "-crf",
            "18",
            "-preset",
            "medium",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            str(OUT),
        ],
        check=True,
    )

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-ss",
            "3",
            "-i",
            str(OUT),
            "-frames:v",
            "1",
            "-update",
            "1",
            "-q:v",
            "2",
            str(POSTER),
        ],
        check=True,
    )

    shutil.rmtree(TMP)
    print(f"Processed {index} frames -> {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
