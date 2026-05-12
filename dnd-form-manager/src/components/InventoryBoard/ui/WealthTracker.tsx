import { useState } from "react";
import type React from "react";
import {
  COIN_TYPES,
  useCharacterStore,
  type CoinType,
} from "../../../store/useCharacterStore";

interface WealthTrackerProps {
  allowElectrum?: boolean;
  allowPlatinum?: boolean;
}

const coinLabelMap: Record<CoinType, string> = {
  cp: "CP",
  sp: "SP",
  ep: "EP",
  gp: "GP",
  pp: "PP",
};

const coinInputLabels: Record<CoinType, string> = {
  cp: "CP balance",
  sp: "SP balance",
  ep: "EP balance",
  gp: "GP balance",
  pp: "PP balance",
};

export const WealthTracker: React.FC<WealthTrackerProps> = ({
  allowElectrum = true,
  allowPlatinum = true,
}) => {
  const coinPurse = useCharacterStore((state) => state.coinPurse);
  const addCoins = useCharacterStore((state) => state.addCoins);
  const removeCoins = useCharacterStore((state) => state.removeCoins);
  const consolidateCoins = useCharacterStore((state) => state.consolidateCoins);
  const [selectedCoinType, setSelectedCoinType] = useState<CoinType>("gp");
  const [coinAmount, setCoinAmount] = useState(1);

  const visibleCoinTypes = COIN_TYPES.filter((coinType) => {
    if (coinType === "ep") {
      return allowElectrum;
    }
    if (coinType === "pp") {
      return allowPlatinum;
    }
    return true;
  });

  const handleAddCoins = () => {
    addCoins(selectedCoinType, coinAmount);
  };

  const handleRemoveCoins = () => {
    removeCoins(selectedCoinType, coinAmount);
  };

  const handleConsolidateCoins = () => {
    consolidateCoins({ allowElectrum, allowPlatinum });
  };

  return (
    <div className="wealth-shell">
      <div className="wealth-header">
        <span className="section-label">WEALTH</span>
        <button
          type="button"
          className="action-btn wealth-exchange-btn"
          onClick={handleConsolidateCoins}
        >
          Exchange
        </button>
      </div>

      <div className="coin-grid">
        {visibleCoinTypes.map((coinType) => (
          <div key={coinType} className="coin-box">
            <input
              type="number"
              placeholder="0"
              value={coinPurse[coinType]}
              readOnly
              aria-label={coinInputLabels[coinType]}
              className={`coin-input ${coinType}`}
            />
            <span className="coin-label">{coinLabelMap[coinType]}</span>
          </div>
        ))}
      </div>

      <div className="wealth-controls">
        <div className="wealth-control-group">
          <label htmlFor="wealth-coin-type" className="wealth-control-label">
            Coin type
          </label>
          <select
            id="wealth-coin-type"
            className="wealth-select"
            value={selectedCoinType}
            onChange={(event) =>
              setSelectedCoinType(event.target.value as CoinType)
            }
          >
            {visibleCoinTypes.map((coinType) => (
              <option key={coinType} value={coinType}>
                {coinLabelMap[coinType]}
              </option>
            ))}
          </select>
        </div>

        <div className="wealth-control-group">
          <label htmlFor="wealth-coin-amount" className="wealth-control-label">
            Amount
          </label>
          <input
            id="wealth-coin-amount"
            className="wealth-number-input"
            type="number"
            min="0"
            step="1"
            value={coinAmount}
            onChange={(event) => setCoinAmount(Number(event.target.value))}
          />
        </div>

        <div className="wealth-action-row">
          <button type="button" className="action-btn" onClick={handleAddCoins}>
            Add
          </button>
          <button
            type="button"
            className="action-btn"
            onClick={handleRemoveCoins}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};
