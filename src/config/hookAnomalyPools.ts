import type { EventType } from "../types/game";
import type { HookAnomalyDefinition, HookAnomalyEventId, HookAnomalyNegativeId, HookAnomalyPositiveId } from "../types/hookAnomaly";
import type { RouteId } from "../types/routes";

export const HOOK_ANOMALY_TEXT: Record<HookAnomalyEventId, { title: string; subtitle: string; message: string }> = {
  abyssEcho: {
    title: "ABYSS ECHO",
    subtitle: "RARE SIGNAL",
    message: "A sonar mark appears below the hook.",
  },
  goldenTide: {
    title: "GOLDEN TIDE",
    subtitle: "TARGETS ENRICHED",
    message: "Current-zone fish gain a +2 value surge.",
  },
  treasureWake: {
    title: "TREASURE WAKE",
    subtitle: "SCHOOL AHEAD",
    message: "A richer school gathers in the lower water.",
  },
  tidebornCall: {
    title: "TIDEBORN CALL",
    subtitle: "EVENT FISH SUMMONED",
    message: "The hook calls a special fish into the current.",
  },
  luckyBait: {
    title: "LUCKY BAIT",
    subtitle: "SIGNAL BOOST",
    message: "Rare Signal events become more likely for several dives.",
  },
  abyssBeacon: {
    title: "ABYSS BEACON",
    subtitle: "DEEPER VIEW",
    message: "The hook reveals one more zone below.",
  },
  gildedHook: {
    title: "GILDED HOOK",
    subtitle: "VALUE SURGE",
    message: "New zones receive a small golden value boost.",
  },
  rustedGrip: {
    title: "RUSTED GRIP",
    subtitle: "HOOK DAMAGED",
    message: "Rust creeps across the hook.",
  },
  panicCurrent: {
    title: "PANIC CURRENT",
    subtitle: "FISH FLEE BELOW",
    message: "Some fish escape deeper instead of vanishing.",
  },
  abyssPredator: {
    title: "ABYSS PREDATOR",
    subtitle: "LOW FISH SCATTER",
    message: "A predator shadow clears smaller fish from the zone.",
  },
};

export const HOOK_POSITIVE_POOL: HookAnomalyDefinition[] = [
  { id: "abyssEcho", polarity: "positive", weight: 25, ...HOOK_ANOMALY_TEXT.abyssEcho },
  { id: "goldenTide", polarity: "positive", weight: 20, ...HOOK_ANOMALY_TEXT.goldenTide },
  { id: "treasureWake", polarity: "positive", weight: 20, ...HOOK_ANOMALY_TEXT.treasureWake },
  { id: "tidebornCall", polarity: "positive", weight: 20, ...HOOK_ANOMALY_TEXT.tidebornCall },
  { id: "luckyBait", polarity: "positive", weight: 5, ...HOOK_ANOMALY_TEXT.luckyBait },
  { id: "abyssBeacon", polarity: "positive", weight: 5, ...HOOK_ANOMALY_TEXT.abyssBeacon },
  { id: "gildedHook", polarity: "positive", weight: 5, ...HOOK_ANOMALY_TEXT.gildedHook },
];

export const HOOK_NEGATIVE_POOL: HookAnomalyDefinition[] = [
  { id: "rustedGrip", polarity: "negative", weight: 35, ...HOOK_ANOMALY_TEXT.rustedGrip },
  { id: "panicCurrent", polarity: "negative", weight: 40, ...HOOK_ANOMALY_TEXT.panicCurrent },
  { id: "abyssPredator", polarity: "negative", weight: 25, ...HOOK_ANOMALY_TEXT.abyssPredator },
];

export const TIDEBORN_CALL_EVENT_WEIGHTS: Array<{ type: EventType; weight: number }> = [
  { type: "twin", weight: 30 },
  { type: "pearl", weight: 30 },
  { type: "puffer", weight: 25 },
  { type: "thunder", weight: 15 },
];

export function routeAdjustedHookWeight(id: HookAnomalyEventId, baseWeight: number, routeId?: RouteId | null) {
  if (routeId === "school" && id === "treasureWake") return baseWeight * 1.35;
  if (routeId === "golden" && (id === "abyssEcho" || id === "goldenTide")) return baseWeight * 1.35;
  if (routeId === "storm" && id === "rustedGrip") return baseWeight * 1.3;
  if (routeId === "storm" && id === "panicCurrent") return baseWeight * 1.25;
  return baseWeight;
}

export function routeAdjustedTidebornWeight(type: EventType, baseWeight: number, routeId?: RouteId | null) {
  if (routeId === "school" && type === "twin") return baseWeight * 1.5;
  if (routeId === "golden" && type === "pearl") return baseWeight * 1.5;
  if (routeId === "storm" && (type === "puffer" || type === "thunder")) return baseWeight * 1.4;
  return baseWeight;
}

export function positiveDefinition(id: HookAnomalyPositiveId) {
  return HOOK_POSITIVE_POOL.find((item) => item.id === id)!;
}

export function negativeDefinition(id: HookAnomalyNegativeId) {
  return HOOK_NEGATIVE_POOL.find((item) => item.id === id)!;
}
