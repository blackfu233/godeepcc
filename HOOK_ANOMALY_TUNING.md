# Hook Anomaly Tuning

All values in this file are Demo Tuning. They are not formal RTP, final hit rate, or certified math.

## Source Rule Vs Demo Tuning

| Item | Status | Notes |
| --- | --- | --- |
| Hook Anomaly is independent from Event Fish | Source request | Implemented in `applyHookAnomaly` after existing Event Fish resolution. |
| One Hook Event max per GO DEEP | Source request | The roll is single-pass and Tideborn Call cannot recurse into another Hook Event. |
| Buy Free skips Hook Event | Source request | Buy Free uses `simulateDive` and does not call `applyHookAnomaly`. |
| Extra Bet does not affect Hook Event | Source request | Simulation confirms base and Extra Bet trigger rates match. |
| Trigger rates by depth | Demo Tuning | 10% / 12% / 14% / 16% bands. |
| Cooldown and pity | Demo Tuning | 2 dive cooldown, +10% after 8 legal misses, 25% cap. |
| Positive / negative ratio | Demo Tuning | 70/30, 65/35, 60/40 by depth. |
| Rusted Grip break chance | Demo Tuning | 40% only after already at `break_risk`. |
| Repair cost | Demo Tuning | 2x base bet, added to `TOTAL BET`. |

## Positive Pool

| Event | Weight |
| --- | ---: |
| Abyss Echo | 25 |
| Golden Tide | 20 |
| Treasure Wake | 20 |
| Tideborn Call | 20 |
| Lucky Bait | 5 |
| Abyss Beacon | 5 |
| Gilded Hook | 5 |

## Negative Pool

| Event | Weight |
| --- | ---: |
| Rusted Grip | 35 |
| Panic Current | 40 |
| Abyss Predator | 25 |

## Persistent Durations

Used by Lucky Bait, Abyss Beacon, and Gilded Hook:

| Duration | Weight |
| --- | ---: |
| 2 dives | 50 |
| 3 dives | 35 |
| 4 dives | 15 |

## Needs Product / Math Confirmation

- Whether repair should always be offered when balance is insufficient, or if abandon should be forced.
- Whether Rust should reset on successful Pull Up before the next expedition. Current demo resets when Pull Up begins / new expedition starts.
- Whether Abyss Echo should reveal its true/false status before the target zone or only at arrival. Current demo reveals only at arrival.
- Whether Panic Current should be allowed to push fish beyond the future route segment. Current demo clamps to legal 1-100 zones.
- Formal RTP impact of Treasure Wake, Golden Tide, and repair cost requires a full math model.
