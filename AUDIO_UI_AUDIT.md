# Audio UI Audit

## Added UI

| Area | Result |
| --- | --- |
| Settings panel | Added Audio section with Enable Audio, Master, Music, Music Vol, SFX, SFX Vol, Mute All, Reset Audio |
| HUD | Added small Audio Layer marker under Depth |
| Depth feedback | Added centered milestone pulse when crossing 2500m / 5000m / 7500m / 10000m |
| Pull Up | Added `RETRIEVING...` phase status overlay during Pull Up |

## Autoplay Handling

Browsers require a user gesture before audio can start. The game now calls `audio.unlock()` from:

- Bet changes
- Extra Bet toggle
- Go Deep
- Buy Free
- Pull Up
- Enable Audio button

## Current Limitation

The settings panel is functional but uses compact demo controls. Final production UI may replace it with icon-based volume controls or a dedicated settings modal.
