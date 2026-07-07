# Pacing Test Plan

All timings and distribution targets are Demo Tuning, not formal RTP.

## Manual Pacing Checks

| Test | Target | How to check |
| --- | --- | --- |
| First high-value fish visibility | A new player should see a high-value fish within the first 3-6 Go Deep actions in demo. | Start Normal Demo or Random Run, dive until first high fish is visible. |
| First event visibility | Random mode should usually show a tool fish/effect early enough to understand, but not every layer. | Run random/demo seeds and record first event trigger. |
| Average Go Deep count before Pull Up | Demo should make Pull Up tempting around 5-10 dives, with deeper value visible. | Simulate heuristic pull decisions and inspect average depth. |
| "One more layer" temptation | Next visible zones should include higher value, event fish, or Thunder carry-over often enough. | During manual play, stop at zones 3, 6, 9 and inspect visible lower zones. |
| Event fatigue | Avoid event effects on every consecutive layer in Random/Normal. | Simulate event streaks and manually check Event Chain as the intentionally dense mode. |
| Empty-stretch fatigue | Avoid 5+ layers with no meaningful new fish/high value/event. | Simulation reports longest no-stimulus streak. |
| Normal Pull Up length | Low/no-high pull should feel 4-6 seconds. | Pull before deep high-fish density and time the sequence. |
| Event Pull Up length | Event-modified pull should feel 7-10 seconds if 1-2 high fish appear. | Event Chain Demo pull at zone 7-9. |
| Big Win Pull Up length | Deep-sea Big Win should stay around 10-15 seconds. | Big Win Demo pull at zone 12+ or Buy Free. |
| High fish readability | High fish should remain visible before reel reveal and result should not show early. | Use `?qa=pull-reel` and manual Big Win. |
| Event decision impact | Event should visibly change value or Guaranteed state before player chooses Pull Up/Go Deep. | Trigger Pearl/Puffer/Thunder and inspect chips/debug. |
| Extra Bet clarity | UI must show Extra Bet ON and next wager 3x. | Toggle Extra Bet before first Go Deep; inspect ControlBar and Debug Panel. |
| Buy Free clarity | Button cost must read as 100x Bet and immediately show deepest pull-up. | Press Buy Free at surface. |
| Demo reproducibility | Normal Demo, Event Chain Demo, Big Win Demo should reset to fixed seeds and state. | Switch scenario, restart, repeat same steps and compare key results. |

## Simulation Checks

| Metric | Report in `SIMULATION_REPORT.md` |
| --- | --- |
| Average depth / Go Deep count | Mean and distribution by random mode. |
| Average Total Bet and Total Win | Report as demo values only. |
| Average return ratio | Label as non-RTP demo simulation. |
| Average event fish appearances/triggers | Include per event type. |
| High-value visibility and catch success | Mean seen and caught high fish. |
| Pull Up duration distribution | Short/mid/deep estimates from pull plan totalMs. |
| Early vs deep Pull Up comparison | Compare heuristic early/deep pull strategies. |
| Extra Bet vs normal trigger difference | Show trigger-rate effect. |
| Buy Free example | Fixed seed result sample. |

## Fail Conditions

- Event trigger on every random layer.
- Five or more consecutive layers with no new fish, high-value fish, event fish, multiplier change, or Guaranteed state.
- Pull Up consistently exceeding 12 seconds outside Buy Free/deep showcase.
- High-fish WIN/ESCAPE visible before reel challenge reveal.
- Extra Bet has no measurable event-trigger difference.
- Buy Free fails to produce stable deep pull-up showcase.

