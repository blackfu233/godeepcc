import { getRouteDefinition } from "../../config/routeDefinitions";
import { getRouteVisualDefinition } from "../../config/routeVisualDefinitions";
import { routeRemainingZones } from "../../state/RouteController";
import type { ActiveRoute } from "../../types/routes";

interface RouteDepthRailAccentProps {
  activeRoute: ActiveRoute | null;
  currentZone: number;
  hidden: boolean;
}

export function RouteDepthRailAccent({ activeRoute, currentZone, hidden }: RouteDepthRailAccentProps) {
  if (!activeRoute || hidden) return null;
  const route = getRouteDefinition(activeRoute.id);
  const visual = getRouteVisualDefinition(activeRoute.id);
  const remaining = routeRemainingZones(activeRoute, currentZone);
  const totalZones = Math.max(1, activeRoute.endZone - activeRoute.selectedAtZone);
  const progress = Math.min(100, Math.max(0, ((totalZones - remaining) / totalZones) * 100));

  return (
    <aside
      className={["route-depth-rail-accent-v2", route.accentClass].join(" ")}
      style={
        {
          "--route-color": visual.accentColor,
          "--route-secondary": visual.secondaryColor,
        } as React.CSSProperties
      }
      data-accent={visual.depthRailAccent}
      aria-hidden="true"
    >
      <span>{visual.activeChipIcon}</span>
      <b>
        <i style={{ height: `${progress}%` }} />
      </b>
      <em>
        Z{activeRoute.startZone}-{activeRoute.endZone}
      </em>
    </aside>
  );
}
