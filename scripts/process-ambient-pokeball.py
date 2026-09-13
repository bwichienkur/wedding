#!/usr/bin/env python3
"""Remove the solid red Pokéball center from the ambient drone hero video."""

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


def main() -> int:
    if not SRC.exists():
        if OUT.exists():
            shutil.copy2(OUT, SRC)
        else:
            print("Missing source video", file=sys.stderr)
            return 1

    if TMP.exists():
        shutil.rmtree(TMP)
    TMP.mkdir()

    cap = cv2.VideoCapture(str(SRC))
    fps = cap.get(cv2.CAP_PROP_FPS) or 24
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    cx, cy = width // 2, int(height * 0.302)
    core_radius = 48

    index = 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break

        mask = np.zeros((height, width), np.uint8)
        cv2.circle(mask, (cx, cy), core_radius, 255, -1)
        frame = cv2.inpaint(frame, mask, 8, cv2.INPAINT_TELEA)

        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        wash = np.zeros((height, width), np.uint8)
        cv2.ellipse(wash, (cx, cy - 8), (55, 45), 0, 200, 340, 255, -1)
        red = cv2.inRange(hsv, (0, 30, 30), (30, 255, 255))
        red2 = cv2.inRange(hsv, (160, 30, 30), (180, 255, 255))
        wash_mask = cv2.bitwise_and(wash, cv2.bitwise_or(red, red2))
        if cv2.countNonZero(wash_mask) > 10:
            frame = cv2.inpaint(frame, wash_mask, 5, cv2.INPAINT_TELEA)

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
            "19",
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
