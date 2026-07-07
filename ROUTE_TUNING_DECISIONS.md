# Route Tuning Decisions

Status: Demo Tuning only. This is not a formal RTP model, hit-rate certification, or final math spec.

## Source Rule vs Demo Tuning

| Item | Classification | Decision |
| --- | --- | --- |
| 100 zones / 10,000m world | Existing game rule | Route selection does not change world depth, zone count, bet, payout, catch rate, Extra Bet, Buy Free, or Pull Up formula. |
| Route checkpoints | New Demo Tuning | Route choice appears at Zone 25, 50, and 75 after the Go Deep animation/event completes. |
| Route cost | New Demo Tuning | Route choice is free, does not deduct balance, and does not increase Total Bet. |
| Route segment | New Demo Tuning | The chosen route affects only the next 25 future zones. It never rewrites passed zones. |
| Route availability | New Demo Tuning | Each checkpoint offers two seeded routes from the three-route pool. Route Demo scenarios use fixed option pairs. |
| Event density | Existing event pacing | Route does not increase Event Spawn Chance. It only biases the event type after an event fish has been scheduled. |
| Route audio | Demo implementation | Uses low-volume local placeholder layers mapped from existing audio assets. Final dedicated route loops still need audio production. |

## Final Route Config

| Route | Fish Count | Low Weight | High Weight | Event Bias |
| --- | ---: | ---: | ---: | --- |
| School Current | 1.30 | 1.25 | 0.72 | Twin 1.80, Pearl 0.80, Puffer 0.80, Thunder 0.60 |
| Golden Current | 0.84 | 0.72 | 1.50 | Twin 0.65, Pearl 2.00, Puffer 0.70, Thunder 0.70 |
| Storm Trench | 0.93 | 0.85 | 1.18 | Twin 0.60, Pearl 0.70, Puffer 1.45, Thunder 1.45 |

## Calibration Notes

Initial requested values were implemented first. Simulation showed Golden Current under-returning and Storm Trench over-returning under the same Pull Up strategies. Two Demo Tuning passes were made:

1. Golden high-value weight was raised and Storm was reduced. This overcorrected.
2. Golden was pulled back to 0.84 / 1.50 and Storm was raised to 0.93 / 1.18. This met the ±3% target while keeping each route's identity.

## Route Identity Targets

School Current:

- Most visible fish.
- Lowest high-value fish visibility.
- Lowest standard deviation among the three routes.
- Twin Fish is the strongest event type bias.

Golden Current:

- Fewest visible fish.
- Highest high-value fish visibility.
- Highest P99 result and volatility.
- Golden Pearl is the strongest event type bias.

Storm Trench:

- Highest Guaranteed Catch count.
- Highest Puffer Bomb / Thunder Jellyfish event pressure.
- High-value visibility above School but below Golden.
- Mean return remains close to the other routes.

## Still Needs Product / Math Confirmation

- Formal RTP target per route.
- Whether route choices belong in production or only report/demo builds.
- Final audio asset selection for the three ambient route layers.
- Whether route target selection should be more aggressive than current legal centered event ranges.
