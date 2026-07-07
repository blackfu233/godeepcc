import type { EventType } from "./game";

export type RouteId = "school" | "golden" | "storm";

export interface RouteTuning {
  generalFishCountMultiplier: number;
  lowValueWeightMultiplier: number;
  highValueWeightMultiplier: number;
  eventTypeWeight: Record<EventType, number>;
}

export interface RouteDefinition {
  id: RouteId;
  name: string;
  shortName: string;
  subtitle: string;
  description: string;
  tags: string[];
  icon: string;
  color: string;
  accentClass: string;
  tuning: RouteTuning;
}

export interface RouteVisualDefinition {
  routeId: RouteId;
  baseColor: string;
  accentColor: string;
  secondaryColor: string;
  highlightColor: string;
  iconAsset: string;
  cardBackgroundAsset: string;
  hoverVfx: string;
  selectedVfx: string;
  ambientVfx: string;
  activeChipIcon: string;
  depthRailAccent: string;
  audioKeys: {
    checkpoint: string;
    cardsReveal: string;
    hover: string;
    confirm: string;
    ambientLoop: string;
  };
  reducedMotionFallback: string;
}

export interface ActiveRoute {
  id: RouteId;
  selectedAtZone: number;
  startZone: number;
  endZone: number;
}

export interface RouteChoiceState {
  checkpointZone: number;
  startZone: number;
  endZone: number;
  options: RouteId[];
  selectedId?: RouteId;
  confirming?: boolean;
}
