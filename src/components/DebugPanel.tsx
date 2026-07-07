import type { DepthZone, EventLog, PullUpPhase, PullUpPlan, ThunderState } from "../types/game";
import type { HookAnomalyLog, HookAnomalyState } from "../types/hookAnomaly";
import type { ActiveRoute, RouteChoiceState } from "../types/routes";
import { resolveRouteBackground } from "../utils/routeBackgroundResolver";
import {
  getCurrentProcessingZone,
  getFishPullState,
  getPendingHighValueCount,
  getPullActiveItem,
  getRouteProgress,
  getSettledCatchCount,
} from "../utils/pullUpRuntime";

interface DebugPanelProps {
  visible: boolean;
  currentZone: number;
  zones: DepthZone[];
  thunder: ThunderState | null;
  seed: number;
  extraBet: boolean;
  nextWager: number;
  lastEvent: EventLog | null;
  activeRoute: ActiveRoute | null;
  routeChoice: RouteChoiceState | null;
  hookAnomaly: HookAnomalyState;
  hookEvent: HookAnomalyLog | null;
  repairCost: number;
  pullPhase: PullUpPhase;
  pullPlan: PullUpPlan | null;
  pullElapsed: number;
}

export function DebugPanel({
  visible,
  currentZone,
  zones,
  thunder,
  seed,
  extraBet,
  nextWager,
  lastEvent,
  activeRoute,
  routeChoice,
  hookAnomaly,
  hookEvent,
  repairCost,
  pullPhase,
  pullPlan,
  pullElapsed,
}: DebugPanelProps) {
  if (!visible) return null;
  const passedFish = zones
    .filter((zone) => zone.id <= currentZone)
    .flatMap((zone) => zone.fish)
    .filter((fish) => fish.tier !== "tool");
  const guaranteed = passedFish.filter((fish) => fish.guaranteed).length;
  const potentialMultiplier = passedFish.reduce((sum, fish) => sum + fish.multiplier * fish.eventMultiplier, 0);
  const activePullItem = pullPlan ? getPullActiveItem(pullPlan, pullElapsed) : null;
  const activePullFishState = activePullItem ? getFishPullState({ plan: pullPlan, elapsed: pullElapsed, fish: activePullItem.fish }) : "none";
  const pullZone = pullPlan ? getCurrentProcessingZone(pullPlan, pullElapsed) : null;
  const routeProgress = pullPlan ? getRouteProgress(pullPlan, pullElapsed) : 0;
  const caughtCount = pullPlan ? getSettledCatchCount(pullPlan, pullElapsed) : 0;
  const pendingHigh = pullPlan ? getPendingHighValueCount(pullPlan, pullElapsed) : 0;
  const routeBackground = resolveRouteBackground(activeRoute, currentZone);

  return (
    <aside className="debug-panel">
      <b>Debug Panel</b>
      <p>Seed: {seed}</p>
      <p>Depth Zone: {currentZone}</p>
      <p>Passed Fish: {passedFish.length}</p>
      <p>Guaranteed Catch: {guaranteed}</p>
      <p>Potential Multipliers: {potentialMultiplier.toFixed(1)}x</p>
      <p>Extra Bet: {extraBet ? `ON, next ${nextWager}` : `OFF, next ${nextWager}`}</p>
      <p>Event Trigger: {lastEvent ? `${lastEvent.title} ${lastEvent.triggered ? "hit" : "miss"} (${Math.round(lastEvent.triggerRate * 100)}%)` : "none"}</p>
      <p>Thunder: {thunder ? `${thunder.remaining} left, reach ${thunder.reach}` : "none"}</p>
      <p>isRouteChoicePending: {routeChoice ? "yes" : "no"}</p>
      <p>offeredRoutes: {routeChoice ? routeChoice.options.join(" / ") : "none"}</p>
      <p>Active Route: {activeRoute ? `${activeRoute.id} ${activeRoute.startZone}-${activeRoute.endZone}` : "none"}</p>
      <p>activeRouteStartZone: {activeRoute?.startZone ?? "none"}</p>
      <p>activeRouteEndZone: {activeRoute?.endZone ?? "none"}</p>
      <p>remainingRouteZones: {activeRoute ? Math.max(0, activeRoute.endZone - Math.max(currentZone, activeRoute.selectedAtZone)) : "none"}</p>
      <p>selectedBackgroundKey: {routeBackground?.selectedBackgroundKey ?? "none"}</p>
      <p>actual resolved asset paths: {routeBackground?.sourceAssetPath ?? "none"}</p>
      <p>fallback: {routeBackground?.fallbackUsed ? "yes" : "no"}</p>
      <hr />
      <p>Hook Cooldown: {hookAnomaly.cooldown}</p>
      <p>Hook Pity: {hookAnomaly.pity}</p>
      <p>Hook Final Chance: {(hookAnomaly.debug.finalChance * 100).toFixed(1)}%</p>
      <p>Hook Triggered: {hookAnomaly.debug.triggered ? "yes" : "no"}</p>
      <p>Hook Last Event: {hookAnomaly.debug.lastEventId ?? "none"}</p>
      <p>Hook Polarity: {hookAnomaly.debug.lastPolarity ?? "none"}</p>
      <p>Hook Rust: {hookAnomaly.rust}{hookAnomaly.broken ? " / broken" : ""}</p>
      <p>Hook Current Banner: {hookEvent ? hookEvent.title : "none"}</p>
      <p>Repair Cost: {repairCost}</p>
      <p>Persistent Hook Effects: {Object.values(hookAnomaly.persistent).filter(Boolean).map((effect) => `${effect.id} x${effect.remaining}`).join(", ") || "none"}</p>
      <p>Rare Signal: {hookAnomaly.rareSignal ? `Z${hookAnomaly.rareSignal.targetZone}, ${hookAnomaly.rareSignal.remaining} dives` : "none"}</p>
      <hr />
      <p>currentPullUpPhase: {pullPhase}</p>
      <p>currentZoneBeingProcessed: {pullZone ?? "none"}</p>
      <p>currentFishId: {activePullItem?.fish.id ?? "none"}</p>
      <p>fish runtime state: {activePullFishState}</p>
      <p>vortex path progress: {(routeProgress * 100).toFixed(1)}%</p>
      <p>caught count: {caughtCount}</p>
      <p>pending high value fish count: {pendingHigh}</p>
    </aside>
  );
}
