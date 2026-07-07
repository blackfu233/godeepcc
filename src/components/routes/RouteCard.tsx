import { getRouteDefinition } from "../../config/routeDefinitions";
import { getRouteVisualDefinition } from "../../config/routeVisualDefinitions";
import type { RouteId } from "../../types/routes";
import { RouteCardIllustration } from "./RouteCardIllustration";

interface RouteCardProps {
  routeId: RouteId;
  visualState: "idle" | "hovered" | "focused" | "selected" | "unselected" | "confirmed";
  onSelect: (routeId: RouteId) => void;
  onPreview?: (routeId: RouteId) => void;
  isDisabled?: boolean;
}

export function RouteCard({ routeId, visualState, onSelect, onPreview, isDisabled = false }: RouteCardProps) {
  const route = getRouteDefinition(routeId);
  const visual = getRouteVisualDefinition(routeId);
  const selected = visualState === "selected" || visualState === "confirmed";

  return (
    <button
      className={["route-card-v2", route.accentClass, `state-${visualState}`].join(" ")}
      style={
        {
          "--route-base": visual.baseColor,
          "--route-color": visual.accentColor,
          "--route-secondary": visual.secondaryColor,
          "--route-highlight": visual.highlightColor,
        } as React.CSSProperties
      }
      data-bg={visual.cardBackgroundAsset}
      data-hover-vfx={visual.hoverVfx}
      data-selected-vfx={visual.selectedVfx}
      disabled={isDisabled}
      onPointerEnter={() => onPreview?.(route.id)}
      onFocus={() => onPreview?.(route.id)}
      onClick={() => onSelect(route.id)}
    >
      <RouteCardIllustration routeId={route.id} />
      <span className="route-card-copy">
        <span className="route-name">{route.name}</span>
        <span className="route-subtitle">{route.subtitle}</span>
        <span className="route-description">{route.description}</span>
        <span className="route-tags" aria-label={route.tags.join(", ")}>
          {route.tags.map((tag) => (
            <i key={tag}>{tag}</i>
          ))}
        </span>
      </span>
      <span className="route-card-select-hint">{selected ? "LOCKED" : "TAP TO CHOOSE"}</span>
      {selected ? <span className="route-selected-flow" /> : null}
    </button>
  );
}
