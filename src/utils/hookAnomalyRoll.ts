import { hookPositiveRateForZone, hookTriggerChanceForZone, HOOK_ANOMALY_CONFIG, polarityForRate } from "../config/hookAnomalyConfig";
import { HOOK_NEGATIVE_POOL, HOOK_POSITIVE_POOL, routeAdjustedHookWeight } from "../config/hookAnomalyPools";
import type { HookAnomalyDefinition } from "../types/hookAnomaly";
import type { HookAnomalyState } from "../types/hookAnomaly";
import type { RouteId } from "../types/routes";
import type { Rng } from "./random";
import { weightedPick } from "./random";

function pickHookDefinition(params: {
  rng: Rng;
  pool: HookAnomalyDefinition[];
  routeId?: RouteId | null;
  luckyBaitActive: boolean;
}) {
  return weightedPick(
    params.rng,
    params.pool.map((entry) => {
      const luckyBoost = params.luckyBaitActive && entry.id === "abyssEcho" ? 1.15 : 1;
      return {
        item: entry,
        weight: routeAdjustedHookWeight(entry.id, entry.weight, params.routeId) * luckyBoost,
      };
    }),
  );
}

export function rollHookAnomaly(params: {
  state: HookAnomalyState;
  zone: number;
  rng: Rng;
  routeId?: RouteId | null;
  skip?: boolean;
}) {
  const state = {
    ...params.state,
    persistent: { ...params.state.persistent },
    history: [...params.state.history],
  };
  const baseChance = hookTriggerChanceForZone(params.zone);
  const cooldown = Math.max(0, state.cooldown);

  if (params.skip || cooldown > 0 || state.broken) {
    const nextCooldown = params.skip || state.broken ? cooldown : Math.max(0, cooldown - 1);
    state.cooldown = nextCooldown;
    state.debug = {
      cooldown: nextCooldown,
      pity: state.pity,
      finalChance: 0,
      roll: null,
      triggered: false,
      lastEventId: null,
      lastPolarity: null,
    };
    return {
      state,
      triggered: false,
      eventId: null,
      polarity: null,
      finalChance: 0,
      roll: null,
      positiveRate: hookPositiveRateForZone(params.zone),
      polarityRoll: null,
    };
  }

  const pityActive = state.pity >= HOOK_ANOMALY_CONFIG.pityAfterMisses;
  const finalChance = Math.min(HOOK_ANOMALY_CONFIG.maxTriggerChance, baseChance + (pityActive ? HOOK_ANOMALY_CONFIG.pityBonus : 0));
  const roll = params.rng.next();
  const triggered = roll <= finalChance;

  if (!triggered) {
    state.pity += 1;
    state.debug = {
      cooldown: state.cooldown,
      pity: state.pity,
      finalChance,
      roll,
      triggered: false,
      lastEventId: null,
      lastPolarity: null,
    };
    return {
      state,
      triggered: false,
      eventId: null,
      polarity: null,
      finalChance,
      roll,
      positiveRate: hookPositiveRateForZone(params.zone),
      polarityRoll: null,
    };
  }

  const positiveRate = hookPositiveRateForZone(params.zone);
  const polarityRoll = params.rng.next();
  const polarity = polarityForRate(polarityRoll, positiveRate);
  const definition = pickHookDefinition({
    rng: params.rng,
    pool: polarity === "positive" ? HOOK_POSITIVE_POOL : HOOK_NEGATIVE_POOL,
    routeId: params.routeId,
    luckyBaitActive: Boolean(state.persistent.luckyBait?.remaining),
  });

  state.cooldown = HOOK_ANOMALY_CONFIG.cooldownAfterTrigger;
  state.pity = 0;
  state.debug = {
    cooldown: state.cooldown,
    pity: state.pity,
    finalChance,
    roll,
    triggered: true,
    lastEventId: definition.id,
    lastPolarity: polarity,
  };

  return {
    state,
    triggered: true,
    eventId: definition.id,
    polarity,
    finalChance,
    roll,
    positiveRate,
    polarityRoll,
  };
}
