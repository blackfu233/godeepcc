import vortexRibbon from "../assets/generated/vortex-water-ribbon-alpha.png";
import type { PullUpPhase, PullUpPlanItem } from "../types/game";
import { SpriteAnimation } from "./effects/SpriteAnimation";

interface VortexPathProps {
  phase: PullUpPhase;
  activeItem: PullUpPlanItem | null;
  progress: number;
}

export function VortexPath({ phase, activeItem, progress }: VortexPathProps) {
  const x = activeItem?.routeX ?? 50;
  const bend = activeItem?.routeBend ?? 0;
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
  const visualBend = activeItem && Math.abs(bend) < 28 ? (bend >= 0 ? 28 : -28) : bend;
  const visualX = activeItem ? clamp(x + visualBend * 0.24, 20, 80) : x;
  const sway = Math.sin(progress * Math.PI * 2) * 8;
  const neckLeft = 46;
  const neckRight = 54;
  const waist = clamp(50 + (visualX - 50) * 0.78 + visualBend * 0.52 + sway * 0.55, 18, 82);
  const lower = clamp(50 - (visualX - 50) * 0.62 - visualBend * 0.42 - sway * 0.38, 16, 84);
  const tail = clamp(visualX + visualBend * 0.22 + sway * 0.2, 14, 86);
  const center = `M 50 0 C ${50 + visualBend * 0.2} 16, ${waist} 34, ${waist} 54 S ${lower} 78, ${tail} 100`;
  const leftEdge = `M ${neckLeft} 0 C ${43 + visualBend * 0.16} 16, ${waist - 14} 34, ${waist - 13} 54 S ${lower - 12} 78, ${tail - 12} 100`;
  const rightEdge = `M ${neckRight} 0 C ${57 + visualBend * 0.16} 16, ${waist + 14} 34, ${waist + 13} 54 S ${lower + 12} 78, ${tail + 12} 100`;
  const outerLeft = `M 40 0 C ${38 + visualBend * 0.22} 15, ${waist - 26} 34, ${waist - 23} 54 S ${lower - 23} 78, ${tail - 24} 100`;
  const outerRight = `M 60 0 C ${62 + visualBend * 0.22} 15, ${waist + 26} 34, ${waist + 23} 54 S ${lower + 23} 78, ${tail + 24} 100`;
  const outerRibbon = `
    M 40 0
    C ${38 + visualBend * 0.22} 15, ${waist - 26} 34, ${waist - 23} 54
    S ${lower - 23} 78, ${tail - 24} 100
    L ${tail + 24} 100
    C ${lower + 23} 78, ${waist + 23} 54, ${waist + 26} 34
    S ${62 + visualBend * 0.22} 15, 60 0
    Z
  `;
  const ribbon = `
    M ${neckLeft} 0
    C ${43 + visualBend * 0.16} 16, ${waist - 15} 34, ${waist - 13} 54
    S ${lower - 12} 78, ${tail - 13} 100
    L ${tail + 13} 100
    C ${lower + 12} 78, ${waist + 13} 54, ${waist + 15} 34
    S ${57 + visualBend * 0.16} 16, ${neckRight} 0
    Z
  `;
  return (
    <div className={`vortex-path phase-${phase}`} style={{ "--route-x": `${visualX}%`, "--bend": visualBend, "--vortex-progress": progress } as React.CSSProperties}>
      <img className="vortex-generated-ribbon single" src={vortexRibbon} alt="" aria-hidden="true" />
      <SpriteAnimation animationKey="vortexParticle" className="vortex-sprite-flow primary" scale={0.42} opacity={0.48} rotation={-8} />
      <SpriteAnimation animationKey="vortexParticle" className="vortex-sprite-flow secondary" scale={0.34} opacity={0.32} rotation={14} />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path className="vortex-water-sheet" d={outerRibbon} />
        <path className="vortex-water-fill" d={ribbon} />
        <path className="vortex-column-glow" d={center} />
        <path className="vortex-chain-shadow" d={center} />
        <path className="vortex-gold-guide" d={center} />
        <path className="vortex-sheet-crest left" d={outerLeft} />
        <path className="vortex-sheet-crest right" d={outerRight} />
        <path className="vortex-flow one" d={leftEdge} />
        <path className="vortex-flow two" d={center} />
        <path className="vortex-flow three" d={rightEdge} />
      </svg>
    </div>
  );
}
