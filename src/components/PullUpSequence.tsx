import { useEffect, useMemo, useRef, useState } from "react";
import type { PullUpPhase, PullUpPlan } from "../types/game";
import { getPullActiveItem, getPullFocusItem, getPullPhase, getSettledCatchCount, getSettledCatchValue, getItemProgress } from "../utils/pullUpRuntime";
import { ReelChallenge } from "./ReelChallenge";
import { VortexPath } from "./VortexPath";

interface PullUpSequenceProps {
  active: boolean;
  plan: PullUpPlan | null;
  onPhaseChange: (phase: PullUpPhase) => void;
  onTick: (elapsed: number) => void;
  forcedElapsed?: number | null;
  onComplete: (plan: PullUpPlan) => void;
}

export function PullUpSequence({ active, plan, onPhaseChange, onTick, forcedElapsed = null, onComplete }: PullUpSequenceProps) {
  const [elapsed, setElapsed] = useState(0);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!active || !plan) return undefined;
    if (forcedElapsed != null) {
      completedRef.current = false;
      setElapsed(forcedElapsed);
      onTick(forcedElapsed);
      return undefined;
    }
    completedRef.current = false;
    const startedAt = Date.now();
    setElapsed(0);
    onTick(0);

    const timer = window.setInterval(() => {
      const nextElapsed = Date.now() - startedAt;
      setElapsed(nextElapsed);
      onTick(nextElapsed);
      if (nextElapsed >= plan.totalMs && !completedRef.current) {
        completedRef.current = true;
        window.clearInterval(timer);
        onPhaseChange("finish");
        onComplete(plan);
      }
    }, 80);

    return () => window.clearInterval(timer);
  }, [active, plan, onComplete, onPhaseChange, onTick, forcedElapsed]);

  const activeItem = useMemo(() => (plan ? getPullActiveItem(plan, elapsed) : null), [plan, elapsed]);
  const focusItem = useMemo(() => (plan ? getPullFocusItem(plan, elapsed) : null), [plan, elapsed]);
  const phase = useMemo(() => (plan ? getPullPhase(plan, elapsed, activeItem) : "idle"), [activeItem, elapsed, plan]);
  const activeProgress = activeItem ? getItemProgress(activeItem, elapsed) : 0;
  const focusProgress = focusItem ? Math.max(0, Math.min(1, (elapsed - plan!.routeStartMs) / Math.max(1, focusItem.startMs - plan!.routeStartMs))) : 0;
  const settledValue = plan ? getSettledCatchValue(plan, elapsed) : 0;
  const settledCount = plan ? getSettledCatchCount(plan, elapsed) : 0;

  useEffect(() => {
    onPhaseChange(phase);
  }, [onPhaseChange, phase]);

  if (!active || !plan) return null;

  return (
    <div className={`pull-sequence phase-${phase}`} data-phase={phase}>
      <VortexPath phase={phase} activeItem={activeItem ?? focusItem} progress={activeItem ? activeProgress : focusProgress} />
      <ReelChallenge item={phase === "highFishChallenge" ? activeItem : null} progress={activeProgress} />
      <div className="pull-ledger" aria-hidden="true">
        <span>CAUGHT {settledCount}</span>
        <b>{settledValue.toLocaleString()}</b>
      </div>
      <div className="pull-status">
        <span>{phase === "cameraSetup" ? "CAMERA SETUP" : phase === "vortexBuild" ? "VORTEX BUILD" : phase === "lowFishCollect" ? "LOW FISH COLLECT" : phase === "highFishChallenge" ? "HIGH FISH CHALLENGE" : phase === "finish" ? "FINISH" : "ROUTE SWEEP"}</span>
        <b>{activeItem ? `${activeItem.zone * 100}m / ${activeItem.fish.name}` : focusItem ? `${focusItem.zone * 100}m route` : `${plan.deepestZone * 100}m`}</b>
      </div>
    </div>
  );
}
