# Route Background Asset Gaps

The route background system is implemented and data-driven. The three route identities now use generated bitmap far-background plates in `src/assets/route-backgrounds/`, combined with the existing depth filters, route particles, and foreground readability overlays.

## Needed Formal Assets

For each Route x Depth Layer, production should eventually provide:

- Far background plate
- Mid background transparent plate
- Near foreground transparent plate
- Route-specific particle sprite sheet
- Optional route props or silhouette plate

## School Current

Current generated plate: `src/assets/route-backgrounds/school-current-bg.png`.

Still needed later: four separate formal school-fish plates that keep background fish clearly weaker than catchable fish. Formal assets should include soft reef corridors and controlled turquoise current ribbons for all four depth layers.

## Golden Current

Current generated plate: `src/assets/route-backgrounds/golden-current-bg.png`.

Still needed later: four separate formal sunken treasure and ruin plates. Must avoid jackpot or result-page visual language. Gold must remain sparse and reflective rather than filling the whole background.

## Storm Trench

Current generated plate: `src/assets/route-backgrounds/storm-trench-bg.png`.

Still needed later: four separate formal trench wall and distant-electric plates. Must avoid horror-game lighting and strong full-screen flashes. Electric arcs should be low brightness except during event effects.

## Current Demo Status

All 12 route/depth backgrounds are functional demo compositions. Each route uses a distinct generated route plate, while its 4 depth layers currently use color grading, opacity, lighting, particles, and foreground overlays to imply depth progression. They are suitable for proving:

- route-specific background switching
- route/depth data selection
- crossfade behavior
- priority dimming behind Hook Event / Pull Up / Result

They are stronger than CSS-only placeholders, but still not final production art because each route does not yet have 4 bespoke painted/generated depth plates.
