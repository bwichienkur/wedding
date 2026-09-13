# Drone hero video — OpenArt optional workflow

The hero loop uses `public/videos/ambient-atmosphere.mp4`, generated from
`ambient-atmosphere.source.mp4` via `scripts/process-ambient-pokeball.py`.

## Automatic fix (repo default)

```bash
pip install opencv-python-headless
python3 scripts/process-ambient-pokeball.py
```

This removes the solid red Pokéball fill and keeps individual drone lights by
sampling the ring/sky around the formation (no blur panel in the site UI).

## Optional: OpenArt VFX inpaint

If you prefer OpenArt’s SwitchX inpainting:

1. Open [OpenArt VFX](https://openart.ai/features/ai-vfx/) → **Inpaint** mode.
2. Upload `public/videos/ambient-atmosphere.source.mp4`.
3. **Mask to keep** the night sky and white/yellow drone dots (first frame); leave the solid red center unmasked.
4. Prompt example: *night sky, drone light dots only, no solid red circle, hollow Pokéball center*.
5. Download the result and save it as  
   `public/videos/ambient-atmosphere.source.mp4`  
   (or replace `ambient-atmosphere.mp4` directly if no further processing is needed).
6. If you replaced the source only, run `python3 scripts/process-ambient-pokeball.py` again or copy the OpenArt export to `ambient-atmosphere.mp4`.

We cannot call OpenArt from this repository; dropping an OpenArt export into
`public/videos/` is the supported handoff.
