import { getRouteDefinition } from "../config/routeDefinitions";
import { routeRemainingZones } from "../state/RouteController";
import type { ActiveRoute } from "../types/routes";
import type { CSSProperties } from "react";

interface ActiveRouteChipProps {
  activeRoute: ActiveRoute | null;
  currentZone: number;
}

export function ActiveRouteChip({ activeRoute, currentZone }: ActiveRouteChipProps) {
  if (!activeRoute) return null;
  const route = getRouteDefinition(activeRoute.id);
  const remaining = routeRemainingZones(activeRoute, currentZone);
  const totalZones = Math.max(1, activeRoute.endZone - activeRoute.selectedAtZone);
  const progress = Math.min(100, Math.max(0, ((totalZones - remaining) / totalZones) * 100));
  const style = { "--route-progress": `${progress}%` } as CSSProperties;

  return (
    <div className={["active-route-chip", route.accentClass].join(" ")} style={style}>
      <span className="active-route-icon">{route.icon}</span>
      <span className="active-route-copy">
        <strong>{route.shortName}</strong>
        <em>{remaining} ZONES</em>
      </span>
      <b className="active-route-progress">
        <i />
      </b>
    </div>
  );
}
