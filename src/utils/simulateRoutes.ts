import { GAME_CONFIG } from "../config/gameConfig";
import { ROUTE_IDS } from "../config/routeDefinitions";
import type { DepthZone, EventLog, ScenarioId, ThunderState } from "../types/game";
import type { RouteId } from "../types/routes";
import { createPullUpPlan } from "./createPullUpPlan";
import { applyEvent, applyThunderStrike } from "./eventEngine";
import { generateSegmentZones } from "./generateSegmentZones";

export interface RouteSimulationStrategy {
  zonesAfterRoute: 8 | 16 | 25;
}

export interface RouteSimulationSummary {
  routeId: RouteId;
  zonesAfterRoute: number;
  runs: number;
  averageTotalBet: number;
  averageTotalWin: number;
  averageNetResult: number;
  averageWinToBet: number;
  averageVisibleFish: number;
  averageVisibleHighFish: number;
  averageEvents: number;
  averageGuaranteedCatch: number;
  averagePearlX2: number;
  averagePearlX4: number;
  averagePearlX8: number;
  averagePearlX16: number;
  standardDeviation: number;
  p50: number;
  p90: number;
  p99: number;
  averagePullUpMs: number;
  averageHighValueCaught: number;
}

function percentile(values: number[], ratio: number) {
  if (values.length === 0) return 0;
  const index = Math.min(values.length - 1, Math.max(0, Math.floor((values.length - 1) * ratio)));
  return values[index];
}

function applyRouteEvents(params: {
  zones: DepthZone[];
  routeId: RouteId;
  pullZone: number;
  scenario: ScenarioId;
  seed: number;
}) {
  let zones = params.zones;
  let thunder: ThunderState | null = null;
  let eventCount = 0;
  let lastEvent: EventLog | null = null;

  for (let zoneId = 1; zoneId <= params.pullZone; zoneId += 1) {
    if (thunder) {
      const strike = applyThunderStrike({ zones, thunder, currentZone: zoneId, scenario: params.scenario, seed: params.seed });
      zones = strike.zones;
      thunder = strike.thunder;
      lastEvent = strike.log;
      eventCount += strike.log.targetIds.length > 0 ? 1 : 0;
    }

    const eventFish = zones[zoneId - 1]?.fish.find((fish) => fish.tier === "tool" && fish.eventType);
    if (!eventFish) continue;
    const eventResult = applyEvent({ zones, eventFish, scenario: params.scenario, seed: params.seed, extraBetActive: false });
    zones = eventResult.zones;
    thunder = eventResult.thunder ?? thunder;
    lastEvent = eventResult.log;
    eventCount += eventResult.log.triggered ? 1 : 0;
  }

  return { zones, thunder, eventCount, lastEvent };
}

export function simulateRoute(params: {
  routeId: RouteId;
  checkpointZone?: 25 | 50 | 75;
  zonesAfterRoute: 8 | 16 | 25;
  runs?: number;
  seed?: number;
}): RouteSimulationSummary {
  const runs = params.runs ?? 50000;
  const checkpointZone = params.checkpointZone ?? 25;
  const startZone = checkpointZone + 1;
  const endZone = checkpointZone + 25;
  const pullZone = Math.min(endZone, checkpointZone + params.zonesAfterRoute);
  const wins: number[] = [];
  let totalBetSum = 0;
  let totalWinSum = 0;
  let fishSum = 0;
  let highFishSum = 0;
  let eventSum = 0;
  let guaranteedSum = 0;
  let pearlX2 = 0;
  let pearlX4 = 0;
  let pearlX8 = 0;
  let pearlX16 = 0;
  let pullMsSum = 0;
  let highCaughtSum = 0;

  for (let index = 0; index < runs; index += 1) {
    const seed = (params.seed ?? 620000) + index * 17 + checkpointZone * 101;
    const segment = generateSegmentZones({
      scenario: "random",
      seed,
      routeId: params.routeId,
      startZone,
      endZone,
    });
    const shellZones: DepthZone[] = Array.from({ length: GAME_CONFIG.maxZones }, (_, zoneIndex) => ({
      id: zoneIndex + 1,
      depth: (zoneIndex + 1) * GAME_CONFIG.metersPerZone,
      fish: [],
    }));
    for (const zone of segment) shellZones[zone.id - 1] = zone;
    const eventState = applyRouteEvents({ zones: shellZones, routeId: params.routeId, pullZone, scenario: "random", seed });
    const passedFish = eventState.zones.filter((zone) => zone.id >= startZone && zone.id <= pullZone).flatMap((zone) => zone.fish);
    const normalFish = passedFish.filter((fish) => fish.tier !== "tool");
    const totalBet = params.zonesAfterRoute * GAME_CONFIG.defaultBet;
    const plan = createPullUpPlan({
      zonesFish: normalFish,
      baseBet: GAME_CONFIG.defaultBet,
      totalBet,
      seed: seed + pullZone * 1009,
      deepestZone: pullZone,
    });

    totalBetSum += totalBet;
    totalWinSum += plan.result.totalWin;
    fishSum += normalFish.length;
    highFishSum += normalFish.filter((fish) => fish.tier === "high").length;
    eventSum += eventState.eventCount;
    guaranteedSum += normalFish.filter((fish) => fish.guaranteed).length;
    pearlX2 += normalFish.filter((fish) => fish.eventMultiplier === 2).length;
    pearlX4 += normalFish.filter((fish) => fish.eventMultiplier === 4).length;
    pearlX8 += normalFish.filter((fish) => fish.eventMultiplier === 8).length;
    pearlX16 += normalFish.filter((fish) => fish.eventMultiplier >= 16).length;
    pullMsSum += plan.totalMs;
    highCaughtSum += plan.result.caught.filter((item) => item.fish.tier === "high").length;
    wins.push(plan.result.totalWin);
  }

  wins.sort((a, b) => a - b);
  const meanWin = totalWinSum / runs;
  const variance = wins.reduce((sum, win) => sum + (win - meanWin) ** 2, 0) / runs;
  const averageTotalBet = totalBetSum / runs;

  return {
    routeId: params.routeId,
    zonesAfterRoute: params.zonesAfterRoute,
    runs,
    averageTotalBet,
    averageTotalWin: meanWin,
    averageNetResult: meanWin - averageTotalBet,
    averageWinToBet: averageTotalBet > 0 ? meanWin / averageTotalBet : 0,
    averageVisibleFish: fishSum / runs,
    averageVisibleHighFish: highFishSum / runs,
    averageEvents: eventSum / runs,
    averageGuaranteedCatch: guaranteedSum / runs,
    averagePearlX2: pearlX2 / runs,
    averagePearlX4: pearlX4 / runs,
    averagePearlX8: pearlX8 / runs,
    averagePearlX16: pearlX16 / runs,
    standardDeviation: Math.sqrt(variance),
    p50: percentile(wins, 0.5),
    p90: percentile(wins, 0.9),
    p99: percentile(wins, 0.99),
    averagePullUpMs: pullMsSum / runs,
    averageHighValueCaught: highCaughtSum / runs,
  };
}

export function simulateAllRoutes(runs = 50000) {
  const strategies: RouteSimulationStrategy[] = [{ zonesAfterRoute: 8 }, { zonesAfterRoute: 16 }, { zonesAfterRoute: 25 }];
  return ROUTE_IDS.flatMap((routeId) =>
    strategies.map((strategy) => simulateRoute({ routeId, zonesAfterRoute: strategy.zonesAfterRoute, runs })),
  );
}
