import { getRouteVisualDefinition } from "../../config/routeVisualDefinitions";
import type { RouteId } from "../../types/routes";

interface RouteCardIllustrationProps {
  routeId: RouteId;
}

export function RouteCardIllustration({ routeId }: RouteCardIllustrationProps) {
  const visual = getRouteVisualDefinition(routeId);

  return (
    <span
      className={["route-card-illustration", `route-illustration-${routeId}`].join(" ")}
      data-asset={visual.iconAsset}
      aria-hidden="true"
    >
      <span className="route-illustration-current" />
      <span className="route-illustration-depth" />
      {routeId === "school" && (
        <span className="route-school-fishline">
          {Array.from({ length: 9 }, (_, index) => (
            <i key={index} style={{ "--i": index } as React.CSSProperties} />
          ))}
        </span>
      )}
      {routeId === "golden" && (
        <>
          <span className="route-golden-ribbon" />
          <span className="route-golden-rare-shadow" />
          <span className="route-golden-pearl" />
        </>
      )}
      {routeId === "storm" && (
        <>
          <span className="route-storm-cleft" />
          <span className="route-storm-arc" />
          <span className="route-storm-jelly-shadow" />
        </>
      )}
    </span>
  );
}
