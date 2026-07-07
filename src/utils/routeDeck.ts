import { ROUTE_IDS, routeSegmentForCheckpoint } from "../config/routeDefinitions";
import type { ScenarioId } from "../types/game";
import type { RouteChoiceState, RouteId } from "../types/routes";
import { createRng } from "./random";

const demoOptions: Partial<Record<ScenarioId, Partial<Record<number, RouteId[]>>>> = {
  "route-school": {
    15: ["school", "golden"],
  },
  "route-golden": {
    50: ["golden", "storm"],
  },
  "route-storm": {
    75: ["storm", "school"],
  },
};

export const demoChosenRoute: Partial<Record<ScenarioId, RouteId>> = {
  "route-school": "school",
  "route-golden": "golden",
  "route-storm": "storm",
};

export function routeOptionsForCheckpoint(params: {
  scenario: ScenarioId;
  seed: number;
  checkpointZone: number;
}): RouteId[] {
  const forced = demoOptions[params.scenario]?.[params.checkpointZone];
  if (forced) return forced;

  const rng = createRng(params.seed + params.checkpointZone * 811);
  const deck = [...ROUTE_IDS];
  const first = deck.splice(rng.int(0, deck.length - 1), 1)[0];
  const second = deck.splice(rng.int(0, deck.length - 1), 1)[0];
  return [first, second];
}

export function createRouteChoice(params: {
  scenario: ScenarioId;
  seed: number;
  checkpointZone: number;
}): RouteChoiceState {
  const segment = routeSegmentForCheckpoint(params.checkpointZone);
  return {
    checkpointZone: params.checkpointZone,
    startZone: segment.startZone,
    endZone: segment.endZone,
    options: routeOptionsForCheckpoint(params),
  };
}
