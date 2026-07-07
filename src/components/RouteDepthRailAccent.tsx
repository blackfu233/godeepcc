import { getRouteDefinition } from "../config/routeDefinitions";
import { routeRemainingZones } from "../state/RouteController";
import type { ActiveRoute } from "../types/routes";

interface RouteDepthRailAccentProps {
  activeRoute: ActiveRoute | null;
  currentZone: number;
  hidden: boolean;
}

export function RouteDepthRailAccent({ activeRoute, currentZone, hidden }: RouteDepthRailAccentProps) {
  if (!activeRoute || hidden) return null;
  const route = getRouteDefinition(activeRoute.id);
  const remaining = routeRemainingZones(activeRoute, currentZone);
  const totalZones = Math.max(1, activeRoute.endZone - activeRoute.selectedAtZone);
  const progress = Math.min(100, Math.max(0, ((totalZones - remaining) / totalZones) * 100));

  return (
    <aside className={["route-depth-rail-accent", route.accentClass].join(" ")} aria-hidden="true">
      <span>{route.shortName}</span>
      <b>
        <i style={{ height: `${progress}%` }} />
      </b>
      <em>
        {activeRoute.startZone}-{activeRoute.endZone}
      </em>
    </aside>
  );
}
