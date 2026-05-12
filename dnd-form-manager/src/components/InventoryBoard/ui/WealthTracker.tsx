import type React from "react";

// #region Types and Interfaces

const COINS = ["CP", "SP", "EP", "GP", "PP"] as const;
type CoinType = (typeof COINS)[number];

interface WealthTrackerProps {
  /** The coins and their respective amounts */
  coins?: Partial<Record<CoinType, number>>;
}

// #endregion

// #region Component

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

// #endregion
