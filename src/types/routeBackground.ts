import type { RouteId } from "./routes";

export type RouteDepthLayer = 1 | 2 | 3 | 4;

export interface RouteBackgroundDefinition {
  routeId: RouteId;
  depthLayer: RouteDepthLayer;
  generatedBackgroundAsset: string;
  mobileBackgroundAsset?: string;
  sourceAssetPath: string;
  farBackgroundAsset: string;
  midBackgroundAsset: string;
  nearBackgroundAsset: string;
  ambientParticlePreset: "bubbles" | "goldDust" | "electricMist";
  silhouettePreset: "schoolFish" | "treasureRuins" | "stormTrench";
  lightShaftPreset: "aquaFlow" | "warmGold" | "coldIndigo";
  optionalPropPreset: "reefLife" | "sunkenTreasure" | "abyssCleft";
  colorGrading: {
    top: string;
    mid: string;
    bottom: string;
    accent: string;
    secondary: string;
  };
  overlayOpacity: number;
  animationProfile: "gentleFlow" | "rareGlimmer" | "distantStorm";
  reducedMotionFallback: string;
}
