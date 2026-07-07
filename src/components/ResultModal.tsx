import type { PullResult } from "../types/game";
import { ScreenSpriteEffect } from "./effects/ScreenSpriteEffect";
import { FishArt } from "./FishArt";

interface ResultModalProps {
  result: PullResult | null;
  onNewExpedition: () => void;
}

export function ResultModal({ result, onNewExpedition }: ResultModalProps) {
  if (!result) return null;
  const topCatches = [...result.caught].sort((a, b) => b.value - a.value).slice(0, 4);
  const moreCount = Math.max(0, result.caught.length - topCatches.length);
  const heroCatches = topCatches.length > 0 ? topCatches : result.caught.slice(0, 1);
  const isWinTier = result.label.includes("WIN");
  const displayLabel = result.failed ? "EXPEDITION FAILED" : isWinTier ? result.label : "COMPLETE";

  return (
    <div className={["result-page", result.failed ? "result-failed" : isWinTier ? "result-big-win" : "result-regular"].join(" ")} role="dialog" aria-modal="true" aria-label="Expedition result">
      {isWinTier && !result.failed && <ScreenSpriteEffect animationKey="bigWinBurst" x={50} y={30} scale={1.06} opacity={0.92} zIndex={0} className="modal-bigwin-sprite" />}
      <div className="result-page-light" />
      <div className="coin-burst">
        {Array.from({ length: 26 }, (_, index) => (
          <span key={index} style={{ "--i": index } as React.CSSProperties} />
        ))}
      </div>
      <div className="result-catch-hero" aria-hidden="true">
        <div className="result-hook-chain" />
        {heroCatches.map((entry, index) => (
          <div
            key={entry.fish.id}
            className={`result-hero-fish fish-${index}`}
            style={
              {
                "--hero-dir": index % 2 === 0 ? 1 : -1,
                "--hero-scale": 1 + Math.min(0.42, entry.fish.multiplier / 120),
              } as React.CSSProperties
            }
          >
            <FishArt speciesId={entry.fish.speciesId} />
          </div>
        ))}
        <div className="result-splash-crown" />
      </div>
      <section className="result-win-panel">
        <span className="win-label">{displayLabel}</span>
        <em>Total Win</em>
        <strong className="win-total">{result.totalWin.toLocaleString()}</strong>
      </section>
      <section className="result-detail-panel">
        <div className="result-stats">
          <div>
            <span>Total Bet</span>
            <b>{result.totalBet.toLocaleString()}</b>
          </div>
          <div>
            <span>Multiplier</span>
            <b>{result.winMultiplier.toFixed(2)}x</b>
          </div>
          {result.repairCost != null && result.repairCost > 0 && (
            <div>
              <span>Repair Cost</span>
              <b>{result.repairCost.toLocaleString()}</b>
            </div>
          )}
        </div>
        <div className="top-catches">
          <section>
            <h3>Top Catches</h3>
            {topCatches.length === 0 && <p>No catch this time.</p>}
            {topCatches.map((entry) => (
              <p key={entry.fish.id}>
                <span>{entry.fish.name}</span>
                <b>{entry.value.toLocaleString()}</b>
              </p>
            ))}
            {moreCount > 0 && <p className="more-catches">+{moreCount} More Catches</p>}
          </section>
        </div>
      </section>
      <button className="new-expedition result-confirm-button" onClick={onNewExpedition}>
        {"\u78ba\u5b9a"}
      </button>
    </div>
  );
}
