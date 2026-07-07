import type { RouteDefinition, RouteId } from "../types/routes";

export const ROUTE_CHECKPOINT_ZONES = [15, 25, 50, 75] as const;
export const ROUTE_SEGMENT_LENGTH = 25;

export const ROUTE_DEFINITIONS: Record<RouteId, RouteDefinition> = {
  school: {
    id: "school",
    name: "SCHOOL CURRENT",
    shortName: "SCHOOL",
    subtitle: "DENSE CATCHES",
    description: "More visible targets and faster catch chains.",
    tags: ["MORE FISH", "TWIN FISH", "STEADY"],
    icon: "SC",
    color: "#42f1dc",
    accentClass: "route-school",
    tuning: {
      generalFishCountMultiplier: 1.3,
      lowValueWeightMultiplier: 1.25,
      highValueWeightMultiplier: 0.72,
      eventTypeWeight: {
        twin: 1.8,
        pearl: 0.8,
        puffer: 0.8,
        thunder: 0.6,
      },
    },
  },
  golden: {
    id: "golden",
    name: "GOLDEN CURRENT",
    shortName: "GOLDEN",
    subtitle: "RARE TREASURES",
    description: "Fewer targets, rarer catches, greater upside.",
    tags: ["RARE FISH", "PEARL", "HIGH SWING"],
    icon: "GC",
    color: "#ffd35a",
    accentClass: "route-golden",
    tuning: {
      generalFishCountMultiplier: 0.84,
      lowValueWeightMultiplier: 0.72,
      highValueWeightMultiplier: 1.5,
      eventTypeWeight: {
        twin: 0.65,
        pearl: 2,
        puffer: 0.7,
        thunder: 0.7,
      },
    },
  },
  storm: {
    id: "storm",
    name: "STORM TRENCH",
    shortName: "STORM",
    subtitle: "ELECTRIFIED HUNT",
    description: "Electrified waters create powerful catch opportunities.",
    tags: ["PUFFER", "JELLY", "LOCK-ON"],
    icon: "ST",
    color: "#9b8cff",
    accentClass: "route-storm",
    tuning: {
      generalFishCountMultiplier: 0.93,
      lowValueWeightMultiplier: 0.85,
      highValueWeightMultiplier: 1.18,
      eventTypeWeight: {
        twin: 0.6,
        pearl: 0.7,
        puffer: 1.45,
        thunder: 1.45,
      },
    },
  },
};

export const ROUTE_IDS = Object.keys(ROUTE_DEFINITIONS) as RouteId[];

export function getRouteDefinition(id: RouteId) {
  return ROUTE_DEFINITIONS[id];
}

export function isRouteCheckpoint(zone: number) {
  return ROUTE_CHECKPOINT_ZONES.includes(zone as (typeof ROUTE_CHECKPOINT_ZONES)[number]);
}

export function routeSegmentForCheckpoint(checkpointZone: number) {
  const nextCheckpoint = ROUTE_CHECKPOINT_ZONES.find((zone) => zone > checkpointZone);
  return {
    startZone: checkpointZone + 1,
    endZone: nextCheckpoint ?? Math.min(100, checkpointZone + ROUTE_SEGMENT_LENGTH),
  };
}
