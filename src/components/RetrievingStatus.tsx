import type { PullUpPhase } from "../types/game";

interface RetrievingStatusProps {
  active: boolean;
  phase: PullUpPhase;
}

export function RetrievingStatus({ active, phase }: RetrievingStatusProps) {
  if (!active) return null;
  return (
    <div className="retrieving-status">
      <b>RETRIEVING...</b>
      <span>{phase === "cameraSetup" ? "Camera Drop" : phase === "vortexBuild" ? "Vortex Build" : phase === "highFishChallenge" ? "High Fish Reel" : phase === "finish" ? "Surface Splash" : "Route Sweep"}</span>
    </div>
  );
}
