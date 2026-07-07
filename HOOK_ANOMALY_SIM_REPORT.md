# Hook Anomaly Simulation Report

Simulation utility: `src/utils/simulateHookAnomalyRuns.ts`

Run command used:

```bash
node ./node_modules/esbuild/bin/esbuild src/utils/simulateHookAnomalyRuns.ts --bundle --platform=node --format=esm --outfile=tmp-hook-anomaly-sim.mjs
node -e "import('./tmp-hook-anomaly-sim.mjs').then(m=>{const r=m.simulateHookAnomalyRuns(100000); console.log(JSON.stringify(r,null,2));})"
```

Temporary bundle was deleted after the run.

## Scope

- Runs per bucket: 100,000
- Buckets: Base/Extra Bet x no route/School/Golden/Storm x pull at Zone 25/60/100
- Total simulated runs: 2,400,000
- This is Hook Anomaly pacing and state-pressure validation only. It is not formal RTP certification.

Assumption for break resolution: after an actual break, the model repairs 85% of the time and abandons 15% of the time. This is a demo stress model, not a product rule.

## Key Frequency Results

| Bucket | Trigger Rate | Positive | Negative | Avg Events |
| --- | ---: | ---: | ---: | ---: |
| Base / no route / Zone 25 | 12.04% | 70.03% | 29.97% | 2.46 |
| Base / no route / Zone 60 | 13.64% | 66.95% | 33.05% | 6.47 |
| Base / no route / Zone 100 | 14.96% | 64.71% | 35.29% | 11.56 |
| Extra / no route / Zone 25 | 12.03% | 70.04% | 29.96% | 2.45 |
| Extra / no route / Zone 60 | 13.68% | 66.82% | 33.18% | 6.48 |
| Extra / no route / Zone 100 | 14.95% | 64.68% | 35.32% | 11.55 |

Result: Extra Bet does not materially affect Hook Event trigger rate, as required.

## Route Content Influence

At Zone 100, Base mode:

| Route | Trigger Rate | Main Distribution Shift |
| --- | ---: | --- |
| No route | 14.96% | Baseline |
| School | 14.96% | Treasure Wake rises to 16.29% of Hook Events |
| Golden | 14.94% | Abyss Echo rises to 18.84%; Golden Tide rises to 15.11% |
| Storm | 14.95% | Rusted Grip rises to 13.35%; Panic Current rises to 14.64% |

Result: Route changes content distribution without changing overall Hook Event trigger rate.

## Rare Signal

Across buckets, true/false Rare Signal remained near 50/50:

- Base no route Zone 100: true 50.05%, false 49.95%
- Extra no route Zone 100: true 50.12%, false 49.88%
- Storm Zone 100: true 50.01%, false 49.99%

## Rust And Break Pressure

| Bucket | Break Risk Visits / Event | Actual Breaks / Event | Avg Repairs | Avg Abandons |
| --- | ---: | ---: | ---: | ---: |
| Base no route Zone 60 | 0.080% | 0.032% | 0.0017 | 0.0004 |
| Base no route Zone 100 | 0.485% | 0.196% | 0.0195 | 0.0032 |
| Base Storm Zone 100 | 0.634% | 0.254% | 0.0249 | 0.0044 |
| Extra Storm Zone 100 | 0.628% | 0.261% | 0.0256 | 0.0045 |

Result: Storm Trench increases rust pressure through content weighting, but does not alter Hook Event trigger rate.

## Repair Cost Impact

Repair cost was a very small share of simulated Total Bet:

- Base no route Zone 100: 0.0390%
- Base Storm Zone 100: 0.0499%
- Extra no route Zone 100: 0.0130%
- Extra Storm Zone 100: 0.0171%

This confirms the repair flow is visible but not overwhelmingly frequent under current demo tuning.

## Needs Further Math Review

- Formal RTP impact of Treasure Wake and Golden Tide.
- Whether actual player repair/abandon behavior should be modeled as a strategy, not a fixed 85/15 assumption.
- Whether break frequency is too low for demonstration purposes; current result makes it rare, which protects normal pacing.
- Whether Lucky Bait should boost only Abyss Echo pool weight, or also trigger probability. Current implementation only boosts content weight.
