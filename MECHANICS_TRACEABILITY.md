# Mechanics Traceability

This document separates source rules from current demo behavior. Page references use `docs/reference/Go Deep Get Bigger (1).pdf` unless otherwise stated. Presentation references use `docs/reference/Go Deep Get Bigger.pdf`.

## Source Conflict

| Topic | Source A | Source B | Demo decision |
| --- | --- | --- | --- |
| Event target area | GDD pp. 9-10 says event fish affect a random area. | GDD appendix pp. 20, 22, 24 and presentation pp. 10-12 describe current zone / current plus adjacent / full-screen range. | Use a configurable target selector. Demo tuning uses a visible-window selector around the event zone so the player immediately sees value changes. This is not final RTP/spec math. |
| Production depth | GDD p. 7 says 100 zones / 10,000m. | Earlier demo builds used 20 zones / 2,000m. | Current implementation now uses the source rule: 100 zones / 10,000m. Earlier 20-zone behavior is removed. |
| Event trigger rate | GDD p. 6 says event fish have a chance to trigger when hook reaches them; GDD p. 8 says Extra Bet makes special fish trigger rate 100%. | Current demo triggers every event fish automatically and has no playable Extra Bet. | Add trigger-rate handling: normal event fish can miss their effect, Extra Bet guarantees effect trigger when a tool fish enters. |

## Traceability Table

| Item | Source and page | Source rule | Current behavior before this audit | Conforms | Files to fix | Acceptance |
| --- | --- | --- | --- | --- | --- | --- |
| 100m per zone | GDD pp. 6-8 | Every Go Deep advances one 100m zone. | `metersPerZone` is 100 and Go Deep increments one zone. | Yes | `gameConfig.ts`, `App.tsx` | Depth increases by exactly 100m per Go Deep. |
| Production 100 zones / 10,000m | GDD p. 7 | 100 zones, 10,000m. | Earlier demo used 20 zones. | Yes | `gameConfig.ts`, `generateRun.ts`, `OceanViewport.tsx` | Seeded runs generate 100 zones; HUD, right-side depth labels, max depth and Pull Up all use the same 10,000m coordinate source. |
| Go Deep cost | GDD p. 7 | Each Go Deep deducts Bet. | Deducts base bet, but Extra Bet absent. | Partial | `App.tsx`, `ControlBar.tsx` | Normal deducts 1x base bet; Extra Bet deducts 3x. |
| Bet lock | GDD p. 7 | Bet cannot change after hook sinks. | Bet buttons disabled after first Go Deep. | Yes | `ControlBar.tsx` | Bet and Extra Bet disabled after zone 1. |
| Pull Up availability | GDD p. 7 | Pull Up enters settlement performance. | Enabled after currentZone > 0. | Yes | `App.tsx` | Pull Up disabled at surface, enabled after dive. |
| Total Bet | GDD p. 8 | Total Bet is this round's total wager. | Adds normal base bet only. | Partial | `App.tsx` | Total Bet includes 3x Extra Bet and 100x Buy Free. |
| Candidate fish | GDD pp. 6, 8 | Fish in passed zones can be caught except tool fish. | Pull plan includes non-tool fish in passed zones. | Yes | `createPullUpPlan.ts` | Tool fish excluded; passed low/high fish included. |
| Tool fish timing | GDD p. 8, pp. 20-25 | Tool fish effects happen before settlement; tool fish do not pay. | Tool effects happen on entry; tool fish excluded from pull. | Mostly | `eventEngine.ts`, `pullUpRuntime.ts` | Pull Up sends tool fish off-screen and never awards tool fish. |
| Low/high/tool settlement difference | GDD pp. 27-28 | Low fish use catch rate then visual auto catch if successful; high fish use reel reveal; tool fish exit. | Pull plan uses catch rate, but old `resolvePullUp.ts` auto-catches low fish. | No | `resolvePullUp.ts`, `pullUpRuntime.ts` | Low failed fish are missed; high result hidden until reel; tools exit. |
| Twin Fish | GDD p. 9, appendix p. 20 | Random/target area non-tool fish count x2; tool fish unaffected. | Duplicates centered zones, excludes tool fish, may overlap close to source. | Partial | `eventEngine.ts` | Clones have same species/value/zone and separated positions. |
| Golden Pearl | GDD p. 9, appendix p. 22 | Non-tool fish x2 multiplier; repeated x2/x4/x8/x16; tool fish unaffected. | Multiplies up to x16, excludes tool fish. | Yes | `eventEngine.ts` | Affected fish show multiplier and result value uses it. |
| Puffer Bomb | GDD p. 10, appendix p. 24 | Non-tool fish in area become Guaranteed Catch. | Sets guaranteed true in centered range. | Yes/target tuning | `eventEngine.ts` | Guaranteed overrides catch roll in pull plan. |
| Thunder Jellyfish | GDD p. 10, appendix p. 25 | Attaches to hook, persists 2-4 subsequent Go Deep, attacks lower 2-4 zones, chance to Guaranteed Catch, tool fish unaffected. | Attaches and strikes, but logic is inside `App.tsx`; debug lacks Extra Bet/event status. | Partial | `eventEngine.ts`, `DebugPanel.tsx` | Remaining count decrements; new game/Pull Up clears state; debug shows remaining/reach. |
| Event target selector | GDD pp. 9-10 vs appendix pp. 20-25 | Source conflict: random area vs current-centered range. | Earlier code used a fixed centered range. | Demo Tuning | `eventEngine.ts`, docs | Selector uses 1/3/5 zone clipped ranges with legality checks and is documented as Demo Tuning. |
| Buy Free | GDD p. 8 | Cost 100x bet; quick drop to deepest zone; normal pull-up. | Config stub only, not playable. | No | `App.tsx`, `ControlBar.tsx`, config | Button deducts 100x and launches fixed deepest pull-up demo. |
| Extra Bet | GDD p. 8 | Cost 3x; tool fish trigger rate 100%. | Config stub only, not playable. | No | `App.tsx`, `ControlBar.tsx`, `DebugPanel.tsx` | Toggle before first dive; cost 3x; event trigger rate 100%. |
| Deep-to-shallow pull-up | GDD p. 27 | Pull Up starts from deepest zone and returns upward. | Pull items sorted by descending zone. | Yes | `createPullUpPlan.ts` | Items sorted deepest to shallowest. |
| Win labels | GDD pp. 18-19; latest visual request | Source thresholds are >1.5/>2/>3/>4/>5, but latest visual request rejects 5.13x as Ultimate for demo presentation. | Earlier code used source thresholds directly. | Demo Tuning | `gameConfig.ts`, `createPullUpPlan.ts`, `resolvePullUp.ts`, docs | Demo visual labels use higher presentation thresholds and are labeled as Demo Tuning, not RTP math. |
