# RTP Alignment Notes

Source PDFs:

- `Go Deep Get Bigger 數值設計 - 區域線性RTP.pdf`
- `Go Deep Get Bigger 數值設計 - 總RTP.pdf`
- `Go Deep Get Bigger 數值設計 - 最終RTP.pdf`

Some extracted Chinese labels are encoding-corrupted in the local PDF text extraction, so this pass only maps numeric rows that are directly readable and cross-checkable.

## Applied Numeric Rules

| Area | PDF value | Implementation |
| --- | ---: | --- |
| Total target RTP reference | 97.23% | `GAME_CONFIG.rtpModel.targetTotalRtp` |
| Normal fish category | 90% | `normalCategoryRate` |
| High-value fish category | 10% | `highCategoryRate` |
| Normal fish per zone | 3 | `normalFishPerZone` |
| High-value fish per category hit | 1 | `highFishPerZone` |
| Normal fish catch rate | 25% | all low-tier `catchRate` |
| High-value fish catch rate | 25% | all high-tier `catchRate` |
| Base event trigger target | 6.25% | 25% spawn x 25% trigger |
| Extra Bet event trigger target | 25% | 25% spawn x 100% trigger |
| Final normal RTP split | 54.22% | reference value only |
| Final high RTP split | 43.01% | reference value only |

## Fish Tables

Low-tier multipliers and spawn weights now follow the readable normal fish table:

`0.1/21`, `0.2/18`, `0.5/18`, `0.8/15`, `1/20`, `2/5`, `3/3`.

High-tier multipliers and spawn weights now follow the readable high-value fish table:

`5/50.5`, `10/30`, `15/0.5`, `20/10`, `30/5`, `40/0.5`, `50/2`, `80/0.5`, `100/1`.

## Event Range Mapping

Non-thunder event fish keep the previously specified range model:

- 1 zone: current zone
- 3 zones: current zone plus one above and one below
- 5 zones: current zone plus two above and two below

The PDF global event rows show stronger 3-zone and 5-zone contributions than the previous tuning, so Demo weights were changed to:

- 1 zone: 22
- 3 zones: 62
- 5 zones: 16

Thunder Jellyfish uses the previous functional spec:

- reaches lower 2/3/4 zones
- weighted by readable global B2/B3/B4 ratio as 62/28/10
- duration uses the same 2/3/4 weighting

## Known Product/Math Follow-Up

The current game architecture separates event fish spawn and event trigger. The PDF exposes `P_trig_N` and `P_trig_S`, but not a clean English source label for spawn versus trigger. This pass maps them as combined successful event probability:

- Base: 25% event spawn chance and 25% trigger chance = 6.25% successful trigger.
- Extra Bet: same spawn chance and 100% trigger chance = 25% successful trigger.

Formal RTP certification should confirm whether the PDF intended this two-step interpretation or a single-step event trigger roll.
