import { GAME_CONFIG } from "../config/gameConfig";
import { HOOK_ANOMALY_CONFIG } from "../config/hookAnomalyConfig";
import type { HookAnomalyEventId, HookAnomalyState, HookPersistentEffectId, HookRustLevel } from "../types/hookAnomaly";
import type { RouteId } from "../types/routes";
import { createInitialHookAnomalyState } from "../state/HookAnomalyController";
import { applyRustedGrip } from "../state/HookRustState";
import { createRng, type Rng, weightedPick } from "./random";
import { rollHookAnomaly } from "./hookAnomalyRoll";

export interface HookAnomalySimulationBucket {
  label: string;
  runs: number;
  pullDepth: number;
  routeId: RouteId | null;
  extraBet: boolean;
  triggerRate: number;
  positiveRate: number;
  negativeRate: number;
  averageEvents: number;
  averageRepairCount: number;
  averageAbandonCount: number;
  repairCostToTotalBet: number;
  breakRiskRate: number;
  actualBreakRate: number;
  trueRareSignalRate: number;
  falseRareSignalRate: number;
  eventDistribution: Record<HookAnomalyEventId, number>;
}

export interface HookAnomalySimulationReport {
  runsPerBucket: number;
  totalRuns: number;
  assumptions: string[];
  buckets: HookAnomalySimulationBucket[];
}

const EVENT_IDS: HookAnomalyEventId[] = [
  "abyssEcho",
  "goldenTide",
  "treasureWake",
  "tidebornCall",
  "luckyBait",
  "abyssBeacon",
  "gildedHook",
  "rustedGrip",
  "panicCurrent",
  "abyssPredator",
];

function pickDuration(rng: Rng) {
  return weightedPick(rng, HOOK_ANOMALY_CONFIG.durationWeights.map((item) => ({ item: item.duration, weight: item.weight })));
}

function decrementPersistent(state: HookAnomalyState, ids: HookPersistentEffectId[]) {
  for (const id of ids) {
    const effect = state.persistent[id];
    if (!effect) continue;
    const remaining = effect.remaining - 1;
    if (remaining > 0) {
      state.persistent[id] = { ...effect, remaining };
    } else {
      delete state.persistent[id];
    }
  }
}

function createEventCounter() {
  return EVENT_IDS.reduce((acc, id) => {
    acc[id] = 0;
    return acc;
  }, {} as Record<HookAnomalyEventId, number>);
}

function simulateBucket(params: {
  runs: number;
  pullDepth: number;
  routeId: RouteId | null;
  extraBet: boolean;
  seed: number;
}): HookAnomalySimulationBucket {
  const eventCounts = createEventCounter();
  let eventTotal = 0;
  let positive = 0;
  let negative = 0;
  let legalChecks = 0;
  let repairCount = 0;
  let abandonCount = 0;
  let repairCost = 0;
  let totalBet = 0;
  let breakRiskVisits = 0;
  let actualBreaks = 0;
  let trueSignal = 0;
  let falseSignal = 0;

  for (let run = 0; run < params.runs; run += 1) {
    const rng = createRng(params.seed + run * 7919 + params.pullDepth * 37 + (params.extraBet ? 99991 : 0));
    let state = createInitialHookAnomalyState();
    let rust: HookRustLevel = "normal";
    let abandoned = false;

    for (let zone = 1; zone <= params.pullDepth; zone += 1) {
      const wager = GAME_CONFIG.defaultBet * (params.extraBet ? GAME_CONFIG.extraBet.costMultiplier : 1);
      totalBet += wager;
      const existingPersistent = Object.keys(state.persistent) as HookPersistentEffectId[];
      const roll = rollHookAnomaly({ state, zone, rng, routeId: params.routeId, skip: false });
      state = roll.state;
      decrementPersistent(state, existingPersistent);
      if (roll.finalChance > 0) legalChecks += 1;
      if (!roll.triggered || !roll.eventId || !roll.polarity) continue;

      eventTotal += 1;
      eventCounts[roll.eventId] += 1;
      if (roll.polarity === "positive") positive += 1;
      if (roll.polarity === "negative") negative += 1;

      if (roll.eventId === "abyssEcho") {
        if (rng.chance(HOOK_ANOMALY_CONFIG.rareSignalTruthChance)) trueSignal += 1;
        else falseSignal += 1;
      }

      if (roll.eventId === "luckyBait" || roll.eventId === "abyssBeacon" || roll.eventId === "gildedHook") {
        state.persistent[roll.eventId] = { id: roll.eventId, remaining: pickDuration(rng) };
      }

      if (roll.eventId === "rustedGrip") {
        if (rust === "break_risk") breakRiskVisits += 1;
        const rustResult = applyRustedGrip(rust, rng);
        rust = rustResult.rust;
        state.rust = rust;
        if (rustResult.brokeHook) {
          actualBreaks += 1;
          if (rng.chance(0.85)) {
            repairCount += 1;
            repairCost += GAME_CONFIG.defaultBet * HOOK_ANOMALY_CONFIG.repairCostMultiplier;
            totalBet += GAME_CONFIG.defaultBet * HOOK_ANOMALY_CONFIG.repairCostMultiplier;
            rust = "normal";
            state.rust = "normal";
            state.broken = false;
          } else {
            abandonCount += 1;
            abandoned = true;
          }
        }
      }

      if (abandoned) break;
    }
  }

  const eventDistribution = createEventCounter();
  for (const id of EVENT_IDS) {
    eventDistribution[id] = eventTotal > 0 ? eventCounts[id] / eventTotal : 0;
  }

  return {
    label: `${params.extraBet ? "extra" : "base"} / ${params.routeId ?? "no-route"} / pull-${params.pullDepth}`,
    runs: params.runs,
    pullDepth: params.pullDepth,
    routeId: params.routeId,
    extraBet: params.extraBet,
    triggerRate: legalChecks > 0 ? eventTotal / legalChecks : 0,
    positiveRate: eventTotal > 0 ? positive / eventTotal : 0,
    negativeRate: eventTotal > 0 ? negative / eventTotal : 0,
    averageEvents: eventTotal / params.runs,
    averageRepairCount: repairCount / params.runs,
    averageAbandonCount: abandonCount / params.runs,
    repairCostToTotalBet: totalBet > 0 ? repairCost / totalBet : 0,
    breakRiskRate: eventTotal > 0 ? breakRiskVisits / eventTotal : 0,
    actualBreakRate: eventTotal > 0 ? actualBreaks / eventTotal : 0,
    trueRareSignalRate: trueSignal + falseSignal > 0 ? trueSignal / (trueSignal + falseSignal) : 0,
    falseRareSignalRate: trueSignal + falseSignal > 0 ? falseSignal / (trueSignal + falseSignal) : 0,
    eventDistribution,
  };
}

export function simulateHookAnomalyRuns(runsPerBucket = 100000): HookAnomalySimulationReport {
  const pullDepths = [25, 60, 100];
  const routes: Array<RouteId | null> = [null, "school", "golden", "storm"];
  const buckets: HookAnomalySimulationBucket[] = [];
  let seed = 410021;

  for (const extraBet of [false, true]) {
    for (const routeId of routes) {
      for (const pullDepth of pullDepths) {
        buckets.push(simulateBucket({ runs: runsPerBucket, pullDepth, routeId, extraBet, seed }));
        seed += 100003;
      }
    }
  }

  return {
    runsPerBucket,
    totalRuns: buckets.reduce((sum, bucket) => sum + bucket.runs, 0),
    assumptions: [
      "Hook Event trigger checks use hookAnomalyConfig and hookAnomalyPools only; Extra Bet does not alter trigger rate.",
      "Repair choice is modeled as 85% repair / 15% abandon after an actual break for demo pacing stress testing.",
      "This validates Hook Anomaly frequency and state pressure, not formal RTP certification.",
    ],
    buckets,
  };
}
