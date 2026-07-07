import { useEffect, useMemo, useRef, useState } from "react";
import type { SpriteSheetAnimation } from "../types/animation";

interface UseSpriteAnimationOptions {
  config: SpriteSheetAnimation;
  playing?: boolean;
  fpsMultiplier?: number;
  onComplete?: () => void;
}

export function useSpriteAnimation({ config, playing = true, fpsMultiplier = 1, onComplete }: UseSpriteAnimationOptions) {
  const [frame, setFrame] = useState(0);
  const completeRef = useRef(false);
  const callbackRef = useRef(onComplete);

  useEffect(() => {
    callbackRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setFrame(0);
    completeRef.current = false;
    if (!playing) return undefined;

    const frameMs = 1000 / Math.max(4, config.fps * fpsMultiplier);
    let animationId = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const elapsedFrames = Math.floor((now - startedAt) / frameMs);
      if (config.loop) {
        setFrame(elapsedFrames % config.frameCount);
        animationId = requestAnimationFrame(tick);
        return;
      }

      const nextFrame = Math.min(config.frameCount - 1, elapsedFrames);
      setFrame(nextFrame);
      if (nextFrame >= config.frameCount - 1) {
        if (!completeRef.current) {
          completeRef.current = true;
          callbackRef.current?.();
        }
        return;
      }
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [config, fpsMultiplier, playing]);

  return useMemo(() => ({ frame, done: completeRef.current }), [frame]);
}
