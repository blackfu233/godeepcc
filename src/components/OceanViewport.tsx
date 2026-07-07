import { GAME_CONFIG } from "../config/gameConfig";
import type { DepthZone, EventLog, PullFishVisualState, PullUpPhase, PullUpPlan, PullUpPlanItem, ThunderState } from "../types/game";
import type { HookAnomalyLog, HookAnomalyState } from "../types/hookAnomaly";
import type { ActiveRoute } from "../types/routes";
import type { PerformanceMode } from "../performance/performanceConfig";
import { PERFORMANCE_CONFIG } from "../performance/performanceConfig";
import { findPullItem, getFishPullState, getItemProgress, getPullActiveItem, getRouteProgress } from "../utils/pullUpRuntime";
import { FishEntity } from "./FishEntity";
import { Hook } from "./Hook";
import { HookRareSignalOverlay } from "./hook-events/HookRareSignalOverlay";
import { RouteBackgroundLayer } from "./routes/RouteBackgroundLayer";

interface OceanViewportProps {
  zones: DepthZone[];
  currentZone: number;
  highlightedIds: string[];
  pulling: boolean;
  pullPhase: PullUpPhase;
  pullFocusZone: number | null;
  pullPlan: PullUpPlan | null;
  pullElapsed: number;
  thunder: ThunderState | null;
  activeEvent: EventLog | null;
  hookAnomaly: HookAnomalyState;
  hookEvent: HookAnomalyLog | null;
  activeRoute: ActiveRoute | null;
  extraRevealZones?: number;
  divePulse: number;
  diving: boolean;
  performanceMode: PerformanceMode;
}

function eventZoneIds(event: EventLog | null) {
  if (!event) return [];
  return event.targetZoneIds;
}

function EventZoneEffect({ event, zoneId }: { event: EventLog; zoneId: number }) {
  const rangeClass = event.range >= 5 || (event.type === "thunder" && event.range >= 4) ? "range-5" : event.range >= 3 ? "range-3" : "range-1";
  const wheelLabel = event.triggered ? "TRIGGER" : "MISS";
  const isSourceZone = zoneId === event.zone;
  return (
    <div className={`zone-event-effect ${event.type} ${rangeClass} ${isSourceZone ? "source-zone" : "target-zone"} ${event.triggered ? "triggered" : "missed"}`} aria-hidden="true">
      {isSourceZone && (
        <div className="event-trigger-wheel">
          <i />
          <b>{wheelLabel}</b>
        </div>
      )}
      <div className="event-range-ring">
        <span>{event.type === "thunder" ? (event.range > 0 ? `DOWN ${event.range}` : "CHARGED") : `${event.range || 1} ZONE`}</span>
      </div>
      <span className="premium-event-vfx" />
      {event.type === "twin" && (
        <>
          <b className="event-energy-core twin-core" />
          <i className="beam one" />
          <i className="beam two" />
          <i className="beam three" />
          <i className="beam four" />
          <b className="mirror-core" />
        </>
      )}
      {event.type === "pearl" && (
        <>
          <b className="pearl-shell-flare" />
          <div className="pearl-coins">
            {Array.from({ length: 14 }, (_, index) => <i key={index} style={{ "--i": index } as React.CSSProperties} />)}
          </div>
        </>
      )}
      {event.type === "puffer" && (
        <>
          <b className="puffer-pressure" />
          <b className="blast-core" />
          <i className="shockwave" />
          <i className="shockwave second" />
          <i className="shock-sparks" />
        </>
      )}
      {event.type === "thunder" && (
        <>
          <b className="thunder-anchor" />
          <div className="lightning-chain">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="electric-net" />
        </>
      )}
      <em>{zoneId * GAME_CONFIG.metersPerZone}m</em>
    </div>
  );
}

function clampZone(zone: number) {
  return Math.max(1, Math.min(GAME_CONFIG.maxZones, zone));
}

function isFishInReadableBand({
  currentZone,
  fish,
  pulling,
  worldZone,
  zoneId,
}: {
  currentZone: number;
  fish: DepthZone["fish"][number];
  pulling: boolean;
  worldZone: number;
  zoneId: number;
}) {
  if (pulling) return true;

  const estimatedFrameHeight = 764;
  const hudSafeBottom = 92;
  const controlSafeTop = estimatedFrameHeight - 142;
  const surfaceOffset = currentZone === 0 ? GAME_CONFIG.zoneHeight : 0;
  const screenY =
    estimatedFrameHeight * 0.5 +
    surfaceOffset +
    (zoneId - worldZone) * GAME_CONFIG.zoneHeight +
    (fish.y / 100) * GAME_CONFIG.zoneHeight;

  return screenY >= hudSafeBottom + fish.size * 0.18 && screenY <= controlSafeTop - fish.size * 0.18;
}

export function OceanViewport({
  zones,
  currentZone,
  highlightedIds,
  pulling,
  pullPhase,
  pullFocusZone,
  pullPlan,
  pullElapsed,
  thunder,
  activeEvent,
  hookAnomaly,
  hookEvent,
  activeRoute,
  extraRevealZones = 0,
  divePulse,
  diving,
  performanceMode,
}: OceanViewportProps) {
  const focusZone = pullFocusZone ?? currentZone;
  const routeProgress = pulling && pullPlan ? getRouteProgress(pullPlan, pullElapsed) : 0;
  const depthProgress = Math.max(0, currentZone / GAME_CONFIG.maxZones);
  const activePullItem = pulling && pullPlan ? getPullActiveItem(pullPlan, pullElapsed) : null;
  const eventZones = eventZoneIds(activeEvent);
  const pullWorldZone = activePullItem?.zone ?? Math.max(1, Math.round(focusZone - (focusZone - 1) * routeProgress));
  const worldZone = pulling ? pullWorldZone : currentZone === 0 ? 1 : currentZone;
  const diveFromZone = diving && !pulling && currentZone > 1 ? worldZone - 1 : worldZone;
  const zonesAbove = currentZone === 0 && !pulling ? 0 : 4;
  const zonesBelow = currentZone === 0 && !pulling ? 3 : 4;
  const visibleStart = clampZone(worldZone - zonesAbove);
  const visibleEnd = Math.min(GAME_CONFIG.maxZones, worldZone + zonesBelow + extraRevealZones);
  const visibleZones = zones.slice(visibleStart - 1, visibleEnd);
  const worldOffset = -(Math.max(0, worldZone - visibleStart) * GAME_CONFIG.zoneHeight);
  const diveFromOffset = -(Math.max(0, diveFromZone - visibleStart) * GAME_CONFIG.zoneHeight);
  const visibleFishIds = new Set<string>();
  const bubbleCount = PERFORMANCE_CONFIG[performanceMode].bubbleCount;
  const diveWakeCount = PERFORMANCE_CONFIG[performanceMode].diveWakeCount;

  for (const zone of visibleZones) {
    for (const fish of zone.fish) {
      if (isFishInReadableBand({ currentZone, fish, pulling, worldZone, zoneId: zone.id })) {
        visibleFishIds.add(fish.id);
      }
    }
  }
  for (const fishId of highlightedIds) {
    visibleFishIds.add(fishId);
  }
  if (activePullItem) visibleFishIds.add(activePullItem.fish.id);

  const pullStateFor = (fish: DepthZone["fish"][number]): PullFishVisualState => {
    if (!pulling) return "swimming";
    return getFishPullState({ plan: pullPlan, elapsed: pullElapsed, fish });
  };

  const pullItemFor = (fish: DepthZone["fish"][number]): PullUpPlanItem | null => {
    if (!pullPlan) return null;
    return findPullItem(pullPlan, fish);
  };

  return (
    <main
      className={[
        "ocean-viewport",
        currentZone === 0 && !pulling ? "is-surface" : "",
        diving && !pulling ? "is-diving" : "",
        pulling ? "is-pulling" : "",
        activeRoute ? `has-route-background route-world-${activeRoute.id}` : "",
        activeEvent ? `event-active event-${activeEvent.type}` : "",
        hookEvent ? `hook-event-active hook-${hookEvent.polarity}` : "",
        `ocean-perf-${performanceMode}`,
      ].filter(Boolean).join(" ")}
      style={
        {
          "--depth-progress": depthProgress,
          "--route-progress": routeProgress,
          "--zone-height": `${GAME_CONFIG.zoneHeight}px`,
          "--current-waterline-y": "50%",
          "--world-offset": `${worldOffset}px`,
          "--dive-from-offset": `${diveFromOffset}px`,
        } as React.CSSProperties
      }
    >
      <div className="surface-light" />
      <div className="god-rays" />
      <RouteBackgroundLayer
        activeRoute={activeRoute}
        currentZone={currentZone}
        hidden={false}
        subdued={pulling || Boolean(activeEvent) || Boolean(hookEvent)}
        performanceMode={performanceMode}
      />
      {divePulse > 0 && (
        <div className="dive-wake" key={divePulse} aria-hidden="true">
          {Array.from({ length: diveWakeCount }, (_, index) => <span key={index} style={{ "--i": index } as React.CSSProperties} />)}
        </div>
      )}
      <div className="bubble-field">
        {Array.from({ length: bubbleCount }, (_, index) => (
          <span key={index} style={{ "--i": index } as React.CSSProperties} />
        ))}
      </div>
      {currentZone === 0 && <div className="surface-depth-label">SURFACE</div>}
      <HookRareSignalOverlay state={hookAnomaly} currentZone={currentZone} hidden={pulling || Boolean(hookEvent)} />
      <div className={["ocean-track", pulling ? "pull-camera" : "", diving && !pulling && currentZone > 1 ? "dive-scroll" : ""].filter(Boolean).join(" ")} style={{ transform: "translateY(var(--world-offset))" }}>
        {visibleZones.map((zone) => (
          <section className={["depth-zone", zone.id === worldZone ? "current-depth-zone" : ""].filter(Boolean).join(" ")} key={zone.id} style={{ height: GAME_CONFIG.zoneHeight }}>
            <div className="depth-line">
              <span>{zone.depth}m</span>
            </div>
            {activeEvent && eventZones.includes(zone.id) && <EventZoneEffect event={activeEvent} zoneId={zone.id} />}
            {zone.fish.filter((fish) => visibleFishIds.has(fish.id) && !(fish.eventType === "thunder" && thunder?.sourceZone === fish.zone)).map((fish) => {
              const item = pullItemFor(fish);
              const pullState = pullStateFor(fish);
              const pullProgress = item ? getItemProgress(item, pullElapsed) : 0;
              const activePull = activePullItem?.fish.id === fish.id;
              return (
                <FishEntity
                  key={fish.id}
                  fish={fish}
                  highlighted={highlightedIds.includes(fish.id) || activePull}
                  pulling={pulling}
                  pullPhase={pullPhase}
                  pullState={pullState}
                  pullItem={item}
                  pullProgress={pullProgress}
                  activePull={activePull}
                />
              );
            })}
          </section>
        ))}
        {visibleEnd === GAME_CONFIG.maxZones && (
          <section className="depth-zone max-depth-zone" style={{ height: GAME_CONFIG.zoneHeight }}>
            <div className="depth-line max-depth-line">
              <span>MAX DEPTH</span>
            </div>
          </section>
        )}
      </div>
      <Hook
        key={diving ? `dive-${divePulse}` : "hook"}
        currentZone={currentZone}
        pulling={pulling}
        pullPhase={pullPhase}
        thunder={thunder}
        rust={hookAnomaly.rust}
        hookEvent={hookEvent}
      />
    </main>
  );
}
