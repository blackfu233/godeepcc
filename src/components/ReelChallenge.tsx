import type { PullUpPlanItem } from "../types/game";
import reelWheelPremium from "../assets/generated/reel-wheel-premium.png";

interface ReelChallengeProps {
  item: PullUpPlanItem | null;
  progress: number;
}

export function ReelChallenge({ item, progress }: ReelChallengeProps) {
  if (!item || item.fish.tier !== "high") return null;
  const won = item.caught;
  const reveal = progress > 0.82;

  return (
    <div className={`reel-challenge ${won ? "win" : "escape"} ${reveal ? "reveal" : "spinning"}`}>
      <div className="reel-stage">
        <div className="reel-pointer" />
        <img className="mechanical-reel premium-reel-art" src={reelWheelPremium} alt="" aria-hidden="true" draggable={false} />
        <span className="reel-disc-motion" aria-hidden="true" />
        <i className="reel-handle-motion" />
      </div>
      <div className="challenge-copy">
        <b>{item.fish.name}</b>
        <span>{reveal ? (won ? `WIN ${item.value.toLocaleString()} (${item.fish.multiplier * item.fish.eventMultiplier}x)` : "ESCAPED") : "REELING..."}</span>
      </div>
    </div>
  );
}
