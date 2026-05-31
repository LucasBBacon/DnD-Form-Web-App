import { useState } from "react";
import type React from "react";
import {
  COIN_TYPES,
  useCharacterStore,
  type CoinType,
} from "../../../store/useCharacterStore";
import "./WealthTracker.css";
import { Minus, Plus, Scale, X } from "lucide-react";

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

export const WealthTracker: React.FC<WealthTrackerProps> = ({
  allowElectrum = true,
  allowPlatinum = true,
}) => {
  const coinPurse = useCharacterStore((state) => state.coinPurse);
  const addCoins = useCharacterStore((state) => state.addCoins);
  const removeCoins = useCharacterStore((state) => state.removeCoins);
  const consolidateCoins = useCharacterStore((state) => state.consolidateCoins);

  const [selectedCoinType, setSelectedCoinType] = useState<CoinType>("gp");
  const [coinAmount, setCoinAmount] = useState<number | "">(1);
  const [isEditing, setIsEditing] = useState(false);

  const currentBalance = coinPurse[selectedCoinType];
  const parsedAmount = Number(coinAmount) || 0;
  const isInsufficientFunds = parsedAmount > currentBalance;

  const visibleCoinTypes = COIN_TYPES.filter((coinType) => {
    if (coinType === "ep") {
      return allowElectrum;
    }
    if (coinType === "pp") {
      return allowPlatinum;
    }
    return true;
  });

  const handleConsolidateCoins = () => {
    consolidateCoins({ allowElectrum, allowPlatinum });
  };

  const handleOpenTransaction = (coinType: CoinType) => {
    setSelectedCoinType(coinType);
    setIsEditing(true);
  };

  const handleTransaction = (type: "add" | "remove") => {
    if (!coinAmount) return;
    if (type === "add") addCoins(selectedCoinType, Number(coinAmount));
    if (type === "remove") removeCoins(selectedCoinType, Number(coinAmount));

    setCoinAmount(1);
  };

  return (
    <div className="wealth-tracker-container">
      {/* The Merchant's Header */}
      <div className="wealth-display-row">
        <div className="coins-list">
          {visibleCoinTypes.map((type) => (
            <div
              key={type}
              className={`coin-balance coin-${type}`}
              onClick={() => handleOpenTransaction(type)}
              title={`Click to transact ${coinLabelMap[type]}`}
            >
              <span className="coin-value">{coinPurse[type]}</span>
              <span className="coin-label">{coinLabelMap[type]}</span>
            </div>
          ))}
        </div>

        <button
          className="action-btn consolidate-btn"
          onClick={handleConsolidateCoins}
          title="Consolidate lower coins into higher ones"
        >
          <Scale size={16} />
        </button>
      </div>

      {/* The Transaction Drawer */}
      {isEditing && (
        <div className="transaction-drawer">
          <hr className="filigree-divider" />
          <div className="transaction-controls">
            <input
              type="number"
              className="manuscript-input amount-input"
              value={coinAmount}
              onChange={(e) =>
                setCoinAmount(
                  e.target.value === ""
                    ? ""
                    : Math.max(1, parseInt(e.target.value)),
                )
              }
              min="1"
            />

            <select
              className="manuscript-input type-select"
              value={selectedCoinType}
              onChange={(e) => setSelectedCoinType(e.target.value as CoinType)}
            >
              {visibleCoinTypes.map((type) => (
                <option key={type} value={type}>
                  {coinLabelMap[type]}
                </option>
              ))}
            </select>

            <div className="transaction-warning-wrapper">
              {isInsufficientFunds && (
                <span className="scribe-warning">
                  Only {currentBalance} {coinLabelMap[selectedCoinType]} available.
                </span>
              )}
            </div>

            <div className="transaction-actions">
              <button
                className="action-btn receive-btn"
                onClick={() => handleTransaction("add")}
              >
                <Plus size={14} /> Receive
              </button>
              <button
                className="action-btn spend-btn"
                onClick={() => handleTransaction("remove")}
                disabled={isInsufficientFunds}
                title={isInsufficientFunds ? "Insufficient funds" : "Spend coins"}
              >
                <Minus size={14} /> Spend
              </button>
              <button
                className="close-drawer-btn"
                onClick={() => setIsEditing(false)}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
