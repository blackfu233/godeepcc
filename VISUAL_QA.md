# Go Deep Get Bigger Visual QA

## Build

- Command: `npm.cmd run build`
- Result: Passed
- Latest build output: TypeScript compiled and Vite generated production assets successfully.

## Screenshot Evidence

All screenshots were generated under `qa_screenshots/` with a 430 x 764 mobile viewport. The latest coordinate pass uses the `world-*` files.

| File | Evidence |
| --- | --- |
| `world-surface.png` | Surface state: HUD shows `0m / 10000m`; right rail shows `SURFACE`, `100m`, `200m`, `300m`; hook depth text is no longer duplicated in the center. |
| `world-dive-1600.png` | Mid-depth state: HUD shows `1600m / 10000m`; right rail shows `1600m`, `1700m`, `1800m`, `1900m` from the same world coordinate source. |
| `world-thunder.png` | Thunder Jellyfish board event and remaining-count feedback in the 100-zone world. |
| `world-pearl-x4.png` | Golden Pearl board event with multiplier feedback. |
| `world-max-depth.png` | Max depth state: HUD shows `10000m / 10000m`; right rail shows `9800m`, `9900m`, `10000m`, `MAX DEPTH`; no shallow-depth wraparound. |
| `world-pull-build.png` | Pull Up setup from the real final depth: HUD/right rail remain around `9000m`, the hook stays staged, controls fade to `RETRIEVING...`, and the water column builds around the gold chain. |
| `world-pull-reel.png` | High-value fish challenge with the reel UI, using the active board fish state. |
| `world-pull-result.png` | Final result modal with Total Win, Total Bet, Win Multiplier, and top catches layout. |
| `surface.png` | Surface composition, gold hook/chain, deep-sea casino HUD/control style, distinct fish silhouettes. |
| `dive-700m.png` | Diving viewport with current depth and lower zones visible. |
| `twin-fish-event.png` | Twin Fish board effect with range rings, beams, mirror/clone result. |
| `golden-pearl-x4.png` | Golden Pearl board effect with coin treatment and visible x4 multiplier upgrade. |
| `puffer-stun.png` | Puffer Bomb board effect with shockwave and stunned/guaranteed fish feedback. |
| `thunder-jelly-attack.png` | Thunder Jellyfish attached to hook, Jelly count, downward attack feedback and stunned fish. |
| `pullup-vortex-build.png` | Pull-up vortex building from the hook/chain as a volumetric water column. |
| `pullup-curved-route.png` | Route sweep without fake route fish; water column bends while real board fish state is active. |
| `pullup-high-fish-reel.png` | High-value fish challenge with reel UI and real active fish state. |
| `pullup-result.png` | Final casino-style result modal after pull-up. |
| `generated-art-surface.png` | Generated deep-sea background, generated fish bitmap sprites, and generated UI texture in the live surface viewport. |
| `generated-art-pull-route.png` | Pull-up route with generated art assets, fixed hook staging, and downward water-column path. |
| `ref-ui-surface.png` | User-reference pass: gold framed HUD, reference hook/chain asset, removed mismatched boat, generated fish in the surface viewport. |
| `ref-ui-pull-route-v2.png` | User-reference pass: thicker water-sheet pull-up effect wrapping the gold chain and reference-framed controls. |

## Generated Asset Pass

- Built-in image generation was used to produce the polished deep-sea background, fish/tool sprite atlas, and premium UI panel texture.
- Source generations remain in `C:\Users\User\.codex\generated_images\019efd61-3aec-7bf2-94c1-f848bfce907b`.
- Game-ready assets were copied or processed into `src/assets/generated/`.
- `scripts/process_generated_assets.py` extracts the fish/tool atlas into transparent PNG sprites so `FishEntity` can render generated art instead of code-drawn SVG.
- Prompt intent: report-ready vertical deep-sea scene with a clear central hook lane, a chroma-keyed 4x4 fish/tool atlas matching the GDD species, and a no-text navy/gold casino UI texture sheet.

## User Reference Asset Pass

- `scripts/derive_reference_assets.py` processes the user-provided hook/chain reference and UI frame sheet into project assets under `src/assets/reference/`.
- `Hook.tsx` now renders `hook-chain-reference.png` instead of CSS-built hook parts.
- HUD cells, bet buttons, GO DEEP, PULL UP, result modal, and reel challenge now use cropped external frame assets rather than plain gradient boxes.
- The old surface boat markup was removed because it did not match the current fantasy deep-sea art direction.
- Fish motion was expanded with body-wave deformation, wake streaks, wider low-fish cruise paths, and distinct high/tool motion treatments.

## DOM / Flow Checks

- `.route-fish`: `0`
- `.route-stage`: `0`
- old `.vortex`: `0`
- `.vortex-path`: present during pull-up
- `.reel-challenge`: present during high-value fish challenge
- `.active-pull-fish`: present during pull-up, confirming real FishEntity participation

## Completed Requirements

| Requirement | Status |
| --- | --- |
| Distinct fish/tool silhouettes | Complete, via generated bitmap sprites rendered through `FishArt`. |
| Board readability | Complete, persistent fish names removed; compact multiplier/status chips remain. |
| Deep-sea casino visual upgrade | Complete, with gold/maroon UI, stronger lighting, rock/coral/plankton layers. |
| Hook and chain visual upgrade | Complete, gold chain links and jeweled hook. |
| Dedicated event board effects | Complete for Twin, Pearl, Puffer, and Thunder. |
| No fake route fish overlay | Complete; render logic and CSS removed. |
| Real FishEntity pull-up states | Complete; fish use `swimming`, `vortexHeld`, `hooked`, `pushedAway`, `struggling`, `escaped`, `exitScreen`. |
| Vortex as water column | Complete; no dashed route line or circular rotate vortex remains. |
| High fish reel delayed result | Complete; result copy is hidden until the reel nears the stop. |
| Demo determinism | Complete; existing seeds retained, plus QA-only URLs for frozen visual states. |

## Simplified Areas

- Fish/tool sprites now use generated bitmap art, but they are still atlas-cropped demo assets rather than hand-polished production sprites.
- Event effects are board-level 2D effects rather than fully authored particle sequences.
- Pull-up route motion is deterministic and state-driven; it does not run a physics simulation.
- `?qa=` URLs are only for screenshot QA and do not change normal gameplay behavior.

## Scenario Testing

### Normal Demo

1. Open `http://127.0.0.1:5173/`.
2. `SET` -> `Normal Demo`.
3. Press `GO DEEP` to roughly Zone 12-18.
4. Press `PULL UP`.
5. Confirm the right-side rail advances in 100m steps, the hook stays staged, real fish are pulled, and result appears.

### Event Chain Demo

1. `SET` -> `Event Chain Demo`.
2. Dive into the Zone 28-40 band.
3. Confirm Twin / Pearl / Puffer / Thunder events trigger as fixed scenario beats, not all at once.
4. Confirm controls are locked during each event and board effects are distinct.
5. Press `PULL UP` and confirm event-modified fish are reflected in the pull-up result.

### Big Win Demo

1. `SET` -> `Big Win Demo`.
2. Dive into Zone 80+ or use `BUY 100x` from Surface.
3. Confirm Pearl/Puffer/Thunder effects appear along the deep route.
4. Press `PULL UP`.
5. Confirm high-value fish enter reel challenges, at least one guaranteed high fish can win, and final result is deterministic.

## Notes

- In-app browser screenshot capture timed out at the browser API layer, so QA PNGs were produced with local Edge headless. The page itself loaded and DOM checks passed in the in-app browser.
- Browser dev logs still contained an old Vite HMR message from before the final rebuild; fresh DOM checks and production build both succeeded.
- Latest required validation: `npm.cmd run build` passed after the 100-zone coordinate, depth rail, event pacing, and Pull Up UI changes.
- Latest required simulation: `EVENT_PACING_SIMULATION.md` was generated from 20,000 seeded runs and is marked Demo Tuning, not RTP.
