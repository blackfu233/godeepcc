# Route QA

Status: Implemented and build-verified.

## Functional Checks

1. Switch to `Route Demo - School`.
2. Confirm the run starts at Zone 24 / 2400m with accumulated demo bet.
3. Press `GO DEEP`.
4. After the Zone 25 dive/event window finishes, confirm the `OCEAN CURRENT AHEAD` panel appears.
5. Confirm `GO DEEP` is disabled while the panel is open.
6. Confirm `PULL UP` remains usable while the panel is open.
7. Select `SCHOOL CURRENT`.
8. Confirm the card plays a short confirmation, the active route chip appears, and the next generated zones show denser fish.

Repeat with:

- `Route Demo - Golden`: starts at Zone 49, fixed options Golden / Storm, expected Golden selection for report flow.
- `Route Demo - Storm`: starts at Zone 74, fixed options Storm / School, expected Storm selection for report flow.

## Visual Checks

- Route panel rises from the lower area and does not cover the whole playfield.
- Route cards have distinct color accents without heavy gold framing.
- Active route chip remains small and does not cover Balance, Depth, or Total Bet.
- Route ambient layer is low opacity and does not cover fish labels, event effects, Pull Up, or Result.
- Pull Up fades out route ambient because active route is cleared at Pull Up start.

## Audio Checks

- Checkpoint plays a short sting.
- Card reveal plays a soft water transition.
- Hover/focus sound changes by route.
- Route confirmation starts a low-volume route accent loop.
- Event mode ducks the route loop.
- Pull Up and Result stop the route accent loop.

## Regression Checks

- Route choice appears only at Zone 25, 50, and 75.
- Route choice does not deduct Balance and does not change Total Bet.
- Route segment replacement affects only future zones: 26-50, 51-75, or 76-100.
- Event Spawn Chance remains under the existing EventPacingController logic.
- Extra Bet and Buy Free cost rules are unchanged.
- New Expedition, Restart, scenario switching, Buy Free, Pull Up, and Result all clear route state.

## Build

`npm run build` passed after route implementation and after final tuning.
