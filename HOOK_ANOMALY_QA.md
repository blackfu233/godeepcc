# Hook Anomaly QA

## Manual Checks

1. Start a Random Run and open Debug Panel.
2. Press `GO DEEP` repeatedly.
3. Confirm `Hook Final Chance`, `Hook Cooldown`, `Hook Pity`, `Hook Triggered`, and `Hook Last Event` update after each dive.
4. Confirm a triggered event locks controls until the Hook Event banner and board effect finish.
5. Confirm Extra Bet does not change Hook Event trigger chance.
6. Confirm Buy Free does not trigger Hook Event during fast descent.

## Positive Event Checks

- Abyss Echo: Rare Signal marker appears 1-2 zones below. On arrival, either a rare fish appears or the signal clears.
- Golden Tide: 1-3 current-zone non-event fish receive an attached golden hook badge and event multiplier increases additively, capped at x16.
- Treasure Wake: 4-6 mid-value fish appear 1-2 zones below with hook wake badges.
- Tideborn Call: A normal Event Fish effect fires immediately. If Thunder Jellyfish is already attached, a second jelly is not added; remaining charges top up to 4.
- Lucky Bait: HUD icon appears with remaining dives and affects future event selection only.
- Abyss Beacon: HUD icon appears and viewport renders one additional lower zone.
- Gilded Hook: HUD icon appears; future zones get one non-event fish with +2 multiplier.

## Negative Event Checks

- Rusted Grip: hook visual changes from normal to light rust, heavy rust, then break risk.
- Break Risk: another Rusted Grip can break the hook and show the repair / abandon panel.
- Repair: deducts 2x base bet, adds to Total Bet, increments Repair Cost, resets hook rust to normal.
- Abandon: opens a failed result page with Total Win 0 and no caught fish payout.
- Panic Current: fish move deeper, not disappear, and keep existing multipliers and guaranteed flags.
- Abyss Predator: low/mid fish leave, high-value fish and Event Fish remain.

## Route Integration Checks

- School Current should show more Treasure Wake and Tideborn Twin Fish outcomes.
- Golden Current should show more Abyss Echo, Golden Tide, and Tideborn Pearl outcomes.
- Storm Trench should show more Rusted Grip / Panic Current and Tideborn Puffer / Thunder outcomes.
- Route must not change `Hook Final Chance`.

## Build

`npm run build` completed successfully after Hook Anomaly integration.
