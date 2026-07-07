import type { PerformanceMode } from "./performanceConfig";

export type FpsListener = (fps: number, degradedMode: PerformanceMode | null) => void;

export class FpsMonitor {
  private frame = 0;
  private raf = 0;
  private last = 0;
  private belowSince: number | null = null;
  private readonly listener: FpsListener;

  constructor(listener: FpsListener) {
    this.listener = listener;
  }

  start() {
    if (typeof window === "undefined" || this.raf) return;
    this.last = performance.now();
    const tick = (now: number) => {
      this.frame += 1;
      const elapsed = now - this.last;
      if (elapsed >= 1000) {
        const fps = Math.round((this.frame * 1000) / elapsed);
        this.frame = 0;
        this.last = now;
        if (fps < 45) {
          this.belowSince ??= now;
        } else {
          this.belowSince = null;
        }
        this.listener(fps, this.belowSince !== null && now - this.belowSince >= 3000 ? "low" : null);
      }
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    if (!this.raf) return;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }
}
