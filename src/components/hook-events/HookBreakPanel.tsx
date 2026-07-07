import type { HookBreakState } from "../../types/hookAnomaly";

interface HookBreakPanelProps {
  breakState: HookBreakState | null;
  repairCost: number;
  balance: number;
  onRepair: () => void;
  onAbandon: () => void;
}

export function HookBreakPanel({ breakState, repairCost, balance, onRepair, onAbandon }: HookBreakPanelProps) {
  if (!breakState) return null;
  const canRepair = balance >= repairCost;

  return (
    <div className="hook-break-panel" role="dialog" aria-modal="true" aria-label="Hook broken">
      <div className="hook-break-card">
        <span className="hook-break-eyebrow">HOOK FRACTURE</span>
        <h2>Tip Broken</h2>
        <p>{breakState.log.message}</p>
        <div className="hook-break-cost">
          <span>Repair Cost</span>
          <b>{repairCost.toLocaleString()}</b>
        </div>
        <div className="hook-break-actions">
          <button className="repair-button" disabled={!canRepair} onClick={onRepair}>
            REPAIR HOOK
            <small>2x BET</small>
          </button>
          <button className="abandon-button" onClick={onAbandon}>
            ABANDON EXPEDITION
          </button>
        </div>
        {!canRepair && <em className="hook-break-warning">Not enough balance to repair.</em>}
      </div>
    </div>
  );
}
