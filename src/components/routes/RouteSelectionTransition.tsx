import { getRouteDefinition } from "../../config/routeDefinitions";
import { getRouteVisualDefinition } from "../../config/routeVisualDefinitions";
import type { RouteChoiceState } from "../../types/routes";

interface RouteSelectionTransitionProps {
  choice: RouteChoiceState;
}

export function RouteSelectionTransition({ choice }: RouteSelectionTransitionProps) {
  if (!choice.selectedId) return null;
  const route = getRouteDefinition(choice.selectedId);
  const visual = getRouteVisualDefinition(choice.selectedId);

  return (
    <div
      className={["route-selection-transition", route.accentClass].join(" ")}
      style={
        {
          "--route-color": visual.accentColor,
          "--route-secondary": visual.secondaryColor,
        } as React.CSSProperties
      }
      aria-live="polite"
    >
      <span>{visual.activeChipIcon}</span>
      <strong>{route.name} {choice.selectedId === "golden" ? "SELECTED" : "LOCKED"}</strong>
      <em>
        {choice.selectedId === "school" && "DENSE CATCHES AHEAD"}
        {choice.selectedId === "golden" && "RARE TREASURES AHEAD"}
        {choice.selectedId === "storm" && "ELECTRIFIED WATERS AHEAD"}
      </em>
    </div>
  );
}
