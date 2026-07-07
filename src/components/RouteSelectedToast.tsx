import { getRouteDefinition } from "../config/routeDefinitions";
import type { RouteId } from "../types/routes";

interface RouteSelectedToastProps {
  notice: {
    routeId: RouteId;
    startZone: number;
    endZone: number;
  } | null;
}

export function RouteSelectedToast({ notice }: RouteSelectedToastProps) {
  if (!notice) return null;
  const route = getRouteDefinition(notice.routeId);

  return (
    <div className={["route-selected-toast", route.accentClass].join(" ")} aria-live="polite">
      <span>{route.icon}</span>
      <strong>{route.name} SELECTED</strong>
      <em>
        ZONES {notice.startZone}-{notice.endZone}
      </em>
    </div>
  );
}
