import { ANIMATION_MANIFEST } from "../config/animationManifest";
import { HOOK_ANOMALY_VFX_MANIFEST } from "../config/hookAnomalyVfxManifest";
import { ROUTE_BACKGROUND_DEFINITIONS } from "../config/routeBackgroundDefinitions";
import type { RouteId } from "../types/routes";

export type AssetGroup = "critical" | "routeChoice" | "pullUp" | "result" | `route:${RouteId}` | "hookSmall";

export function assetsForGroup(group: AssetGroup) {
  if (group === "critical") return [] as string[];
  if (group === "routeChoice") {
    return Object.values(ROUTE_BACKGROUND_DEFINITIONS).flatMap((byLayer) => [
      byLayer[1].mobileBackgroundAsset ?? byLayer[1].generatedBackgroundAsset,
    ]);
  }
  if (group === "pullUp") {
    return [ANIMATION_MANIFEST.vortexParticle.src, ANIMATION_MANIFEST.catchSplash.src];
  }
  if (group === "result") {
    return [ANIMATION_MANIFEST.bigWinBurst.src];
  }
  if (group === "hookSmall") {
    return [
      HOOK_ANOMALY_VFX_MANIFEST.bannerPositive.src,
      HOOK_ANOMALY_VFX_MANIFEST.bannerNegative.src,
      HOOK_ANOMALY_VFX_MANIFEST.hookGlowPositive.src,
      HOOK_ANOMALY_VFX_MANIFEST.hookGlowNegative.src,
    ];
  }
  if (group.startsWith("route:")) {
    const routeId = group.slice("route:".length) as RouteId;
    return Object.values(ROUTE_BACKGROUND_DEFINITIONS[routeId]).flatMap((definition) => [
      definition.mobileBackgroundAsset ?? definition.generatedBackgroundAsset,
    ]);
  }
  return [];
}
