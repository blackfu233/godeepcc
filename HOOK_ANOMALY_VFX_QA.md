# Hook Anomaly VFX QA

## Asset Checks

- 30 Hook Anomaly assets exist under `assets/vfx/hook_anomaly/`.
- Every asset folder contains `source_green.png`, `sheet.png`, `preview.gif`, and `manifest.json`.
- `source_green.png` preserves the external generated chroma-key source.
- `sheet.png` has an alpha channel after local chroma-key removal.
- Prompts exist under `prompts/<asset_name>.md`.
- `manifest.index.json` indexes all 30 assets.

## Runtime Checks

- Hook Event banner uses generated `banner_positive_base` / `banner_negative_base` sprite sheets behind React text.
- Hook glow positive/negative plays near the true hook position when a Hook Event appears.
- Rusted Grip plays rust stage VFX near the hook.
- Hook Break plays the generated break sequence while the repair/abandon panel is active.
- Repair Hook triggers the generated repair sequence.
- Golden Tide, Treasure Wake, Rare Signal, Panic Current, Abyss Predator, and Tideborn Call use generated sprite sheets through `HookAnomalyVfxLayer`.
- HUD persistent-effect icons use externally generated icon assets cropped from the icon atlas.

## Known Visual Limits

- Generated sprite sheets are AI-created and may not have perfectly mechanical frame registration.
- Some generated sheets are not exact requested pixel dimensions, so manifests use actual output dimensions.
- Transparent pixels may retain green RGB values under alpha 0; this is acceptable in browser compositing and the alpha channel is present.
- The current layer positions are percentage-based and tied to target fish/zone when available. Further refinement can bind exact DOM transforms from `OceanViewport` if needed.

## Verification

- `npm run build` must pass after adding VFX imports.
- Browser smoke test should trigger several Hook Events and confirm no missing asset errors in console.
