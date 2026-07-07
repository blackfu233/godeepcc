# Sprite Animation Report

## Summary

This pass used Codex built-in `$imagegen` to generate true sprite sheet assets, copied them into the project, removed chroma-key backgrounds, and integrated them through a reusable React sprite animation layer.

No Lottie MCP, external websites, external login tools, prerecorded video, or single static PNG effects were used.

## Runtime System

| File | Purpose |
| --- | --- |
| `src/types/animation.ts` | Shared animation keys and sprite sheet metadata types. |
| `src/config/animationManifest.ts` | Central manifest for frame size, frame count, FPS, loop mode, anchor, and asset path. |
| `src/hooks/useSpriteAnimation.ts` | Frame player using `requestAnimationFrame`, with loop/once support and completion callback. |
| `src/components/effects/SpriteAnimation.tsx` | Core sprite sheet renderer using frame-based background-position changes. |
| `src/components/effects/WorldSpriteEffect.tsx` | Mounts sprite animation in the game/ocean layer. |
| `src/components/effects/ScreenSpriteEffect.tsx` | Mounts sprite animation in screen/UI layers. |
| `src/components/effects/EffectLayer.tsx` | Bridges real game state to event, pull-up, catch, and result sprite animations. |

## Sprite Sheets

| File | Frames | FPS | Mode | Mounted At | Trigger |
| --- | ---: | ---: | --- | --- | --- |
| `src/assets/animated-effects/puffer_bomb_explosion_sheet.png` | 12 | 10 | once | World event position | Puffer Bomb event active |
| `src/assets/animated-effects/thunder_jelly_attach_sheet.png` | 8 | 10 | loop | Hook area | Thunder state or thunder event |
| `src/assets/animated-effects/thunder_jelly_strike_sheet.png` | 8 | 12 | once | World event strike area | Thunder event active |
| `src/assets/animated-effects/golden_pearl_multiplier_sheet.png` | 12 | 10 | once | World event position | Golden Pearl event active |
| `src/assets/animated-effects/twin_fish_copy_sheet.png` | 12 | 12 | once | World event position | Twin Fish event active |
| `src/assets/animated-effects/vortex_particle_sheet.png` | 8 | 12 | loop | Pull Up vortex route area | Pull Up after `cameraSetup` |
| `src/assets/animated-effects/catch_splash_sheet.png` | 8 | 14 | once | Active pull fish / hook area | Caught pull item near collect timing |
| `src/assets/animated-effects/bigwin_burst_sheet.png` | 12 | 12 | once | Result modal / screen layer | Result shown |

Source copies are kept beside the transparent outputs with `_source.png` suffix for traceability.

## Integration Notes

- Event sprite animations are driven by the existing `activeEvent` state.
- Thunder attach loop is driven by existing `thunder` state.
- Pull-up vortex particles are driven by the existing Pull Up phase, plan, and elapsed time.
- Catch splash is tied to the current Pull Up plan item and only appears when a caught item reaches collection timing.
- Big Win burst is shown in the result layer without changing result math.
- Existing event rules, pull-up result calculation, fish generation, seeds, and scenario tuning were not changed in this pass.

## QA Screenshots

| Screenshot | Scenario |
| --- | --- |
| `qa_screenshots/puffer-animation.png` | Puffer Bomb sprite animation |
| `qa_screenshots/jelly-attach-animation.png` | Thunder Jelly attach loop |
| `qa_screenshots/jelly-strike-animation.png` | Thunder Jelly strike animation |
| `qa_screenshots/pearl-animation.png` | Golden Pearl multiplier animation |
| `qa_screenshots/twin-copy-animation.png` | Twin Fish copy animation |
| `qa_screenshots/vortex-animation.png` | Pull Up vortex particle loop |
| `qa_screenshots/catch-splash-animation.png` | Catch splash animation |
| `qa_screenshots/bigwin-animation.png` | Result burst animation |

## Build

`npm run build` passed after integrating the sprite system.

## Demo Simplifications

- Sprite sheet effects are currently mounted at representative event/hook/route positions. Fine-grained per-target beam and coin flight path animation remains program-controlled work for a later pass.
- Existing event result timing is preserved. The sprite animation visually communicates buildup and impact, but this pass does not delay event math application to a specific animation frame.
- Vortex path logic remains programmatic; the new `vortex_particle_sheet.png` is only a repeated local particle element along that program-controlled route.
