# Go Deep Get Bigger Audio Implementation

## Status

The demo now uses downloaded local Mixkit MP3 assets from `public/audio/`. Web Audio API remains only as the mixer/decoder layer for volume buses, crossfades, looping, ducking and slight pitch/volume variation. It is not used to generate procedural placeholder game audio.

## Implemented Modules

| Module | Purpose |
| --- | --- |
| `src/audio/AudioDirector.ts` | Central local-asset audio loader, buffer cache, buses, music crossfade, SFX routing, loop cleanup |
| `src/audio/audioManifest.ts` | Local MP3 paths for BGM and SFX |
| `src/hooks/useGameAudio.ts` | Connects game depth, events, Pull Up phases and results to audio playback |
| `src/components/AudioSettings.tsx` | Player-facing master/music/SFX controls |
| `src/components/DepthMilestoneIndicator.tsx` | Visual feedback for depth music-layer changes |
| `src/components/RetrievingStatus.tsx` | Pull Up status feedback |

## Audio Buses

| Bus | Control |
| --- | --- |
| Master | `masterVolume` |
| Music | `musicEnabled`, `musicVolume` |
| SFX | `sfxEnabled`, `sfxVolume` |
| Pull Up Tension | Dedicated gain node with BGM ducking |

## Depth Music Layers

| Depth | Local track |
| --- | --- |
| 0-2499m | `/audio/music/bgm_surface_loop.mp3` |
| 2500-4999m | `/audio/music/bgm_mid_depth_loop.mp3` |
| 5000-7499m | `/audio/music/bgm_deep_abyss_loop.mp3` |
| 7500-10000m | `/audio/music/bgm_max_depth_loop.mp3` |
| Pull Up | `/audio/music/bgm_pullup_tension_loop.mp3` |
| Big Win+ Result | `/audio/music/bgm_result_bigwin.mp3` |

## Triggered SFX

The local SFX manifest covers UI, Go Deep, depth reveal, all four event fish, Pull Up phases, fish catch/miss, high fish reel, high fish win/escape and result tiers.

## Source Tracking

See `AUDIO_ASSET_SOURCES.md` for every downloaded file, Mixkit source page, direct asset URL and license link.
