# Hook Anomaly Event System Spec

Status: implemented demo system. This document describes the runtime behavior now connected to Go Deep Get Bigger.

## Trigger Flow

Each normal `GO DEEP` follows this order:

1. Player presses `GO DEEP`.
2. Base wager is deducted.
3. Hook and chain dive animation plays.
4. Existing Thunder Jellyfish state attacks first.
5. New zone fish and existing Event Fish are revealed and resolved.
6. Hook Anomaly rolls independently.
7. If triggered, a short Hook Event banner appears and the board effect is applied.
8. Controls unlock after the event, unless the hook breaks.

Buy Free fast dive skips Hook Anomaly. Extra Bet does not alter Hook Anomaly trigger rate.

## Trigger Rules

Trigger rates are configured in `src/config/hookAnomalyConfig.ts`:

| Zone | Chance |
| --- | ---: |
| 1-25 | 10% |
| 26-50 | 12% |
| 51-75 | 14% |
| 76-100 | 16% |

After any Hook Event triggers, the next 2 legal `GO DEEP` checks are cooldown misses. After 8 legal misses, the next legal check gains +10%, capped at 25%.

## Polarity

| Zone | Positive | Negative |
| --- | ---: | ---: |
| 1-25 | 70% | 30% |
| 26-75 | 65% | 35% |
| 76-100 | 60% | 40% |

The polarity roll happens before selecting the concrete event pool.

## Positive Events

| Event | Implemented Effect |
| --- | --- |
| Abyss Echo / Rare Signal | Marks a target 1-2 zones below. On arrival, resolves as 50% real rare fish spawn or 50% false signal. At most one signal is active. |
| Golden Tide | Current zone: 1-3 non-event fish gain +2 event multiplier, additive with Pearl multiplier and capped at x16. |
| Treasure Wake | Spawns 4-6 mid-value fish in 1-2 zones below. |
| Tideborn Call | Summons one existing Event Fish and immediately applies it. Existing Thunder Jellyfish is topped up to 4 instead of duplicated. |
| Lucky Bait | Persistent 2/3/4 dives. Boosts Abyss Echo event-pool weight. |
| Abyss Beacon | Persistent 2/3/4 dives. Reveals one extra zone below in the viewport. |
| Gilded Hook | Persistent 2/3/4 dives. Each new zone selects one non-event fish and adds +2, capped at x16. |

## Negative Events

| Event | Implemented Effect |
| --- | --- |
| Rusted Grip | Advances hook rust state. At `break_risk`, another Rusted Grip has a 40% break chance. |
| Panic Current | Moves 30%-50% of current-zone non-event fish down 1-2 zones. Existing multipliers, guaranteed catch, and hook effects are preserved. |
| Abyss Predator | Removes 50%-70% of current-zone low/mid fish. High-value and Event Fish are preserved. |

## Rust And Break

Rust state is hidden from the player as a number, but visible on the hook:

`normal -> light_rust -> heavy_rust -> break_risk`

Positive events never repair rust. Repair is only available after an actual break.

On break:

1. Current `GO DEEP` remains valid and already paid.
2. The break panel blocks input.
3. `REPAIR HOOK · 2x BET` deducts 2x base bet, adds to `TOTAL BET`, records `repairCost`, resets rust to normal, and continues the expedition.
4. `ABANDON EXPEDITION` ends immediately with failed result and no fish payout.

## Route Integration

Route never changes Hook Event trigger chance or polarity. It only adjusts event content weights:

| Route | Weight Changes |
| --- | --- |
| School Current | Treasure Wake x1.35. Tideborn Call Twin Fish x1.50. |
| Golden Current | Abyss Echo x1.35, Golden Tide x1.35. Tideborn Call Golden Pearl x1.50. |
| Storm Trench | Rusted Grip x1.30, Panic Current x1.25. Tideborn Call Puffer/Thunder x1.40. |

Weights are normalized by weighted picking; total pool weight can vary but the roll chooses proportionally.

## UI And Debug

Implemented UI:

- Short Hook Event banner.
- Hook persistent effect HUD icons.
- Rare Signal board marker.
- Hook rust visual layer on the actual hook.
- Hook break repair/abandon panel.
- Fish-attached hook effect badges and VFX.
- Debug Panel values: cooldown, pity, final chance, last event, polarity, rust, active persistent effects, Rare Signal, repair cost.
