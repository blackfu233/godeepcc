# Performance Fix Summary

## Original Main Causes

1. Mobile devices were using desktop-size route/background assets.
2. Audio was warming too many large files too early.
3. Ambient background/VFX density was not scaled by device capability.
4. Debug code was part of the main import path.
5. Startup had no lightweight loading shell, which made mobile slow loads feel like a blank page.

## Implemented Fixes

### Performance Mode

Added:

- `src/performance/deviceProfile.ts`
- `src/performance/usePerformanceMode.ts`
- `src/performance/FpsMonitor.ts`
- `src/performance/performanceConfig.ts`

Modes:

- `high`: full visual density.
- `medium`: mobile-friendly particles, sprite FPS, and route transitions.
- `low`: one VFX max, minimal ambient particles, simplified CSS filters, route ambient audio off.

### Asset Loading

Added:

- `src/performance/assetRegistry.ts`
- `src/performance/assetPreloader.ts`

The game now schedules critical, route, hook, pull-up, and result assets by phase instead of treating every asset as startup-critical.

### Background Optimization

Added mobile background derivatives:

- `src/assets/generated/deep-sea-bg-mobile.jpg`
- `src/assets/route-backgrounds/school-current-bg-mobile.jpg`
- `src/assets/route-backgrounds/golden-current-bg-mobile.jpg`
- `src/assets/route-backgrounds/storm-trench-bg-mobile.jpg`

Route backgrounds now receive `performanceMode`, use mobile assets in medium/low, and reduce particles/layers in low mode.

### VFX Optimization

Updated:

- `src/components/vfx/SpriteSequencePlayer.tsx`
- `src/hooks/useSpriteAnimation.ts`
- `src/components/effects/EffectLayer.tsx`
- `src/components/vfx/HookAnomalyVfxLayer.tsx`
- `src/components/effects/WorldSpriteEffect.tsx`
- `src/components/effects/ScreenSpriteEffect.tsx`

Mobile limits:

- High: 3 VFX
- Medium: 2 VFX
- Low: 1 VFX

Sprite FPS is reduced in medium/low.

### CSS Optimization

Added:

- `src/styles/performance.css`

This disables or reduces heavy backdrop/filter/shadow/ambient animation work for mobile low and reduced-motion users.

### Audio Optimization

Updated:

- `src/audio/AudioDirector.ts`
- `src/hooks/useGameAudio.ts`

Audio now warms fewer files, initializes after user gesture, and disables route ambient loops in low mode.

### Production Debug

Updated:

- `src/App.tsx`

DebugPanel is now lazy-loaded and only available in dev or explicit debug/QA URLs.

### Loading Screen

Updated:

- `index.html`

Added a lightweight CSS-only loading shell so mobile users get immediate feedback before React mounts.

## Build Result

`npm.cmd run build` succeeded.

## GitHub Pages Notes

The remote GitHub Pages URL was not available in this session for direct external-device testing. The local production build output is ready for Pages deployment and avoids external runtime URLs.
