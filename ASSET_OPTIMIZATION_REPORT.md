# Asset Optimization Report

## Generated Mobile Derivatives

| Asset | Original approx size | Mobile derivative | Mobile size | Reduction |
| --- | ---: | --- | ---: | ---: |
| Base deep sea background | 2.07 MB | `src/assets/generated/deep-sea-bg-mobile.jpg` | 139.32 KB in build | ~93% |
| School route background | 2.19 MB | `src/assets/route-backgrounds/school-current-bg-mobile.jpg` | 133.94 KB in build | ~94% |
| Golden route background | 2.17 MB | `src/assets/route-backgrounds/golden-current-bg-mobile.jpg` | 124.21 KB in build | ~94% |
| Storm route background | 2.52 MB | `src/assets/route-backgrounds/storm-trench-bg-mobile.jpg` | 141.32 KB in build | ~94% |

## Remaining Heavy Assets

These assets are still large but are now lazy loaded or capped at runtime:

- Music loops: 3.09-4.90 MB each.
- `bigwin_burst_sheet.png`: about 2.5 MB.
- Hook anomaly sprite sheets: often 1.4-2.8 MB.
- Some event/VFX sprite sheets remain PNG because they require transparency.

## Runtime Optimization Instead Of Re-encoding

This pass did not install new image optimization packages. Instead it:

- Added mobile JPEG derivatives for large opaque backgrounds.
- Keeps transparent VFX lazy and event-mounted.
- Lowers sprite playback FPS on mobile medium/low.
- Caps simultaneous VFX by performance mode.
- Disables most ambient visual layers in low mode.

## Added Scripts

Added script scaffolds for future repeatable audits/conversion:

- `scripts/auditAssets.ts`
- `scripts/optimizeImages.ts`
- `scripts/buildMobileSprites.ts`

They document and support the intended pipeline, but this pass used local image processing for the concrete mobile background derivatives.

## Assets Still Recommended For Future Optimization

1. Create mobile sprite sheets for hook anomaly VFX at 512-768 px maximum.
2. Re-export long music loops at mobile-friendly bitrates.
3. Shorten or replace the 2.67 MB `event_puffer_burst.mp3`.
4. Convert opaque non-alpha PNG backgrounds to WebP/JPEG variants.
