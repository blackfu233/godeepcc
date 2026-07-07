import type { AnimationKey } from "../../types/animation";
import { SpriteAnimation } from "./SpriteAnimation";

interface ScreenSpriteEffectProps {
  animationKey: AnimationKey;
  x: number;
  y: number;
  scale?: number;
  opacity?: number;
  rotation?: number;
  zIndex?: number;
  fpsMultiplier?: number;
  className?: string;
  onComplete?: () => void;
}

export function ScreenSpriteEffect({ animationKey, x, y, className = "", ...spriteProps }: ScreenSpriteEffectProps) {
  return (
    <span className={["screen-sprite-effect", className].filter(Boolean).join(" ")} style={{ left: `${x}%`, top: `${y}%` }}>
      <SpriteAnimation animationKey={animationKey} {...spriteProps} />
    </span>
  );
}
