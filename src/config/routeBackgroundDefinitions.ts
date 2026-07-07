import type { RouteDepthLayer, RouteBackgroundDefinition } from "../types/routeBackground";
import type { RouteId } from "../types/routes";
import goldenCurrentBg from "../assets/route-backgrounds/golden-current-bg.png";
import goldenCurrentBgMobile from "../assets/route-backgrounds/golden-current-bg-mobile.jpg";
import schoolCurrentBg from "../assets/route-backgrounds/school-current-bg.png";
import schoolCurrentBgMobile from "../assets/route-backgrounds/school-current-bg-mobile.jpg";
import stormTrenchBg from "../assets/route-backgrounds/storm-trench-bg.png";
import stormTrenchBgMobile from "../assets/route-backgrounds/storm-trench-bg-mobile.jpg";

export function depthLayerForZone(zone: number): RouteDepthLayer {
  if (zone <= 25) return 1;
  if (zone <= 50) return 2;
  if (zone <= 75) return 3;
  return 4;
}

const school = {
  routeId: "school" as const,
  generatedBackgroundAsset: schoolCurrentBg,
  mobileBackgroundAsset: schoolCurrentBgMobile,
  sourceAssetPath: "src/assets/route-backgrounds/school-current-bg.png",
  ambientParticlePreset: "bubbles" as const,
  silhouettePreset: "schoolFish" as const,
  lightShaftPreset: "aquaFlow" as const,
  optionalPropPreset: "reefLife" as const,
  animationProfile: "gentleFlow" as const,
};

const golden = {
  routeId: "golden" as const,
  generatedBackgroundAsset: goldenCurrentBg,
  mobileBackgroundAsset: goldenCurrentBgMobile,
  sourceAssetPath: "src/assets/route-backgrounds/golden-current-bg.png",
  ambientParticlePreset: "goldDust" as const,
  silhouettePreset: "treasureRuins" as const,
  lightShaftPreset: "warmGold" as const,
  optionalPropPreset: "sunkenTreasure" as const,
  animationProfile: "rareGlimmer" as const,
};

const storm = {
  routeId: "storm" as const,
  generatedBackgroundAsset: stormTrenchBg,
  mobileBackgroundAsset: stormTrenchBgMobile,
  sourceAssetPath: "src/assets/route-backgrounds/storm-trench-bg.png",
  ambientParticlePreset: "electricMist" as const,
  silhouettePreset: "stormTrench" as const,
  lightShaftPreset: "coldIndigo" as const,
  optionalPropPreset: "abyssCleft" as const,
  animationProfile: "distantStorm" as const,
};

export const ROUTE_BACKGROUND_DEFINITIONS: Record<RouteId, Record<RouteDepthLayer, RouteBackgroundDefinition>> = {
  school: {
    1: {
      ...school,
      depthLayer: 1,
      farBackgroundAsset: "school-l1-far-blue-green-corridor",
      midBackgroundAsset: "school-l1-mid-soft-reef-school",
      nearBackgroundAsset: "school-l1-near-seagrass-bubbles",
      colorGrading: { top: "#155e8c", mid: "#0b476b", bottom: "#092541", accent: "#27d7d3", secondary: "#74f4ff" },
      overlayOpacity: 0.66,
      reducedMotionFallback: "school-l1-static-current",
    },
    2: {
      ...school,
      depthLayer: 2,
      farBackgroundAsset: "school-l2-far-deeper-current",
      midBackgroundAsset: "school-l2-mid-dense-flowline",
      nearBackgroundAsset: "school-l2-near-rock-reef",
      colorGrading: { top: "#0d456d", mid: "#08395c", bottom: "#071d39", accent: "#22c9cb", secondary: "#66e8f2" },
      overlayOpacity: 0.7,
      reducedMotionFallback: "school-l2-static-current",
    },
    3: {
      ...school,
      depthLayer: 3,
      farBackgroundAsset: "school-l3-far-clustered-school",
      midBackgroundAsset: "school-l3-mid-blue-green-trench",
      nearBackgroundAsset: "school-l3-near-dark-coral-edge",
      colorGrading: { top: "#0a3358", mid: "#072847", bottom: "#061632", accent: "#1db8bf", secondary: "#54dbe6" },
      overlayOpacity: 0.72,
      reducedMotionFallback: "school-l3-static-current",
    },
    4: {
      ...school,
      depthLayer: 4,
      farBackgroundAsset: "school-l4-far-abyss-school-stream",
      midBackgroundAsset: "school-l4-mid-deep-flow-shadow",
      nearBackgroundAsset: "school-l4-near-muted-reef",
      colorGrading: { top: "#082845", mid: "#061d38", bottom: "#050d28", accent: "#1399aa", secondary: "#42cad6" },
      overlayOpacity: 0.7,
      reducedMotionFallback: "school-l4-static-current",
    },
  },
  golden: {
    1: {
      ...golden,
      depthLayer: 1,
      farBackgroundAsset: "golden-l1-far-sunken-glimmer",
      midBackgroundAsset: "golden-l1-mid-ship-silhouette",
      nearBackgroundAsset: "golden-l1-near-pearl-sand",
      colorGrading: { top: "#0b3a66", mid: "#082a4f", bottom: "#071b36", accent: "#e7b84a", secondary: "#fff2c7" },
      overlayOpacity: 0.6,
      reducedMotionFallback: "golden-l1-static-glimmer",
    },
    2: {
      ...golden,
      depthLayer: 2,
      farBackgroundAsset: "golden-l2-far-pearl-grotto",
      midBackgroundAsset: "golden-l2-mid-ruin-arches",
      nearBackgroundAsset: "golden-l2-near-metal-fragments",
      colorGrading: { top: "#092f59", mid: "#072346", bottom: "#06162f", accent: "#dfa941", secondary: "#f4c979" },
      overlayOpacity: 0.64,
      reducedMotionFallback: "golden-l2-static-glimmer",
    },
    3: {
      ...golden,
      depthLayer: 3,
      farBackgroundAsset: "golden-l3-far-ancient-ruins",
      midBackgroundAsset: "golden-l3-mid-focused-treasure-reflect",
      nearBackgroundAsset: "golden-l3-near-dark-column",
      colorGrading: { top: "#082647", mid: "#061d3c", bottom: "#050f28", accent: "#d99734", secondary: "#f3c86d" },
      overlayOpacity: 0.66,
      reducedMotionFallback: "golden-l3-static-glimmer",
    },
    4: {
      ...golden,
      depthLayer: 4,
      farBackgroundAsset: "golden-l4-far-abyss-treasure-cleft",
      midBackgroundAsset: "golden-l4-mid-rare-glint-void",
      nearBackgroundAsset: "golden-l4-near-sparse-gold-stone",
      colorGrading: { top: "#071f3d", mid: "#051833", bottom: "#040b22", accent: "#c8812a", secondary: "#e9b85f" },
      overlayOpacity: 0.62,
      reducedMotionFallback: "golden-l4-static-glimmer",
    },
  },
  storm: {
    1: {
      ...storm,
      depthLayer: 1,
      farBackgroundAsset: "storm-l1-far-first-cleft",
      midBackgroundAsset: "storm-l1-mid-faint-electric-wall",
      nearBackgroundAsset: "storm-l1-near-indigo-stone",
      colorGrading: { top: "#0b315b", mid: "#0a244b", bottom: "#08142f", accent: "#8d70ff", secondary: "#4dcdff" },
      overlayOpacity: 0.64,
      reducedMotionFallback: "storm-l1-static-cleft",
    },
    2: {
      ...storm,
      depthLayer: 2,
      farBackgroundAsset: "storm-l2-far-indigo-canyon",
      midBackgroundAsset: "storm-l2-mid-deeper-rock-wall",
      nearBackgroundAsset: "storm-l2-near-electric-mist",
      colorGrading: { top: "#09274f", mid: "#081d3e", bottom: "#06112c", accent: "#8168f2", secondary: "#42bfe8" },
      overlayOpacity: 0.7,
      reducedMotionFallback: "storm-l2-static-cleft",
    },
    3: {
      ...storm,
      depthLayer: 3,
      farBackgroundAsset: "storm-l3-far-deep-fissure-lightning",
      midBackgroundAsset: "storm-l3-mid-sharp-trench",
      nearBackgroundAsset: "storm-l3-near-cold-violet-fog",
      colorGrading: { top: "#081f43", mid: "#071733", bottom: "#050d27", accent: "#745cf0", secondary: "#38add8" },
      overlayOpacity: 0.74,
      reducedMotionFallback: "storm-l3-static-cleft",
    },
    4: {
      ...storm,
      depthLayer: 4,
      farBackgroundAsset: "storm-l4-far-abyss-pressure",
      midBackgroundAsset: "storm-l4-mid-black-indigo-cleft",
      nearBackgroundAsset: "storm-l4-near-sparse-electric-edges",
      colorGrading: { top: "#071938", mid: "#050f2a", bottom: "#03071e", accent: "#6852d8", secondary: "#3298c9" },
      overlayOpacity: 0.76,
      reducedMotionFallback: "storm-l4-static-cleft",
    },
  },
};

export function getRouteBackgroundDefinition(routeId: RouteId, depthLayer: RouteDepthLayer) {
  return ROUTE_BACKGROUND_DEFINITIONS[routeId][depthLayer];
}
