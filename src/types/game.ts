export type FishTier = "low" | "high" | "tool";

export type EventType = "twin" | "pearl" | "puffer" | "thunder";

export type ScenarioId =
  | "random"
  | "normal"
  | "event-chain"
  | "big-win"
  | "route-school"
  | "route-golden"
  | "route-storm";

export type PullUpPhase = "idle" | "cameraSetup" | "vortexBuild" | "routeSweep" | "lowFishCollect" | "highFishChallenge" | "finish";

export type PullFishVisualState =
  | "swimming"
  | "disturbed"
  | "vortexHeld"
  | "struggling"
  | "hooked"
  | "escaped"
  | "exited";

export interface FishSpecies {
  id: string;
  name: string;
  tier: FishTier;
  multiplier: number;
  catchRate: number;
  color: string;
  spawnWeight?: number;
  eventType?: EventType;
}

export type FishDirection = -1 | 1;

export interface FishEntity {
  id: string;
  speciesId: string;
  name: string;
  tier: FishTier;
  zone: number;
  x: number;
  y: number;
  size: number;
  direction: FishDirection;
  swimDistance: number;
  swimDuration: number;
  bobDuration: number;
  swimDelay: number;
  bobDistance: number;
  sway: number;
  multiplier: number;
  catchRate: number;
  color: string;
  eventType?: EventType;
  eventSpawnChance?: number;
  eventTriggerRoll?: number;
  eventRange?: 1 | 3 | 5;
  eventMultiplier: number;
  guaranteed: boolean;
  duplicated: boolean;
  cloneOf?: string;
  affectedBy: EventType[];
  hookEffects?: import("./hookAnomaly").HookFishEffect[];
}

export interface DepthZone {
  id: number;
  depth: number;
  fish: FishEntity[];
}

export interface GameRun {
  seed: number;
  scenario: ScenarioId;
  zones: DepthZone[];
}

export interface EventLog {
  id: string;
  type: EventType;
  zone: number;
  title: string;
  message: string;
  targetIds: string[];
  targetZoneIds: number[];
  range: number;
  triggered: boolean;
  triggerRate: number;
  roll: number;
}

export interface ThunderState {
  remaining: number;
  reach: number;
  sourceZone: number;
}

export interface PullResultFish {
  fish: FishEntity;
  value: number;
  caught: boolean;
  roll: number;
  resolution: "auto-catch" | "reel-win" | "reel-miss";
}

export interface PullResult {
  totalBet: number;
  totalWin: number;
  winMultiplier: number;
  caught: PullResultFish[];
  missed: PullResultFish[];
  label: string;
  repairCost?: number;
  failed?: boolean;
}

export interface PullUpPlanItem {
  id: string;
  fish: FishEntity;
  zone: number;
  routeX: number;
  routeBend: number;
  startMs: number;
  durationMs: number;
  caught: boolean;
  value: number;
  roll: number;
  visualState: PullFishVisualState;
  resolution: "low-caught" | "low-missed" | "high-win" | "high-escape";
}

export interface PullUpPlan {
  id: string;
  seed: number;
  deepestZone: number;
  introMs: number;
  buildMs: number;
  finishMs: number;
  totalMs: number;
  routeStartMs: number;
  routeEndMs: number;
  items: PullUpPlanItem[];
  result: PullResult;
}
