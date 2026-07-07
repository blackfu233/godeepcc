import { getRouteDefinition } from "../config/routeDefinitions";
import type { ActiveRoute } from "../types/routes";

interface RouteAmbientLayerProps {
  activeRoute: ActiveRoute | null;
  hidden: boolean;
}

export function RouteAmbientLayer({ activeRoute, hidden }: RouteAmbientLayerProps) {
  if (!activeRoute || hidden) return null;
  const route = getRouteDefinition(activeRoute.id);

  return (
    <div className={["route-ambient-layer", route.accentClass].join(" ")} aria-hidden="true">
      <span className="route-current route-current-a" />
      <span className="route-current route-current-b" />
      <span className="route-current route-current-c" />
    </div>
  );
}
