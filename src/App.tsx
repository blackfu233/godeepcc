import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AudioSettings } from "./components/AudioSettings";
import { ActiveRouteChip } from "./components/routes/ActiveRouteChip";
import { ControlBar } from "./components/ControlBar";
import { DepthMilestoneIndicator } from "./components/DepthMilestoneIndicator";
import { EventOverlay } from "./components/EventOverlay";
import { EffectLayer } from "./components/effects/EffectLayer";
import { GameHUD } from "./components/GameHUD";
import { HookBreakPanel } from "./components/hook-events/HookBreakPanel";
import { HookEventBanner } from "./components/hook-events/HookEventBanner";
import { HookEventHudIcons } from "./components/hook-events/HookEventHudIcons";
import { OceanViewport } from "./components/OceanViewport";
import { PullUpSequence } from "./components/PullUpSequence";
import { RouteAmbientLayer } from "./components/routes/RouteAmbientLayer";
import { RouteChoicePanel } from "./components/routes/RouteChoicePanel";
import { RouteDepthRailAccent } from "./components/routes/RouteDepthRailAccent";
import { RouteSelectedToast } from "./components/routes/RouteSelectedToast";
import { RetrievingStatus } from "./components/RetrievingStatus";
import { ResultModal } from "./components/ResultModal";
import { HookAnomalyVfxLayer } from "./components/vfx/HookAnomalyVfxLayer";
import { usePerformanceMode } from "./performance/usePerformanceMode";
import { schedulePreloadAssetGroup } from "./performance/assetPreloader";
import { isRouteCheckpoint, routeSegmentForCheckpoint } from "./config/routeDefinitions";
import { GAME_CONFIG, SCENARIOS } from "./config/gameConfig";
import { HOOK_ANOMALY_CONFIG } from "./config/hookAnomalyConfig";
import { routeHoverSfx } from "./audio/routeAudio";
import { useGameAudio } from "./hooks/useGameAudio";
import { createInitialHookAnomalyState } from "./state/HookAnomalyController";
import { createActiveRoute, routeHasEnded } from "./state/RouteController";
import type { DepthZone, EventLog, PullResult, PullUpPhase, PullUpPlan, ScenarioId, ThunderState } from "./types/game";
import type { HookAnomalyLog, HookAnomalyState, HookBreakState } from "./types/hookAnomaly";
import type { ActiveRoute, RouteChoiceState, RouteId } from "./types/routes";
import { applyHookAnomaly } from "./utils/applyHookAnomaly";
import { createPullUpPlan } from "./utils/createPullUpPlan";
import { applyEvent, applyThunderStrike } from "./utils/eventEngine";
import { generateSegmentZones, replaceSegmentZones } from "./utils/generateSegmentZones";
import { generateRun } from "./utils/generateRun";
import { createRouteChoice } from "./utils/routeDeck";

type PlayMode = "ready" | "event" | "hookBreak" | "pulling" | "result";

const DebugPanel = lazy(() => import("./components/DebugPanel").then((module) => ({ default: module.DebugPanel })));

function eventDisplayMs(log: EventLog | null) {
  if (!log) return 0;
  return log.type === "thunder" ? 1700 : log.range >= 5 ? 3000 : log.range >= 3 ? 2200 : 1500;
}

function hookEventDisplayMs(log: HookAnomalyLog | null) {
  if (!log) return 0;
  if (log.brokeHook) return 900;
  if (log.eventId === "tidebornCall") return 1900;
  if (log.polarity === "negative") return 1600;
  return 1400;
}

interface InitialGameState {
  scenario: ScenarioId;
  seed: number;
  zones: DepthZone[];
  balance: number;
  bet: number;
  baseBet: number;
  totalBet: number;
  currentZone: number;
  extraBet: boolean;
  extraBetLocked: boolean;
  mode: PlayMode;
  pullPhase: PullUpPhase;
  pullFocusZone: number | null;
  pullPlan: PullUpPlan | null;
  pullElapsed: number;
  forcedPullElapsed: number | null;
  thunder: ThunderState | null;
  activeEvent: EventLog | null;
  activeRoute: ActiveRoute | null;
  routeChoice: RouteChoiceState | null;
  hookAnomaly: HookAnomalyState;
  hookEvent: HookAnomalyLog | null;
  hookBreak: HookBreakState | null;
  repairCost: number;
  result: PullResult | null;
}

function scenarioSeed(scenario: ScenarioId) {
  return SCENARIOS.find((item) => item.id === scenario)?.seed ?? SCENARIOS[0].seed;
}

function routeDemoStartZone(scenario: ScenarioId) {
  if (scenario === "route-school") return 14;
  if (scenario === "route-golden") return 49;
  if (scenario === "route-storm") return 74;
  return 0;
}

function simulateDive(scenario: ScenarioId, depthZone: number, seed = scenarioSeed(scenario), extraBetActive = false) {
  let zones = generateRun(scenario, seed).zones;
  let thunder: ThunderState | null = null;
  let activeEvent: EventLog | null = null;

  for (let nextZone = 1; nextZone <= depthZone; nextZone += 1) {
    if (thunder) {
      const strike = applyThunderStrike({ zones, thunder, currentZone: nextZone, scenario, seed });
      zones = strike.zones;
      thunder = strike.thunder;
      activeEvent = strike.log;
    }

    const eventFish = zones[nextZone - 1].fish.find((fish) => fish.tier === "tool" && fish.eventType);
    if (eventFish) {
      const eventResult = applyEvent({ zones, eventFish, scenario, seed, extraBetActive });
      zones = eventResult.zones;
      activeEvent = eventResult.log;
      if (eventResult.thunder) {
        thunder = eventResult.thunder;
      }
    }
  }

  return { zones, thunder, activeEvent };
}

function simulateFocusedEvents(scenario: ScenarioId, eventZones: number[], seed = scenarioSeed(scenario), extraBetActive = false) {
  let zones = generateRun(scenario, seed).zones;
  let activeEvent: EventLog | null = null;

  for (const zoneId of eventZones) {
    const eventFish = zones[zoneId - 1].fish.find((fish) => fish.tier === "tool" && fish.eventType);
    if (!eventFish) continue;
    const eventResult = applyEvent({ zones, eventFish, scenario, seed, extraBetActive });
    zones = eventResult.zones;
    activeEvent = eventResult.log;
  }

  return { zones, thunder: null as ThunderState | null, activeEvent };
}

function createInitialGameState(): InitialGameState {
  const params = new URLSearchParams(window.location.search);
  const qa = params.get("qa");
  const defaultScenario: ScenarioId = "random";
  const defaultSeed = scenarioSeed(defaultScenario);
  const defaults: InitialGameState = {
    scenario: defaultScenario,
    seed: defaultSeed,
    zones: generateRun(defaultScenario, defaultSeed).zones,
    balance: GAME_CONFIG.initialBalance,
    bet: GAME_CONFIG.defaultBet,
    baseBet: GAME_CONFIG.defaultBet,
    totalBet: 0,
    currentZone: 0,
    extraBet: false,
    extraBetLocked: false,
    mode: "ready",
    pullPhase: "idle",
    pullFocusZone: null,
    pullPlan: null,
    pullElapsed: 0,
    forcedPullElapsed: null,
    thunder: null,
    activeEvent: null,
    activeRoute: null,
    routeChoice: null,
    hookAnomaly: createInitialHookAnomalyState(),
    hookEvent: null,
    hookBreak: null,
    repairCost: 0,
    result: null,
  };

  if (!qa) return defaults;

  const qaScenario: ScenarioId =
    qa.includes("zone50") ? "route-golden" :
    qa.includes("zone75") ? "route-storm" :
    qa.includes("golden") ? "route-golden" :
    qa.includes("storm") ? "route-storm" :
    qa.startsWith("route") ? "route-school" :
    qa.startsWith("big") || qa.startsWith("pull") || qa === "thunder" || qa === "max-depth" ? "big-win" :
    qa === "surface" || qa === "dive-700" || qa === "dive-1600" ? "normal" :
    "event-chain";
  const seed = scenarioSeed(qaScenario);
  const routeBgLayerDepth =
    qa.includes("layer1") ? 15 :
    qa.includes("layer2") ? 35 :
    qa.includes("layer3") ? 60 :
    qa.includes("layer4") ? 85 :
    null;
  const depth =
    qa === "surface" ? 0 :
    qa === "dive-700" ? 7 :
    qa === "dive-1600" ? 16 :
    qa === "max-depth" ? GAME_CONFIG.maxZones :
    qa === "route-restored-choice-zone25" ? 25 :
    qa === "route-restored-choice-zone50" ? 50 :
    qa === "route-restored-choice-zone75" ? 75 :
    qa === "route-restored-school-background" || qa === "route-restored-school-active-chip" || qa === "route-restored-depthrail-school" || qa === "route-restored-debug-panel" ? 18 :
    qa === "route-restored-golden-background" || qa === "route-restored-golden-active-chip" || qa === "route-restored-depthrail-golden" ? 55 :
    qa === "route-restored-storm-background" || qa === "route-restored-storm-active-chip" || qa === "route-restored-depthrail-storm" || qa === "route-restored-hook-event-priority" ? 80 :
    qa === "route-restored-pullup-priority" ? 85 :
    routeBgLayerDepth != null ? routeBgLayerDepth :
    qa === "route-bg-pullup-priority" || qa === "route-bg-result-priority" ? 85 :
    qa.startsWith("route-bg-transition-school-to-golden") ? 35 :
    qa.startsWith("route-bg-transition-golden-to-storm") ? 60 :
    qa.startsWith("route-bg-transition-storm-to-school") ? 85 :
    qa.startsWith("route-choice-golden") || qa.startsWith("route-golden") ? 50 :
    qa.startsWith("route-choice-storm") || qa.startsWith("route-storm") || qa === "route-hook-event-priority" ? 75 :
    qa.startsWith("route") ? 15 :
    qa === "twin" ? 28 :
    qa === "pearl-x4" ? 32 :
    qa === "puffer" ? 36 :
    qa === "thunder" ? 90 :
    qa.startsWith("pull") ? 90 :
    0;
  const simulated =
    qa === "pearl-x4" ? simulateFocusedEvents(qaScenario, [32], seed) :
    qa === "puffer" ? simulateFocusedEvents(qaScenario, [36], seed) :
    depth > 0 ? simulateDive(qaScenario, depth, seed) :
    { zones: generateRun(qaScenario, seed).zones, thunder: null, activeEvent: null };
  const totalBet = depth * GAME_CONFIG.defaultBet;
  const pullPlan = qa.startsWith("pull") || qa === "route-bg-pullup-priority" || qa === "route-restored-pullup-priority"
    ? createPullUpPlan({
        zonesFish: simulated.zones.filter((zone) => zone.id <= depth).flatMap((zone) => zone.fish),
        baseBet: GAME_CONFIG.defaultBet,
        totalBet,
        seed: seed + depth * 1009,
        deepestZone: depth,
      })
    : null;

  const forcedPullElapsed =
    qa === "pull-build" && pullPlan ? pullPlan.introMs + 420 :
    qa === "pull-route" && pullPlan ? (pullPlan.items.find((item) => item.fish.tier === "low")?.startMs ?? pullPlan.routeStartMs) + 80 :
    qa === "pull-reel" && pullPlan ? pullPlan.items.find((item) => item.fish.tier === "high")?.startMs ?? pullPlan.routeStartMs :
    qa === "route-bg-pullup-priority" && pullPlan ? pullPlan.introMs + 520 :
    qa === "route-restored-pullup-priority" && pullPlan ? pullPlan.introMs + 520 :
    null;

  const routeChoiceCheckpoint =
    qa === "route-restored-choice-zone25" ? 25 :
    qa === "route-restored-choice-zone50" ? 50 :
    qa === "route-restored-choice-zone75" ? 75 :
    qa.startsWith("route-choice-golden") ? 50 :
    qa.startsWith("route-choice-storm") ? 75 :
    qa.startsWith("route-choice") || qa === "route-reduced-motion" ? 15 :
    null;
  const routeChoice = routeChoiceCheckpoint ? createRouteChoice({ scenario: qaScenario, seed, checkpointZone: routeChoiceCheckpoint }) : null;
  const selectedRoute: RouteId | null =
    qa === "route-school-selected" ? "school" :
    qa === "route-golden-selected" ? "golden" :
    qa === "route-storm-selected" ? "storm" :
    null;
  const selectedSegment = selectedRoute
    ? routeSegmentForCheckpoint(selectedRoute === "storm" ? 75 : selectedRoute === "golden" ? 50 : 15)
    : null;
  const activeRouteId: RouteId | null =
    qa === "route-restored-school-background" || qa === "route-restored-school-active-chip" || qa === "route-restored-depthrail-school" || qa === "route-restored-debug-panel" ? "school" :
    qa === "route-restored-golden-background" || qa === "route-restored-golden-active-chip" || qa === "route-restored-depthrail-golden" || qa === "route-restored-pullup-priority" ? "golden" :
    qa === "route-restored-storm-background" || qa === "route-restored-storm-active-chip" || qa === "route-restored-depthrail-storm" || qa === "route-restored-hook-event-priority" ? "storm" :
    qa.startsWith("route-bg-school") || qa.startsWith("route-bg-transition-storm-to-school") ? "school" :
    qa.startsWith("route-bg-golden") || qa.startsWith("route-bg-transition-school-to-golden") || qa === "route-bg-pullup-priority" || qa === "route-bg-result-priority" ? "golden" :
    qa.startsWith("route-bg-storm") || qa.startsWith("route-bg-transition-golden-to-storm") ? "storm" :
    qa.includes("school-active") || qa.includes("depth-rail-school") ? "school" :
    qa.includes("golden-active") || qa.includes("depth-rail-golden") ? "golden" :
    qa.includes("storm-active") || qa.includes("depth-rail-storm") || qa === "route-hook-event-priority" || qa === "route-bg-hook-event-priority" ? "storm" :
    null;
  const activeRouteSegment = activeRouteId
    ? routeSegmentForCheckpoint(activeRouteId === "storm" ? 75 : activeRouteId === "golden" ? 50 : 15)
    : null;
  const qaHookEvent: HookAnomalyLog | null = qa === "route-hook-event-priority" || qa === "route-bg-hook-event-priority" || qa === "route-restored-hook-event-priority" ? {
    id: "qa-hook-priority",
    eventId: "panicCurrent",
    polarity: "negative",
    title: "PANIC CURRENT",
    subtitle: "FISH SCATTERED",
    zone: depth,
    targetZoneIds: [depth],
    targetIds: [],
    triggered: true,
    finalChance: 1,
    roll: 0,
    message: "Route ambience ducks behind the Hook Event.",
  } : null;

  return {
    scenario: qaScenario,
    seed,
    zones: simulated.zones,
    balance: GAME_CONFIG.initialBalance - totalBet,
    bet: GAME_CONFIG.defaultBet,
    baseBet: GAME_CONFIG.defaultBet,
    totalBet,
    currentZone: depth,
    extraBet: false,
    extraBetLocked: false,
    mode: qa === "route-bg-result-priority" ? "result" :
      qa === "route-bg-pullup-priority" || qa === "route-restored-pullup-priority" ? "pulling" :
      qa.startsWith("pull") ? (qa === "pull-result" ? "result" : "pulling") :
      simulated.activeEvent ? "event" : "ready",
    pullPhase: forcedPullElapsed != null && pullPlan ? "vortexBuild" : "idle",
    pullFocusZone: pullPlan ? depth : null,
    pullPlan,
    pullElapsed: forcedPullElapsed ?? 0,
    forcedPullElapsed,
    thunder: simulated.thunder,
    activeEvent: qa.startsWith("pull") || qa === "pull-result" ? null : simulated.activeEvent,
    activeRoute: activeRouteId && activeRouteSegment ? createActiveRoute({
      id: activeRouteId,
      selectedAtZone: activeRouteSegment.startZone - 1,
      startZone: activeRouteSegment.startZone,
      endZone: activeRouteSegment.endZone,
    }) : null,
    routeChoice: selectedRoute && selectedSegment ? {
      checkpointZone: selectedSegment.startZone - 1,
      startZone: selectedSegment.startZone,
      endZone: selectedSegment.endZone,
      options: selectedRoute === "school" ? ["school", "golden"] : selectedRoute === "golden" ? ["golden", "storm"] : ["storm", "school"],
      selectedId: selectedRoute,
      confirming: true,
    } : routeChoice,
    hookAnomaly: createInitialHookAnomalyState(),
    hookEvent: qaHookEvent,
    hookBreak: null,
    repairCost: 0,
    result: qa === "route-bg-result-priority" ? {
      totalBet,
      totalWin: 3200,
      winMultiplier: totalBet > 0 ? 3200 / totalBet : 0,
      caught: simulated.zones.slice(0, 4).flatMap((zone) => zone.fish).filter((fish) => fish.tier !== "tool").slice(0, 4).map((fish) => ({
        fish,
        value: fish.multiplier * GAME_CONFIG.defaultBet,
        caught: true,
        roll: 0.01,
        resolution: "auto-catch" as const,
      })),
      missed: [],
      label: "BIG WIN",
    } : qa === "pull-result" && pullPlan ? pullPlan.result : null,
  };
}

function App() {
  const [initialState] = useState(createInitialGameState);
  const [scenario, setScenario] = useState<ScenarioId>(initialState.scenario);
  const [seed, setSeed] = useState(initialState.seed);
  const [zones, setZones] = useState(initialState.zones);
  const [balance, setBalance] = useState(initialState.balance);
  const [bet, setBet] = useState(initialState.bet);
  const [baseBet, setBaseBet] = useState(initialState.baseBet);
  const [totalBet, setTotalBet] = useState(initialState.totalBet);
  const [currentZone, setCurrentZone] = useState(initialState.currentZone);
  const [extraBet, setExtraBet] = useState(initialState.extraBet);
  const [extraBetLocked, setExtraBetLocked] = useState(initialState.extraBetLocked);
  const [mode, setMode] = useState<PlayMode>(initialState.mode);
  const [pullPhase, setPullPhase] = useState<PullUpPhase>(initialState.pullPhase);
  const [pullFocusZone, setPullFocusZone] = useState<number | null>(initialState.pullFocusZone);
  const [pullPlan, setPullPlan] = useState<PullUpPlan | null>(initialState.pullPlan);
  const [pullElapsed, setPullElapsed] = useState(initialState.pullElapsed);
  const [forcedPullElapsed, setForcedPullElapsed] = useState<number | null>(initialState.forcedPullElapsed);
  const [thunder, setThunder] = useState<ThunderState | null>(initialState.thunder);
  const [activeEvent, setActiveEvent] = useState<EventLog | null>(initialState.activeEvent);
  const [activeRoute, setActiveRoute] = useState<ActiveRoute | null>(initialState.activeRoute);
  const [routeChoice, setRouteChoice] = useState<RouteChoiceState | null>(initialState.routeChoice);
  const [routeNotice, setRouteNotice] = useState<{ routeId: RouteId; startZone: number; endZone: number } | null>(null);
  const [hookAnomaly, setHookAnomaly] = useState<HookAnomalyState>(initialState.hookAnomaly);
  const [hookEvent, setHookEvent] = useState<HookAnomalyLog | null>(initialState.hookEvent);
  const [hookBreak, setHookBreak] = useState<HookBreakState | null>(initialState.hookBreak);
  const [repairCost, setRepairCost] = useState(initialState.repairCost);
  const [hookRepairPulse, setHookRepairPulse] = useState(0);
  const [result, setResult] = useState<PullResult | null>(initialState.result);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const debugAllowed = import.meta.env.DEV || new URLSearchParams(window.location.search).has("debug") || new URLSearchParams(window.location.search).get("qa") === "route-restored-debug-panel";
  const [debugOpen, setDebugOpen] = useState(() => debugAllowed && new URLSearchParams(window.location.search).get("qa") === "route-restored-debug-panel");
  const [divePulse, setDivePulse] = useState(0);
  const [diving, setDiving] = useState(false);
  const performance = usePerformanceMode();
  const modeRef = useRef(mode);
  const currentZoneRef = useRef(currentZone);

  useEffect(() => {
    modeRef.current = mode;
    currentZoneRef.current = currentZone;
  }, [currentZone, mode]);

  const depth = currentZone * GAME_CONFIG.metersPerZone;
  const locked = currentZone > 0;
  const maxDepth = GAME_CONFIG.maxZones * GAME_CONFIG.metersPerZone;
  const highlightedIds = [...(activeEvent?.targetIds ?? []), ...(hookEvent?.targetIds ?? [])];
  const currentScenarioLabel = SCENARIOS.find((item) => item.id === scenario)?.label ?? "Random Run";
  const activeExtraBet = locked ? extraBetLocked : extraBet;
  const currentWager = (locked ? baseBet : bet) * (activeExtraBet ? GAME_CONFIG.extraBet.costMultiplier : 1);
  const buyFreeCost = bet * GAME_CONFIG.buyFree.costMultiplier;

  useEffect(() => {
    schedulePreloadAssetGroup("critical");
  }, []);

  useEffect(() => {
    if (currentZone >= 22 || routeChoice) {
      schedulePreloadAssetGroup("routeChoice");
    }
    if (currentZone >= 1) {
      schedulePreloadAssetGroup("pullUp");
      schedulePreloadAssetGroup("hookSmall");
    }
  }, [currentZone, routeChoice]);

  useEffect(() => {
    if (activeRoute) schedulePreloadAssetGroup(`route:${activeRoute.id}`);
  }, [activeRoute]);

  useEffect(() => {
    if (result) schedulePreloadAssetGroup("result");
  }, [result]);

  useEffect(() => {
    if (mode !== "ready") return undefined;
    if (routeChoice) return undefined;
    if (!isRouteCheckpoint(currentZone) || currentZone >= GAME_CONFIG.maxZones) return undefined;
    if (activeRoute?.selectedAtZone === currentZone) return undefined;

    const timer = window.setTimeout(() => {
      if (modeRef.current !== "ready" || currentZoneRef.current !== currentZone) return;
      setRouteChoice((current) => current ?? createRouteChoice({ scenario, seed, checkpointZone: currentZone }));
    }, 140);

    return () => window.clearTimeout(timer);
  }, [activeRoute?.selectedAtZone, currentZone, mode, routeChoice, scenario, seed]);

  const passedFish = useMemo(
    () => zones.filter((zone) => zone.id <= currentZone).flatMap((zone) => zone.fish),
    [zones, currentZone],
  );

  const audio = useGameAudio({
    depth,
    mode,
    pullPhase,
    pullPlan,
    pullElapsed,
    activeEvent,
    result,
    thunder,
    activeRoute,
    routeChoice,
    hookEvent,
    performanceMode: performance.effectiveMode,
  });

  function flashEvent(log: EventLog | null) {
    setActiveEvent(log);
    if (log) {
      setMode("event");
      const eventMs = eventDisplayMs(log);
      window.setTimeout(() => {
        setActiveEvent((current) => (current?.id === log.id ? null : current));
        setMode((current) => (current === "event" ? "ready" : current));
      }, eventMs);
    }
  }

  function flashHookEvent(log: HookAnomalyLog | null, delay = 0) {
    if (!log) {
      setHookEvent(null);
      return;
    }
    window.setTimeout(() => {
      setHookEvent(log);
      if (!log.brokeHook) {
        setMode("event");
        window.setTimeout(() => {
          setHookEvent((current) => (current?.id === log.id ? null : current));
          setMode((current) => (current === "event" ? "ready" : current));
        }, hookEventDisplayMs(log));
      }
    }, delay);
  }

  function queueRouteChoice(checkpointZone: number, log: EventLog | null, hookLog: HookAnomalyLog | null) {
    if (!isRouteCheckpoint(checkpointZone) || checkpointZone >= GAME_CONFIG.maxZones) return;
    const delay = 820 + eventDisplayMs(log) + hookEventDisplayMs(hookLog);
    window.setTimeout(() => {
      if (modeRef.current !== "ready" || currentZoneRef.current !== checkpointZone) return;
      setRouteChoice((current) => current ?? createRouteChoice({ scenario, seed, checkpointZone }));
    }, delay);
  }

  function resetExpedition(nextScenario = scenario, nextSeed = seed, resetBalance = true) {
    const startZone = routeDemoStartZone(nextScenario);
    const startState = startZone > 0
      ? simulateDive(nextScenario, startZone, nextSeed, false)
      : { zones: generateRun(nextScenario, nextSeed).zones, thunder: null as ThunderState | null, activeEvent: null as EventLog | null };
    const startSpend = startZone * GAME_CONFIG.defaultBet;
    setZones(startState.zones);
    if (resetBalance) {
      setBalance(GAME_CONFIG.initialBalance - startSpend);
    } else if (startSpend > 0) {
      setBalance((value) => value - startSpend);
    }
    setBet(GAME_CONFIG.defaultBet);
    setCurrentZone(startZone);
    setTotalBet(startSpend);
    setBaseBet(GAME_CONFIG.defaultBet);
    setExtraBet(false);
    setExtraBetLocked(false);
    setMode("ready");
    setPullPhase("idle");
    setPullFocusZone(null);
    setPullPlan(null);
    setPullElapsed(0);
    setForcedPullElapsed(null);
    setThunder(startState.thunder);
    setActiveEvent(startState.activeEvent);
    setActiveRoute(null);
    setRouteChoice(null);
    setRouteNotice(null);
    setHookAnomaly(createInitialHookAnomalyState());
    setHookEvent(null);
    setHookBreak(null);
    setRepairCost(0);
    setHookRepairPulse(0);
    setResult(null);
  }

  function switchScenario(nextScenario: ScenarioId) {
    const nextSeed = SCENARIOS.find((item) => item.id === nextScenario)?.seed ?? seed;
    setScenario(nextScenario);
    setSeed(nextSeed);
    setSettingsOpen(false);
    resetExpedition(nextScenario, nextSeed, true);
  }

  function goDeep() {
    if (mode !== "ready" || routeChoice || currentZone >= GAME_CONFIG.maxZones || balance < currentWager) return;
    void audio.unlock();
    audio.playSfx("ui_go_deep_press");
    audio.playSfx("wallet_wager_deduct");
    const nextZone = currentZone + 1;
    const wager = currentWager;
    const nextExtraBetLocked = locked ? extraBetLocked : extraBet;
    let nextZones = zones;
    let nextThunder = thunder;
    let logToShow: EventLog | null = null;
    let hookLog: HookAnomalyLog | null = null;
    let nextHookBreak: HookBreakState | null = null;

    if (thunder) {
      const strike = applyThunderStrike({ zones: nextZones, thunder, currentZone: nextZone, scenario, seed });
      nextZones = strike.zones;
      nextThunder = strike.thunder;
      logToShow = strike.log;
    }

    const eventFish = nextZones[nextZone - 1].fish.find((fish) => fish.tier === "tool" && fish.eventType);
    if (eventFish) {
      const eventResult = applyEvent({ zones: nextZones, eventFish, scenario, seed, extraBetActive: nextExtraBetLocked });
      nextZones = eventResult.zones;
      logToShow = eventResult.log;
      if (eventResult.thunder) {
        nextThunder = eventResult.thunder;
      }
    }

    const hookResult = applyHookAnomaly({
      zones: nextZones,
      state: hookAnomaly,
      currentZone: nextZone,
      seed,
      scenario,
      baseBet: locked ? baseBet : bet,
      thunder: nextThunder,
      routeId: activeRoute?.id,
    });
    nextZones = hookResult.zones;
    nextThunder = hookResult.thunder;
    hookLog = hookResult.log;
    nextHookBreak = hookResult.breakState;

    if (!locked) {
      setBaseBet(bet);
      setExtraBetLocked(nextExtraBetLocked);
    }
    setBalance((value) => value - wager);
    setTotalBet((value) => value + wager);
    setCurrentZone(nextZone);
    setZones(nextZones);
    setThunder(nextThunder);
    setHookAnomaly(hookResult.state);
    setActiveRoute((current) => (routeHasEnded(current, nextZone) ? null : current));
    setDivePulse((value) => value + 1);
    setDiving(true);
    audio.playSfx("chain_descend");
    window.setTimeout(() => {
      setDiving(false);
      audio.stopSfx("chain_descend", 0.06);
    }, 760);
    flashEvent(logToShow);
    flashHookEvent(hookLog, eventDisplayMs(logToShow));
    if (nextHookBreak) {
      window.setTimeout(() => {
        setHookBreak(nextHookBreak);
        setMode("hookBreak");
      }, eventDisplayMs(logToShow) + hookEventDisplayMs(hookLog));
      return;
    }
    queueRouteChoice(nextZone, logToShow, hookLog);
  }

  function chooseRoute(routeId: RouteId) {
    if (!routeChoice || routeChoice.confirming) return;
    const choice = routeChoice;
    setRouteChoice({ ...choice, selectedId: routeId, confirming: true });
    window.setTimeout(() => {
      const segmentZones = generateSegmentZones({
        scenario,
        seed,
        routeId,
        startZone: choice.startZone,
        endZone: choice.endZone,
      });
      setZones((currentZones) => replaceSegmentZones(currentZones, segmentZones));
      setActiveRoute(createActiveRoute({
        id: routeId,
        selectedAtZone: choice.checkpointZone,
        startZone: choice.startZone,
        endZone: choice.endZone,
      }));
      setRouteChoice(null);
      setRouteNotice({ routeId, startZone: choice.startZone, endZone: choice.endZone });
      window.setTimeout(() => {
        setRouteNotice((current) => (current?.routeId === routeId && current.startZone === choice.startZone ? null : current));
      }, 1400);
    }, 420);
  }

  function buyFree() {
    if (mode !== "ready" || currentZone > 0 || balance < buyFreeCost) return;
    void audio.unlock();
    audio.playSfx("ui_go_deep_press");
    audio.playSfx("wallet_wager_deduct");
    const buyScenario: ScenarioId = "big-win";
    const buySeed = scenarioSeed(buyScenario) + GAME_CONFIG.buyFree.showcaseSeedOffset;
    const buyState = simulateDive(buyScenario, GAME_CONFIG.maxZones, buySeed, false);
    const buyZones = buyState.zones;
    const plan = createPullUpPlan({
      zonesFish: buyZones.flatMap((zone) => zone.fish),
      baseBet: bet,
      totalBet: buyFreeCost,
      seed: buySeed + GAME_CONFIG.maxZones * 1009,
      deepestZone: GAME_CONFIG.maxZones,
    });

    setScenario(buyScenario);
    setSeed(buySeed);
    setZones(buyZones);
    setBaseBet(bet);
    setExtraBet(false);
    setExtraBetLocked(false);
    setBalance((value) => value - buyFreeCost);
    setTotalBet(buyFreeCost);
    setCurrentZone(GAME_CONFIG.maxZones);
    setThunder(null);
    setActiveEvent(null);
    setActiveRoute(null);
    setRouteChoice(null);
    setRouteNotice(null);
    setHookAnomaly(createInitialHookAnomalyState());
    setHookEvent(null);
    setHookBreak(null);
    setRepairCost(0);
    setHookRepairPulse(0);
    setResult(null);
    setMode("pulling");
    setPullPhase("cameraSetup");
    setPullFocusZone(GAME_CONFIG.maxZones);
    setPullPlan(plan);
    setPullElapsed(0);
    setForcedPullElapsed(null);
  }

  function pullUp() {
    if (mode !== "ready" || currentZone === 0) return;
    void audio.unlock();
    audio.playSfx("pullup_button_press");
    const plan = createPullUpPlan({
      zonesFish: passedFish,
      baseBet,
      totalBet,
      seed: seed + currentZone * 1009,
      deepestZone: currentZone,
    });
    setMode("pulling");
    setPullPhase("cameraSetup");
    setPullFocusZone(currentZone);
    setPullPlan(plan);
    setPullElapsed(0);
    setForcedPullElapsed(null);
    setActiveEvent(null);
    setHookEvent(null);
    setRouteChoice(null);
    setActiveRoute(null);
    setRouteNotice(null);
    setThunder(null);
    setHookAnomaly(createInitialHookAnomalyState());
    setHookBreak(null);
  }

  const handlePullPhaseChange = useCallback((phase: PullUpPhase) => {
    setPullPhase(phase);
  }, []);

  const handlePullComplete = useCallback((plan: PullUpPlan) => {
    setResult({ ...plan.result, repairCost });
    setBalance((value) => value + plan.result.totalWin);
    setPullElapsed(plan.totalMs);
    setMode("result");
  }, [repairCost]);

  function repairHook() {
    if (!hookBreak) return;
    const cost = (locked ? baseBet : bet) * HOOK_ANOMALY_CONFIG.repairCostMultiplier;
    if (balance < cost) return;
    setBalance((value) => value - cost);
    setTotalBet((value) => value + cost);
    setRepairCost((value) => value + cost);
    setHookAnomaly((current) => ({
      ...current,
      rust: "normal",
      broken: false,
      history: [
        {
          ...hookBreak.log,
          id: `${hookBreak.log.id}-repair`,
          message: "Hook repaired to normal.",
          repairCost: cost,
        },
        ...current.history,
      ].slice(0, 24),
    }));
    setHookBreak(null);
    setHookEvent(null);
    setHookRepairPulse((value) => value + 1);
    setMode("ready");
  }

  function abandonExpedition() {
    const failedResult: PullResult = {
      totalBet,
      totalWin: 0,
      winMultiplier: 0,
      caught: [],
      missed: [],
      label: "EXPEDITION FAILED",
      repairCost,
      failed: true,
    };
    setResult(failedResult);
    setHookBreak(null);
    setHookEvent(null);
    setMode("result");
  }

  function newExpedition() {
    const nextSeed = scenario === "random" ? seed + 1 : SCENARIOS.find((item) => item.id === scenario)?.seed ?? seed;
    setSeed(nextSeed);
    resetExpedition(scenario, nextSeed, false);
  }

  return (
    <div className="app-shell" onPointerDown={() => void audio.unlock()}>
      <div className={`phone-frame mode-${mode} perf-${performance.effectiveMode} perf-pref-${performance.preference}`}>
        <GameHUD balance={balance} depth={depth} maxDepth={maxDepth} totalBet={totalBet} />
        <ActiveRouteChip activeRoute={activeRoute} currentZone={currentZone} />
        <HookEventHudIcons state={hookAnomaly} />
        <button className="settings-button" aria-label="Settings" onClick={() => setSettingsOpen((value) => !value)}>
          SET
        </button>
        {settingsOpen && (
          <aside className="settings-panel">
            <b>{currentScenarioLabel}</b>
            <p>Seed {seed}</p>
            {SCENARIOS.map((item) => (
              <button key={item.id} className={item.id === scenario ? "active" : ""} onClick={() => switchScenario(item.id)}>
                {item.label}
              </button>
            ))}
            <button onClick={() => resetExpedition(scenario, seed, true)}>Restart Current Scenario</button>
            {debugAllowed && (
              <label>
                <input type="checkbox" checked={debugOpen} onChange={(event) => setDebugOpen(event.target.checked)} />
                Debug Panel
              </label>
            )}
            <section className="performance-settings">
              <header>
                <b>PERFORMANCE</b>
                <span>{performance.effectiveMode.toUpperCase()}{performance.fps ? ` · ${performance.fps}FPS` : ""}</span>
              </header>
              <label>
                <span>Mode</span>
                <select value={performance.preference} onChange={(event) => performance.setPreference(event.target.value as typeof performance.preference)}>
                  <option value="auto">Auto</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>
            </section>
            <AudioSettings
              settings={audio.settings}
              snapshot={audio.snapshot}
              onUnlock={audio.unlock}
              onChange={audio.updateSettings}
              onReset={audio.resetSettings}
            />
          </aside>
        )}
        <DepthMilestoneIndicator label={audio.milestone} />
        <OceanViewport
          zones={zones}
          currentZone={currentZone}
          highlightedIds={highlightedIds}
          pulling={mode === "pulling"}
          pullPhase={pullPhase}
          pullFocusZone={pullFocusZone}
          pullPlan={pullPlan}
          pullElapsed={pullElapsed}
          thunder={thunder}
          activeEvent={activeEvent}
          hookAnomaly={hookAnomaly}
          hookEvent={hookEvent}
          activeRoute={activeRoute}
          extraRevealZones={hookAnomaly.persistent.abyssBeacon?.remaining ? 1 : 0}
          divePulse={divePulse}
          diving={diving}
          performanceMode={performance.effectiveMode}
        />
        <RouteDepthRailAccent activeRoute={activeRoute} currentZone={currentZone} hidden={mode === "pulling" || mode === "result" || mode === "hookBreak"} />
        <RouteAmbientLayer
          activeRoute={activeRoute}
          hidden={mode === "pulling" || mode === "result" || mode === "hookBreak"}
          subdued={mode === "event" || Boolean(activeEvent) || Boolean(hookEvent)}
        />
        <EffectLayer
          activeEvent={activeEvent}
          thunder={thunder}
          pulling={mode === "pulling"}
          pullPhase={pullPhase}
          pullPlan={pullPlan}
          pullElapsed={pullElapsed}
          result={result}
          performanceMode={performance.effectiveMode}
        />
        <EventOverlay event={activeEvent} />
        <HookEventBanner event={hookEvent} />
        <HookAnomalyVfxLayer
          hookEvent={hookEvent}
          hookAnomaly={hookAnomaly}
          hookBreak={hookBreak}
          zones={zones}
          currentZone={currentZone}
          repairPulse={hookRepairPulse}
          hidden={mode === "pulling" || mode === "result"}
          performanceMode={performance.effectiveMode}
        />
        <PullUpSequence
          active={mode === "pulling"}
          plan={pullPlan}
          onPhaseChange={handlePullPhaseChange}
          onTick={setPullElapsed}
          forcedElapsed={forcedPullElapsed}
          onComplete={handlePullComplete}
        />
        <RetrievingStatus active={mode === "pulling"} phase={pullPhase} />
        <RouteSelectedToast notice={routeNotice} />
        <RouteChoicePanel
          choice={routeChoice}
          onChoose={chooseRoute}
          onPullUpNow={pullUp}
          onPreview={(routeId) => audio.playSfx(routeHoverSfx(routeId))}
        />
        {debugAllowed && debugOpen && (
          <Suspense fallback={null}>
            <DebugPanel
              visible={debugOpen}
              currentZone={currentZone}
              zones={zones}
              thunder={thunder}
              seed={seed}
              extraBet={activeExtraBet}
              nextWager={currentWager}
              lastEvent={activeEvent}
              activeRoute={activeRoute}
              routeChoice={routeChoice}
              pullPhase={pullPhase}
              pullPlan={pullPlan}
              pullElapsed={pullElapsed}
              hookAnomaly={hookAnomaly}
              hookEvent={hookEvent}
              repairCost={repairCost}
            />
          </Suspense>
        )}
        <HookBreakPanel
          breakState={hookBreak}
          repairCost={(locked ? baseBet : bet) * HOOK_ANOMALY_CONFIG.repairCostMultiplier}
          balance={balance}
          onRepair={repairHook}
          onAbandon={abandonExpedition}
        />
        <ControlBar
          betOptions={GAME_CONFIG.betOptions}
          bet={bet}
          locked={locked}
          extraBet={activeExtraBet}
          nextWager={currentWager}
          buyFreeCost={buyFreeCost}
          canGoDeep={mode === "ready" && !routeChoice && !hookBreak && currentZone < GAME_CONFIG.maxZones && balance >= currentWager}
          canPullUp={mode === "ready" && currentZone > 0}
          canBuyFree={mode === "ready" && !hookBreak && currentZone === 0 && balance >= buyFreeCost}
          onBetChange={(nextBet) => {
            void audio.unlock();
            audio.playSfx("ui_bet_change");
            setBet(nextBet);
          }}
          onExtraBetChange={(enabled) => {
            void audio.unlock();
            audio.playSfx("ui_bet_change");
            setExtraBet(enabled);
          }}
          onGoDeep={goDeep}
          onPullUp={pullUp}
          onBuyFree={buyFree}
        />
        <ResultModal result={result} onNewExpedition={newExpedition} />
      </div>
    </div>
  );
}

export default App;
