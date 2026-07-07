import type { RouteBackgroundDefinition } from "../../types/routeBackground";
import type { PerformanceMode } from "../../performance/performanceConfig";
import { PERFORMANCE_CONFIG } from "../../performance/performanceConfig";

interface RouteBackgroundTransitionProps {
  definition: RouteBackgroundDefinition;
  previousDefinition: RouteBackgroundDefinition | null;
  transitioning: boolean;
  subdued: boolean;
  performanceMode: PerformanceMode;
}

function particles(definition: RouteBackgroundDefinition, performanceMode: PerformanceMode) {
  const count = definition.ambientParticlePreset === "goldDust" ? 18 : definition.ambientParticlePreset === "electricMist" ? 14 : 22;
  const scaledCount = Math.max(performanceMode === "low" ? 0 : 4, Math.round(count * PERFORMANCE_CONFIG[performanceMode].routeParticleScale));
  return Array.from({ length: scaledCount }, (_, index) => (
    <i key={index} style={{ "--i": index } as React.CSSProperties} />
  ));
}

function layer(definition: RouteBackgroundDefinition, stateClass: string, subdued: boolean, performanceMode: PerformanceMode) {
  const mobile = performanceMode !== "high";
  const backgroundAsset = mobile ? definition.mobileBackgroundAsset ?? definition.generatedBackgroundAsset : definition.generatedBackgroundAsset;
  const renderFullLayers = performanceMode === "high";
  const renderMediumLayers = performanceMode === "medium";
  return (
    <div
      className={[
        "route-bg-scene",
        `route-bg-${definition.routeId}`,
        `route-bg-layer-${definition.depthLayer}`,
        `route-bg-particles-${definition.ambientParticlePreset}`,
        `route-bg-silhouette-${definition.silhouettePreset}`,
        `route-bg-light-${definition.lightShaftPreset}`,
        `route-bg-props-${definition.optionalPropPreset}`,
        `route-bg-motion-${definition.animationProfile}`,
        `route-bg-perf-${performanceMode}`,
        stateClass,
        subdued ? "is-subdued" : "",
      ].filter(Boolean).join(" ")}
      style={
        {
          "--route-bg-top": definition.colorGrading.top,
          "--route-bg-mid": definition.colorGrading.mid,
          "--route-bg-bottom": definition.colorGrading.bottom,
          "--route-bg-accent": definition.colorGrading.accent,
          "--route-bg-secondary": definition.colorGrading.secondary,
          "--route-bg-opacity": definition.overlayOpacity,
          "--route-bg-image": `url(${backgroundAsset})`,
        } as React.CSSProperties
      }
      data-far={definition.farBackgroundAsset}
      data-mid={definition.midBackgroundAsset}
      data-near={definition.nearBackgroundAsset}
    >
      <span className="route-bg-far" />
      <span className="route-bg-mid" />
      {renderFullLayers && <span className="route-bg-near" />}
      {(renderFullLayers || renderMediumLayers) && <span className="route-bg-lightshafts" />}
      {(renderFullLayers || renderMediumLayers) && <span className="route-bg-silhouettes" />}
      {renderFullLayers && <span className="route-bg-props" />}
      {performanceMode !== "low" && <span className="route-bg-particles">{particles(definition, performanceMode)}</span>}
    </div>
  );
}

export function RouteBackgroundTransition({ definition, previousDefinition, transitioning, subdued, performanceMode }: RouteBackgroundTransitionProps) {
  return (
    <>
      {previousDefinition && transitioning ? layer(previousDefinition, "is-previous", subdued, performanceMode) : null}
      {layer(definition, transitioning ? "is-current is-transitioning" : "is-current", subdued, performanceMode)}
    </>
  );
}
