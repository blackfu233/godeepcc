import { useEffect, useMemo, useRef, useState } from "react";
import { HOOK_ANOMALY_VFX_MANIFEST, type HookAnomalyVfxKey } from "../../config/hookAnomalyVfxManifest";

interface SpriteSequencePlayerProps {
  assetKey: HookAnomalyVfxKey;
  className?: string;
  x?: number;
  y?: number;
  scale?: number;
  opacity?: number;
  rotation?: number;
  flip?: boolean;
  loop?: boolean;
  delayMs?: number;
  zIndex?: number;
  blendMode?: React.CSSProperties["mixBlendMode"];
  fpsMultiplier?: number;
  onComplete?: () => void;
}

export function SpriteSequencePlayer({
  assetKey,
  className = "",
  x = 50,
  y = 50,
  scale = 1,
  opacity = 1,
  rotation = 0,
  flip = false,
  loop,
  delayMs = 0,
  zIndex,
  blendMode,
  fpsMultiplier = 1,
  onComplete,
}: SpriteSequencePlayerProps) {
  const config = HOOK_ANOMALY_VFX_MANIFEST[assetKey];
  const [frame, setFrame] = useState(0);
  const [started, setStarted] = useState(delayMs === 0);
  const completeRef = useRef(false);
  const callbackRef = useRef(onComplete);

  useEffect(() => {
    callbackRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setFrame(0);
    completeRef.current = false;
    if (delayMs <= 0) {
      setStarted(true);
      return undefined;
    }
    setStarted(false);
    const timer = window.setTimeout(() => setStarted(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [assetKey, delayMs]);

  useEffect(() => {
    if (!started) return undefined;
    const activeLoop = loop ?? config.loop;
    if (config.frameCount <= 1) {
      callbackRef.current?.();
      return undefined;
    }
    const frameMs = 1000 / Math.max(4, config.fps * fpsMultiplier);
    const startedAt = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = Math.floor((now - startedAt) / frameMs);
      if (activeLoop) {
        setFrame(elapsed % config.frameCount);
        raf = requestAnimationFrame(tick);
        return;
      }
      const nextFrame = Math.min(config.frameCount - 1, elapsed);
      setFrame(nextFrame);
      if (nextFrame >= config.frameCount - 1) {
        if (!completeRef.current) {
          completeRef.current = true;
          callbackRef.current?.();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [config, fpsMultiplier, loop, started]);

  const style = useMemo(() => {
    const column = frame % config.columns;
    const row = Math.floor(frame / config.columns);
    const backgroundX = config.columns <= 1 ? 0 : (column / (config.columns - 1)) * 100;
    const backgroundY = config.rows <= 1 ? 0 : (row / (config.rows - 1)) * 100;
    return {
      left: `${x}%`,
      top: `${y}%`,
      width: config.frameWidth,
      height: config.frameHeight,
      opacity: started ? opacity : 0,
      zIndex,
      mixBlendMode: blendMode,
      transform: `translate(${-config.anchorPoint.x * 100}%, ${-config.anchorPoint.y * 100}%) rotate(${rotation}deg) scale(${flip ? -scale : scale}, ${scale})`,
      backgroundImage: `url(${config.src})`,
      backgroundSize: `${config.columns * 100}% ${config.rows * 100}%`,
      backgroundPosition: `${backgroundX}% ${backgroundY}%`,
    } as React.CSSProperties;
  }, [blendMode, config, flip, frame, opacity, rotation, scale, started, x, y, zIndex]);

  return <span className={["sprite-sequence-player", className].filter(Boolean).join(" ")} style={style} aria-hidden="true" />;
}
