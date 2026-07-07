# Hook Anomaly VFX Pipeline

## Generation Method

This pass used the built-in `$imagegen` external bitmap generation path, not CSS, SVG, or procedural placeholder graphics.

Default generation format:

- Sprite sheet or icon atlas.
- Pure flat `#00FF00` chroma-key background.
- No text, logo, watermark, UI labels, or fixed gameplay numbers.
- Stable camera, stable scale, same subject identity across frames.

Generated outputs were copied from:

`C:\Users\User\.codex\generated_images\019efd61-3aec-7bf2-94c1-f848bfce907b`

into:

`assets/vfx/hook_anomaly/`

The original generated files remain in Codex's generated image folder.

## Directory Structure

Each animation asset folder contains:

- `source_green.png`: original external generated chroma-key source.
- `sheet.png`: local transparent PNG after chroma-key removal.
- `preview.gif`: quick visual preview.
- `manifest.json`: rows, columns, frame count, fps, frame size, anchor point, and usage.

Prompts are stored in:

`prompts/<asset_name>.md`

## Chroma Key

The generated source uses pure green as a removable background. Local processing converts green pixels to alpha and performs a light despill pass.

Fallback policy:

- If future generated outputs contain gradients, green noise, or subject colors too close to `#00FF00`, regenerate the source instead of hiding the issue with CSS.
- Transparent `sheet.png` files must be used in-game.
- `source_green.png` is kept for audit and reprocessing.

## Frontend Playback

Runtime files:

- `src/config/hookAnomalyVfxManifest.ts`
- `src/components/vfx/SpriteSequencePlayer.tsx`
- `src/components/vfx/HookAnomalyVfxLayer.tsx`

`SpriteSequencePlayer` supports:

- Sprite sheet playback.
- FPS and loop settings.
- Delay, scale, opacity, rotation, flip, z-index, blend mode.
- `onComplete` callbacks.
- Screen/world-style percentage placement.

`HookAnomalyVfxLayer` maps Hook Event runtime state to VFX:

- Hook glow: attached near the real hook position.
- Rust and break: attached near the real hook position.
- Rare Signal: placed near the target zone/fish when visible.
- Golden Tide / Treasure Wake: placed near target fish or target zone.
- Tideborn Call: selected by summoned Event Fish type.
- Panic Current / Abyss Predator: placed over the affected zone.

## Asset Manifest Mapping

`src/config/hookAnomalyVfxManifest.ts` maps gameplay keys to local generated assets:

- `hookGlowPositive -> hook_glow_positive`
- `hookGlowNegative -> hook_glow_negative`
- `rustLight -> rust_stage_light`
- `rustHeavy -> rust_stage_heavy`
- `rustBreakRisk -> rust_stage_breakrisk`
- `hookBreak -> hook_break`
- `hookRepair -> hook_repair`
- `rareSignalFake -> rare_signal_fake`
- `rareSignalReal -> rare_signal_real`
- `goldenTide -> fish_buff_plus2`
- `treasureWake -> treasure_wake_spawn`
- `tidebornTwinFish -> tideborn_twinfish_summon`
- `tidebornPearl -> tideborn_pearl_summon`
- `tidebornPuffer -> tideborn_puffer_summon`
- `tidebornJelly -> tideborn_jelly_summon`
- `luckyBait -> lucky_bait_apply`
- `abyssBeacon -> abyss_beacon_apply`
- `gildedHook -> gilded_hook_apply`
- `panicCurrent -> panic_current_sweep`
- `abyssPredator -> abyss_predator_shadow`

## Tool Scripts

Added pipeline helpers:

- `scripts/buildSpriteSheet.ts`
- `scripts/extractFrames.ts`
- `scripts/removeChromaKey.ts`
- `scripts/generateVfxManifest.ts`

The current production assets were processed with the bundled Python/Pillow runtime because no Node image-processing library is installed in this project.
