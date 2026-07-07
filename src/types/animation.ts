export type AnimationKey =
  | "pufferBombExplosion"
  | "thunderJellyAttach"
  | "thunderJellyStrike"
  | "goldenPearlMultiplier"
  | "twinFishCopy"
  | "vortexParticle"
  | "catchSplash"
  | "bigWinBurst";

export interface AnimationAnchorPoint {
  x: number;
  y: number;
}

export interface SpriteSheetAnimation {
  key: AnimationKey;
  src: string;
  frameWidth: number;
  frameHeight: number;
  columns: number;
  rows: number;
  frameCount: number;
  fps: number;
  loop: boolean;
  anchorPoint: AnimationAnchorPoint;
}
