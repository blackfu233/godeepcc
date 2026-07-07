import { getRouteDefinition } from "../../config/routeDefinitions";
import { getRouteVisualDefinition } from "../../config/routeVisualDefinitions";
import type { RouteId } from "../../types/routes";

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
  const visual = getRouteVisualDefinition(notice.routeId);

  return (
    <div
      className={["route-selected-toast-v2", route.accentClass].join(" ")}
      style={
        {
          "--route-color": visual.accentColor,
          "--route-secondary": visual.secondaryColor,
        } as React.CSSProperties
      }
      aria-live="polite"
    >
      <span>{visual.activeChipIcon}</span>
      <strong>{route.name} SELECTED</strong>
      <em>
        ZONES {notice.startZone}-{notice.endZone}
      </em>
    </div>
  );
}
