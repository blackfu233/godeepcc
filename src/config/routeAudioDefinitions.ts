import type { SfxKey } from "../audio/audioTypes";
import type { RouteId } from "../types/routes";
import { getRouteVisualDefinition } from "./routeVisualDefinitions";

export const ROUTE_AUDIO_DUCK_DB = {
  event: -6,
  hookEvent: -6,
  pullUpFadeMs: 500,
} as const;

export function routeHoverAudioKey(routeId: RouteId): SfxKey {
  return getRouteVisualDefinition(routeId).audioKeys.hover as SfxKey;
}

export function routeAmbientAudioKey(routeId: RouteId): SfxKey {
  return getRouteVisualDefinition(routeId).audioKeys.ambientLoop as SfxKey;
}

export function routeConfirmAudioKey(routeId: RouteId): SfxKey {
  return getRouteVisualDefinition(routeId).audioKeys.confirm as SfxKey;
}
