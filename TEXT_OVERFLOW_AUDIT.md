# Text Overflow Audit

Scope: player-facing UI text only. Gameplay logic, probabilities, route logic, hook events, event fish, pull-up flow, background behavior, and animation systems were not changed.

## Findings

| # | Area | Problem | Cause |
|---|---|---|---|
| 1 | Global typography | Traditional Chinese fallback could render wider than expected. | Font stack ended at generic sans-serif without TC-specific fallbacks. |
| 2 | Flex/grid UI | Some grid and flex children could refuse to shrink. | Missing global `min-width: 0`. |
| 3 | HUD | Depth, balance, total bet values could overflow narrow cells. | `white-space: nowrap` on HUD values and fixed HUD height. |
| 4 | Bottom controls | BET, EXTRA 3x, BUY, PULL UP, GO DEEP could crowd or clip on small screens. | Fixed button heights, nowrap secondary buttons, tight grid columns. |
| 5 | Route choice header | Dynamic zone-range text could wrap poorly. | Fixed route panel dimensions and small single-line text. |
| 6 | Route cards | Route names, descriptions, and tags could overflow card bounds. | Fixed card height, hidden overflow, very small tag line boxes. |
| 7 | Active route chip | Route chip could become too wide or clip remaining-zones text. | Fixed chip width and nowrap text. |
| 8 | Route selected toast | Selected route names could exceed toast width. | Two-column layout without wrapping safeguards. |
| 9 | Hook anomaly banner | Long title/subtitle could exceed banner or be visually cut. | Wide banner, fixed text sizes, no line-wrap policy. |
| 10 | Hook HUD icons | Multiple persistent effect labels could overlap HUD space. | Single flex row with nowrap chips. |
| 11 | Hook break panel | Repair/abandon buttons could overflow in translated or narrow layouts. | Two fixed columns and button text without wrapping. |
| 12 | Result page | Big win tier and large total win values could exceed red/gold panels. | Very large clamp values and fixed panel assumptions. |
| 13 | Result stats/top catches | Fish names and large values could collide. | Flex rows without shrink/overflow rules. |
| 14 | Settings/audio panel | Labels and controls could overlap on narrow screens. | Fixed-ish two-column label rows and no overflow wrapping. |
| 15 | Depth rail | Depth labels could clip at the right edge. | Fixed rail width/right offset and nowrap text. |
| 16 | Fish multiplier chips | Fish and multiplier chips could drift into the phone edge or bottom control bar. | Fish swim offsets were applied after layout positioning, so the rendered body/chip could move outside the readable play area. |

## Notes

- The current demo has mostly English player-facing strings plus a Chinese confirm button. The CSS is now prepared for Traditional Chinese string width and multi-line wrapping.
- Debug UI remains lower priority, but it also benefits from global `min-width: 0`.
- Fish multiplier chips are treated as player-facing text because they communicate payout value; they now use display-safe fish coordinates and viewport band filtering.
