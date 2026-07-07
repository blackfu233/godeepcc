import type { HookAnomalyPolarity, HookRustLevel } from "../types/hookAnomaly";

export const HOOK_ANOMALY_CONFIG = {
  triggerBands: [
    { from: 1, to: 25, chance: 0.1 },
    { from: 26, to: 50, chance: 0.12 },
    { from: 51, to: 75, chance: 0.14 },
    { from: 76, to: 100, chance: 0.16 },
  ],
  polarityBands: [
    { from: 1, to: 25, positive: 0.7 },
    { from: 26, to: 75, positive: 0.65 },
    { from: 76, to: 100, positive: 0.6 },
  ],
  cooldownAfterTrigger: 2,
  pityAfterMisses: 8,
  pityBonus: 0.1,
  maxTriggerChance: 0.25,
  rustOrder: ["normal", "light_rust", "heavy_rust", "break_risk"] as HookRustLevel[],
  breakRiskChance: 0.4,
  durationWeights: [
    { duration: 2, weight: 50 },
    { duration: 3, weight: 35 },
    { duration: 4, weight: 15 },
  ],
  rareSignalTruthChance: 0.5,
  treasureWakeFishCount: { min: 4, max: 6 },
  panicMoveRate: { min: 0.3, max: 0.5 },
  predatorLeaveRate: { min: 0.5, max: 0.7 },
  repairCostMultiplier: 2,
};

export function hookTriggerChanceForZone(zone: number) {
  return HOOK_ANOMALY_CONFIG.triggerBands.find((band) => zone >= band.from && zone <= band.to)?.chance ?? 0;
}

export function hookPositiveRateForZone(zone: number): number {
  return HOOK_ANOMALY_CONFIG.polarityBands.find((band) => zone >= band.from && zone <= band.to)?.positive ?? 0.65;
}

export function polarityForRate(roll: number, positiveRate: number): HookAnomalyPolarity {
  return roll <= positiveRate ? "positive" : "negative";
}
