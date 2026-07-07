import type { FishEntity, PullFishVisualState, PullUpPhase, PullUpPlan, PullUpPlanItem } from "../types/game";

export function getPullActiveItem(plan: PullUpPlan, elapsed: number): PullUpPlanItem | null {
  if (elapsed < plan.routeStartMs || elapsed >= plan.routeEndMs) return null;
  return plan.items.find((item) => elapsed >= item.startMs && elapsed < item.startMs + item.durationMs) ?? null;
}

export function getPullFocusItem(plan: PullUpPlan, elapsed: number): PullUpPlanItem | null {
  if (elapsed < plan.routeStartMs || elapsed >= plan.routeEndMs) return null;
  return getPullActiveItem(plan, elapsed) ?? plan.items.find((item) => elapsed < item.startMs) ?? null;
}

export function getPullPhase(plan: PullUpPlan, elapsed: number, activeItem = getPullActiveItem(plan, elapsed)): PullUpPhase {
  if (elapsed < plan.introMs) return "cameraSetup";
  if (elapsed < plan.routeStartMs) return "vortexBuild";
  if (elapsed >= plan.routeEndMs) return "finish";
  if (activeItem?.fish.tier === "high") return "highFishChallenge";
  if (activeItem?.fish.tier === "low") return "lowFishCollect";
  return "routeSweep";
}

export function getItemProgress(item: PullUpPlanItem, elapsed: number) {
  return Math.max(0, Math.min(1, (elapsed - item.startMs) / item.durationMs));
}

export function getRouteProgress(plan: PullUpPlan, elapsed: number) {
  return Math.max(0, Math.min(1, (elapsed - plan.routeStartMs) / Math.max(1, plan.routeEndMs - plan.routeStartMs)));
}

export function findPullItem(plan: PullUpPlan | null, fish: FishEntity): PullUpPlanItem | null {
  if (!plan) return null;
  return plan.items.find((item) => item.fish.id === fish.id) ?? null;
}

export function getFishPullState(params: {
  plan: PullUpPlan | null;
  elapsed: number;
  fish: FishEntity;
}): PullFishVisualState {
  const { plan, elapsed, fish } = params;
  if (!plan) return "swimming";
  if (fish.tier === "tool") return "exited";

  const item = findPullItem(plan, fish);
  if (!item || elapsed < plan.routeStartMs || elapsed < item.startMs) return "swimming";

  const progress = getItemProgress(item, elapsed);
  if (elapsed >= item.startMs + item.durationMs) {
    if (item.caught) return "hooked";
    return "escaped";
  }

  if (item.fish.tier === "high") {
    if (progress < 0.72) return "struggling";
    return item.caught ? "hooked" : "escaped";
  }

  if (!item.caught) return progress < 0.42 ? "disturbed" : "escaped";
  if (progress < 0.32) return "disturbed";
  if (progress < 0.76) return "vortexHeld";
  return "hooked";
}

export function getSettledCatchValue(plan: PullUpPlan, elapsed: number) {
  return plan.items
    .filter((item) => item.caught && elapsed >= item.startMs + item.durationMs * 0.88)
    .reduce((sum, item) => sum + item.value, 0);
}

export function getSettledCatchCount(plan: PullUpPlan, elapsed: number) {
  return plan.items.filter((item) => item.caught && elapsed >= item.startMs + item.durationMs * 0.88).length;
}

export function getCurrentProcessingZone(plan: PullUpPlan, elapsed: number) {
  const activeItem = getPullActiveItem(plan, elapsed);
  if (activeItem) return activeItem.zone;
  const focusItem = getPullFocusItem(plan, elapsed);
  if (focusItem) return focusItem.zone;
  if (elapsed >= plan.routeEndMs) return 1;
  return plan.deepestZone;
}

export function getPendingHighValueCount(plan: PullUpPlan, elapsed: number) {
  return plan.items.filter((item) => item.fish.tier === "high" && elapsed < item.startMs + item.durationMs).length;
}
