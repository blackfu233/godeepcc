import type { HookAnomalyState } from "../../types/hookAnomaly";

interface HookRareSignalOverlayProps {
  state: HookAnomalyState;
  currentZone: number;
  hidden?: boolean;
}

export function HookRareSignalOverlay({ state, currentZone, hidden = false }: HookRareSignalOverlayProps) {
  const signal = state.rareSignal;
  if (!signal || hidden) return null;
  const distance = signal.targetZone - currentZone;
  if (distance < 0 || distance > 4) return null;

  return (
    <div className="hook-rare-signal-overlay" style={{ "--signal-distance": distance } as React.CSSProperties} aria-hidden="true">
      <span />
      <i />
      <b>RARE SIGNAL</b>
      <em>{signal.targetZone * 100}m</em>
    </div>
  );
}
