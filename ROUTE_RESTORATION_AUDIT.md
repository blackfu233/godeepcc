# Route Restoration Audit

## Current Systems Found

- Route controller exists: `src/state/RouteController.ts`
- Route checkpoints exist: `src/config/routeDefinitions.ts`
  - Zone 25
  - Zone 50
  - Zone 75
- Route choice panel is rendered from `src/App.tsx` through `src/components/routes/RouteChoicePanel.tsx`
- Route definitions exist:
  - School Current
  - Golden Current
  - Storm Trench
- Route segment generation exists in `src/utils/generateSegmentZones.ts`
- Route background definitions exist in `src/config/routeBackgroundDefinitions.ts`
- Route background render exists in `src/components/routes/RouteBackgroundLayer.tsx`

## Background Asset Mapping

| Route | Source asset |
| --- | --- |
| School Current | `src/assets/route-backgrounds/school-current-bg.png` |
| Golden Current | `src/assets/route-backgrounds/golden-current-bg.png` |
| Storm Trench | `src/assets/route-backgrounds/storm-trench-bg.png` |

The assets are imported by `src/config/routeBackgroundDefinitions.ts`, resolved by `src/utils/routeBackgroundResolver.ts`, and rendered by `src/components/routes/RouteBackgroundLayer.tsx`.

## Issues Found

1. Route demo flow had been changed while debugging backgrounds, which made it unclear whether the route choice or the already-selected route state should be visible.
2. Route background assets were present, but there was no single resolver visible in Debug Panel to prove which asset was actually selected.
3. Route Choice UI text contained a broken separator character after a previous encoding rewrite.
4. Route restored QA URLs did not exist under the names requested in the latest brief.

## Fixes Applied

1. Route demos now start before the checkpoint:
   - School Route Demo starts at Zone 24.
   - Golden Route Demo starts at Zone 49.
   - Storm Route Demo starts at Zone 74.
2. The normal route flow remains:
   - Press GO DEEP to reach Zone 25 / 50 / 75.
   - Route Choice Panel appears.
   - GO DEEP is disabled while route choice is pending.
   - PULL UP NOW remains available.
3. Selecting a route regenerates only the future 25-zone segment through `generateSegmentZones()` and `replaceSegmentZones()`.
4. Active route state drives:
   - Active Route Chip
   - Depth Rail Accent
   - Route Ambient Layer
   - Route Background Layer
5. Route background resolver now reports:
   - active route id
   - depth layer
   - selected background key
   - source asset path
   - runtime generated asset URL
   - fallback status
6. Debug Panel now displays route choice, active route, remaining zones, selected background key, resolved asset path, and fallback flag.

## QA URLs

- `?qa=route-restored-choice-zone25`
- `?qa=route-restored-choice-zone50`
- `?qa=route-restored-choice-zone75`
- `?qa=route-restored-school-background`
- `?qa=route-restored-golden-background`
- `?qa=route-restored-storm-background`
- `?qa=route-restored-school-active-chip`
- `?qa=route-restored-golden-active-chip`
- `?qa=route-restored-storm-active-chip`
- `?qa=route-restored-depthrail-school`
- `?qa=route-restored-depthrail-golden`
- `?qa=route-restored-depthrail-storm`
- `?qa=route-restored-hook-event-priority`
- `?qa=route-restored-pullup-priority`
- `?qa=route-restored-debug-panel`

## Screenshot Status

Automated screenshots were not produced in this environment:

- Edge headless fails with Windows crashpad/mojo access-denied errors.
- The in-app browser automation is currently blocked by browser security policy for `http://127.0.0.1:5175`.

No fake screenshot files were generated.

## Build

`npm run build` completed successfully after the restoration work.
