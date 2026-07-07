import type { HookAnomalyState } from "../../types/hookAnomaly";
import type { HookAnomalyVfxKey } from "../../config/hookAnomalyVfxManifest";
import { SpriteSequencePlayer } from "../vfx/SpriteSequencePlayer";

interface HookEventHudIconsProps {
  state: HookAnomalyState;
}

const labels = {
  luckyBait: "BAIT",
  abyssBeacon: "BEACON",
  gildedHook: "GILDED",
};

const icons = {
  luckyBait: "iconLuckyBait",
  abyssBeacon: "iconAbyssBeacon",
  gildedHook: "iconGildedHook",
} satisfies Record<keyof typeof labels, HookAnomalyVfxKey>;

export function HookEventHudIcons({ state }: HookEventHudIconsProps) {
  const effects = Object.values(state.persistent).filter(Boolean);
  const hasSignal = Boolean(state.rareSignal);
  if (effects.length === 0 && !hasSignal) return null;

  return (
    <div className="hook-hud-icons" aria-label="Hook anomaly effects">
      {effects.map((effect) => (
        <span key={effect.id} className={`hook-hud-icon ${effect.id}`}>
          <SpriteSequencePlayer assetKey={icons[effect.id]} className="hook-hud-icon-art" scale={0.042} />
          {labels[effect.id]} x{effect.remaining}
        </span>
      ))}
      {state.rareSignal && (
        <span className={`hook-hud-icon rareSignal ${state.rareSignal.real ? "real" : "unknown"}`}>
          <SpriteSequencePlayer assetKey="iconRareSignal" className="hook-hud-icon-art" scale={0.042} />
          SIGNAL Z{state.rareSignal.targetZone}
        </span>
      )}
    </div>
  );
}
