import { getRouteDefinition } from "../../config/routeDefinitions";
import { getRouteVisualDefinition } from "../../config/routeVisualDefinitions";
import type { ActiveRoute } from "../../types/routes";

interface RouteAmbientLayerProps {
  activeRoute: ActiveRoute | null;
  hidden: boolean;
  subdued?: boolean;
}

export function RouteAmbientLayer({ activeRoute, hidden, subdued = false }: RouteAmbientLayerProps) {
  if (!activeRoute || hidden) return null;
  const route = getRouteDefinition(activeRoute.id);
  const visual = getRouteVisualDefinition(activeRoute.id);

  return (
    <div
      className={["route-ambient-layer-v2", route.accentClass, subdued ? "is-subdued" : ""].filter(Boolean).join(" ")}
      style={
        {
          "--route-color": visual.accentColor,
          "--route-secondary": visual.secondaryColor,
        } as React.CSSProperties
      }
      data-ambient={visual.ambientVfx}
      aria-hidden="true"
    >
      <span className="route-current-v2 route-current-a" />
      <span className="route-current-v2 route-current-b" />
      <span className="route-current-v2 route-current-c" />
      {activeRoute.id === "school" && (
        <span className="route-ambient-school">
          {Array.from({ length: 11 }, (_, index) => (
            <i key={index} style={{ "--i": index } as React.CSSProperties} />
          ))}
        </span>
      )}
      {activeRoute.id === "golden" && (
        <span className="route-ambient-gold">
          {Array.from({ length: 14 }, (_, index) => (
            <i key={index} style={{ "--i": index } as React.CSSProperties} />
          ))}
        </span>
      )}
      {activeRoute.id === "storm" && <span className="route-ambient-storm" />}
    </div>
  );
}
