import type { RouteId, RouteVisualDefinition } from "../types/routes";

export const ROUTE_VISUAL_DEFINITIONS: Record<RouteId, RouteVisualDefinition> = {
  school: {
    routeId: "school",
    baseColor: "#0b2540",
    accentColor: "#27d7d3",
    secondaryColor: "#74f4ff",
    highlightColor: "#eafdff",
    iconAsset: "school-current-fishline",
    cardBackgroundAsset: "school-current-deep-flow",
    hoverVfx: "school-current-school-glide",
    selectedVfx: "school-current-outflow",
    ambientVfx: "school-current-ambient-fish",
    activeChipIcon: "◈",
    depthRailAccent: "soft-aqua-stream",
    audioKeys: {
      checkpoint: "route_checkpoint_sting",
      cardsReveal: "route_cards_reveal",
      hover: "route_school_hover",
      confirm: "route_confirm",
      ambientLoop: "route_school_ambient_loop",
    },
    reducedMotionFallback: "school-current-static-fishline",
  },
  golden: {
    routeId: "golden",
    baseColor: "#071b36",
    accentColor: "#e7b84a",
    secondaryColor: "#f4a948",
    highlightColor: "#fff2c7",
    iconAsset: "golden-current-rare-fish",
    cardBackgroundAsset: "golden-current-midnight-glow",
    hoverVfx: "golden-current-shimmer",
    selectedVfx: "golden-current-ribbon",
    ambientVfx: "golden-current-gold-dust",
    activeChipIcon: "✦",
    depthRailAccent: "thin-gold-stream",
    audioKeys: {
      checkpoint: "route_checkpoint_sting",
      cardsReveal: "route_cards_reveal",
      hover: "route_golden_hover",
      confirm: "route_confirm",
      ambientLoop: "route_golden_ambient_loop",
    },
    reducedMotionFallback: "golden-current-static-pearl",
  },
  storm: {
    routeId: "storm",
    baseColor: "#08142f",
    accentColor: "#8d70ff",
    secondaryColor: "#4dcdff",
    highlightColor: "#c6a6ff",
    iconAsset: "storm-trench-lightning",
    cardBackgroundAsset: "storm-trench-abyss-cleft",
    hoverVfx: "storm-trench-arc",
    selectedVfx: "storm-trench-low-strike",
    ambientVfx: "storm-trench-distant-electric",
    activeChipIcon: "ϟ",
    depthRailAccent: "indigo-electric-thread",
    audioKeys: {
      checkpoint: "route_checkpoint_sting",
      cardsReveal: "route_cards_reveal",
      hover: "route_storm_hover",
      confirm: "route_confirm",
      ambientLoop: "route_storm_ambient_loop",
    },
    reducedMotionFallback: "storm-trench-static-cleft",
  },
};

export function getRouteVisualDefinition(routeId: RouteId) {
  return ROUTE_VISUAL_DEFINITIONS[routeId];
}
