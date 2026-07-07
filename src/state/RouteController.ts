import type { ActiveRoute, RouteId } from "../types/routes";

export function createActiveRoute(params: {
  id: RouteId;
  selectedAtZone: number;
  startZone: number;
  endZone: number;
}): ActiveRoute {
  return {
    id: params.id,
    selectedAtZone: params.selectedAtZone,
    startZone: params.startZone,
    endZone: params.endZone,
  };
}

export function routeRemainingZones(activeRoute: ActiveRoute, currentZone: number) {
  return Math.max(0, activeRoute.endZone - Math.max(currentZone, activeRoute.selectedAtZone));
}

export function routeHasEnded(activeRoute: ActiveRoute | null, currentZone: number) {
  return Boolean(activeRoute && currentZone > activeRoute.endZone);
}
