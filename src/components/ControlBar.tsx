interface ControlBarProps {
  betOptions: number[];
  bet: number;
  locked: boolean;
  extraBet: boolean;
  nextWager: number;
  buyFreeCost: number;
  canGoDeep: boolean;
  canPullUp: boolean;
  canBuyFree: boolean;
  onBetChange: (bet: number) => void;
  onExtraBetChange: (enabled: boolean) => void;
  onGoDeep: () => void;
  onPullUp: () => void;
  onBuyFree: () => void;
}

export function ControlBar({
  betOptions,
  bet,
  locked,
  extraBet,
  nextWager,
  buyFreeCost,
  canGoDeep,
  canPullUp,
  canBuyFree,
  onBetChange,
  onExtraBetChange,
  onGoDeep,
  onPullUp,
  onBuyFree,
}: ControlBarProps) {
  return (
    <footer className="control-bar">
      <div className="bet-switch" aria-label="Bet selector">
        <span>BET</span>
        <div>
          {betOptions.map((option) => (
            <button
              key={option}
              className={option === bet ? "active" : ""}
              disabled={locked}
              onClick={() => onBetChange(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="feature-actions">
          <button className={extraBet ? "active" : ""} disabled={locked} onClick={() => onExtraBetChange(!extraBet)}>
            EXTRA 3x
          </button>
          <button disabled={!canBuyFree} onClick={onBuyFree}>
            BUY {buyFreeCost.toLocaleString()}
          </button>
        </div>
      </div>
      <button className="pull-button" disabled={!canPullUp} onClick={onPullUp}>
        PULL UP
      </button>
      <button className="deep-button" disabled={!canGoDeep} onClick={onGoDeep}>
        <span>GO DEEP</span>
        <small>{nextWager.toLocaleString()}</small>
      </button>
    </footer>
  );
}
