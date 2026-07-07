import type { PerformanceMode } from "./performanceConfig";

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

export interface DeviceProfile {
  width: number;
  deviceMemory: number | null;
  hardwareConcurrency: number | null;
  reducedMotion: boolean;
  recommendedMode: PerformanceMode;
}

export function getDeviceProfile(): DeviceProfile {
  if (typeof window === "undefined") {
    return {
      width: 1024,
      deviceMemory: null,
      hardwareConcurrency: null,
      reducedMotion: false,
      recommendedMode: "high",
    };
  }

  const nav = navigator as NavigatorWithMemory;
  const width = window.innerWidth;
  const deviceMemory = typeof nav.deviceMemory === "number" ? nav.deviceMemory : null;
  const hardwareConcurrency = typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : null;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const constrained = width <= 768 || reducedMotion || (deviceMemory !== null && deviceMemory <= 4) || (hardwareConcurrency !== null && hardwareConcurrency <= 4);
  const veryConstrained = reducedMotion || width <= 390 || (deviceMemory !== null && deviceMemory <= 2) || (hardwareConcurrency !== null && hardwareConcurrency <= 2);

  return {
    width,
    deviceMemory,
    hardwareConcurrency,
    reducedMotion,
    recommendedMode: veryConstrained ? "low" : constrained ? "medium" : "high",
  };
}
