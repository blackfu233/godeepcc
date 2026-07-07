import type { HookAnomalyLog } from "../../types/hookAnomaly";
import { SpriteSequencePlayer } from "../vfx/SpriteSequencePlayer";

interface HookEventBannerProps {
  event: HookAnomalyLog | null;
}

export function HookEventBanner({ event }: HookEventBannerProps) {
  if (!event) return null;

  return (
    <div className={`hook-event-banner ${event.polarity}`} role="status" aria-live="polite">
      <SpriteSequencePlayer
        assetKey={event.polarity === "positive" ? "bannerPositive" : "bannerNegative"}
        className="hook-event-banner-vfx"
        scale={0.72}
        opacity={0.92}
      />
      <div className="hook-event-banner-content">
        <span>{event.title}</span>
        <b>{event.subtitle}</b>
      </div>
    </div>
  );
}
