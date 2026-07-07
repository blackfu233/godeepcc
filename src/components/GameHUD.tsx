interface GameHUDProps {
  balance: number;
  depth: number;
  maxDepth: number;
  totalBet: number;
}

export function GameHUD({ balance, depth, maxDepth, totalBet }: GameHUDProps) {
  return (
    <header className="game-hud">
      <div>
        <span>BALANCE</span>
        <strong>{balance.toLocaleString()}</strong>
      </div>
      <div className="hud-depth">
        <span>DEPTH</span>
        <strong>
          {depth}m / {maxDepth}m
        </strong>
      </div>
      <div>
        <span>TOTAL BET</span>
        <strong>{totalBet.toLocaleString()}</strong>
      </div>
    </header>
  );
}
