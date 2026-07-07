# Audio Asset Manifest

Runtime source: local files under `public/audio/`. The game does not stream external audio URLs.

## BGM

| Game key | Local path | Runtime behavior |
| --- | --- | --- |
| `bgm_surface_loop` | `/audio/music/bgm_surface_loop.mp3` | Layer 1, loop, 0m-2499m |
| `bgm_mid_depth_loop` | `/audio/music/bgm_mid_depth_loop.mp3` | Layer 2, loop, 2500m-4999m |
| `bgm_deep_abyss_loop` | `/audio/music/bgm_deep_abyss_loop.mp3` | Layer 3, loop, 5000m-7499m |
| `bgm_max_depth_loop` | `/audio/music/bgm_max_depth_loop.mp3` | Layer 4, loop, 7500m-10000m |
| `bgm_pullup_tension_loop` | `/audio/music/bgm_pullup_tension_loop.mp3` | Pull Up loop, BGM ducked |
| `bgm_result_bigwin` | `/audio/music/bgm_result_bigwin.mp3` | Big Win+ result bed |

## SFX

All SFX are declared in `src/audio/audioManifest.ts` as `SFX_TRACKS` and loaded through `AudioDirector`.

Implemented groups:

- UI: bet, Go Deep, wager deduct
- Depth: chain descent, zone reveal, milestone sting, rare fish reveal
- Events: Twin Fish, Golden Pearl, Puffer Bomb, Thunder Jellyfish
- Pull Up: button, camera setup, chain tension, vortex loop, route loop, low catch/miss, high struggle loop, reel spin/stop, high catch/escape, surface splash
- Result: small, big, mega and higher result stings

## Blocked Assets

None. All selected Mixkit files were downloaded successfully into `public/audio/`.
