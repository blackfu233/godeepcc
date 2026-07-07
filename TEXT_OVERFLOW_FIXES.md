# Text Overflow Fixes

## Shared Rules Added

- Added Traditional Chinese font fallbacks: `Microsoft JhengHei`, `PingFang TC`, `Noto Sans TC`, `Heiti TC`.
- Added global `box-sizing: border-box` plus `min-width: 0` for shrinkable layout children.
- Added reusable typography classes:
  - `.text-ui-label`
  - `.text-ui-value`
  - `.text-card-title`
  - `.text-card-subtitle`
  - `.text-card-description`
  - `.text-chip`
  - `.text-button-primary`
  - `.text-button-secondary`
  - `.text-event-banner`
  - `.text-modal-title`
  - `.text-modal-body`

## Component-Level Fixes

| Area | Fix |
|---|---|
| HUD | Converted fixed height to min-height, allowed values to wrap safely, clamped font sizes. |
| Bottom control bar | Added adaptive min-heights, wrapping for secondary buttons, centered button text, and small-screen adjustments. |
| Route choice panel | Made panel height adaptive, protected header text, and made route range text wrap. |
| Route cards | Added title/subtitle/description/tag constraints; description max two lines; tags max two rows. |
| Active route chip | Added dynamic width cap, wrapped copy, and smaller safe type. |
| Route selected toast | Added wrapping and width cap. |
| Hook event banner | Limited width to 72% of viewport, allowed two-line title/subtitle. |
| Hook HUD icons | Allowed wrapping into multiple chips and capped individual chip width. |
| Hook break panel | Made modal scroll-safe, button text wrap-safe, and narrow screens stack actions vertically. |
| Result page | Clamped win tier and total win values, protected stats/top catches from collision. |
| Settings/audio | Added panel scroll safety, wrapping labels, and safer label/control grid. |
| Depth rail | Added right-offset clamp and wrapping-safe depth labels. |
| Fish multiplier chips | Added display-safe fish coordinates, reduced swim amplitude near edges, and filtered fish/chips that would render inside HUD or bottom-control safe zones. |

## Short Text / Fallback Handling

- No gameplay strings were changed.
- No translations were changed.
- No primary button uses ellipsis.
- Route descriptions remain capped to two lines, as requested.
- Route tags are allowed to wrap but capped to two rows.

## Files Changed

- `src/styles.css`
- `src/styles/routes.css`
- `src/components/FishEntity.tsx`
- `src/components/OceanViewport.tsx`
