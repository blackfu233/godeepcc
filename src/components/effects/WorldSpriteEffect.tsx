import type { AnimationKey } from "../../types/animation";
import { SpriteAnimation } from "./SpriteAnimation";

interface WorldSpriteEffectProps {
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

export function WorldSpriteEffect({ animationKey, x, y, className = "", ...spriteProps }: WorldSpriteEffectProps) {
  return (
    <span className={["world-sprite-effect", className].filter(Boolean).join(" ")} style={{ left: `${x}%`, top: `${y}%` }}>
      <SpriteAnimation animationKey={animationKey} {...spriteProps} />
    </span>
  );
}
