import type { HookRustLevel } from "../../types/hookAnomaly";

interface HookRustVisualLayerProps {
  rust: HookRustLevel;
  hidden?: boolean;
}

export function HookRustVisualLayer({ rust, hidden = false }: HookRustVisualLayerProps) {
  if (rust === "normal" || hidden) return null;

  return (
    <div className={`hook-rust-visual ${rust}`} aria-hidden="true">
      <span className="rust-speckles" />
      <span className="rust-cracks" />
      <span className="rust-dim" />
    </div>
  );
}
