import { getRouteDefinition } from "../../config/routeDefinitions";
import type { RouteChoiceState, RouteId } from "../../types/routes";
import { RouteCard } from "./RouteCard";
import { RouteSelectionTransition } from "./RouteSelectionTransition";

interface RouteChoicePanelProps {
  choice: RouteChoiceState | null;
  onChoose: (routeId: RouteId) => void;
  onPullUpNow: () => void;
  onPreview?: (routeId: RouteId) => void;
}

export function RouteChoicePanel({ choice, onChoose, onPullUpNow, onPreview }: RouteChoicePanelProps) {
  if (!choice) return null;
  const zoneCount = Math.max(1, choice.endZone - choice.startZone + 1);

  return (
    <section className="route-choice-panel-v2" aria-label="Ocean current route choice">
      <header className="route-choice-heading-v2">
        <span>ZONE {choice.checkpointZone} - CURRENT FORK</span>
        <strong>OCEAN CURRENT AHEAD</strong>
        <em>Choose a route for Zones {choice.startZone}-{choice.endZone} ({zoneCount} zones).</em>
      </header>
      <div className="route-card-row-v2">
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
      <button className="route-pull-now-v2" onClick={onPullUpNow} disabled={choice.confirming}>
        <strong>PULL UP NOW</strong>
        <span>Choice is free - No bet added</span>
      </button>
      <RouteSelectionTransition choice={choice} />
    </section>
  );
}


