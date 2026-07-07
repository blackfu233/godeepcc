import type { FishEntity, PullResult, PullResultFish, PullUpPlan, PullUpPlanItem } from "../types/game";
import { GAME_CONFIG } from "../config/gameConfig";
import { createRng } from "./random";

function resultLabel(multiplier: number) {
  const thresholds = GAME_CONFIG.demoResultThresholds;
  if (multiplier >= thresholds.ultimate) return "ULTIMATE WIN";
  if (multiplier >= thresholds.ultra) return "ULTRA WIN";
  if (multiplier >= thresholds.super) return "SUPER WIN";
  if (multiplier >= thresholds.mega) return "MEGA WIN";
  if (multiplier >= thresholds.big) return "BIG WIN";
  return "EXPEDITION COMPLETE";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function createPullUpPlan(params: {
  zonesFish: FishEntity[];
  baseBet: number;
  totalBet: number;
  seed: number;
  deepestZone: number;
}): PullUpPlan {
  const rng = createRng(params.seed);
  const introMs = 760;
  const buildMs = 820;
  const finishMs = 680;
  const routeStartMs = introMs + buildMs;
  const sweepLeadMs = 340;
  const itemGapMs = 70;

  const candidates = params.zonesFish
    .filter((fish) => fish.tier !== "tool")
    .sort((a, b) => b.zone - a.zone || b.multiplier - a.multiplier || a.id.localeCompare(b.id));

  const highCount = candidates.filter((fish) => fish.tier === "high").length;
  const lowCount = candidates.length - highCount;
  const targetTotalMs = params.deepestZone >= 18 ? 14500 : highCount >= 3 ? 11800 : highCount > 0 ? 9200 : 5600;
  const maxRouteMs = targetTotalMs - introMs - buildMs - finishMs;
  const routeWeight = Math.max(1, lowCount + highCount * 3.8);
  const unitMs = maxRouteMs / routeWeight;
  const lowDuration = Math.round(clamp(unitMs, 60, 145));
  const firstHighDuration = Math.round(clamp(unitMs * 4.4, 980, 1450));
  const secondHighDuration = Math.round(firstHighDuration * 0.82);
  const laterHighDuration = Math.round(clamp(unitMs * 1.85, 360, 620));
  let cursor = routeStartMs + sweepLeadMs;
  let highIndex = 0;

  const resultEntries: PullResultFish[] = [];
  const items: PullUpPlanItem[] = candidates.map((fish, index) => {
    const roll = rng.next();
    const caught = fish.guaranteed || roll <= fish.catchRate;
    const value = Math.round(fish.multiplier * fish.eventMultiplier * params.baseBet);
    const isHigh = fish.tier === "high";
    if (isHigh) highIndex += 1;
    const routeWave = Math.sin(index * 1.17 + params.seed * 0.013);
    const routeX = clamp(50 + routeWave * 28 + (rng.next() - 0.5) * 10, 16, 84);
    const durationMs = isHigh ? (highIndex === 1 ? firstHighDuration : highIndex === 2 ? secondHighDuration : laterHighDuration) : lowDuration;
    const item: PullUpPlanItem = {
      id: `pull-${fish.id}`,
      fish,
      zone: fish.zone,
      routeX,
      routeBend: Math.round(routeWave * 34),
      startMs: cursor,
      durationMs,
      caught,
      value: caught ? value : 0,
      roll,
      visualState: caught ? "hooked" : "escaped",
      resolution: isHigh ? (caught ? "high-win" : "high-escape") : caught ? "low-caught" : "low-missed",
    };

    resultEntries.push({
      fish,
      value: caught ? value : 0,
      caught,
      roll,
      resolution: isHigh ? (caught ? "reel-win" : "reel-miss") : caught ? "auto-catch" : "reel-miss",
    });

    cursor += durationMs + itemGapMs;
    return item;
  });

  const caught = resultEntries.filter((entry) => entry.caught);
  const missed = resultEntries.filter((entry) => !entry.caught);
  const totalWin = caught.reduce((sum, entry) => sum + entry.value, 0);
  const winMultiplier = params.totalBet > 0 ? totalWin / params.totalBet : 0;
  const result: PullResult = {
    totalBet: params.totalBet,
    totalWin,
    winMultiplier,
    caught,
    missed,
    label: resultLabel(winMultiplier),
  };

  const routeEndMs = cursor;
  return {
    id: `pull-plan-${params.seed}-${params.deepestZone}`,
    seed: params.seed,
    deepestZone: params.deepestZone,
    introMs,
    buildMs,
    finishMs,
    totalMs: routeEndMs + finishMs,
    routeStartMs,
    routeEndMs,
    items,
    result,
  };
}
