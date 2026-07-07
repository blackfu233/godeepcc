import { FISH_SPECIES, GAME_CONFIG } from "../config/gameConfig";
import type { DepthZone, EventType, FishDirection, FishEntity, FishSpecies, GameRun, ScenarioId } from "../types/game";
import { createRng, type Rng, weightedPick } from "./random";

const lowFish = FISH_SPECIES.filter((fish) => fish.tier === "low");
const highFish = FISH_SPECIES.filter((fish) => fish.tier === "high");
const toolFish = FISH_SPECIES.filter((fish) => fish.tier === "tool");

function eventSpawnChance(zone: number) {
  return GAME_CONFIG.eventSpawnChances.find((band) => zone >= band.from && zone <= band.to)?.chance ?? 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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
    id: `${zone}-${species.id}-${index}-${Math.floor(rng.next() * 100000)}`,
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

function weightedSpecies(rng: Rng, species: FishSpecies[]) {
  return weightedPick(
    rng,
    species.map((fish) => ({ item: fish, weight: fish.spawnWeight ?? 1 })),
  );
}

function pickLowFish(rng: Rng) {
  return weightedSpecies(rng, lowFish);
}

function pickHighFish(rng: Rng) {
  return weightedSpecies(rng, highFish);
}

function forcedEvent(scenario: ScenarioId, zone: number): EventType | undefined {
  if (scenario === "event-chain") {
    return ({ 28: "twin", 32: "pearl", 36: "puffer", 40: "thunder" } as Record<number, EventType>)[zone];
  }
  if (scenario === "big-win") {
    return ({ 82: "pearl", 86: "puffer", 90: "thunder" } as Record<number, EventType>)[zone];
  }
  if (scenario === "normal") {
    return ({ 14: "pearl" } as Record<number, EventType>)[zone];
  }
  return undefined;
}

function forcedRange(scenario: ScenarioId, zone: number): 1 | 3 | 5 | undefined {
  if (scenario === "event-chain") {
    return ({ 28: 3, 32: 3, 36: 5, 40: 3 } as Record<number, 1 | 3 | 5>)[zone];
  }
  if (scenario === "big-win") {
    return ({ 82: 5, 86: 5, 90: 3 } as Record<number, 1 | 3 | 5>)[zone];
  }
  if (scenario === "normal") return 1;
  return undefined;
}

function forcedHighValueSpecies(scenario: ScenarioId, zone: number, rng: Rng) {
  if (scenario === "big-win" && zone >= 80) {
    return weightedPick(rng, [
      { item: highFish.find((fish) => fish.id === "azure-dragon-100x")!, weight: 8 },
      { item: highFish.find((fish) => fish.id === "azure-dragon-80x")!, weight: 12 },
      { item: highFish.find((fish) => fish.id === "azure-dragon")!, weight: 22 },
      { item: highFish.find((fish) => fish.id === "white-tiger-30x")!, weight: 24 },
      { item: highFish.find((fish) => fish.id === "vermilion")!, weight: 34 },
    ]);
  }
  return pickHighFish(rng);
}

function pickEventType(rng: Rng, lastByType: Record<EventType, number>, zone: number): EventType {
  const types = GAME_CONFIG.eventTypeWeights.map((entry) => entry.type as EventType);
  const candidates = types
    .filter((type) => zone - (lastByType[type] ?? -99) >= 4);
  const allowed = candidates.length > 0 ? candidates : types;
  return weightedPick(
    rng,
    GAME_CONFIG.eventTypeWeights
      .filter((entry) => allowed.includes(entry.type as EventType))
      .map((entry) => ({ item: entry.type as EventType, weight: entry.weight })),
  );
}

function pickEventRange(rng: Rng): 1 | 3 | 5 {
  return weightedPick(rng, GAME_CONFIG.eventRangeWeights.map((item) => ({ item: item.range as 1 | 3 | 5, weight: item.weight })));
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

export function generateRun(scenario: ScenarioId, seed: number): GameRun {
  const rng = createRng(seed);
  const zones: DepthZone[] = [];
  let lastEventZone = -99;
  let lastLargeRangeZone = -99;
  let zonesSinceTriggeredEvent = 0;
  const lastByType: Record<EventType, number> = { twin: -99, pearl: -99, puffer: -99, thunder: -99 };

  for (let zone = 1; zone <= GAME_CONFIG.maxZones; zone += 1) {
    const fish: FishEntity[] = [];

    for (let index = 0; index < GAME_CONFIG.rtpModel.normalFishPerZone; index += 1) {
      fish.push(fishFromSpecies(pickLowFish(rng), zone, rng, index));
    }

    const shouldAddHighFish =
      (scenario === "big-win" && zone >= 80) ||
      (scenario === "event-chain" && zone >= 28 && zone % 4 === 0) ||
      (scenario === "normal" && zone >= 12 && zone <= 18 && zone % 3 === 0) ||
      rng.chance(GAME_CONFIG.rtpModel.highCategoryRate);
    if (shouldAddHighFish) {
      fish.push(fishFromSpecies(forcedHighValueSpecies(scenario, zone, rng), zone, rng, GAME_CONFIG.rtpModel.normalFishPerZone));
    }

    const forcedType = forcedEvent(scenario, zone);
    const forcedEventRange = forcedRange(scenario, zone);
    if (forcedType && forcedEventRange) {
      addEventFish({ fish, type: forcedType, zone, range: forcedEventRange, rng, index: 9, spawnChance: 1, triggerRoll: 0.01 });
      lastEventZone = zone;
      lastByType[forcedType] = zone;
      if (forcedEventRange === 5) lastLargeRangeZone = zone;
      zonesSinceTriggeredEvent = 0;
    } else if (scenario === "random") {
      const baseChance = eventSpawnChance(zone);
      const pityChance = zonesSinceTriggeredEvent >= 9 ? Math.min(0.25, baseChance + 0.1) : baseChance;
      const range = pickEventRange(rng);
      if (
        canScheduleRandomEvent({ zone, range, lastEventZone, lastLargeRangeZone, normalFishCount: fish.length }) &&
        rng.chance(pityChance)
      ) {
        const type = pickEventType(rng, lastByType, zone);
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

  return { seed, scenario, zones };
}
