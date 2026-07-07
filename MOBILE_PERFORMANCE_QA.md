# Mobile Performance QA

## Build Verification

`npm.cmd run build` completed successfully.

Build output summary:

| Output | Size |
| --- | ---: |
| `dist/assets/index-COt5saeq.css` | 136.90 KB, gzip 29.54 KB |
| `dist/assets/index-8eB-1g1R.js` | 273.62 KB, gzip 84.41 KB |
| `dist/assets/DebugPanel-C5TwumYR.js` | 3.34 KB, gzip 1.30 KB |
| Mobile route backgrounds | 124-141 KB each |
| Mobile base background | 139 KB |

## Local Browser Smoke Test

Test URL: `http://127.0.0.1:5175/`

Observed:

- App mounted successfully.
- Initial depth showed `0m / 10000m`.
- Phone frame class included `perf-medium perf-pref-auto`.
- Debug panel was not visible by default.
- Hook VFX nodes were not mounted while idle.
- Route background layers were not mounted while no route was active.

## Viewport / Mobile Behavior

CSS and performance rules were added for:

- 360 x 640
- 375 x 812
- 390 x 844
- 412 x 915
- 430 x 932
- Desktop phone frame

Manual full-device GitHub Pages testing still needs the final published URL. The local build and dev URL confirm the production code path and mobile performance classes.

## Performance Modes

| Mode | Expected result |
| --- | --- |
| Auto | Selects medium/low on narrow or lower-memory devices; can degrade to low after sustained <45 FPS |
| Medium | Reduced particles, mobile backgrounds, lower sprite FPS |
| Low | Ambient route particles mostly off, no route ambient audio, one VFX max, simplified filters |

## Known Remaining Risk

The largest remaining runtime risk is the uncompressed transparent sprite-sheet set. They are now lazy and capped, but should receive mobile re-exported sheets in a later art-asset optimization pass.
