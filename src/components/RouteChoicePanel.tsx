import { getRouteDefinition } from "../config/routeDefinitions";
import type { RouteChoiceState, RouteId } from "../types/routes";
import { RouteCard } from "./RouteCard";

interface RouteChoicePanelProps {
  choice: RouteChoiceState | null;
  onChoose: (routeId: RouteId) => void;
  onPullUpNow: () => void;
  onPreview?: (routeId: RouteId) => void;
}

export function RouteChoicePanel({ choice, onChoose, onPullUpNow, onPreview }: RouteChoicePanelProps) {
  if (!choice) return null;

  return (
    <section className="route-choice-panel" aria-label="Ocean current route choice">
      <div className="route-choice-heading">
        <span>OCEAN CURRENT AHEAD</span>
        <strong>Choose a route for the next 25 zones.</strong>
      </div>
      <div className="route-card-row">
        {choice.options.map((routeId) => {
          const route = getRouteDefinition(routeId);
          const selected = choice.selectedId === routeId;
          const dimmed = Boolean(choice.selectedId && !selected);
          return (
            <RouteCard
              key={route.id}
              routeId={route.id}
              visualState={selected ? "selected" : dimmed ? "unselected" : "idle"}
              onSelect={onChoose}
              onPreview={onPreview}
              isDisabled={choice.confirming}
            />
          );
        })}
      </div>
      <button className="route-pull-now" onClick={onPullUpNow} disabled={choice.confirming}>
        <strong>PULL UP NOW</strong>
        <span>Keep your current catches.</span>
      </button>
      {choice.selectedId && (
        <div className="route-confirmation">
          {getRouteDefinition(choice.selectedId).name} SELECTED - ZONES {choice.startZone}-{choice.endZone}
        </div>
      )}
    </section>
  );
}
