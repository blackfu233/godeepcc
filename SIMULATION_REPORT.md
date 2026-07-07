# Simulation Report

This is a 2,000-round demo tuning simulation. It is not formal RTP and must not be used as production math.

### Random Run - Normal Bet

- Rounds: 2000
- Average depth / Go Deep count: 7.41
- Average Total Bet: 741.10
- Average Total Win: 844.45
- Average return ratio: 1.129 (demo simulation, not RTP)
- Average event fish appearances: 0.26
- Average event triggers: 0.17
- Event trigger counts: pearl: 87, twin: 83, thunder: 91, puffer: 86
- Average high-value fish seen: 0.93
- Average high-value fish caught: 0.14
- Pull Up duration ms avg/min/max: 4511 / 3130 / 8160
- Average longest no-stimulus streak: 5.07 zones

### Random Run - Extra Bet

- Rounds: 2000
- Average depth / Go Deep count: 7.41
- Average Total Bet: 2223.30
- Average Total Win: 889.56
- Average return ratio: 0.393 (demo simulation, not RTP)
- Average event fish appearances: 0.26
- Average event triggers: 0.26
- Event trigger counts: pearl: 121, twin: 123, puffer: 130, thunder: 136
- Average high-value fish seen: 0.93
- Average high-value fish caught: 0.15
- Pull Up duration ms avg/min/max: 4520 / 3130 / 8160
- Average longest no-stimulus streak: 5.06 zones

### Early vs Deep Pull Up

- Early fixed depth 4 average return ratio: 1.114
- Deep fixed depth 12 average return ratio: 1.204
- Early fixed depth 4 average Total Win: 445.64
- Deep fixed depth 12 average Total Win: 1444.21

### Buy Free Example

- Fixed showcase seed: 99792
- Cost: 10000
- Total Win: 162350
- Win Multiplier: 16.23x
- Label: SUPER WIN
- Pull Up duration: 36204ms
- High fish seen/caught: 125 / 53

## Findings

- Extra Bet event triggers per round changed from 0.17 to 0.26.
- Pull Up duration average is 4.51s, with max 8.16s in random heuristic play.
- Longest no-stimulus streak average is 5.07 zones.