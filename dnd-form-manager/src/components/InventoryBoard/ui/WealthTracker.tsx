import type React from "react";

const COINS = ["CP", "SP", "EP", "GP", "PP"] as const;
type CoinType = (typeof COINS)[number];

interface WealthTrackerProps {
  coins?: Partial<Record<CoinType, number>>;
}

export const WealthTracker: React.FC<WealthTrackerProps> = ({ coins = {} }) => (
  <div className="wealth-shell">
    <span className="section-label">WEALTH</span>
    <div className="coin-grid">
      {COINS.map((coin) => (
        <div key={coin} className="coin-box">
          <input
            type="number"
            placeholder="0"
            value={coins[coin] ?? ""}
            readOnly
            className={`coin-input ${coin.toLowerCase()}`}
          />
          <span className="coin-label">{coin}</span>
        </div>
      ))}
    </div>
  </div>
);
