# Go Deep Get Bigger Implementation Log

## Summary

This pass keeps the existing React/Vite project structure and upgrades the demo around fish life, viewport readability, event clarity, pull-up staging, and deterministic demo scenarios.

The requested `docs/reference/pull-up-fish-performance.png` was not present in the workspace, Downloads, or Codex attachment folder. The pull-up implementation follows the user-provided textual rules plus the PDF pull-up fish-performance pages.

## Completed Phases

| Phase | Status | Notes |
| --- | --- | --- |
| Phase 1: Existing code and document audit | Complete | Created `IMPLEMENTATION_PLAN.md`, copied/read PDFs in `docs/reference`, rendered key pages, and mapped source files to requirements. |
| Phase 2: Fish life | Complete | Fish have independent direction, speed, bobbing, sway, tail/body motion, high-value emphasis, and special tool-fish pulse/electric styling. |
| Phase 3: Viewport and diving view | Complete | Hook is kept around the upper-middle stage; compact zones show the current area and at least three lower zones, with depth markers and darkening ambience. |
| Phase 4: Event fish | Complete | Event ranges are centered on the triggering zone; event overlay locks Go Deep/Pull Up; Thunder Jellyfish shows remaining count and now strikes immediately when acquired. |
| Phase 5: Pull Up replacement | Complete | The old in-place spin behavior is replaced by a state-machine flow: intro camera move, vortex build, curved route sweep, high-value reel challenge, finish, result. |
| Phase 6: Demo stability | Complete | Scenario switch and restart reset balance, total bet, depth, fish list, event/thunder state, pull-up plan/result, and seed. Fixed seeds drive Normal, Event Chain, and Big Win. |
| Phase 7: Verification | Complete | `npm.cmd run build` passes. Browser smoke tests covered Normal Demo, Event Chain Demo, and Big Win Demo. |

## Files Implementing The Pass

| File | Change / Role |
| --- | --- |
| `src/App.tsx` | Controls event lock, scenario reset, pull-up state transitions, centered event application, and Thunder Jellyfish immediate strike after acquisition. |
| `src/types/game.ts` | Adds explicit pull-up phase and fish visual-state types used by the new state machine. |
| `src/utils/generateRun.ts` | Generates deterministic scenario layouts and per-fish movement parameters/directions. |
| `src/utils/createPullUpPlan.ts` | Builds the full deterministic pull-up plan: deepest-to-shallow ordering, low/high result reveal, timing, route x/bend, and final result. |
| `src/components/OceanViewport.tsx` | Keeps the hook stage fixed while camera/ocean zones move; sends tool fish into exit-screen state during pull-up. |
| `src/components/FishEntity.tsx` | Renders fish with swimming, bobbing, sway, pull-up states, high-value emphasis, and tool-fish distinction. |
| `src/components/Hook.tsx` | Keeps hook/chain visually centered and gives pull-up chain tension without making the hook chase fish. |
| `src/components/PullUpSequence.tsx` | Runs `pullUpIntro`, `vortexBuild`, `routeSweep`, `highValueChallenge`, and `pullUpFinish`; fish are only activated once route sweep begins. |
| `src/components/VortexPath.tsx` | Renders the downward curved water-column path tied to the hook stage instead of a fixed spinning circle. |
| `src/components/ReelChallenge.tsx` | Displays the high-value WIN/ESCAPE reel with handle, pointer, and deterministic result. |
| `src/components/EventOverlay.tsx` | Displays event feedback while controls are locked. |
| `src/components/ResultModal.tsx` | Displays deterministic caught/missed pull-up result and settlement. |
| `src/components/DebugPanel.tsx` | Supports internal inspection of seed, zones, and Thunder Jellyfish state. |
| `src/styles.css` | Contains fish movement, pull-up route, vortex column, reel, event, viewport, and result presentation styling. |
| `IMPLEMENTATION_PLAN.md` | Documents requirement mapping and phased acceptance. |
| `IMPLEMENTATION_LOG.md` | This verification and completion log. |

## Replaced Old Flow

- Removed the practical dependency on a central `.vortex` spinning circle animation.
- Replaced "hook and fish rotate together" with fixed hook stage + moving ocean/camera + curved route sweep.
- Split low-value fish auto-route handling from high-value reel challenge handling.
- Tool fish now leave the pull-up stage rather than joining the collection animation.

## Verification

### Build

- Command: `npm.cmd run build`
- Result: Pass
- Output summary: TypeScript compiled, Vite built `dist/index.html`, CSS, and JS bundle successfully.

### Browser Smoke Tests

Tested at `http://127.0.0.1:5173/`.

| Scenario | Result |
| --- | --- |
| Normal Demo | Pull-up ran through intro/build/finish, controls locked during pull-up, old `.vortex` count was 0, `VortexPath` was present, result modal appeared. |
| Event Chain Demo | Twin Fish event showed centered range feedback; Go Deep and Pull Up were disabled during event overlay and restored after it finished; pull-up route swept deepest-to-shallow with active fish one at a time. |
| Big Win Demo | Pull-up reached `highValueChallenge`; reel UI appeared for high-value fish such as White Tiger, Vermilion Bird, Azure Dragon; result modal showed deterministic Ultimate Win. |

Browser console error log was empty.

## Known Limits

- The missing `pull-up-fish-performance.png` could not be inspected directly, so the implementation follows the PDF pages and the detailed user text for that image.
- The demo keeps the existing simplified symbol set rather than expanding to the full 24-symbol production table.
- Reel and fish art remain CSS/HTML demo art, not final production illustration.
- The legacy `resolvePullUp.ts` remains in the tree for compatibility but the active pull-up flow uses `createPullUpPlan.ts`.
