import type { DepthZone } from "../../types/game";
import type { HookAnomalyLog, HookAnomalyState, HookBreakState } from "../../types/hookAnomaly";
import type { HookAnomalyVfxKey } from "../../config/hookAnomalyVfxManifest";
import type { PerformanceMode } from "../../performance/performanceConfig";
import { PERFORMANCE_CONFIG } from "../../performance/performanceConfig";
import { SpriteSequencePlayer } from "./SpriteSequencePlayer";

interface HookAnomalyVfxLayerProps {
  hookEvent: HookAnomalyLog | null;
  hookAnomaly: HookAnomalyState;
  hookBreak: HookBreakState | null;
  zones: DepthZone[];
  currentZone: number;
  repairPulse: number;
  hidden?: boolean;
  performanceMode: PerformanceMode;
}

function eventAsset(event: HookAnomalyLog): HookAnomalyVfxKey | null {
  if (event.eventId === "abyssEcho") {
    if (event.message.toLowerCase().includes("scatters")) return "rareSignalFake";
    if (event.targetIds.length > 0) return "rareSignalReal";
    return null;
  }
  if (event.eventId === "goldenTide") return "goldenTide";
  if (event.eventId === "treasureWake") return "treasureWake";
  if (event.eventId === "tidebornCall") {
    if (event.summonedEventType === "twin") return "tidebornTwinFish";
    if (event.summonedEventType === "pearl") return "tidebornPearl";
    if (event.summonedEventType === "puffer") return "tidebornPuffer";
    if (event.summonedEventType === "thunder") return "tidebornJelly";
    return "tidebornPuffer";
  }
  if (event.eventId === "luckyBait") return "luckyBait";
  if (event.eventId === "abyssBeacon") return "abyssBeacon";
  if (event.eventId === "gildedHook") return "gildedHook";
  if (event.eventId === "panicCurrent") return "panicCurrent";
  if (event.eventId === "abyssPredator") return "abyssPredator";
  return null;
}

function rustAsset(state: HookAnomalyState): HookAnomalyVfxKey | null {
  if (state.rust === "light_rust") return "rustLight";
  if (state.rust === "heavy_rust") return "rustHeavy";
  if (state.rust === "break_risk") return "rustBreakRisk";
  return null;
}

function targetSpot(event: HookAnomalyLog, zones: DepthZone[], currentZone: number) {
  const targetFish = zones.flatMap((zone) => zone.fish).find((fish) => event.targetIds.includes(fish.id));
  if (targetFish && Math.abs(targetFish.zone - currentZone) <= 2) {
    const zoneDelta = targetFish.zone - currentZone;
    return {
      x: Math.max(16, Math.min(84, targetFish.x)),
      y: Math.max(22, Math.min(78, 50 + zoneDelta * 24 + (targetFish.y - 50) * 0.28)),
    };
  }
  if (event.targetZoneIds.length > 0) {
    const averageZone = event.targetZoneIds.reduce((sum, zone) => sum + zone, 0) / event.targetZoneIds.length;
    return {
      x: event.eventId === "panicCurrent" ? 48 : event.eventId === "abyssPredator" ? 52 : 50,
      y: Math.max(24, Math.min(80, 50 + (averageZone - currentZone) * 18)),
    };
  }
  return { x: 50, y: 50 };
}

function eventScale(event: HookAnomalyLog) {
  if (event.eventId === "panicCurrent" || event.eventId === "abyssPredator") return 0.92;
  if (event.eventId === "treasureWake" || event.eventId === "abyssEcho") return 0.78;
  if (event.eventId === "tidebornCall") return 0.72;
  return 0.48;
}

export function HookAnomalyVfxLayer({ hookEvent, hookAnomaly, hookBreak, zones, currentZone, repairPulse, hidden = false, performanceMode }: HookAnomalyVfxLayerProps) {
  if (hidden) return null;
  const glowKey = hookEvent ? (hookEvent.polarity === "positive" ? "hookGlowPositive" : "hookGlowNegative") : null;
  const effectKey = hookEvent ? eventAsset(hookEvent) : null;
  const rustKey = hookEvent?.eventId === "rustedGrip" && !hookEvent.brokeHook ? rustAsset(hookAnomaly) : null;
  const spot = hookEvent ? targetSpot(hookEvent, zones, currentZone) : { x: 50, y: 50 };
  const fpsMultiplier = PERFORMANCE_CONFIG[performanceMode].spriteFpsMultiplier;
  const maxVfx = PERFORMANCE_CONFIG[performanceMode].maxHookVfx;
  let mountedVfx = 0;
  const canMount = () => {
    mountedVfx += 1;
    return mountedVfx <= maxVfx;
  };

  return (
    <div className={["hook-anomaly-vfx-layer", `hook-vfx-${performanceMode}`].join(" ")} aria-hidden="true">
      {hookBreak && canMount() && (
        <SpriteSequencePlayer
          key={`${hookBreak.log.id}-break`}
          assetKey="hookBreak"
          x={50}
          y={49}
          scale={performanceMode === "low" ? 0.34 : 0.42}
          opacity={1}
          zIndex={38}
          fpsMultiplier={fpsMultiplier}
        />
      )}
      {repairPulse > 0 && canMount() && (
        <SpriteSequencePlayer
          key={`repair-${repairPulse}`}
          assetKey="hookRepair"
          x={50}
          y={49}
          scale={performanceMode === "low" ? 0.34 : 0.42}
          opacity={1}
          zIndex={38}
          fpsMultiplier={fpsMultiplier}
        />
      )}
      {effectKey && canMount() && (
        <SpriteSequencePlayer
          key={`${hookEvent?.id}-effect`}
          assetKey={effectKey}
          x={spot.x}
          y={spot.y}
          scale={eventScale(hookEvent!) * (performanceMode === "low" ? 0.82 : 1)}
          opacity={performanceMode === "low" ? 0.78 : 0.94}
          zIndex={hookEvent?.polarity === "negative" ? 17 : 16}
          blendMode={performanceMode === "low" ? undefined : hookEvent?.eventId === "abyssPredator" ? "multiply" : "screen"}
          fpsMultiplier={fpsMultiplier}
        />
      )}
      {glowKey && canMount() && (
        <SpriteSequencePlayer
          key={`${hookEvent?.id}-glow`}
          assetKey={glowKey}
          x={50}
          y={48}
          scale={performanceMode === "low" ? 0.28 : 0.34}
          opacity={performanceMode === "low" ? 0.72 : 0.96}
          zIndex={18}
          blendMode={performanceMode === "low" ? undefined : "screen"}
          fpsMultiplier={fpsMultiplier}
        />
      )}
      {rustKey && canMount() && (
        <SpriteSequencePlayer
          key={`${hookEvent?.id}-rust`}
          assetKey={rustKey}
          x={50}
          y={49}
          scale={performanceMode === "low" ? 0.28 : 0.34}
          opacity={performanceMode === "low" ? 0.72 : 0.96}
          zIndex={19}
          fpsMultiplier={fpsMultiplier}
        />
      )}
    </div>
  );
}
