import type { FishEntity, PullResult, PullResultFish } from "../types/game";
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

export function resolvePullUp(params: {
  zonesFish: FishEntity[];
  baseBet: number;
  totalBet: number;
  seed: number;
}): PullResult {
  const rng = createRng(params.seed);
  const results: PullResultFish[] = params.zonesFish
    .filter((fish) => fish.tier !== "tool")
    .sort((a, b) => b.zone - a.zone)
    .map((fish) => {
      const roll = rng.next();
      const caught = fish.guaranteed || roll <= fish.catchRate;
      const value = Math.round(fish.multiplier * fish.eventMultiplier * params.baseBet);
      const resolution = fish.tier === "low" ? "auto-catch" : caught ? "reel-win" : "reel-miss";
      return { fish, value: caught ? value : 0, caught, roll, resolution };
    });

  const caught = results.filter((entry) => entry.caught);
  const missed = results.filter((entry) => !entry.caught);
  const totalWin = caught.reduce((sum, entry) => sum + entry.value, 0);
  const winMultiplier = params.totalBet > 0 ? totalWin / params.totalBet : 0;

  return {
    totalBet: params.totalBet,
    totalWin,
    winMultiplier,
    caught,
    missed,
    label: resultLabel(winMultiplier),
  };
}
