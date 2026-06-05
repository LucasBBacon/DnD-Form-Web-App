import type React from "react";
import "./EncumbranceDisplay.css";
import { AlertTriangle, Backpack } from "lucide-react";

// #region Interface

interface EncumbranceDisplayProps {
  /** The total weight the character is carrying */
  totalWeight: number;
  /** The maximum weight the character can carry */
  capacity: number;
  /** Whether the character is encumbered */
  isEncumbered: boolean;
}

// #endregion

// #region Component

export const EncumbranceDisplay: React.FC<EncumbranceDisplayProps> = ({
  totalWeight,
  capacity,
  isEncumbered,
}) => {
  const fillPercentage = Math.min((totalWeight / capacity) * 100, 100);

  return (
    <div className="encumbrance-container">
      <div className="encumbrance-header">
        <div className="encumbrance-title">
          <Backpack size={16} />
          <span>Carrying Capacity</span>
        </div>

        <div className="encumbrance-stats">
          <span className={`weight-text ${isEncumbered ? "is-heavy" : ""}`}>
            {totalWeight.toFixed(1)} / {capacity}
          </span>

          {isEncumbered && (
            <span className="encumbered-warning">
              <AlertTriangle size={14} /> Encumbered
            </span>
          )}
        </div>
      </div>

      <div className="scribe-gauge-track">
        <div
          className={`scribe-gauge-fill ${isEncumbered ? "is-heavy" : ""}`}
          style={{ width: `${fillPercentage}%` }}
        >
          <div className="capacity-marker" style={{ left: "100%" }}></div>
        </div>
      </div>
    </div>
  );
};

// #endregion
