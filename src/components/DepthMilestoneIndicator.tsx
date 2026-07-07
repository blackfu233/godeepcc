interface DepthMilestoneIndicatorProps {
  label: string | null;
}

export function DepthMilestoneIndicator({ label }: DepthMilestoneIndicatorProps) {
  if (!label) return null;
  return (
    <div className="depth-milestone-indicator">
      <span>{label}</span>
    </div>
  );
}
