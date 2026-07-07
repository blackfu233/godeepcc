import { useEffect, useMemo, useRef, useState } from "react";
import { milestoneLabel, musicLayerForDepth } from "../audio/audioManifest";
import { getAudioDirector } from "../audio/AudioDirector";
import {
  ROUTE_ACCENT_LOOP_ID,
  ROUTE_CARDS_REVEAL,
  ROUTE_CHECKPOINT_STING,
  ROUTE_CONFIRM,
  routeAmbientSfx,
  routeAmbientVolume,
} from "../audio/routeAudio";
import type { AudioRuntimeSnapshot, AudioSettingsState, SfxKey } from "../audio/audioTypes";
import type { EventLog, PullResult, PullUpPhase, PullUpPlan, ThunderState } from "../types/game";
import type { HookAnomalyLog } from "../types/hookAnomaly";
import type { ActiveRoute, RouteChoiceState } from "../types/routes";
import type { PerformanceMode } from "../performance/performanceConfig";
import { PERFORMANCE_CONFIG } from "../performance/performanceConfig";
import { getPullActiveItem } from "../utils/pullUpRuntime";

interface UseGameAudioParams {
  depth: number;
  mode: "ready" | "event" | "hookBreak" | "pulling" | "result";
  pullPhase: PullUpPhase;
  pullPlan: PullUpPlan | null;
  pullElapsed: number;
  activeEvent: EventLog | null;
  result: PullResult | null;
  thunder: ThunderState | null;
  activeRoute: ActiveRoute | null;
  routeChoice: RouteChoiceState | null;
  hookEvent: HookAnomalyLog | null;
  performanceMode: PerformanceMode;
}

export function useGameAudio({
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
  performanceMode,
}: UseGameAudioParams) {
  const director = useMemo(() => getAudioDirector(), []);
  const [settings, setSettingsState] = useState<AudioSettingsState>(director.getSettings());
  const [snapshot, setSnapshot] = useState<AudioRuntimeSnapshot>(director.snapshot());
  const [milestone, setMilestone] = useState<string | null>(null);
  const previousMilestoneRef = useRef<string | null>(null);
  const previousEventRef = useRef<string | null>(null);
  const previousPullPhaseRef = useRef<PullUpPhase | "idle">("idle");
  const previousPullItemRef = useRef<string | null>(null);
  const previousResultRef = useRef<string | null>(null);
  const previousThunderRef = useRef<number | null>(null);
  const previousRouteChoiceRef = useRef<string | null>(null);
  const previousRouteRef = useRef<string | null>(null);
  const previousHookEventRef = useRef<string | null>(null);

  useEffect(() => {
    const onChange = () => {
      setSettingsState(director.getSettings());
      setSnapshot(director.snapshot());
    };
    director.addEventListener("change", onChange);
    return () => director.removeEventListener("change", onChange);
  }, [director]);

  useEffect(() => {
    director.setMusicLayer(musicLayerForDepth(depth));
    const label = milestoneLabel(depth);
    if (label && label !== previousMilestoneRef.current) {
      previousMilestoneRef.current = label;
      setMilestone(label);
      director.playSfx("milestone_sting");
      window.setTimeout(() => setMilestone((current) => (current === label ? null : current)), 1400);
    }
  }, [depth, director]);

  useEffect(() => {
    director.setPullUpMode(mode === "pulling", mode === "pulling" ? pullPhase : "idle");
    if (mode === "pulling" && previousPullPhaseRef.current !== pullPhase) {
      if (pullPhase === "cameraSetup") director.playSfx("pullup_camera_drop");
      if (pullPhase === "vortexBuild") {
        director.playSfx("pullup_chain_tension");
        director.playLoop("pullup_vortex_build_loop", "pullup-vortex");
      }
      if (pullPhase === "routeSweep") {
        director.stopLoop("pullup-vortex", 0.24);
        director.playLoop("pullup_route_sweep_loop", "pullup-route");
      }
      if (pullPhase === "finish") {
        director.stopLoop("pullup-route", 0.28);
        director.stopLoop("pullup-high-struggle", 0.18);
        director.playSfx("pullup_surface_splash");
      }
      previousPullPhaseRef.current = pullPhase;
    }
    if (mode !== "pulling") {
      previousPullPhaseRef.current = "idle";
      director.stopLoop("pullup-vortex", 0.24);
      director.stopLoop("pullup-route", 0.24);
      director.stopLoop("pullup-high-struggle", 0.18);
    }
  }, [director, mode, pullPhase]);

  useEffect(() => {
    if (!routeChoice) {
      previousRouteChoiceRef.current = null;
      return;
    }
    const routeChoiceKey = `${routeChoice.checkpointZone}-${routeChoice.options.join("/")}`;
    if (previousRouteChoiceRef.current === routeChoiceKey) return;
    previousRouteChoiceRef.current = routeChoiceKey;
    director.playSfx(ROUTE_CHECKPOINT_STING);
    window.setTimeout(() => director.playSfx(ROUTE_CARDS_REVEAL), 220);
  }, [director, routeChoice]);

  useEffect(() => {
    if (!activeRoute) {
      previousRouteRef.current = null;
      director.stopLoop(ROUTE_ACCENT_LOOP_ID, 0.35);
      return;
    }
    const routeKey = `${activeRoute.id}-${activeRoute.startZone}-${activeRoute.endZone}`;
    if (previousRouteRef.current !== routeKey) {
      previousRouteRef.current = routeKey;
      director.stopLoop(ROUTE_ACCENT_LOOP_ID, 0.12);
      director.playSfx(ROUTE_CONFIRM);
      if (PERFORMANCE_CONFIG[performanceMode].audioRouteAmbient) {
        director.playLoop(routeAmbientSfx(activeRoute.id), ROUTE_ACCENT_LOOP_ID);
      }
    }
  }, [activeRoute, director, performanceMode]);

  useEffect(() => {
    if (!activeRoute) return;
    if (!PERFORMANCE_CONFIG[performanceMode].audioRouteAmbient) {
      director.stopLoop(ROUTE_ACCENT_LOOP_ID, 0.3);
      return;
    }
    if (mode === "pulling" || mode === "result" || mode === "hookBreak") {
      director.stopLoop(ROUTE_ACCENT_LOOP_ID, 0.5);
      return;
    }
    const baseVolume = routeAmbientVolume(activeRoute.id);
    director.setLoopGain(ROUTE_ACCENT_LOOP_ID, mode === "event" || activeEvent || hookEvent ? baseVolume * 0.35 : baseVolume, 0.22);
  }, [activeEvent, activeRoute, director, hookEvent, mode, performanceMode]);

  useEffect(() => {
    if (!hookEvent || previousHookEventRef.current === hookEvent.id) return;
    previousHookEventRef.current = hookEvent.id;
    if (hookEvent.eventId === "rustedGrip") {
      director.playSfx(hookEvent.brokeHook ? "pullup_high_escape" : "pullup_chain_tension");
    } else if (hookEvent.eventId === "panicCurrent" || hookEvent.eventId === "abyssPredator") {
      director.playSfx("zone_reveal");
    } else if (hookEvent.eventId === "tidebornCall" && hookEvent.summonedEventType) {
      director.playSfx(`event_${hookEvent.summonedEventType}_trigger` as SfxKey);
    } else {
      director.playSfx("rare_fish_reveal");
    }
  }, [director, hookEvent]);

  useEffect(() => {
    if (!pullPlan || mode !== "pulling") return;
    const item = getPullActiveItem(pullPlan, pullElapsed);
    if (!item || item.id === previousPullItemRef.current) return;
    previousPullItemRef.current = item.id;
    if (item.fish.tier === "high") {
      director.playSfx("pullup_reel_idle");
      director.playLoop("pullup_high_struggle_loop", "pullup-high-struggle");
      window.setTimeout(() => director.playSfx("pullup_reel_spin"), 180);
      window.setTimeout(() => director.playSfx("pullup_reel_stop"), Math.max(520, item.durationMs * 0.78));
      window.setTimeout(() => {
        director.stopLoop("pullup-high-struggle", 0.18);
        director.playSfx(item.caught ? "pullup_high_catch" : "pullup_high_escape");
      }, Math.max(700, item.durationMs * 0.88));
    } else {
      director.playSfx(item.caught ? "pullup_low_catch" : "pullup_low_miss");
    }
  }, [director, mode, pullElapsed, pullPlan]);

  useEffect(() => {
    if (!activeEvent || previousEventRef.current === activeEvent.id) return;
    previousEventRef.current = activeEvent.id;
    director.playSfx(`event_${activeEvent.type}_trigger` as SfxKey);
    if (activeEvent.type === "twin") {
      director.playSfx("event_twin_charge");
      window.setTimeout(() => director.playSfx("event_twin_scan"), 360);
      window.setTimeout(() => director.playSfx("event_twin_duplicate"), 780);
    }
    if (activeEvent.type === "pearl") {
      director.playSfx("event_pearl_open");
      window.setTimeout(() => director.playSfx("event_pearl_coin_burst"), 420);
    }
    if (activeEvent.type === "puffer") {
      director.playSfx("event_puffer_inflate");
      window.setTimeout(() => director.playSfx("event_puffer_burst"), 620);
    }
    if (activeEvent.type === "thunder") {
      director.playSfx("event_jelly_attach");
      window.setTimeout(() => director.playSfx("event_jelly_strike"), 480);
    }
  }, [activeEvent, director]);

  useEffect(() => {
    if (!thunder) {
      previousThunderRef.current = null;
      return;
    }
    if (previousThunderRef.current != null && thunder.remaining < previousThunderRef.current) {
      director.playSfx(thunder.remaining <= 0 ? "event_jelly_expire" : "event_jelly_chain_hit");
    }
    previousThunderRef.current = thunder.remaining;
  }, [director, thunder]);

  useEffect(() => {
    if (!result || previousResultRef.current === `${result.totalWin}-${result.label}`) return;
    previousResultRef.current = `${result.totalWin}-${result.label}`;
    director.playResult(result.label);
  }, [director, result]);

  return {
    settings,
    snapshot,
    milestone,
    unlock: () => director.unlock(),
    playSfx: (key: SfxKey) => director.playSfx(key),
    stopSfx: (key: SfxKey, fadeSeconds?: number) => director.stopSfx(key, fadeSeconds),
    playLoop: (key: SfxKey, loopId?: string) => director.playLoop(key, loopId),
    stopLoop: (loopId: string) => director.stopLoop(loopId),
    setLoopGain: (loopId: string, volume: number, fadeSeconds?: number) => director.setLoopGain(loopId, volume, fadeSeconds),
    updateSettings: (next: Partial<AudioSettingsState>) => director.setSettings(next),
    resetSettings: () => director.resetSettings(),
  };
}
