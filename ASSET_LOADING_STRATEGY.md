# Asset Loading Strategy

## Goal

Keep the first mobile load small and interactive, then load non-critical visuals only when the player is close to needing them.

## Critical Startup Assets

Loaded or scheduled at startup:

- Base ocean background, using the mobile derivative where possible.
- Hook and chain visuals already used on the first screen.
- Core UI and current visible fish.
- Only common short audio and the current depth BGM.

Avoided at startup:

- All 12 route/depth background variants.
- All hook anomaly VFX sheets.
- Pull Up/result VFX.
- All music layers and all SFX.
- Debug panel bundle.

## Lazy Loading Rules

| Trigger | Assets scheduled |
| --- | --- |
| App start | `critical` group |
| Zone 22+ or route choice pending | Route choice UI and route mobile preview backgrounds |
| Route selected | Selected route's background assets |
| Any non-surface zone | Small hook anomaly VFX and Pull Up core assets |
| Pull Up / result approaching | Result assets |

## Implementation

Added:

- `src/performance/assetRegistry.ts`
- `src/performance/assetPreloader.ts`

The registry groups assets by gameplay phase. `schedulePreloadAssetGroup` uses idle time where available and does not block the first render.

## Fallback Behavior

If an asset is not preloaded yet, the game keeps the current base background/effect layer instead of blocking gameplay. Mobile route backgrounds use small JPEG derivatives so route identity remains visible without large PNG downloads.

## GitHub Pages Notes

The production build emits hashed local assets under `dist/assets` and `dist/audio`. Runtime playback uses local build paths only; it does not stream external URLs.
