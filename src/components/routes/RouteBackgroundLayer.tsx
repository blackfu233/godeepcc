import { useEffect, useMemo, useRef, useState } from "react";
import type { RouteBackgroundDefinition } from "../../types/routeBackground";
import type { ActiveRoute } from "../../types/routes";
import type { PerformanceMode } from "../../performance/performanceConfig";
import { PERFORMANCE_CONFIG } from "../../performance/performanceConfig";
import { resolveRouteBackground } from "../../utils/routeBackgroundResolver";
import { RouteBackgroundTransition } from "./RouteBackgroundTransition";

interface RouteBackgroundLayerProps {
  activeRoute: ActiveRoute | null;
  currentZone: number;
  hidden?: boolean;
  subdued?: boolean;
  performanceMode: PerformanceMode;
}

function keyFor(definition: RouteBackgroundDefinition | null) {
  return definition ? `${definition.routeId}-${definition.depthLayer}` : "none";
}

export function RouteBackgroundLayer({ activeRoute, currentZone, hidden = false, subdued = false, performanceMode }: RouteBackgroundLayerProps) {
  const resolved = useMemo(() => resolveRouteBackground(activeRoute, currentZone), [activeRoute, currentZone]);
  const definition = resolved?.definition ?? null;
  const previousRef = useRef<RouteBackgroundDefinition | null>(null);
  const activeKeyRef = useRef(keyFor(definition));
  const [previousDefinition, setPreviousDefinition] = useState<RouteBackgroundDefinition | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const nextKey = keyFor(definition);
    if (nextKey === activeKeyRef.current) return undefined;
    setPreviousDefinition(previousRef.current);
    setTransitioning(true);
    activeKeyRef.current = nextKey;
    previousRef.current = definition;
    const timer = window.setTimeout(() => {
      setPreviousDefinition(null);
      setTransitioning(false);
    }, PERFORMANCE_CONFIG[performanceMode].routeTransitionMs);
    return () => window.clearTimeout(timer);
  }, [definition, performanceMode]);

  useEffect(() => {
    if (!previousRef.current && definition) previousRef.current = definition;
  }, [definition]);

  if (!definition || hidden) return null;

  return (
    <div className={["route-background-layer", `perf-route-${performanceMode}`, subdued ? "is-subdued" : ""].filter(Boolean).join(" ")} aria-hidden="true">
      <RouteBackgroundTransition
        definition={definition}
        previousDefinition={previousDefinition}
        transitioning={transitioning}
        subdued={subdued}
        performanceMode={performanceMode}
      />
    </div>
  );
}
