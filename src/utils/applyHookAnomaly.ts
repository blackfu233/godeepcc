import { FISH_SPECIES, GAME_CONFIG } from "../config/gameConfig";
import { HOOK_ANOMALY_CONFIG } from "../config/hookAnomalyConfig";
import { HOOK_ANOMALY_TEXT, routeAdjustedTidebornWeight, TIDEBORN_CALL_EVENT_WEIGHTS } from "../config/hookAnomalyPools";
import { applyRustedGrip } from "../state/HookRustState";
import type { DepthZone, EventType, FishDirection, FishEntity, FishSpecies, ScenarioId, ThunderState } from "../types/game";
import type { HookAnomalyEventId, HookAnomalyLog, HookAnomalyState, HookFishEffect, HookPersistentEffectId } from "../types/hookAnomaly";
import type { RouteId } from "../types/routes";
import { applyEvent, copyZones, normalFishInZone } from "./eventEngine";
import { createRng, type Rng, weightedPick } from "./random";
import { rollHookAnomaly } from "./hookAnomalyRoll";

const highSpecies = FISH_SPECIES.filter((fish) => fish.tier === "high");
const toolSpecies = FISH_SPECIES.filter((fish) => fish.tier === "tool");
const mediumSpeciesIds = ["red-fish-2x", "shark-3x", "xuanwu", "white-tiger"];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function cloneHookState(state: HookAnomalyState): HookAnomalyState {
  return {
    ...state,
    persistent: { ...state.persistent },
    rareSignal: state.rareSignal ? { ...state.rareSignal } : null,
    debug: { ...state.debug },
    history: [...state.history],
  };
}

function addHookEffect(fish: FishEntity, effect: HookFishEffect) {
  const effects = fish.hookEffects ? [...fish.hookEffects] : [];
  if (!effects.includes(effect)) effects.push(effect);
  fish.hookEffects = effects;
}

function addPlusTwoMultiplier(fish: FishEntity, effect: HookFishEffect) {
  fish.eventMultiplier = fish.eventMultiplier <= 1 ? 2 : Math.min(16, fish.eventMultiplier + 2);
  addHookEffect(fish, effect);
}

function sizeFromSpecies(species: FishSpecies, rng: Rng) {
  if (species.tier === "tool") return rng.int(92, 112);
  if (species.tier === "high") return rng.int(118, 178);
  return rng.int(72, 126);
}

function fishFromSpecies(species: FishSpecies, zone: number, rng: Rng, index: number, source: string): FishEntity {
  const x = rng.int(14, 86);
  const edgeDirection: FishDirection = x < 48 ? 1 : -1;
  return {
    id: `${zone}-${source}-${species.id}-${index}-${Math.floor(rng.next() * 100000)}`,
    speciesId: species.id,
    name: species.name,
    tier: species.tier,
    zone,
    x,
    y: rng.int(20, 76),
    size: sizeFromSpecies(species, rng),
    direction: edgeDirection,
    swimDistance: species.tier === "high" ? rng.int(12, 26) : rng.int(40, 82),
    swimDuration: species.tier === "high" ? rng.int(8200, 12200) : rng.int(6000, 9800),
    bobDuration: species.tier === "high" ? rng.int(4800, 7200) : rng.int(2200, 4100),
    swimDelay: rng.int(-4200, 0),
    bobDistance: species.tier === "high" ? rng.int(3, 7) : rng.int(6, 13),
    sway: rng.int(2, 8),
    multiplier: species.multiplier,
    catchRate: species.catchRate,
    color: species.color,
    eventType: species.eventType,
    eventMultiplier: 1,
    guaranteed: false,
    duplicated: false,
    affectedBy: [],
    hookEffects: [],
  };
}

function decrementPersistent(state: HookAnomalyState, existingIds: HookPersistentEffectId[]) {
  for (const id of existingIds) {
    const effect = state.persistent[id];
    if (!effect) continue;
    const remaining = effect.remaining - 1;
    if (remaining > 0) {
      state.persistent[id] = { ...effect, remaining };
    } else {
      delete state.persistent[id];
    }
  }
}

function duration(rng: Rng) {
  return weightedPick(rng, HOOK_ANOMALY_CONFIG.durationWeights.map((item) => ({ item: item.duration, weight: item.weight })));
}

function baseLog(params: {
  eventId: HookAnomalyEventId;
  zone: number;
  targetZoneIds?: number[];
  targetIds?: string[];
  triggered: boolean;
  finalChance: number;
  roll: number;
  message?: string;
}): HookAnomalyLog {
  const text = HOOK_ANOMALY_TEXT[params.eventId];
  const polarity = params.eventId === "rustedGrip" || params.eventId === "panicCurrent" || params.eventId === "abyssPredator" ? "negative" : "positive";
  return {
    id: `hook-${params.zone}-${params.eventId}-${Date.now()}-${Math.floor(params.roll * 100000)}`,
    eventId: params.eventId,
    polarity,
    title: text.title,
    subtitle: text.subtitle,
    zone: params.zone,
    targetZoneIds: params.targetZoneIds ?? [params.zone],
    targetIds: params.targetIds ?? [],
    triggered: params.triggered,
    finalChance: params.finalChance,
    roll: params.roll,
    message: params.message ?? text.message,
  };
}

function resolveRareSignal(params: { zones: DepthZone[]; state: HookAnomalyState; currentZone: number; rng: Rng; finalChance: number }) {
  const signal = params.state.rareSignal;
  if (!signal || signal.revealed || params.currentZone < signal.targetZone) return null;
  const zone = params.zones[signal.targetZone - 1];
  const targetIds: string[] = [];
  if (signal.real && zone) {
    const species = weightedPick(params.rng, highSpecies.map((fish) => ({ item: fish, weight: fish.spawnWeight ?? 1 })));
    const fish = fishFromSpecies(species, signal.targetZone, params.rng, 8, "rare-signal");
    fish.hookEffects = ["rareSignal"];
    zone.fish.push(fish);
    targetIds.push(fish.id);
  }
  params.state.rareSignal = null;
  return baseLog({
    eventId: "abyssEcho",
    zone: params.currentZone,
    targetZoneIds: [signal.targetZone],
    targetIds,
    triggered: true,
    finalChance: params.finalChance,
    roll: signal.real ? 0 : 1,
    message: signal.real ? "The sonar shadow was real. A rare fish enters the zone." : "The sonar shadow scatters into the dark.",
  });
}

function applyExistingPersistent(params: { zones: DepthZone[]; state: HookAnomalyState; currentZone: number; rng: Rng }) {
  const targetIds: string[] = [];
  if (params.state.persistent.gildedHook?.remaining) {
    const fish = normalFishInZone(params.zones[params.currentZone - 1]).filter((item) => item.tier !== "tool");
    if (fish.length > 0) {
      const target = params.rng.pick(fish);
      addPlusTwoMultiplier(target, "gildedHook");
      targetIds.push(target.id);
    }
  }
  return targetIds;
}

function applyGoldenTide(zones: DepthZone[], currentZone: number, rng: Rng) {
  const fish = [...normalFishInZone(zones[currentZone - 1])];
  const count = Math.min(fish.length, rng.int(1, 3));
  const targetIds: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const target = fish.splice(rng.int(0, fish.length - 1), 1)[0];
    addPlusTwoMultiplier(target, "goldenTide");
    targetIds.push(target.id);
  }
  return targetIds;
}

function applyTreasureWake(zones: DepthZone[], currentZone: number, rng: Rng) {
  const targetZone = clamp(currentZone + rng.int(1, 2), 1, GAME_CONFIG.maxZones);
  const count = rng.int(HOOK_ANOMALY_CONFIG.treasureWakeFishCount.min, HOOK_ANOMALY_CONFIG.treasureWakeFishCount.max);
  const targetIds: string[] = [];
  const speciesPool = mediumSpeciesIds.map((id) => FISH_SPECIES.find((fish) => fish.id === id)!).filter(Boolean);
  const zone = zones[targetZone - 1];
  for (let index = 0; index < count; index += 1) {
    const species = rng.pick(speciesPool);
    const fish = fishFromSpecies(species, targetZone, rng, index, "treasure-wake");
    fish.hookEffects = ["treasureWake"];
    zone.fish.push(fish);
    targetIds.push(fish.id);
  }
  return { targetZone, targetIds };
}

function applyPanicCurrent(zones: DepthZone[], currentZone: number, rng: Rng) {
  const zone = zones[currentZone - 1];
  const movable = normalFishInZone(zone);
  const rate = HOOK_ANOMALY_CONFIG.panicMoveRate.min + rng.next() * (HOOK_ANOMALY_CONFIG.panicMoveRate.max - HOOK_ANOMALY_CONFIG.panicMoveRate.min);
  const moveCount = Math.max(0, Math.floor(movable.length * rate));
  const targetIds: string[] = [];
  for (let index = 0; index < moveCount; index += 1) {
    const fish = movable.splice(rng.int(0, movable.length - 1), 1)[0];
    if (!fish) break;
    const targetZone = clamp(currentZone + rng.int(1, 2), 1, GAME_CONFIG.maxZones);
    zone.fish = zone.fish.filter((item) => item.id !== fish.id);
    fish.zone = targetZone;
    fish.x = clamp(fish.x + rng.int(-10, 10), 8, 92);
    fish.y = clamp(fish.y + rng.int(-8, 8), 14, 84);
    addHookEffect(fish, "panicCurrent");
    zones[targetZone - 1].fish.push(fish);
    targetIds.push(fish.id);
  }
  return targetIds;
}

function applyAbyssPredator(zones: DepthZone[], currentZone: number, rng: Rng) {
  const zone = zones[currentZone - 1];
  const candidates = zone.fish.filter((fish) => fish.tier === "low" && fish.multiplier <= 10);
  const rate = HOOK_ANOMALY_CONFIG.predatorLeaveRate.min + rng.next() * (HOOK_ANOMALY_CONFIG.predatorLeaveRate.max - HOOK_ANOMALY_CONFIG.predatorLeaveRate.min);
  const leaveCount = Math.floor(candidates.length * rate);
  const targetIds = new Set<string>();
  for (let index = 0; index < leaveCount; index += 1) {
    const fish = candidates.splice(rng.int(0, candidates.length - 1), 1)[0];
    if (fish) targetIds.add(fish.id);
  }
  zone.fish = zone.fish.filter((fish) => !targetIds.has(fish.id));
  return Array.from(targetIds);
}

function applyTidebornCall(params: {
  zones: DepthZone[];
  currentZone: number;
  rng: Rng;
  routeId?: RouteId | null;
  thunder: ThunderState | null;
  scenario: ScenarioId;
  seed: number;
}) {
  const type = weightedPick(
    params.rng,
    TIDEBORN_CALL_EVENT_WEIGHTS.map((entry) => ({
      item: entry.type,
      weight: routeAdjustedTidebornWeight(entry.type, entry.weight, params.routeId),
    })),
  );

  if (type === "thunder" && params.thunder) {
    return {
      zones: params.zones,
      thunder: { ...params.thunder, remaining: 4, reach: Math.max(params.thunder.reach, 4) },
      summonedEventType: type,
      targetIds: [],
      targetZoneIds: [params.currentZone],
    };
  }

  const species = toolSpecies.find((fish) => fish.eventType === type)!;
  const eventFish = fishFromSpecies(species, params.currentZone, params.rng, 17, "tideborn");
  eventFish.eventRange = type === "thunder" ? 1 : 3;
  eventFish.eventTriggerRoll = 0.01;
  eventFish.x = params.rng.int(28, 72);
  eventFish.y = params.rng.int(16, 38);
  eventFish.hookEffects = [];
  const nextZones = copyZones(params.zones);
  nextZones[params.currentZone - 1].fish.push(eventFish);
  const eventResult = applyEvent({
    zones: nextZones,
    eventFish,
    scenario: params.scenario,
    seed: params.seed + params.currentZone * 31,
    extraBetActive: true,
  });

  return {
    zones: eventResult.zones,
    thunder: eventResult.thunder ?? params.thunder,
    summonedEventType: type,
    targetIds: eventResult.log.targetIds,
    targetZoneIds: eventResult.log.targetZoneIds,
  };
}

export function applyHookAnomaly(params: {
  zones: DepthZone[];
  state: HookAnomalyState;
  currentZone: number;
  seed: number;
  scenario: ScenarioId;
  baseBet: number;
  thunder: ThunderState | null;
  routeId?: RouteId | null;
  skip?: boolean;
}) {
  let zones = copyZones(params.zones);
  let state = cloneHookState(params.state);
  let thunder = params.thunder;
  const rng = createRng(params.seed + params.currentZone * 1307 + state.pity * 41 + state.cooldown * 97);
  const existingPersistent = Object.keys(state.persistent) as HookPersistentEffectId[];
  applyExistingPersistent({ zones, state, currentZone: params.currentZone, rng });
  const signalLog = resolveRareSignal({ zones, state, currentZone: params.currentZone, rng, finalChance: 0 });
  const roll = rollHookAnomaly({ state, zone: params.currentZone, rng, routeId: params.routeId, skip: params.skip });
  state = roll.state;
  decrementPersistent(state, existingPersistent);

  if (!roll.triggered || !roll.eventId) {
    if (signalLog) {
      state.history = [signalLog, ...state.history].slice(0, 24);
    }
    return { zones, state, thunder, log: signalLog, breakState: null as null | { log: HookAnomalyLog } };
  }

  let log = baseLog({
    eventId: roll.eventId,
    zone: params.currentZone,
    triggered: true,
    finalChance: roll.finalChance,
    roll: roll.roll ?? 0,
  });

  if (roll.eventId === "abyssEcho") {
    const targetZone = clamp(params.currentZone + rng.int(1, 2), 1, GAME_CONFIG.maxZones);
    state.rareSignal = {
      targetZone,
      remaining: 2,
      real: rng.chance(HOOK_ANOMALY_CONFIG.rareSignalTruthChance),
      revealed: false,
    };
    log = { ...log, targetZoneIds: [targetZone], message: `A rare signal marks Zone ${targetZone}.` };
  }

  if (roll.eventId === "goldenTide") {
    const targetIds = applyGoldenTide(zones, params.currentZone, rng);
    log = { ...log, targetIds, message: `Enriched ${targetIds.length} fish in this zone.` };
  }

  if (roll.eventId === "treasureWake") {
    const treasure = applyTreasureWake(zones, params.currentZone, rng);
    log = { ...log, targetZoneIds: [treasure.targetZone], targetIds: treasure.targetIds, message: `Treasure school gathers at Zone ${treasure.targetZone}.` };
  }

  if (roll.eventId === "tidebornCall") {
    const call = applyTidebornCall({
      zones,
      currentZone: params.currentZone,
      rng,
      routeId: params.routeId,
      thunder,
      scenario: params.scenario,
      seed: params.seed,
    });
    zones = call.zones;
    thunder = call.thunder;
    log = {
      ...log,
      targetIds: call.targetIds,
      targetZoneIds: call.targetZoneIds,
      summonedEventType: call.summonedEventType,
      subtitle: `${call.summonedEventType.toUpperCase()} SUMMONED`,
      message: `Summoned ${call.summonedEventType}.`,
    };
  }

  if (roll.eventId === "luckyBait" || roll.eventId === "abyssBeacon" || roll.eventId === "gildedHook") {
    state.persistent[roll.eventId] = { id: roll.eventId, remaining: duration(rng) };
    log = { ...log, message: `${log.title} active for ${state.persistent[roll.eventId]!.remaining} dives.` };
  }

  if (roll.eventId === "rustedGrip") {
    const rustResult = applyRustedGrip(state.rust, rng);
    state.rust = rustResult.rust;
    state.broken = rustResult.brokeHook;
    log = {
      ...log,
      breakRoll: rustResult.breakRoll,
      brokeHook: rustResult.brokeHook,
      repairCost: params.baseBet * HOOK_ANOMALY_CONFIG.repairCostMultiplier,
      message: rustResult.brokeHook ? "The hook tip snaps under pressure." : `Rust level is now ${rustResult.rust}.`,
    };
  }

  if (roll.eventId === "panicCurrent") {
    const targetIds = applyPanicCurrent(zones, params.currentZone, rng);
    log = { ...log, targetIds, message: `${targetIds.length} fish fled deeper.` };
  }

  if (roll.eventId === "abyssPredator") {
    const targetIds = applyAbyssPredator(zones, params.currentZone, rng);
    log = { ...log, targetIds, message: `${targetIds.length} low-value fish left the zone.` };
  }

  state.history = [log, ...state.history].slice(0, 24);
  return {
    zones,
    state,
    thunder,
    log,
    breakState: log.brokeHook ? { log } : null,
  };
}
