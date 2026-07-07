import { GAME_CONFIG, SCENARIOS } from "../config/gameConfig";
import type { DepthZone, EventLog, PullUpPlan, ScenarioId, ThunderState } from "../types/game";
import { createPullUpPlan } from "./createPullUpPlan";
import { applyEvent, applyThunderStrike } from "./eventEngine";
import { generateRun } from "./generateRun";
import { createRng } from "./random";

interface SimulatedRound {
  depth: number;
  totalBet: number;
  plan: PullUpPlan;
  eventAppearances: number;
  eventTriggers: number;
  eventTypeTriggers: Record<string, number>;
  highSeen: number;
  highCaught: number;
  longestNoStimulusStreak: number;
}

interface Aggregate {
  rounds: number;
  avgDepth: number;
  avgGoDeep: number;
  avgTotalBet: number;
  avgTotalWin: number;
  avgReturnRatio: number;
  avgEventAppearances: number;
  avgEventTriggers: number;
  eventTypeTriggers: Record<string, number>;
  avgHighSeen: number;
  avgHighCaught: number;
  avgPullMs: number;
  minPullMs: number;
  maxPullMs: number;
  avgNoStimulusStreak: number;
}

function scenarioSeed(scenario: ScenarioId) {
  return SCENARIOS.find((item) => item.id === scenario)?.seed ?? SCENARIOS[0].seed;
}

function passedFish(zones: DepthZone[], depth: number) {
  return zones.filter((zone) => zone.id <= depth).flatMap((zone) => zone.fish);
}

function chooseDemoDepth(seed: number, zones: DepthZone[]) {
  const rng = createRng(seed * 17 + 91);
  let depth = 0;
  let interest = 0;
  for (let zone = 1; zone <= GAME_CONFIG.maxZones; zone += 1) {
    depth = zone;
    const fish = zones[zone - 1].fish;
    interest += fish.some((item) => item.tier === "tool") ? 2.2 : 0;
    interest += fish.some((item) => item.tier === "high") ? 1.1 : 0;
    const stopPressure = zone >= 4 ? (zone - 3) * 0.055 : 0;
    const continuePressure = Math.min(0.62, interest * 0.045);
    if (zone >= 6 && rng.next() + stopPressure > 0.74 + continuePressure) break;
    if (zone >= 14 && rng.chance(0.72)) break;
  }
  return Math.min(depth, GAME_CONFIG.maxZones);
}

export function applyEventsThroughDepth(params: {
  zones: DepthZone[];
  depth: number;
  scenario: ScenarioId;
  seed: number;
  extraBet: boolean;
}) {
  let zones = params.zones;
  let thunder: ThunderState | null = null;
  const logs: EventLog[] = [];
  let longestNoStimulusStreak = 0;
  let currentNoStimulusStreak = 0;

  for (let nextZone = 1; nextZone <= params.depth; nextZone += 1) {
    let stimulated = false;
    const zoneFish = zones[nextZone - 1].fish;
    if (zoneFish.some((fish) => fish.tier === "high" || fish.tier === "tool")) {
      stimulated = true;
    }

    if (thunder) {
      const strike = applyThunderStrike({ zones, thunder, currentZone: nextZone, scenario: params.scenario, seed: params.seed });
      zones = strike.zones;
      thunder = strike.thunder;
      logs.push(strike.log);
      stimulated = stimulated || strike.log.targetIds.length > 0;
    }

    const eventFish = zones[nextZone - 1].fish.find((fish) => fish.tier === "tool" && fish.eventType);
    if (eventFish) {
      const eventResult = applyEvent({ zones, eventFish, scenario: params.scenario, seed: params.seed, extraBetActive: params.extraBet });
      zones = eventResult.zones;
      stimulated = stimulated || eventResult.log.triggered;
      if (eventResult.thunder) {
        thunder = eventResult.thunder;
        logs.push(eventResult.log);
      } else {
        logs.push(eventResult.log);
      }
    }

    currentNoStimulusStreak = stimulated ? 0 : currentNoStimulusStreak + 1;
    longestNoStimulusStreak = Math.max(longestNoStimulusStreak, currentNoStimulusStreak);
  }

  return { zones, logs, thunder, longestNoStimulusStreak };
}

export function simulateRound(seed: number, extraBet = false, forcedDepth?: number): SimulatedRound {
  const scenario: ScenarioId = "random";
  const run = generateRun(scenario, seed);
  const depth = forcedDepth ?? chooseDemoDepth(seed, run.zones);
  const eventAppearances = passedFish(run.zones, depth).filter((fish) => fish.tier === "tool").length;
  const eventState = applyEventsThroughDepth({ zones: run.zones, depth, scenario, seed, extraBet });
  const baseBet = GAME_CONFIG.defaultBet;
  const totalBet = depth * baseBet * (extraBet ? GAME_CONFIG.extraBet.costMultiplier : 1);
  const plan = createPullUpPlan({
    zonesFish: passedFish(eventState.zones, depth),
    baseBet,
    totalBet,
    seed: seed + depth * 1009,
    deepestZone: depth,
  });
  const eventTypeTriggers: Record<string, number> = {};
  for (const log of eventState.logs) {
    if (!log.triggered || log.title === "Thunder Strike") continue;
    eventTypeTriggers[log.type] = (eventTypeTriggers[log.type] ?? 0) + 1;
  }
  const highSeen = passedFish(eventState.zones, depth).filter((fish) => fish.tier === "high").length;
  const highCaught = plan.result.caught.filter((entry) => entry.fish.tier === "high").length;
  const eventTriggers = Object.values(eventTypeTriggers).reduce((sum, count) => sum + count, 0);

  return {
    depth,
    totalBet,
    plan,
    eventAppearances,
    eventTriggers,
    eventTypeTriggers,
    highSeen,
    highCaught,
    longestNoStimulusStreak: eventState.longestNoStimulusStreak,
  };
}

function aggregate(rounds: SimulatedRound[]): Aggregate {
  const eventTypeTriggers: Record<string, number> = {};
  for (const round of rounds) {
    for (const [type, count] of Object.entries(round.eventTypeTriggers)) {
      eventTypeTriggers[type] = (eventTypeTriggers[type] ?? 0) + count;
    }
  }
  const sum = (fn: (round: SimulatedRound) => number) => rounds.reduce((total, round) => total + fn(round), 0);
  return {
    rounds: rounds.length,
    avgDepth: sum((round) => round.depth) / rounds.length,
    avgGoDeep: sum((round) => round.depth) / rounds.length,
    avgTotalBet: sum((round) => round.totalBet) / rounds.length,
    avgTotalWin: sum((round) => round.plan.result.totalWin) / rounds.length,
    avgReturnRatio: sum((round) => round.plan.result.totalBet > 0 ? round.plan.result.totalWin / round.plan.result.totalBet : 0) / rounds.length,
    avgEventAppearances: sum((round) => round.eventAppearances) / rounds.length,
    avgEventTriggers: sum((round) => round.eventTriggers) / rounds.length,
    eventTypeTriggers,
    avgHighSeen: sum((round) => round.highSeen) / rounds.length,
    avgHighCaught: sum((round) => round.highCaught) / rounds.length,
    avgPullMs: sum((round) => round.plan.totalMs) / rounds.length,
    minPullMs: Math.min(...rounds.map((round) => round.plan.totalMs)),
    maxPullMs: Math.max(...rounds.map((round) => round.plan.totalMs)),
    avgNoStimulusStreak: sum((round) => round.longestNoStimulusStreak) / rounds.length,
  };
}

function formatAggregate(title: string, aggregateResult: Aggregate) {
  const eventCounts = Object.entries(aggregateResult.eventTypeTriggers)
    .map(([type, count]) => `${type}: ${count}`)
    .join(", ") || "none";
  return [
    `### ${title}`,
    "",
    `- Rounds: ${aggregateResult.rounds}`,
    `- Average depth / Go Deep count: ${aggregateResult.avgDepth.toFixed(2)}`,
    `- Average Total Bet: ${aggregateResult.avgTotalBet.toFixed(2)}`,
    `- Average Total Win: ${aggregateResult.avgTotalWin.toFixed(2)}`,
    `- Average return ratio: ${aggregateResult.avgReturnRatio.toFixed(3)} (demo simulation, not RTP)`,
    `- Average event fish appearances: ${aggregateResult.avgEventAppearances.toFixed(2)}`,
    `- Average event triggers: ${aggregateResult.avgEventTriggers.toFixed(2)}`,
    `- Event trigger counts: ${eventCounts}`,
    `- Average high-value fish seen: ${aggregateResult.avgHighSeen.toFixed(2)}`,
    `- Average high-value fish caught: ${aggregateResult.avgHighCaught.toFixed(2)}`,
    `- Pull Up duration ms avg/min/max: ${aggregateResult.avgPullMs.toFixed(0)} / ${aggregateResult.minPullMs} / ${aggregateResult.maxPullMs}`,
    `- Average longest no-stimulus streak: ${aggregateResult.avgNoStimulusStreak.toFixed(2)} zones`,
  ].join("\n");
}

export function runSimulation(roundCount = 2000) {
  const normalRounds: SimulatedRound[] = [];
  const extraRounds: SimulatedRound[] = [];
  const earlyRounds: SimulatedRound[] = [];
  const deepRounds: SimulatedRound[] = [];
  const baseSeed = scenarioSeed("random");

  for (let index = 0; index < roundCount; index += 1) {
    const seed = baseSeed + index * 37;
    normalRounds.push(simulateRound(seed, false));
    extraRounds.push(simulateRound(seed, true));
    earlyRounds.push(simulateRound(seed, false, 4));
    deepRounds.push(simulateRound(seed, false, 12));
  }

  const buySeed = scenarioSeed("big-win") + GAME_CONFIG.buyFree.showcaseSeedOffset;
  const buyRun = generateRun("big-win", buySeed);
  const buyState = applyEventsThroughDepth({ zones: buyRun.zones, depth: GAME_CONFIG.maxZones, scenario: "big-win", seed: buySeed, extraBet: false });
  const buyCost = GAME_CONFIG.defaultBet * GAME_CONFIG.buyFree.costMultiplier;
  const buyPlan = createPullUpPlan({
    zonesFish: buyState.zones.flatMap((zone) => zone.fish),
    baseBet: GAME_CONFIG.defaultBet,
    totalBet: buyCost,
    seed: buySeed + GAME_CONFIG.maxZones * 1009,
    deepestZone: GAME_CONFIG.maxZones,
  });

  const normal = aggregate(normalRounds);
  const extra = aggregate(extraRounds);
  const early = aggregate(earlyRounds);
  const deep = aggregate(deepRounds);

  return {
    normal,
    extra,
    early,
    deep,
    buyFree: {
      seed: buySeed,
      totalBet: buyCost,
      totalWin: buyPlan.result.totalWin,
      winMultiplier: buyPlan.result.winMultiplier,
      label: buyPlan.result.label,
      pullMs: buyPlan.totalMs,
      highSeen: buyState.zones.flatMap((zone) => zone.fish).filter((fish) => fish.tier === "high").length,
      highCaught: buyPlan.result.caught.filter((entry) => entry.fish.tier === "high").length,
    },
    markdown: [
      "# Simulation Report",
      "",
      "This is a 2,000-round demo tuning simulation. It is not formal RTP and must not be used as production math.",
      "",
      formatAggregate("Random Run - Normal Bet", normal),
      "",
      formatAggregate("Random Run - Extra Bet", extra),
      "",
      "### Early vs Deep Pull Up",
      "",
      `- Early fixed depth 4 average return ratio: ${early.avgReturnRatio.toFixed(3)}`,
      `- Deep fixed depth 12 average return ratio: ${deep.avgReturnRatio.toFixed(3)}`,
      `- Early fixed depth 4 average Total Win: ${early.avgTotalWin.toFixed(2)}`,
      `- Deep fixed depth 12 average Total Win: ${deep.avgTotalWin.toFixed(2)}`,
      "",
      "### Buy Free Example",
      "",
      `- Fixed showcase seed: ${buySeed}`,
      `- Cost: ${buyCost}`,
      `- Total Win: ${buyPlan.result.totalWin}`,
      `- Win Multiplier: ${buyPlan.result.winMultiplier.toFixed(2)}x`,
      `- Label: ${buyPlan.result.label}`,
      `- Pull Up duration: ${buyPlan.totalMs}ms`,
      `- High fish seen/caught: ${buyState.zones.flatMap((zone) => zone.fish).filter((fish) => fish.tier === "high").length} / ${buyPlan.result.caught.filter((entry) => entry.fish.tier === "high").length}`,
      "",
      "## Findings",
      "",
      `- Extra Bet event triggers per round changed from ${normal.avgEventTriggers.toFixed(2)} to ${extra.avgEventTriggers.toFixed(2)}.`,
      `- Pull Up duration average is ${(normal.avgPullMs / 1000).toFixed(2)}s, with max ${(normal.maxPullMs / 1000).toFixed(2)}s in random heuristic play.`,
      `- Longest no-stimulus streak average is ${normal.avgNoStimulusStreak.toFixed(2)} zones.`,
    ].join("\n"),
  };
}

function checkpointStats(roundCount: number, extraBet: boolean) {
  const checkpoints = [10, 20, 40, 60, 100];
  const baseSeed = scenarioSeed("random");
  const stats = Object.fromEntries(checkpoints.map((depth) => [depth, {
    generated: 0,
    triggered: 0,
    noTriggerRounds: 0,
    totalBet: 0,
    totalWin: 0,
    highSeen: 0,
    potentialValue: 0,
  }]));
  const typeStats: Record<string, { generated: number; triggered: number }> = {
    twin: { generated: 0, triggered: 0 },
    pearl: { generated: 0, triggered: 0 },
    puffer: { generated: 0, triggered: 0 },
    thunder: { generated: 0, triggered: 0 },
  };
  const rangeStats: Record<string, number> = { "1": 0, "3": 0, "5": 0 };
  let intervalSum = 0;
  let intervalCount = 0;
  let consecutiveTriggered = 0;
  let sameTypeTooClose = 0;
  let thunderDurationSum = 0;
  let thunderDurationCount = 0;
  let guaranteedCount = 0;
  const pearlCounts: Record<string, number> = { x2: 0, x4: 0, x8: 0, x16: 0 };

  for (let index = 0; index < roundCount; index += 1) {
    const seed = baseSeed + index * 37;
    const run = generateRun("random", seed);
    const eventFish = run.zones.flatMap((zone) => zone.fish.filter((fish) => fish.tier === "tool" && fish.eventType));
    for (const fish of eventFish) {
      typeStats[fish.eventType!].generated += 1;
      if (fish.eventRange) rangeStats[String(fish.eventRange)] += 1;
    }

    const eventZones = eventFish.map((fish) => fish.zone).sort((a, b) => a - b);
    for (let eventIndex = 1; eventIndex < eventZones.length; eventIndex += 1) {
      intervalSum += eventZones[eventIndex] - eventZones[eventIndex - 1];
      intervalCount += 1;
    }

    const triggeredZones: Array<{ zone: number; type: string }> = [];
    for (const depth of checkpoints) {
      const state = applyEventsThroughDepth({ zones: run.zones, depth, scenario: "random", seed, extraBet });
      const generated = eventFish.filter((fish) => fish.zone <= depth).length;
      const triggeredLogs = state.logs.filter((log) => log.triggered && log.title !== "Thunder Strike");
      const triggered = triggeredLogs.length;
      stats[depth].generated += generated;
      stats[depth].triggered += triggered;
      stats[depth].noTriggerRounds += triggered === 0 ? 1 : 0;
      const totalBet = depth * GAME_CONFIG.defaultBet * (extraBet ? GAME_CONFIG.extraBet.costMultiplier : 1);
      const plan = createPullUpPlan({
        zonesFish: state.zones.filter((zone) => zone.id <= depth).flatMap((zone) => zone.fish),
        baseBet: GAME_CONFIG.defaultBet,
        totalBet,
        seed: seed + depth * 1009,
        deepestZone: depth,
      });
      stats[depth].totalBet += totalBet;
      stats[depth].totalWin += plan.result.totalWin;
      const normalFish = state.zones.filter((zone) => zone.id <= depth).flatMap((zone) => zone.fish.filter((fish) => fish.tier !== "tool"));
      stats[depth].highSeen += normalFish.filter((fish) => fish.tier === "high").length;
      stats[depth].potentialValue += normalFish.reduce((sum, fish) => sum + fish.multiplier * fish.eventMultiplier, 0);

      if (depth === 100) {
        for (const log of triggeredLogs) {
          typeStats[log.type].triggered += 1;
          triggeredZones.push({ zone: log.zone, type: log.type });
          if (log.type === "thunder") {
            const match = log.message.match(/for (\d) dives/);
            if (match) {
              thunderDurationSum += Number(match[1]);
              thunderDurationCount += 1;
            }
          }
        }
        guaranteedCount += normalFish.filter((fish) => fish.guaranteed).length;
        for (const fish of normalFish) {
          if (fish.eventMultiplier >= 16) pearlCounts.x16 += 1;
          else if (fish.eventMultiplier >= 8) pearlCounts.x8 += 1;
          else if (fish.eventMultiplier >= 4) pearlCounts.x4 += 1;
          else if (fish.eventMultiplier >= 2) pearlCounts.x2 += 1;
        }
      }
    }

    triggeredZones.sort((a, b) => a.zone - b.zone);
    const lastByType: Record<string, number> = {};
    for (let eventIndex = 0; eventIndex < triggeredZones.length; eventIndex += 1) {
      const event = triggeredZones[eventIndex];
      if (eventIndex > 0 && event.zone - triggeredZones[eventIndex - 1].zone <= 1) consecutiveTriggered += 1;
      if (event.zone - (lastByType[event.type] ?? -99) < 4) sameTypeTooClose += 1;
      lastByType[event.type] = event.zone;
    }
  }

  return {
    checkpoints,
    stats,
    typeStats,
    rangeStats,
    avgInterval: intervalCount ? intervalSum / intervalCount : 0,
    consecutiveTriggered,
    sameTypeTooClose,
    thunderAvgDuration: thunderDurationCount ? thunderDurationSum / thunderDurationCount : 0,
    guaranteedAvg: guaranteedCount / roundCount,
    pearlCounts,
  };
}

export function runEventPacingSimulation(roundCount = 20000) {
  const base = checkpointStats(roundCount, false);
  const extra = checkpointStats(roundCount, true);
  const checkpointLines = base.checkpoints.flatMap((depth) => {
    const baseStat = base.stats[depth];
    const extraStat = extra.stats[depth];
    return [
      `| Zone ${depth} | Base | ${(baseStat.generated / roundCount).toFixed(2)} | ${(baseStat.triggered / roundCount).toFixed(2)} | ${(baseStat.noTriggerRounds / roundCount * 100).toFixed(1)}% | ${(baseStat.totalWin / Math.max(1, baseStat.totalBet)).toFixed(3)} |`,
      `| Zone ${depth} | Extra Bet | ${(extraStat.generated / roundCount).toFixed(2)} | ${(extraStat.triggered / roundCount).toFixed(2)} | ${(extraStat.noTriggerRounds / roundCount * 100).toFixed(1)}% | ${(extraStat.totalWin / Math.max(1, extraStat.totalBet)).toFixed(3)} |`,
    ];
  });

  const typeLines = Object.keys(base.typeStats).map((type) => {
    const baseType = base.typeStats[type];
    const extraType = extra.typeStats[type];
    return `| ${type} | ${baseType.generated} | ${baseType.triggered} | ${extraType.generated} | ${extraType.triggered} |`;
  });

  return [
    "# Event Pacing Simulation",
    "",
    `Seeded random runs: ${roundCount.toLocaleString()}. This is Demo Tuning validation, not formal RTP.`,
    "",
    "## Checkpoints",
    "",
    "| Depth | Mode | Avg generated events | Avg successful triggers | No successful trigger rounds | Pull-up return ratio |",
    "| --- | --- | ---: | ---: | ---: | ---: |",
    ...checkpointLines,
    "",
    "## Event Density",
    "",
    `- Base average scheduled-event interval: ${base.avgInterval.toFixed(2)} zones`,
    `- Base adjacent successful-trigger count: ${base.consecutiveTriggered}`,
    `- Base same-type-too-close count: ${base.sameTypeTooClose}`,
    `- Range distribution 1/3/5: ${base.rangeStats["1"]} / ${base.rangeStats["3"]} / ${base.rangeStats["5"]}`,
    "",
    "## Event Type Counts",
    "",
    "| Type | Base generated | Base triggered | Extra generated | Extra triggered |",
    "| --- | ---: | ---: | ---: | ---: |",
    ...typeLines,
    "",
    "## Effects",
    "",
    `- Base Thunder average duration: ${base.thunderAvgDuration.toFixed(2)} Go Deep actions`,
    `- Extra Thunder average duration: ${extra.thunderAvgDuration.toFixed(2)} Go Deep actions`,
    `- Base Guaranteed Catch fish at Zone 100 average: ${base.guaranteedAvg.toFixed(2)}`,
    `- Extra Guaranteed Catch fish at Zone 100 average: ${extra.guaranteedAvg.toFixed(2)}`,
    `- Base Pearl multiplier counts x2/x4/x8/x16: ${base.pearlCounts.x2} / ${base.pearlCounts.x4} / ${base.pearlCounts.x8} / ${base.pearlCounts.x16}`,
    `- Extra Pearl multiplier counts x2/x4/x8/x16: ${extra.pearlCounts.x2} / ${extra.pearlCounts.x4} / ${extra.pearlCounts.x8} / ${extra.pearlCounts.x16}`,
    "",
    "## Base vs Extra Bet",
    "",
    "- Event generation is identical by seed; Extra Bet changes event trigger chance from 70% to 100%.",
    `- Average cost per Go Deep: Base ${GAME_CONFIG.defaultBet}, Extra ${GAME_CONFIG.defaultBet * GAME_CONFIG.extraBet.costMultiplier}.`,
    "- These values are for demo pacing only and are not official hit-rate or RTP math.",
  ].join("\n");
}
