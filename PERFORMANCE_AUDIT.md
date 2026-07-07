# Mobile Performance Audit

Date: 2026-07-06

## Summary

This pass focused only on production/mobile performance. Game math, event probabilities, route logic, pull-up settlement, and fish results were not changed.

## Asset Size Findings

Scanned source and build assets before optimization:

| Area | Files | Total size |
| --- | ---: | ---: |
| `src/assets` | 60 | 71.47 MB |
| `assets` | 123 | 103.19 MB |
| `public/audio` | 48 | 30.85 MB |
| `dist/assets` | 68 | 86.11 MB |
| `dist/audio` | 48 | 30.85 MB |

Largest production assets observed:

| Asset | Size |
| --- | ---: |
| `dist/audio/music/bgm_deep_abyss_loop.mp3` | 4.90 MB |
| `dist/audio/music/bgm_result_bigwin.mp3` | 4.40 MB |
| `dist/audio/music/bgm_surface_loop.mp3` | 4.08 MB |
| `dist/audio/music/bgm_mid_depth_loop.mp3` | 3.30 MB |
| `dist/audio/music/bgm_pullup_tension_loop.mp3` | 3.13 MB |
| `dist/audio/music/bgm_max_depth_loop.mp3` | 3.09 MB |
| Hook anomaly / event sprite sheets | 1.4-2.8 MB each |
| Desktop route background PNGs | 2.1-2.6 MB each |

## Main Bottlenecks Found

1. Route backgrounds were desktop PNG scale only; each route background was above 2 MB.
2. AudioDirector initialized and warmed too many music/SFX assets early, which risks mobile decode stalls.
3. Ambient route layers, bubbles, wake particles, and VFX could continue at desktop density on mobile.
4. Hook anomaly and result VFX needed stricter simultaneous-play caps on mobile.
5. Debug code was imported eagerly into the main bundle even when the debug panel was hidden.
6. Heavy CSS effects such as blur, filters, text shadows, backdrop filters, and particle layers needed mobile/low-mode rules.
7. Production needed a lightweight boot screen so mobile users do not stare at a white page while React and first assets load.

## Runtime Notes

Good existing behavior retained:

- The game already renders a visible-zone window rather than all 100 zones.
- Hook anomaly VFX are event-driven rather than permanently visible.
- Route backgrounds are active-route driven, not all 12 route/depth combinations at once.

Risk areas addressed:

- Mobile performance mode now caps particles, VFX count, sprite FPS, and route ambient effects.
- DebugPanel is lazy-loaded and gated behind development/debug QA flags.
- Audio warmup is now smaller and user-gesture based.

## Priority Fixes Applied

1. Added `high`, `medium`, and `low` performance modes with automatic device/FPS detection.
2. Added mobile JPEG derivatives for the base ocean background and three route backgrounds.
3. Added route background mobile rendering rules and crossfade duration reductions.
4. Added lazy preload registry for critical, route, hook, pull-up, and result asset groups.
5. Added mobile CSS downgrade rules for ambient particles, filters, blur, shadows, and route layers.
6. Added a lightweight loading shell in `index.html`.
