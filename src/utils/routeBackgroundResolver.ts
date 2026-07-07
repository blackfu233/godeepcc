import { depthLayerForZone, getRouteBackgroundDefinition } from "../config/routeBackgroundDefinitions";
import type { RouteBackgroundDefinition, RouteDepthLayer } from "../types/routeBackground";
import type { ActiveRoute } from "../types/routes";

export interface ResolvedRouteBackground {
  activeRouteId: string;
  depthLayer: RouteDepthLayer;
  selectedBackgroundKey: string;
  sourceAssetPath: string;
  generatedBackgroundAsset: string;
  farAsset: string;
  midAsset: string;
  nearAsset: string;
  ambientPreset: string;
  fallbackUsed: boolean;
  definition: RouteBackgroundDefinition;
}

export function resolveRouteBackground(activeRoute: ActiveRoute | null, currentZone: number): ResolvedRouteBackground | null {
  if (!activeRoute) return null;
  const depthLayer = depthLayerForZone(currentZone || activeRoute.startZone);
  const definition = getRouteBackgroundDefinition(activeRoute.id, depthLayer);

  return {
    activeRouteId: activeRoute.id,
    depthLayer,
    selectedBackgroundKey: `${activeRoute.id}-layer-${depthLayer}`,
    sourceAssetPath: definition.sourceAssetPath,
    generatedBackgroundAsset: definition.generatedBackgroundAsset,
    farAsset: definition.farBackgroundAsset,
    midAsset: definition.midBackgroundAsset,
    nearAsset: definition.nearBackgroundAsset,
    ambientPreset: definition.ambientParticlePreset,
    fallbackUsed: false,
    definition,
  };
}
