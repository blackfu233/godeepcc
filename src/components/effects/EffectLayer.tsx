import type { EventLog, PullResult, PullUpPhase, PullUpPlan, ThunderState } from "../../types/game";
import type { PerformanceMode } from "../../performance/performanceConfig";
import { PERFORMANCE_CONFIG } from "../../performance/performanceConfig";
import { getItemProgress, getPullActiveItem } from "../../utils/pullUpRuntime";
import { ScreenSpriteEffect } from "./ScreenSpriteEffect";
import { WorldSpriteEffect } from "./WorldSpriteEffect";

interface EffectLayerProps {
  activeEvent: EventLog | null;
  thunder: ThunderState | null;
  pulling: boolean;
  pullPhase: PullUpPhase;
  pullPlan: PullUpPlan | null;
  pullElapsed: number;
  result: PullResult | null;
  performanceMode: PerformanceMode;
}

function eventPosition(event: EventLog) {
  const y = event.range >= 5 ? 50 : event.type === "thunder" ? 38 : 47;
  const x = event.type === "twin" ? 44 : event.type === "pearl" ? 58 : event.type === "puffer" ? 52 : 50;
  return { x, y };
}

function eventAnimation(event: EventLog) {
  if (event.type === "puffer") return "pufferBombExplosion" as const;
  if (event.type === "thunder") return "thunderJellyStrike" as const;
  if (event.type === "pearl") return "goldenPearlMultiplier" as const;
  return "twinFishCopy" as const;
}

export function EffectLayer({ activeEvent, thunder, pulling, pullPhase, pullPlan, pullElapsed, result, performanceMode }: EffectLayerProps) {
  const activePullItem = pulling && pullPlan ? getPullActiveItem(pullPlan, pullElapsed) : null;
  const pullProgress = activePullItem ? getItemProgress(activePullItem, pullElapsed) : 0;
  const showCatchSplash = activePullItem?.caught && pullProgress > 0.76 && pullProgress < 0.96;
  const showVortex = false;
  const eventSpot = activeEvent ? eventPosition(activeEvent) : null;
  const eventScale = activeEvent ? (activeEvent.range >= 5 ? 1.05 : activeEvent.range >= 3 ? 0.86 : 0.68) : 1;
  const thunderAttachOnly = activeEvent?.type === "thunder" && activeEvent.range === 0;
  const fpsMultiplier = PERFORMANCE_CONFIG[performanceMode].spriteFpsMultiplier;
  const effectScaleAdjust = performanceMode === "low" ? 0.78 : performanceMode === "medium" ? 0.9 : 1;
  const allowResultBurst = performanceMode !== "low" || (result?.totalWin ?? 0) >= (result?.totalBet ?? 1) * 10;

  return (
    <div className={["sprite-effect-layer", `sprite-effects-${performanceMode}`].join(" ")} aria-hidden="true">
      {activeEvent && eventSpot && !thunderAttachOnly && (
        <WorldSpriteEffect
          key={activeEvent.id}
          animationKey={eventAnimation(activeEvent)}
          x={eventSpot.x}
          y={eventSpot.y}
          scale={(activeEvent.type === "thunder" ? 0.66 : eventScale) * effectScaleAdjust}
          opacity={activeEvent.triggered ? (performanceMode === "low" ? 0.72 : 0.98) : 0.46}
          zIndex={activeEvent.type === "thunder" ? 8 : 9}
          fpsMultiplier={fpsMultiplier}
          className={`event-sprite event-sprite-${activeEvent.type}`}
        />
      )}
      {thunder && null}
      {showVortex && null}
      {showCatchSplash && activePullItem && (
        <WorldSpriteEffect
          key={`catch-${activePullItem.id}-${Math.floor(pullElapsed / 120)}`}
          animationKey="catchSplash"
          x={52 + Math.sin(activePullItem.routeBend) * 10}
          y={48}
          scale={0.48 * effectScaleAdjust}
          opacity={performanceMode === "low" ? 0.65 : 0.96}
          zIndex={16}
          fpsMultiplier={fpsMultiplier}
          className="catch-splash-sprite"
        />
      )}
      {result && allowResultBurst && <ScreenSpriteEffect animationKey="bigWinBurst" x={50} y={43} scale={0.74 * effectScaleAdjust} opacity={performanceMode === "low" ? 0.45 : 0.76} zIndex={40} fpsMultiplier={fpsMultiplier} className="result-burst-sprite" />}
    </div>
  );
}
