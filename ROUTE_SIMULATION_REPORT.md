# Route Simulation Report

Status: Demo Tuning simulation. Not formal RTP certification.

Tool: `src/utils/simulateRoutes.ts`  
Execution: bundled with local esbuild to `.tmp/simulateRoutes.mjs`, then executed with Node.  
Volume: 50,000 seeded runs per route per strategy, 450,000 total route-segment simulations.

## Strategy Definition

Each run enters a route segment after a checkpoint and then pulls up after:

- 8 zones
- 16 zones
- the full 25-zone route segment

The simulation uses current fish species, catch rates, event application, Pull Up result calculation, and route-biased future segment generation. Results remain Demo Tuning and do not include a certified full-session RTP model.

## Final Results

| Route | Pull After | Avg Bet | Avg Win | Win/Bet | Fish | High Fish | Events | Guaranteed | Std Dev | P50 | P90 | P99 | Avg Pull Up |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| School | 8 | 800 | 783.96 | 0.9800 | 33.57 | 0.61 | 0.45 | 0.73 | 820.72 | 600 | 1,370 | 3,870 | 10,496ms |
| Golden | 8 | 800 | 775.95 | 0.9699 | 21.86 | 1.23 | 0.47 | 0.49 | 1,107.97 | 450 | 1,590 | 5,380 | 8,675ms |
| Storm | 8 | 800 | 775.46 | 0.9693 | 23.80 | 0.97 | 0.60 | 1.19 | 1,041.98 | 490 | 1,530 | 5,210 | 8,836ms |
| School | 16 | 1,600 | 1,586.23 | 0.9914 | 67.13 | 1.21 | 0.90 | 1.81 | 1,157.68 | 1,310 | 2,610 | 6,270 | 17,820ms |
| Golden | 16 | 1,600 | 1,598.54 | 0.9991 | 43.74 | 2.46 | 0.93 | 1.26 | 1,629.51 | 1,120 | 3,200 | 8,960 | 13,594ms |
| Storm | 16 | 1,600 | 1,604.03 | 1.0025 | 47.62 | 1.93 | 1.22 | 2.88 | 1,521.40 | 1,170 | 3,030 | 8,510 | 14,118ms |
| School | 25 | 2,500 | 2,499.27 | 0.9997 | 104.87 | 1.89 | 1.39 | 3.06 | 1,469.63 | 2,150 | 3,920 | 8,740 | 22,864ms |
| Golden | 25 | 2,500 | 2,525.98 | 1.0104 | 68.37 | 3.84 | 1.45 | 2.12 | 2,060.79 | 1,920 | 4,680 | 11,470 | 18,971ms |
| Storm | 25 | 2,500 | 2,511.14 | 1.0045 | 74.41 | 3.01 | 1.87 | 4.78 | 1,896.12 | 1,990 | 4,470 | 11,240 | 19,920ms |

## Acceptance Check

| Strategy | Lowest Win/Bet | Highest Win/Bet | Spread | Pass |
| --- | ---: | ---: | ---: | --- |
| 8 zones | 0.9693 | 0.9800 | 1.07% | Yes |
| 16 zones | 0.9914 | 1.0025 | 1.11% | Yes |
| 25 zones | 0.9997 | 1.0104 | 1.07% | Yes |

## Behavior Check

- School Current has the most fish and lowest high-value visibility.
- Golden Current has the fewest fish, highest high-value visibility, highest P99, and highest standard deviation.
- Storm Trench has the highest event count and Guaranteed Catch count.
- No route changes bet, payout, catch rate, or event spawn chance.

## Secondary Metrics

| Route | Pull After | Avg High Caught | Avg x2 Fish | Avg x4 Fish | Avg x8 Fish | Avg x16 Fish |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| School | 8 | 0.16 | 0.89 | 0.00 | 0.00 | 0.00 |
| Golden | 8 | 0.33 | 1.27 | 0.00 | 0.00 | 0.00 |
| Storm | 8 | 0.28 | 0.61 | 0.00 | 0.00 | 0.00 |
| School | 16 | 0.32 | 1.87 | 0.00 | 0.00 | 0.00 |
| Golden | 16 | 0.67 | 2.53 | 0.00 | 0.00 | 0.00 |
| Storm | 16 | 0.58 | 1.26 | 0.00 | 0.00 | 0.00 |
| School | 25 | 0.51 | 2.93 | 0.00 | 0.00 | 0.00 |
| Golden | 25 | 1.05 | 4.00 | 0.00 | 0.00 | 0.00 |
| Storm | 25 | 0.89 | 2.00 | 0.00 | 0.00 | 0.00 |

## Known Simulation Limitations

- Pull Up time in the simulation is the current plan total for all visible route fish, so the long full-segment times should be read as comparative signals, not final UX timing.
- Route-specific target selection currently relies on route-biased future generation and existing legal event ranges; deeper formal target optimization remains a product/math follow-up.
- x4/x8/x16 Pearl stacking is rare to zero in this route-segment simulation because current event spacing usually prevents the same fish from being hit repeatedly inside one 25-zone segment.
