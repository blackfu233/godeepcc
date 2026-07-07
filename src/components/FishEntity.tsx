import type { FishEntity as FishEntityType, PullFishVisualState, PullUpPlanItem } from "../types/game";
import { FishArt } from "./FishArt";

interface FishEntityProps {
  fish: FishEntityType;
  highlighted: boolean;
  pulling?: boolean;
  pullPhase?: string;
  pullState?: PullFishVisualState;
  pullItem?: PullUpPlanItem | null;
  pullProgress?: number;
  activePull?: boolean;
}

export function FishEntity({
  fish,
  highlighted,
  pulling = false,
  pullPhase = "idle",
  pullState = "swimming",
  pullItem = null,
  pullProgress = 0,
  activePull = false,
}: FishEntityProps) {
  const displayX = pulling ? fish.x : Math.min(84, Math.max(16, fish.x));
  const displayY = pulling ? fish.y : Math.min(76, Math.max(14, fish.y));
  const edgeRoomPx = Math.min(displayX - 8, 92 - displayX) * 4.2;
  const swimDistance = pulling ? fish.swimDistance : Math.min(fish.swimDistance, Math.max(8, edgeRoomPx - fish.size * 0.45));
  const routeX = pullItem?.routeX ?? 50;
  const routeBend = pullItem?.routeBend ?? 0;
  const ringSide = displayX < routeX ? -1 : 1;
  const ringOffset = fish.tier === "high" ? 4 : 10;
  const heldX = routeX + ringSide * ringOffset;
  const heldY = fish.tier === "high" ? 47 : 58;
  const pullTowardX = (heldX - displayX) * (fish.tier === "high" ? 4.7 : 4.05) + routeBend * 0.18;
  const stageY = fish.tier === "high" ? 166 : 238;
  const pullTowardY = stageY + (heldY - displayY) * 0.45;
  const hookX = (50 - displayX) * 4.1 + routeBend * 0.12;
  const hookY = fish.tier === "high" ? -166 - displayY * 0.46 : -118 - displayY * 0.38;
  const escapeX = fish.direction * 220 + routeBend;
  const escapeY = -36 - (displayY % 18);
  const style = {
    left: `${displayX}%`,
    top: `${displayY}%`,
    width: `${fish.size}px`,
    color: fish.color,
    "--dir": fish.direction,
    "--swim": `${swimDistance}px`,
    "--swim-start": `${swimDistance * -0.62 * fish.direction}px`,
    "--swim-end": `${swimDistance * 0.62 * fish.direction}px`,
    "--glide-start": `${swimDistance * -0.42 * fish.direction}px`,
    "--glide-end": `${swimDistance * 0.42 * fish.direction}px`,
    "--drift-start": `${swimDistance * -0.48 * fish.direction}px`,
    "--drift-end": `${swimDistance * 0.48 * fish.direction}px`,
    "--duration": `${fish.swimDuration}ms`,
    "--bob-duration": `${fish.bobDuration}ms`,
    "--delay": `${fish.swimDelay}ms`,
    "--bob": `${fish.bobDistance}px`,
    "--sway": `${fish.sway}deg`,
    "--pull-exit": `${fish.direction * 220}px`,
    "--pull-tug-x": `${pullTowardX}px`,
    "--pull-tug-y": `${pullTowardY}px`,
    "--pull-hook-x": `${hookX}px`,
    "--pull-hook-y": `${hookY}px`,
    "--pull-escape-x": `${escapeX}px`,
    "--pull-escape-y": `${escapeY}px`,
    "--pull-progress": pullProgress,
  };
  const valueLabel = fish.tier !== "tool" ? (fish.eventMultiplier > 1 ? `x${fish.eventMultiplier}` : `${fish.multiplier}x`) : "";
  const showValueLabel = Boolean(valueLabel) && !pulling;
  const statusBadges = [
    fish.affectedBy.includes("puffer") ? { key: "puffer", label: "STUN" } : null,
    fish.affectedBy.includes("twin") ? { key: "twin", label: "COPY" } : null,
    fish.affectedBy.includes("pearl") ? { key: "pearl", label: `x${fish.eventMultiplier}` } : null,
    fish.affectedBy.includes("thunder") ? { key: "thunder", label: "ZAP" } : null,
    fish.guaranteed && !fish.affectedBy.includes("puffer") && !fish.affectedBy.includes("thunder") ? { key: "guaranteed", label: "LOCK" } : null,
    fish.hookEffects?.includes("goldenTide") ? { key: "goldenTide", label: `x${fish.eventMultiplier}` } : null,
    fish.hookEffects?.includes("gildedHook") ? { key: "gildedHook", label: `x${fish.eventMultiplier}` } : null,
    fish.hookEffects?.includes("treasureWake") ? { key: "treasureWake", label: "WAKE" } : null,
    fish.hookEffects?.includes("panicCurrent") ? { key: "panicCurrent", label: "FLEE" } : null,
    fish.hookEffects?.includes("rareSignal") ? { key: "rareSignal", label: "RARE" } : null,
  ].filter(Boolean) as Array<{ key: string; label: string }>;
  const className = [
    "fish-entity",
    displayX > 74 ? "near-right-edge" : displayX < 18 ? "near-left-edge" : "",
    fish.tier,
    `species-${fish.speciesId}`,
    fish.eventType ? `event-${fish.eventType}` : "",
    fish.guaranteed ? "guaranteed" : "",
    fish.duplicated ? "duplicated" : "",
    highlighted ? "highlighted" : "",
    activePull ? "active-pull-fish" : "",
    pulling ? "pulling-fish" : "",
    pullPhase !== "idle" ? `pull-${pullPhase}` : "",
    pullState ? `state-${pullState}` : "",
    ...fish.affectedBy.map((type) => `affected-${type}`),
    ...(fish.hookEffects ?? []).map((type) => `hook-effect-${type}`),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className} style={style as React.CSSProperties} aria-label={fish.name}>
      <div className="fish-swim">
        <div className="fish-facing">
          <FishArt speciesId={fish.speciesId} />
        </div>
      </div>
      {(showValueLabel || statusBadges.length > 0) && (
        <div className="fish-chip-track">
          {statusBadges.length > 0 && (
            <div className="fish-effect-frame fish-effect-lock" aria-hidden="true">
              {fish.affectedBy.includes("twin") && <span className="fish-effect-frame-art twin" />}
              {fish.affectedBy.includes("puffer") && <span className="fish-effect-frame-art puffer" />}
              {fish.affectedBy.includes("pearl") && <span className="fish-effect-frame-art pearl" />}
              {fish.affectedBy.includes("thunder") && <span className="fish-effect-frame-art thunder" />}
              {(fish.hookEffects?.includes("goldenTide") || fish.hookEffects?.includes("gildedHook")) && <span className="fish-effect-frame-art hook-gold" />}
              {fish.hookEffects?.includes("treasureWake") && <span className="fish-effect-frame-art hook-wake" />}
              {fish.hookEffects?.includes("panicCurrent") && <span className="fish-effect-frame-art hook-panic" />}
              {fish.hookEffects?.includes("rareSignal") && <span className="fish-effect-frame-art hook-rare" />}
              {statusBadges.map((badge) => (
                <span key={badge.key} className={`fish-effect-badge ${badge.key}`}>
                  {badge.label}
                </span>
              ))}
            </div>
          )}
          {showValueLabel && <div className="fish-value-chip">{valueLabel}</div>}
        </div>
      )}
      {pullState === "escaped" && activePull && <div className="escape-callout">ESCAPED</div>}
    </div>
  );
}
