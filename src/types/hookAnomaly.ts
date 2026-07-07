import type { EventType } from "./game";

export type HookAnomalyPolarity = "positive" | "negative";

export type HookRustLevel = "normal" | "light_rust" | "heavy_rust" | "break_risk";

export type HookAnomalyPositiveId =
  | "abyssEcho"
  | "goldenTide"
  | "treasureWake"
  | "tidebornCall"
  | "luckyBait"
  | "abyssBeacon"
  | "gildedHook";

export type HookAnomalyNegativeId = "rustedGrip" | "panicCurrent" | "abyssPredator";

export type HookAnomalyEventId = HookAnomalyPositiveId | HookAnomalyNegativeId;

export type HookPersistentEffectId = "luckyBait" | "abyssBeacon" | "gildedHook";

export type HookFishEffect = "goldenTide" | "treasureWake" | "gildedHook" | "panicCurrent" | "abyssPredator" | "rareSignal";

export interface HookPersistentEffect {
  id: HookPersistentEffectId;
  remaining: number;
}

export interface HookRareSignalState {
  targetZone: number;
  remaining: number;
  real: boolean;
  revealed: boolean;
}

export interface HookAnomalyDebugState {
  cooldown: number;
  pity: number;
  finalChance: number;
  roll: number | null;
  triggered: boolean;
  lastEventId: HookAnomalyEventId | null;
  lastPolarity: HookAnomalyPolarity | null;
}

export interface HookAnomalyState {
  cooldown: number;
  pity: number;
  rust: HookRustLevel;
  broken: boolean;
  persistent: Partial<Record<HookPersistentEffectId, HookPersistentEffect>>;
  rareSignal: HookRareSignalState | null;
  debug: HookAnomalyDebugState;
  history: HookAnomalyLog[];
}

export interface HookAnomalyRollResult {
  state: HookAnomalyState;
  triggered: boolean;
  eventId: HookAnomalyEventId | null;
  polarity: HookAnomalyPolarity | null;
  finalChance: number;
  roll: number | null;
  positiveRate: number;
  polarityRoll: number | null;
}

export interface HookAnomalyDefinition {
  id: HookAnomalyEventId;
  polarity: HookAnomalyPolarity;
  title: string;
  subtitle: string;
  weight: number;
}

export interface HookAnomalyLog {
  id: string;
  eventId: HookAnomalyEventId;
  polarity: HookAnomalyPolarity;
  title: string;
  subtitle: string;
  zone: number;
  targetZoneIds: number[];
  targetIds: string[];
  triggered: boolean;
  finalChance: number;
  roll: number;
  message: string;
  summonedEventType?: EventType;
  breakRoll?: number;
  brokeHook?: boolean;
  repairCost?: number;
}

export interface HookBreakState {
  log: HookAnomalyLog;
}
