# Event Pacing Simulation

Seeded random runs: 20,000. This is Demo Tuning validation, not formal RTP.

## Checkpoints

| Depth | Mode | Avg generated events | Avg successful triggers | No successful trigger rounds | Pull-up return ratio |
| --- | --- | ---: | ---: | ---: | ---: |
| Zone 10 | Base | 0.44 | 0.31 | 70.7% | 1.158 |
| Zone 10 | Extra Bet | 0.44 | 0.44 | 59.3% | 0.405 |
| Zone 20 | Base | 1.47 | 1.03 | 22.5% | 1.608 |
| Zone 20 | Extra Bet | 1.47 | 1.47 | 8.8% | 0.595 |
| Zone 40 | Base | 3.56 | 2.50 | 2.1% | 2.291 |
| Zone 40 | Extra Bet | 3.56 | 3.56 | 0.1% | 0.879 |
| Zone 60 | Base | 5.81 | 4.07 | 0.1% | 2.815 |
| Zone 60 | Extra Bet | 5.81 | 5.81 | 0.0% | 1.095 |
| Zone 100 | Base | 10.69 | 7.49 | 0.0% | 4.829 |
| Zone 100 | Extra Bet | 10.69 | 10.69 | 0.0% | 1.940 |

## Event Density

- Base average scheduled-event interval: 8.56 zones
- Base adjacent successful-trigger count: 0
- Base same-type-too-close count: 0
- Range distribution 1/3/5: 128697 / 65104 / 20021

## Event Type Counts

| Type | Base generated | Base triggered | Extra generated | Extra triggered |
| --- | ---: | ---: | ---: | ---: |
| twin | 53671 | 37657 | 53671 | 53671 |
| pearl | 53383 | 37503 | 53383 | 53383 |
| puffer | 53296 | 37274 | 53296 | 53296 |
| thunder | 53472 | 37283 | 53472 | 53472 |

## Effects

- Base Thunder average duration: 2.65 Go Deep actions
- Extra Thunder average duration: 2.65 Go Deep actions
- Base Guaranteed Catch fish at Zone 100 average: 22.23
- Extra Guaranteed Catch fish at Zone 100 average: 31.72
- Base Pearl multiplier counts x2/x4/x8/x16: 170199 / 0 / 0 / 0
- Extra Pearl multiplier counts x2/x4/x8/x16: 242518 / 0 / 0 / 0

## Base vs Extra Bet

- Event generation is identical by seed; Extra Bet changes event trigger chance from 70% to 100%.
- Average cost per Go Deep: Base 100, Extra 300.
- These values are for demo pacing only and are not official hit-rate or RTP math.