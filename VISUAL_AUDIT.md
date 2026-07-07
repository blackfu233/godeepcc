# Go Deep Get Bigger Visual Audit

## Reference Basis

| Reference | Used For |
| --- | --- |
| `docs/reference/Go Deep Get Bigger.pdf` | Deck p5-p8 for deep-sea casino art direction, p10-p13 for event fish performance, p15 for pull-up camera/vortex flow, p16 for fish performance during pull-up. |
| `docs/reference/Go Deep Get Bigger (1).pdf` | GDD pages for loop rules, event range behavior, Thunder Jellyfish behavior, and pull-up ordering. |
| Conversation pull-up performance reference | Highest-priority source for the pull-up composition: fixed hook stage, gold chain inside a downward S-shaped water column, real fish pulled from their board positions, high fish struggle before reel result. |
| Existing `IMPLEMENTATION_PLAN.md` and `IMPLEMENTATION_LOG.md` | Confirmed previous pass left a useful state machine but still used fake route-fish overlay and CSS prototype art. |

The workspace still does not include `docs/reference/pull-up-fish-performance.png`, but the current instruction explicitly cancels that stop condition. The conversation-provided reference and the PDF p15/p16 rules are treated as the visual authority.

## Gaps Against The References

| Area | Current Problem | Required Replacement |
| --- | --- | --- |
| Fish art | Most fish share the same oval body with color changes; tool fish are circular icon-like marks. | Add an original local illustration system with distinct silhouettes for every demo fish and tool fish. |
| Board readability | Fish names, multiplier, event badge, and lock badge can stack over fish and other fish. | Remove persistent fish names from the board; keep compact multiplier/status chips that sit around the fish. |
| Background | Deep sea has basic gradients and simple geometric reef shapes. | Build a more layered casino-deep-sea stage: fixed top light, beams, darker depth, rock walls, coral, glowing mushrooms, bubbles, plankton, far fish, parallax feel. |
| Hook and chain | Chain still reads as a thin repeating line; hook is light/white. | Use gold metal chain links and gold hook with central gem. |
| Event fish | Event overlay is mostly a generic card/pulse. | Add board-level dedicated effects: Twin beams/mirror, Pearl coins, Puffer shockwave/stun, Thunder hook lightning. |
| Pull Up fish | `PullUpSequence` renders fake `.route-fish` copies instead of moving real `FishEntity` instances. | Delete fake route fish render. Drive each real fish from its `PullUpPlanItem` and `PullFishVisualState`. |
| Pull Up vortex | `VortexPath` is a line/path with a dashed current, closer to navigation than a water column. | Replace with a translucent volumetric water column that wraps the gold chain and bends left/right. |
| High fish reel | Result copy appears as soon as the high fish challenge starts. | Reel should spin first; WIN/ESCAPE result copy appears only near the stop. |
| Old CSS | Old `.vortex`, `.reel-ui`, old phase names, and fake route-fish CSS coexist with newer code. | Remove conflicting styles so only one pull-up architecture remains. |

## Components To Replace Or Modify

| File | Action |
| --- | --- |
| `src/components/FishArt.tsx` | New local inline SVG illustration system with distinct species silhouettes. |
| `src/components/FishEntity.tsx` | Render `FishArt`, compact chips, and real pull-up runtime states. |
| `src/components/OceanViewport.tsx` | Compute real fish pull states from `PullUpPlan`, drive camera route progress, add board event effects. |
| `src/components/PullUpSequence.tsx` | Remove fake route-fish overlay; expose elapsed time; show vortex, reel, and progressive catch ledger only. |
| `src/components/VortexPath.tsx` | Replace dashed route line with a water-column vortex wrapping chain and bending toward active fish. |
| `src/components/ReelChallenge.tsx` | Delay result reveal until reel stop; stronger gold 2.5D reel styling. |
| `src/components/Hook.tsx` | Gold chain/hook/gem, Thunder chip remains readable. |
| `src/App.tsx` | Store pull-up elapsed time and pass plan/elapsed/event into the real board. |
| `src/utils/pullUpRuntime.ts` | New shared runtime helpers: phase, active item, progress, fish visual state. |
| `src/styles.css` | Replace prototype CSS with report-grade visual system and delete old pull-up CSS. |

## Old Architecture To Delete

- Fake `.route-stage` / `.route-fish` rendering in `PullUpSequence`.
- Old `.vortex` circular rotate animation.
- Old `.reel-ui` and `.reel-disc` styles.
- Old hook phase selectors such as `.phase-camera`, `.phase-vortex`, `.phase-reel`, `.phase-resolve`.
- Any dashed water route styling used as the main vortex.

## Phase Acceptance

| Phase | Acceptance Condition |
| --- | --- |
| Phase 1: Report-grade art base | Main board reads as a deep-sea casino scene, not generic CSS blocks; hook/chain are gold; every demo fish/tool has a distinct silhouette. |
| Phase 2: Fish life/readability | Fish keep independent movement and direction; chips do not cover names/other fish; visible lower three zones remain readable. |
| Phase 3: Event performances | Twin, Pearl, Puffer, and Thunder have different board effects and still lock controls during playback. |
| Phase 4: Pull Up replacement | No fake route fish are rendered; real FishEntity instances enter `vortexHeld`, `hooked`, `pushedAway`, `struggling`, `escaped`, or `exitScreen` based on the plan. |
| Phase 5: Cleanup | Old vortex/reel/route-fish CSS no longer exists; there is only one pull-up state machine. |
| Phase 6: QA | `npm run build` passes; `VISUAL_QA.md` exists; at least 8 screenshots are exported to `qa_screenshots/`. |

## Non-Goals For This Round

- Do not change bet math, catch rates, win multipliers, or scenario seeds except where required to preserve deterministic display.
- Do not expand to the full production 24-symbol catalog; keep the current demo roster.
- Do not add external APIs, remote art, paid assets, or a backend.
- Do not implement buy-free or extra-bet features.
