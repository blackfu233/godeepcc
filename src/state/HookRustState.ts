import { HOOK_ANOMALY_CONFIG } from "../config/hookAnomalyConfig";
import type { HookRustLevel } from "../types/hookAnomaly";
import type { Rng } from "../utils/random";

export function nextRustLevel(current: HookRustLevel) {
  const order = HOOK_ANOMALY_CONFIG.rustOrder;
  const index = order.indexOf(current);
  return order[Math.min(order.length - 1, Math.max(0, index) + 1)];
}

export function applyRustedGrip(current: HookRustLevel, rng: Rng) {
  if (current === "break_risk") {
    const breakRoll = rng.next();
    return {
      rust: current,
      breakRoll,
      brokeHook: breakRoll <= HOOK_ANOMALY_CONFIG.breakRiskChance,
    };
  }

  return {
    rust: nextRustLevel(current),
    breakRoll: undefined,
    brokeHook: false,
  };
}
