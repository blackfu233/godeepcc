import type { SfxKey } from "./audioTypes";
import type { RouteId } from "../types/routes";
import { routeAmbientAudioKey, routeHoverAudioKey } from "../config/routeAudioDefinitions";

export const ROUTE_CHECKPOINT_STING: SfxKey = "route_checkpoint_sting";
export const ROUTE_CARDS_REVEAL: SfxKey = "route_cards_reveal";
export const ROUTE_CONFIRM: SfxKey = "route_confirm";
export const ROUTE_ACCENT_LOOP_ID = "route-accent";

export function routeHoverSfx(routeId: RouteId): SfxKey {
  return routeHoverAudioKey(routeId);
}

export function routeAmbientSfx(routeId: RouteId): SfxKey {
  return routeAmbientAudioKey(routeId);
}

export function routeAmbientVolume(routeId: RouteId) {
  if (routeId === "school") return 0.12;
  if (routeId === "golden") return 0.1;
  return 0.08;
}
