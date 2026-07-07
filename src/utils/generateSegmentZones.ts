import { FISH_SPECIES, GAME_CONFIG } from "../config/gameConfig";
import { getRouteDefinition } from "../config/routeDefinitions";
import type { DepthZone, EventType, FishDirection, FishEntity, FishSpecies, ScenarioId } from "../types/game";
import type { RouteId } from "../types/routes";
import { createRng, type Rng, weightedPick } from "./random";

const lowFish = FISH_SPECIES.filter((fish) => fish.tier === "low");
const highFish = FISH_SPECIES.filter((fish) => fish.tier === "high");
const toolFish = FISH_SPECIES.filter((fish) => fish.tier === "tool");

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function eventSpawnChance(zone: number) {
  return GAME_CONFIG.eventSpawnChances.find((band) => zone >= band.from && zone <= band.to)?.chance ?? 0;
}

function sizeFromSpecies(species: FishSpecies, rng: Rng) {
  if (species.tier === "tool") return rng.int(92, 112);
  if (species.tier === "high") {
    const multiplierLift = Math.sqrt(species.multiplier / 5) * 28;
    return Math.round(clamp(92 + multiplierLift + rng.int(-6, 8), 108, 208));
  }
  const multiplierLift = Math.sqrt(species.multiplier / 0.1) * 17;
  return Math.round(clamp(42 + multiplierLift + rng.int(-5, 6), 58, 124));
}

function fishFromSpecies(species: FishSpecies, zone: number, rng: Rng, index: number): FishEntity {
  const isHigh = species.tier === "high";
  const isTool = species.tier === "tool";
  const x = isHigh ? rng.int(18, 82) : isTool ? rng.int(18, 82) : rng.int(9, 91);
  const edgeDirection: FishDirection = x < 42 ? 1 : x > 58 ? -1 : rng.chance(0.5) ? 1 : -1;
  const speciesBias: FishDirection =
    species.id.startsWith("shark") || species.id.startsWith("azure-dragon") || species.id.startsWith("vermilion") ? -1 : edgeDirection;
  const direction = rng.chance(species.tier === "tool" ? 0.5 : 0.76) ? edgeDirection : speciesBias;

  return {
    id: `${zone}-${species.id}-route-${index}-${Math.floor(rng.next() * 100000)}`,
    speciesId: species.id,
    name: species.name,
    tier: species.tier,
    zone,
    x,
    y: rng.int(18, 76),
    size: sizeFromSpecies(species, rng),
    direction,
    swimDistance: isHigh ? rng.int(12, 26) : isTool ? rng.int(22, 42) : rng.int(54, 118),
    swimDuration: isHigh ? rng.int(8200, 12200) : isTool ? rng.int(5200, 8600) : rng.int(6200, 11200),
    bobDuration: isHigh ? rng.int(4800, 7000) : isTool ? rng.int(2500, 3800) : rng.int(2200, 4100),
    swimDelay: rng.int(-4800, 0),
    bobDistance: isHigh ? rng.int(3, 7) : isTool ? rng.int(8, 14) : rng.int(6, 13),
    sway: rng.int(2, 8),
    multiplier: species.multiplier,
    catchRate: species.catchRate,
    color: species.color,
    eventType: species.eventType,
    eventMultiplier: 1,
    guaranteed: false,
    duplicated: false,
    affectedBy: [],
  };
}

function weightedSpecies(rng: Rng, species: FishSpecies[], weightMultiplier = 1) {
  return weightedPick(
    rng,
    species.map((fish) => ({ item: fish, weight: (fish.spawnWeight ?? 1) * weightMultiplier })),
  );
}

function pickEventRange(rng: Rng): 1 | 3 | 5 {
  return weightedPick(rng, GAME_CONFIG.eventRangeWeights.map((item) => ({ item: item.range as 1 | 3 | 5, weight: item.weight })));
}

function pickEventType(rng: Rng, routeId: RouteId, lastByType: Record<EventType, number>, zone: number): EventType {
  const route = getRouteDefinition(routeId);
  const types = GAME_CONFIG.eventTypeWeights.map((entry) => entry.type as EventType);
  const allowedTypes = types.filter((type) => zone - (lastByType[type] ?? -99) >= 4);
  const allowed = allowedTypes.length > 0 ? allowedTypes : types;
  return weightedPick(
    rng,
    GAME_CONFIG.eventTypeWeights
      .filter((entry) => allowed.includes(entry.type as EventType))
      .map((entry) => ({
        item: entry.type as EventType,
        weight: entry.weight * route.tuning.eventTypeWeight[entry.type as EventType],
      })),
  );
}

function canScheduleRandomEvent(params: {
  zone: number;
  range: 1 | 3 | 5;
  lastEventZone: number;
  lastLargeRangeZone: number;
  normalFishCount: number;
}) {
  if (params.zone === 1 || params.zone < 3) return false;
  if (params.normalFishCount === 0) return false;
  if (params.zone - params.lastEventZone < 3) return false;
  if (params.range === 5 && params.zone - params.lastLargeRangeZone < 10) return false;
  return true;
}

function routeDemoEvent(scenario: ScenarioId, zone: number): EventType | undefined {
  if (scenario === "route-school") return ({ 18: "twin", 22: "twin" } as Record<number, EventType>)[zone];
  if (scenario === "route-golden") return ({ 55: "pearl", 61: "pearl" } as Record<number, EventType>)[zone];
  if (scenario === "route-storm") return ({ 80: "thunder", 84: "puffer", 88: "puffer" } as Record<number, EventType>)[zone];
  return undefined;
}

function routeDemoRange(scenario: ScenarioId, zone: number): 1 | 3 | 5 | undefined {
  if (scenario === "route-school") return ({ 18: 3, 22: 3 } as Record<number, 1 | 3 | 5>)[zone];
  if (scenario === "route-golden") return ({ 55: 3, 61: 5 } as Record<number, 1 | 3 | 5>)[zone];
  if (scenario === "route-storm") return ({ 80: 3, 84: 5, 88: 3 } as Record<number, 1 | 3 | 5>)[zone];
  return undefined;
}

function routeDemoHighFish(scenario: ScenarioId, zone: number, rng: Rng) {
  if (scenario === "route-golden" && [54, 58, 62].includes(zone)) {
    return weightedPick(rng, [
      { item: highFish.find((fish) => fish.id === "white-tiger-30x")!, weight: 12 },
      { item: highFish.find((fish) => fish.id === "azure-dragon")!, weight: 8 },
      { item: highFish.find((fish) => fish.id === "vermilion")!, weight: 18 },
    ]);
  }
  if (scenario === "route-storm" && [79, 83, 87].includes(zone)) {
    return weightedPick(rng, [
      { item: highFish.find((fish) => fish.id === "azure-dragon")!, weight: 8 },
      { item: highFish.find((fish) => fish.id === "white-tiger-30x")!, weight: 12 },
      { item: highFish.find((fish) => fish.id === "vermilion")!, weight: 16 },
    ]);
  }
  return null;
}

function addEventFish(params: {
  fish: FishEntity[];
  type: EventType;
  zone: number;
  range: 1 | 3 | 5;
  rng: Rng;
  index: number;
  spawnChance: number;
  triggerRoll: number;
}) {
  const species = toolFish.find((item) => item.eventType === params.type)!;
  params.fish.push({
    ...fishFromSpecies(species, params.zone, params.rng, params.index),
    x: params.rng.int(24, 76),
    y: params.rng.int(16, 42),
    size: 104,
    eventSpawnChance: params.spawnChance,
    eventTriggerRoll: params.triggerRoll,
    eventRange: params.range,
  });
}

export function generateSegmentZones(params: {
  scenario: ScenarioId;
  seed: number;
  routeId: RouteId;
  startZone: number;
  endZone: number;
}): DepthZone[] {
  const route = getRouteDefinition(params.routeId);
  const rng = createRng(params.seed + params.startZone * 137 + params.endZone * 509);
  const zones: DepthZone[] = [];
  let lastEventZone = -99;
  let lastLargeRangeZone = -99;
  let zonesSinceTriggeredEvent = 0;
  const lastByType: Record<EventType, number> = { twin: -99, pearl: -99, puffer: -99, thunder: -99 };

  for (let zone = params.startZone; zone <= params.endZone; zone += 1) {
    const fish: FishEntity[] = [];
    const baseFishCount = GAME_CONFIG.rtpModel.normalFishPerZone * route.tuning.generalFishCountMultiplier;
    const normalCount = clamp(Math.floor(baseFishCount) + (rng.chance(baseFishCount % 1) ? 1 : 0), 1, 5);

    for (let index = 0; index < normalCount; index += 1) {
      fish.push(fishFromSpecies(weightedSpecies(rng, lowFish, route.tuning.lowValueWeightMultiplier), zone, rng, index));
    }

    const forcedHigh = routeDemoHighFish(params.scenario, zone, rng);
    const highChance = clamp(GAME_CONFIG.rtpModel.highCategoryRate * route.tuning.highValueWeightMultiplier, 0.03, 0.24);
    if (forcedHigh || rng.chance(highChance)) {
      fish.push(fishFromSpecies(forcedHigh ?? weightedSpecies(rng, highFish, route.tuning.highValueWeightMultiplier), zone, rng, normalCount));
    }

    const forcedType = routeDemoEvent(params.scenario, zone);
    const forcedRange = routeDemoRange(params.scenario, zone);
    if (forcedType && forcedRange) {
      addEventFish({ fish, type: forcedType, zone, range: forcedRange, rng, index: 9, spawnChance: 1, triggerRoll: 0.01 });
      lastEventZone = zone;
      lastByType[forcedType] = zone;
      if (forcedRange === 5) lastLargeRangeZone = zone;
      zonesSinceTriggeredEvent = 0;
    } else {
      const baseChance = eventSpawnChance(zone);
      const pityChance = zonesSinceTriggeredEvent >= 9 ? Math.min(0.25, baseChance + 0.1) : baseChance;
      const range = pickEventRange(rng);
      if (
        canScheduleRandomEvent({ zone, range, lastEventZone, lastLargeRangeZone, normalFishCount: fish.length }) &&
        rng.chance(pityChance)
      ) {
        const type = pickEventType(rng, params.routeId, lastByType, zone);
        const triggerRoll = rng.next();
        addEventFish({ fish, type, zone, range, rng, index: 9, spawnChance: pityChance, triggerRoll });
        lastEventZone = zone;
        lastByType[type] = zone;
        if (range === 5) lastLargeRangeZone = zone;
        zonesSinceTriggeredEvent = triggerRoll <= GAME_CONFIG.eventTriggerRate ? 0 : zonesSinceTriggeredEvent + 1;
      } else {
        zonesSinceTriggeredEvent += 1;
      }
    }

    zones.push({ id: zone, depth: zone * GAME_CONFIG.metersPerZone, fish });
  }

  return zones;
}

export function replaceSegmentZones(zones: DepthZone[], segmentZones: DepthZone[]) {
  const replacements = new Map(segmentZones.map((zone) => [zone.id, zone]));
  return zones.map((zone) => replacements.get(zone.id) ?? zone);
}
