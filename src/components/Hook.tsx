import type { PullUpPhase, ThunderState } from "../types/game";
import type { HookAnomalyLog, HookRustLevel } from "../types/hookAnomaly";
import hookChain from "../assets/reference/hook-chain-reference.png";
import { SpriteAnimation } from "./effects/SpriteAnimation";
import { HookRustVisualLayer } from "./hook-events/HookRustVisualLayer";

interface HookProps {
  currentZone: number;
  pulling: boolean;
  pullPhase: PullUpPhase;
  thunder: ThunderState | null;
  rust: HookRustLevel;
  hookEvent: HookAnomalyLog | null;
}

export function Hook({ pulling, pullPhase, thunder, rust, hookEvent }: HookProps) {
  return (
    <div
      className={[
        "hook-rig",
        pulling ? "pulling" : "",
        pullPhase ? `phase-${pullPhase}` : "",
        thunder ? "charged" : "",
        rust !== "normal" ? `rust-${rust}` : "",
      ].filter(Boolean).join(" ")}
    >
      <img className="hook-chain-image" src={hookChain} alt="" aria-hidden="true" draggable={false} />
      <HookRustVisualLayer rust={rust} hidden={Boolean(hookEvent)} />
      {thunder && (
        <>
          <div className="hook-thunder-attach">
            <SpriteAnimation animationKey="thunderJellyAttach" className="hook-thunder-sprite" scale={0.34} opacity={0.96} />
          </div>
          <div className="thunder-chip">
            Jelly x{thunder.remaining} · {thunder.reach}Z
          </div>
        </>
      )}
    </div>
  );
}
