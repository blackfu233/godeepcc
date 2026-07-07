# Demo Tuning Decisions

This file prevents temporary demo choices from being mistaken for production math or final RTP.

## Source Rules

| Rule | Source | Implementation expectation |
| --- | --- | --- |
| Each Go Deep is one wager and one 100m descent. | GDD pp. 6-8 | Deduct wager and advance one zone. |
| Production depth is 100 zones / 10,000m. | GDD p. 7 | The web demo now uses the full 100-zone world coordinate source. |
| Pull Up settles fish from passed zones except tool fish. | GDD pp. 6, 8, 27-28 | Low/high fish are candidates; tool fish effects happen before Pull Up and then exit. |
| Buy Free cost is 100x Bet. | GDD p. 8 | Deduct 100x selected Bet and run deepest pull-up. |
| Extra Bet cost is 3x Bet and special fish trigger rate is 100%. | GDD p. 8 | Extra Bet Go Deep cost is 3x; event fish effect cannot fail when Extra Bet is locked. |
| Golden Pearl multiplier repeats to x2/x4/x8/x16. | GDD p. 9, appendix p. 22 | Cap display/effect at x16. |
| Puffer Bomb makes non-tool fish Guaranteed Catch. | GDD p. 10, appendix p. 24 | Guaranteed overrides catch-rate roll. |
| Thunder Jellyfish persists 2-4 Go Deep, attacks lower 2-4 zones, chance to Guaranteed Catch. | GDD p. 10, appendix p. 25 | Decrement on each subsequent/active Go Deep, clear on Pull Up/new game. |
| Big/Mega/Super/Ultra/Ultimate thresholds are >1.5/>2/>3/>4/>5 Total Win / Total Bet. | GDD pp. 18-19 | Source thresholds are recorded, but the current demo presentation uses adjusted visual thresholds because the latest review explicitly rejected 5.13x as Ultimate. |

## Demo Tuning

| Tuning | Why | Player impact | Affects formal RTP? | Future owner |
| --- | --- | --- | --- | --- |
| Earlier 20-zone / 2,000m compression has been removed. | Latest hard spec requires true 100 zones / 10,000m. | Depth labels, fish generation, event pacing and Pull Up now remain in one 100-zone world. | Yes, this returns toward source structure but still uses demo fish/event tuning. | Product + math. |
| Event target selector uses clipped 1/3/5 zone ranges around the event zone. | GDD has a random-area source conflict; visible changes are easier to understand during demo play. | Players can immediately see value/catch-rate changes and decide Pull Up vs Go Deep. | Yes. | Product. |
| Normal event fish effect trigger rate is 70%; Extra Bet locks it to 100%. | Current code triggered all events, making Extra Bet meaningless. GDD states event fish can have a trigger chance and Extra Bet makes trigger rate 100%. | Extra Bet has visible value without requiring every zone to generate an event fish. | Yes. | Math + product. |
| Event generation is paced with demo rates and scenario-forced events. | Report modes need reliable examples; random runs still need rarity. | Normal Demo is calmer; Event Chain and Big Win are deterministic. | Yes. | Product + math. |
| Buy Free uses a fixed Big Win style showcase seed and jumps to Zone 100 / 10,000m. | GDD asks quick drop to deepest zone and normal pull-up; reports need stable output. | Presenter can show deep-sea/high-value pull-up instantly. | Yes. | Product + math. |
| Pull-up timing is capped for demo readability. | Full-depth production timing is not feasible in a short web demo. | Low-only pulls are fast; high-fish pulls have reel tension but avoid fatigue. | No final RTP, but affects presentation pacing. | Product/UX. |
| Result title thresholds use demo visual levels: Big 2x, Mega 5x, Super 10x, Ultra 20x, Ultimate 50x. | Latest review says 5.13x should not display Ultimate Win. | Small wins no longer overclaim high-tier celebration labels. | Presentation only; not formal paytable/RTP. | Product + math. |

## Unknown / Needs Product Decision

| Topic | Unknown |
| --- | --- |
| Final event target area algorithm | Random area vs current-centered range needs product decision. |
| Final event trigger chance without Extra Bet | GDD indicates chance but does not provide exact probability. |
| Final event generation rate | The current rate is demo-only. |
| Final fish distribution across 100 production zones | Current 100-zone bands are Demo Tuning, not final RTP distribution. |
| Formal RTP | No formal RTP should be inferred from this demo or simulation. |
| Buy Free final script/randomness | Demo uses fixed showcase; production needs math-owned behavior. |
| Extra Bet exact wording | Demo defines it as guaranteed effect trigger for event fish that appears/enters; product should confirm whether it also changes event appearance frequency. |
