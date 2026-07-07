import type { EventLog } from "../types/game";

interface EventOverlayProps {
  event: EventLog | null;
}

export function EventOverlay({ event }: EventOverlayProps) {
  if (!event) return null;
  return (
    <div className={`event-overlay ${event.type}`}>
      <div className="event-pulse" />
      <div className="event-card">
        <span>EVENT</span>
        <strong>{event.title}</strong>
        <p>{event.message}</p>
      </div>
    </div>
  );
}
