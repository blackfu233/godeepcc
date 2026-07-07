import { ANIMATION_MANIFEST } from "../../config/animationManifest";
import { useSpriteAnimation } from "../../hooks/useSpriteAnimation";
import type { AnimationKey } from "../../types/animation";

interface SpriteAnimationProps {
  animationKey: AnimationKey;
  className?: string;
  scale?: number;
  opacity?: number;
  rotation?: number;
  zIndex?: number;
  playing?: boolean;
  fpsMultiplier?: number;
  onComplete?: () => void;
}

export function SpriteAnimation({
  animationKey,
  className = "",
  scale = 1,
  opacity = 1,
  rotation = 0,
  zIndex,
  playing = true,
  fpsMultiplier = 1,
  onComplete,
}: SpriteAnimationProps) {
  const config = ANIMATION_MANIFEST[animationKey];
  const { frame } = useSpriteAnimation({ config, playing, fpsMultiplier, onComplete });
  const column = frame % config.columns;
  const row = Math.floor(frame / config.columns);
  const backgroundX = config.columns <= 1 ? 0 : (column / (config.columns - 1)) * 100;
  const backgroundY = config.rows <= 1 ? 0 : (row / (config.rows - 1)) * 100;

  return (
    <span
      className={["sprite-animation", className].filter(Boolean).join(" ")}
      style={{
        width: config.frameWidth,
        height: config.frameHeight,
        opacity,
        zIndex,
        transform: `translate(${-config.anchorPoint.x * 100}%, ${-config.anchorPoint.y * 100}%) rotate(${rotation}deg) scale(${scale})`,
        backgroundImage: `url(${config.src})`,
        backgroundSize: `${config.columns * 100}% ${config.rows * 100}%`,
        backgroundPosition: `${backgroundX}% ${backgroundY}%`,
      }}
      aria-hidden="true"
    />
  );
}
