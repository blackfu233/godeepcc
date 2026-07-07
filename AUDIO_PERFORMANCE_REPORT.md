# Audio Performance Report

## Findings

`public/audio` contains 48 files totaling 30.85 MB. The six BGM files are the largest part of the audio budget.

Largest music files:

| File | Approx size |
| --- | ---: |
| `bgm_deep_abyss_loop.mp3` | 4.90 MB |
| `bgm_result_bigwin.mp3` | 4.40 MB |
| `bgm_surface_loop.mp3` | 4.08 MB |
| `bgm_mid_depth_loop.mp3` | 3.30 MB |
| `bgm_pullup_tension_loop.mp3` | 3.13 MB |
| `bgm_max_depth_loop.mp3` | 3.09 MB |

## Changes Applied

1. Audio context is no longer initialized on module construction.
2. Audio unlock remains tied to user gesture.
3. Common preload is reduced to the current surface BGM and four core short SFX:
   - `ui_bet_change`
   - `ui_go_deep_press`
   - `chain_descend`
   - `zone_reveal`
4. Full depth BGM stack, Pull Up music, route ambience, and result audio are no longer eagerly decoded at startup.
5. Route ambient loops are stopped/disabled in low performance mode.
6. Development-only console warnings are kept behind `import.meta.env.DEV`.

## Mobile Audio Rules

| Mode | Behavior |
| --- | --- |
| High | Full music/event layers |
| Medium | Route ambience allowed but visual/audio layers are less aggressive |
| Low | Route ambient loops disabled; core operation SFX and BGM remain |

## Remaining Audio Risks

- Large MP3 files still need bitrate/downsample optimization in a future asset pass.
- GitHub Pages still serves static MP3s; cache behavior depends on browser/CDN caching.
- Event burst SFX should be shortened or replaced with smaller production files.
