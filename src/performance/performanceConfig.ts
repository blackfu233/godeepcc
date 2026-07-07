export type PerformanceMode = "high" | "medium" | "low";
export type PerformancePreference = "auto" | PerformanceMode;

export const PERFORMANCE_STORAGE_KEY = "go-deep-performance-preference";

export const PERFORMANCE_CONFIG: Record<PerformanceMode, {
  routeParticleScale: number;
  bubbleCount: number;
  diveWakeCount: number;
  maxHookVfx: number;
  spriteFpsMultiplier: number;
  routeTransitionMs: number;
  audioRouteAmbient: boolean;
}> = {
  high: {
    routeParticleScale: 1,
    bubbleCount: 24,
    diveWakeCount: 18,
    maxHookVfx: 3,
    spriteFpsMultiplier: 1,
    routeTransitionMs: 1250,
    audioRouteAmbient: true,
  },
  medium: {
    routeParticleScale: 0.5,
    bubbleCount: 12,
    diveWakeCount: 10,
    maxHookVfx: 2,
    spriteFpsMultiplier: 0.75,
    routeTransitionMs: 900,
    audioRouteAmbient: true,
  },
  low: {
    routeParticleScale: 0.18,
    bubbleCount: 5,
    diveWakeCount: 4,
    maxHookVfx: 1,
    spriteFpsMultiplier: 0.5,
    routeTransitionMs: 520,
    audioRouteAmbient: false,
  },
};
