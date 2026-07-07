import { GAME_CONFIG } from "../config/gameConfig";
import type { DepthZone, EventLog, EventType, FishEntity, ScenarioId, ThunderState } from "../types/game";
import { createRng, type Rng, weightedPick } from "./random";

const eventNames: Record<EventType, string> = {
  twin: "Twin Fish",
  pearl: "Golden Pearl",
  puffer: "Puffer Bomb",
  thunder: "Thunder Jellyfish",
};

export function copyZones(zones: DepthZone[]): DepthZone[] {
  return zones.map((zone) => ({
    ...zone,
    fish: zone.fish.map((fish) => ({
      ...fish,
      affectedBy: [...fish.affectedBy],
      ...(fish.hookEffects ? { hookEffects: [...fish.hookEffects] } : {}),
    })),
  }));
}

export function normalFishInZone(zone: DepthZone) {
  return zone.fish.filter((fish) => fish.tier !== "tool");
}

export function centeredZoneIds(centerZone: number, range: number) {
  const radius = Math.floor(range / 2);
  const start = Math.max(1, centerZone - radius);
  const end = Math.min(GAME_CONFIG.maxZones, centerZone + radius);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function selectEventTargetZoneIds(eventZone: number, range: number) {
  if (GAME_CONFIG.eventTargetSelector === "visible-window") {
    return centeredZoneIds(eventZone, range);
  }
  return centeredZoneIds(eventZone, range);
}

export function forcedRange(scenario: ScenarioId, type: EventType) {
  if (scenario === "event-chain") {
    if (type === "twin") return 5;
    if (type === "pearl") return 3;
    if (type === "puffer") return 5;
  }
  if (scenario === "big-win" && (type === "pearl" || type === "puffer")) {
    return 5;
  }
  return undefined;
}

function updateAffected(fish: FishEntity, type: EventType) {
  if (!fish.affectedBy.includes(type)) {
    fish.affectedBy.push(type);
  }
}

function eventTriggerRate(scenario: ScenarioId, extraBetActive: boolean) {
  if (extraBetActive) return GAME_CONFIG.extraBet.eventTriggerRate;
  if (scenario === "event-chain" || scenario === "big-win") return 1;
  return GAME_CONFIG.eventTriggerRate;
}

function weightedThunderDuration(rng: Rng) {
  return weightedPick(
    rng,
    GAME_CONFIG.thunderDurationWeights.map((item) => ({ item: item.duration, weight: item.weight })),
  );
}

function weightedEventRange(rng: Rng) {
  return weightedPick(
    rng,
    GAME_CONFIG.eventRangeWeights.map((item) => ({ item: item.range as 1 | 3 | 5, weight: item.weight })),
  );
}

function weightedThunderReach(rng: Rng) {
  return weightedPick(
    rng,
    GAME_CONFIG.thunderReachWeights.map((item) => ({ item: item.reach, weight: item.weight })),
  );
}

export function applyEvent(params: {
  zones: DepthZone[];
  eventFish: FishEntity;
  scenario: ScenarioId;
  seed: number;
  extraBetActive: boolean;
}): { zones: DepthZone[]; log: EventLog; thunder: ThunderState | null } {
  const { eventFish, scenario, seed, extraBetActive } = params;
  const zones = copyZones(params.zones);
  const rng = createRng(seed + eventFish.zone * 113 + eventFish.id.length + (extraBetActive ? 7777 : 0));
  const type = eventFish.eventType!;
  const triggerRate = eventTriggerRate(scenario, extraBetActive);
  const roll = eventFish.eventTriggerRoll ?? rng.next();
  const triggered = roll <= triggerRate;
  const range = type === "thunder" ? 0 : eventFish.eventRange ?? forcedRange(scenario, type) ?? weightedEventRange(rng);
  const targetZoneIds = type === "thunder" ? [eventFish.zone] : selectEventTargetZoneIds(eventFish.zone, range);
  const targetIds: string[] = [];
  let message = "";
  let thunder: ThunderState | null = null;

  if (!triggered) {
    return {
      zones,
      thunder,
      log: {
        id: `${eventFish.id}-${eventFish.zone}-${type}-miss`,
        type,
        zone: eventFish.zone,
        title: `${eventNames[type]} Dormant`,
        message: `Trigger roll ${(roll * 100).toFixed(0)} / ${(triggerRate * 100).toFixed(0)}. No effect this time.`,
        targetIds: [eventFish.id],
        targetZoneIds: [eventFish.zone],
        range,
        triggered,
        triggerRate,
        roll,
      },
    };
  }

  targetIds.push(eventFish.id);

  if (type === "twin") {
    for (const zoneId of targetZoneIds) {
      const zone = zones[zoneId - 1];
      const originals = normalFishInZone(zone);
      const clones = originals.map((fish, index) => {
        updateAffected(fish, "twin");
        targetIds.push(fish.id);
        const side = index % 2 === 0 ? 1 : -1;
        const clone = {
          ...fish,
          id: `${fish.id}-twin-${index}`,
          x: Math.min(92, Math.max(8, fish.x + side * rng.int(12, 18))),
          y: Math.min(88, Math.max(12, fish.y + rng.int(-12, 12))),
          direction: (fish.direction * -1) as FishEntity["direction"],
          swimDelay: fish.swimDelay - 800,
          duplicated: true,
          cloneOf: fish.id,
          affectedBy: [...fish.affectedBy, "twin" as EventType],
        };
        targetIds.push(clone.id);
        return clone;
      });
      zone.fish.push(...clones);
    }
    message = `Copied non-tool fish in zones ${targetZoneIds.join(", ")}.`;
  }

  if (type === "pearl") {
    for (const zoneId of targetZoneIds) {
      for (const fish of normalFishInZone(zones[zoneId - 1])) {
        fish.eventMultiplier = Math.min(16, fish.eventMultiplier * 2);
        updateAffected(fish, "pearl");
        targetIds.push(fish.id);
      }
    }
    message = `Granted x2 payout in zones ${targetZoneIds.join(", ")}, up to x16.`;
  }

  if (type === "puffer") {
    for (const zoneId of targetZoneIds) {
      for (const fish of normalFishInZone(zones[zoneId - 1])) {
        fish.guaranteed = true;
        updateAffected(fish, "puffer");
        targetIds.push(fish.id);
      }
    }
    message = `Locked Guaranteed Catch in zones ${targetZoneIds.join(", ")}.`;
  }

  if (type === "thunder") {
    zones[eventFish.zone - 1].fish = zones[eventFish.zone - 1].fish.filter((fish) => fish.id !== eventFish.id);
    thunder = {
      remaining: scenario === "big-win" ? 4 : weightedThunderDuration(rng),
      reach: scenario === "big-win" ? 4 : weightedThunderReach(rng),
      sourceZone: eventFish.zone,
    };
    targetIds.push(eventFish.id);
    message = `Charged the hook for the next ${thunder.remaining} dives, striking ${thunder.reach} zones below each new depth.`;
  }

  return {
    zones,
    thunder,
    log: {
      id: `${eventFish.id}-${eventFish.zone}-${type}`,
      type,
      zone: eventFish.zone,
      title: eventNames[type],
      message,
      targetIds,
      targetZoneIds,
      range,
      triggered,
      triggerRate,
      roll,
    },
  };
}

export function applyThunderStrike(params: {
  zones: DepthZone[];
  thunder: ThunderState;
  currentZone: number;
  scenario: ScenarioId;
  seed: number;
}): { zones: DepthZone[]; log: EventLog; thunder: ThunderState | null } {
  const zones = copyZones(params.zones);
  const rng = createRng(params.seed + params.currentZone * 907 + params.thunder.remaining * 59);
  const targetIds: string[] = [];
  const targetZoneIds: number[] = [];

  for (
    let zoneId = params.currentZone + 1;
    zoneId <= params.currentZone + params.thunder.reach && zoneId <= GAME_CONFIG.maxZones;
    zoneId += 1
  ) {
    targetZoneIds.push(zoneId);
    for (const fish of normalFishInZone(zones[zoneId - 1])) {
      if (rng.chance(GAME_CONFIG.thunderGuaranteedRate)) {
        fish.guaranteed = true;
        updateAffected(fish, "thunder");
        targetIds.push(fish.id);
      }
    }
  }

  const remaining = params.thunder.remaining - 1;
  return {
    zones,
    thunder: remaining > 0 ? { ...params.thunder, remaining } : null,
    log: {
      id: `thunder-${params.currentZone}-${params.thunder.remaining}`,
      type: "thunder",
      zone: params.currentZone,
      title: "Thunder Strike",
      message: `Jelly x${remaining}. Struck ${targetIds.length} fish below the hook.`,
      targetIds,
      targetZoneIds,
      range: params.thunder.reach,
      triggered: true,
      triggerRate: 1,
      roll: 0,
    },
  };
}

export function mergeEventLogs(baseLog: EventLog, strikeLog: EventLog): EventLog {
  return {
    ...baseLog,
    message: `${baseLog.message} ${strikeLog.message}`,
    targetIds: Array.from(new Set([...baseLog.targetIds, ...strikeLog.targetIds])),
    targetZoneIds: Array.from(new Set([...baseLog.targetZoneIds, ...strikeLog.targetZoneIds])).sort((a, b) => a - b),
    range: Math.max(baseLog.range, strikeLog.range),
    triggered: baseLog.triggered || strikeLog.triggered,
    triggerRate: Math.max(baseLog.triggerRate, strikeLog.triggerRate),
    roll: baseLog.roll,
  };
}
