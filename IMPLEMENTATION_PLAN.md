# Go Deep Get Bigger Implementation Plan

## Reference Status

| Source | Status | Notes |
| --- | --- | --- |
| `docs/reference/Go Deep Get Bigger.pdf` | Read and rendered | 17-page presentation reference. Key pages: p3 core loop/viewport, p5 ambience, p10-p13 event fish, p15 pull-up flow, p16 fish performance. |
| `docs/reference/Go Deep Get Bigger (1).pdf` | Read and rendered | 28-page GDD reference. Key pages: p6-p8 loop/UI, p20/p22/p24/p25 event fish, p27 pull-up flow, p28 fish performance. |
| `docs/reference/pull-up-fish-performance.png` | Missing from workspace | Searched workspace, Downloads, and Codex attachments. The user-provided textual pull-up requirements and PDF fish-performance pages are treated as the highest-priority substitute. |
| Existing source | Read | Reviewed generation, event logic, hook/camera viewport, fish entity animation, pull-up plan/sequence, reel UI, result, scenario/seed reset. |

## Requirement Mapping

| Requirement | Primary reference | Existing issue | Planned implementation |
| --- | --- | --- | --- |
| Fish have independent direction and life | GDD p5-p8, deck p5-p8, user Phase 2 | Original demo made fish feel like static icons or too uniform | Use per-fish direction, speed, bob, sway, CSS swimming/bobbing/tail motion; stronger styling for high fish and distinct tool fish pulse/electric effects. |
| Hook viewport shows current and next three zones | Deck p3, GDD p7, user Phase 3 | Viewport could hide lower zones when zone height was too tall | Keep hook fixed around 40-42%, compact zone height, camera translate by current zone, maintain depth markers and full lower-zone preview. |
| Event range centered on current zone | Deck p10-p13, GDD p20/p22/p24/p25, user Phase 4 | Earlier behavior affected mostly future/deeper zones | Use centered range: 1 = current, 3 = current +/- 1, 5 = current +/- 2 with edge clipping. |
| Event playback locks operation | User Phase 4 | Player could skip rhythm if controls stayed active | `mode === "event"` disables Go Deep and Pull Up until overlay finishes. |
| Thunder Jellyfish status and strikes | Deck p13, GDD p25, user Phase 4 | Existing state display was present, but acquisition did not immediately strike | Show Jelly xN and apply strike feedback; add immediate strike on acquisition while preserving remaining-count display. |
| Pull Up camera first moves deepest area to bottom | Deck p15, GDD p27, user Phase 5 | Old flow looked like hook/fish rotating in place | Fixed hook stage; ocean track translates so pull focus zone is at bottom. |
| Vortex forms from hook and extends downward | Deck p15, GDD p27, user Phase 5 | Old vortex was a central rotate effect | Replace with `VortexPath` SVG water-column/spline path tied to hook stage. |
| Route sweeps from deepest to shallowest | Deck p15-p16, GDD p27-p28, user Phase 5 | Old flow had no clear path/cause order | `createPullUpPlan` sorts candidates deepest-to-shallow and schedules each fish item. |
| Low/high/tool fish split in pull-up | Deck p16, GDD p28, user Phase 5 | Old flow treated fish similarly | Low fish use held/pushed/auto catch reveal; high fish pause into reel challenge; tool fish exit screen. |
| Demo scenarios are deterministic | User Phase 6 | Balance/bet/event/pull state could leak between runs | Scenario switch and restart reset balance, total bet, depth, fish, event state, thunder, pull plan/result, and seed. |

## Files Planned For Modification

| File | Purpose |
| --- | --- |
| `src/components/FishEntity.tsx` | Fish life states and pull-up-specific visual classes. |
| `src/components/OceanViewport.tsx` | Hook fixed-stage camera, lower-zone visibility, tool fish exit state. |
| `src/components/Hook.tsx` | Hook/chain pull-up motion without chasing fish. |
| `src/components/PullUpSequence.tsx` | Explicit state machine display and route item sequencing. |
| `src/components/VortexPath.tsx` | Downward curved water-column path, route head, turbulence. |
| `src/components/ReelChallenge.tsx` | High-value fish WIN/ESCAPE reel UI. |
| `src/components/EventOverlay.tsx` | Event feedback while controls are locked. |
| `src/utils/createPullUpPlan.ts` | Deterministic pull-up plan, fish order, timing, result reveal. |
| `src/utils/generateRun.ts` | Deterministic scenario fish/events and independent movement parameters. |
| `src/App.tsx` | State reset, event lock, thunder strike, pull-up mode transitions. |
| `src/styles.css` | Motion, viewport, vortex, fish, reel, event, and responsive polish. |
| `IMPLEMENTATION_LOG.md` | Completion log, tests, and limitations. |

## Phase Acceptance Plan

### Phase 1: Requirement Audit

- Confirm PDF rules and missing PNG status.
- Map reference requirements to current source behavior.
- Create this plan without changing gameplay values unless required by the references.

### Phase 2: Fish Life

- Fish directions vary by spawn side and species.
- Fish smoothly swim, bob, and sway without jitter.
- High fish are larger/brighter and move with more weight.
- Tool fish have distinct pulse/electric/utility styling.

### Phase 3: Viewport

- Hook stays around 40-42% during diving and central/mid during pull-up.
- Current zone and at least three lower zones remain visible.
- Depth markers and darker deep water ambience remain readable.

### Phase 4: Event Fish

- Event range is centered and clipped at boundaries.
- Overlay locks Go Deep/Pull Up until finished.
- Thunder shows Jelly xN, target zones, and struck fish feedback.

### Phase 5: Pull Up Replacement

- Use phases `pullUpIntro`, `vortexBuild`, `routeSweep`, `highValueChallenge`, `pullUpFinish`, then result.
- Hook stays on the central stage; camera/ocean/fish move.
- Vortex grows downward from hook and becomes a curved sweeping route.
- Low fish are held/pushed then caught/missed in order.
- High fish pause the sweep for struggling plus reel outcome.
- Tool fish leave the stage and do not join pull-up.

### Phase 6: Demo Stability

- Normal Demo, Event Chain Demo, Big Win Demo have fixed seed, bet, balance, generated fish/events, pull-up result, and final settlement.
- Restart and scenario switch fully reset gameplay state.

### Phase 7: Verification

- `npm run build` succeeds.
- Browser smoke tests cover all three demos and observe pull-up phases.
- Known limitations are recorded in `IMPLEMENTATION_LOG.md`.

## Existing Behavior That Must Not Break

- Bet is locked after first Go Deep and repeated dives use the base bet.
- Balance decreases on each Go Deep and result win is added after pull-up.
- Result modal keeps caught/missed lists and total win summary.
- Event fish effects still modify existing fish list and persist through pull-up.
- Debug panel remains optional and useful for internal review.
- The app remains a local Vite demo with no backend or external API dependency.
