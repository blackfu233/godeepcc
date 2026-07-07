import { getRouteDefinition } from "../config/routeDefinitions";
import type { RouteId } from "../types/routes";

interface RouteCardProps {
  routeId: RouteId;
  visualState: "idle" | "hovered" | "focused" | "selected" | "unselected" | "confirmed";
  onSelect: (routeId: RouteId) => void;
  onPreview?: (routeId: RouteId) => void;
  isDisabled?: boolean;
}

export function RouteCard({ routeId, visualState, onSelect, onPreview, isDisabled = false }: RouteCardProps) {
  const route = getRouteDefinition(routeId);

  return (
    <button
      className={["route-card", route.accentClass, `state-${visualState}`].join(" ")}
      disabled={isDisabled}
      onPointerEnter={() => onPreview?.(route.id)}
      onFocus={() => onPreview?.(route.id)}
      onClick={() => onSelect(route.id)}
    >
      <span className="route-card-visual" aria-hidden="true">
        <span className="route-orb">{route.icon}</span>
        <span className="route-flow route-flow-a" />
        <span className="route-flow route-flow-b" />
        <span className="route-spark route-spark-a" />
        <span className="route-spark route-spark-b" />
      </span>
      <span className="route-card-body">
        <span className="route-name">{route.name}</span>
        <span className="route-subtitle">{route.subtitle}</span>
        <span className="route-description">{route.description}</span>
        <span className="route-tags">
          {route.tags.map((tag) => (
            <i key={tag}>{tag}</i>
          ))}
        </span>
      </span>
      {visualState === "selected" || visualState === "confirmed" ? <b className="route-lock-label">CURRENT LOCKED</b> : null}
    </button>
  );
}
