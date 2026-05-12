import type React from "react";
import "./EncumbranceDisplay.css";

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
}) => (
  <div className={`encumbrance-box ${isEncumbered ? "encumbered" : ""}`}>
    <span className="section-label">ENCUMBRANCE</span>
    <div className="weight-tracker">
      <span className="current-weight">
        {Math.round(totalWeight * 10) / 10}
      </span>
      <span className="max-weight"> / {capacity} lbs</span>
    </div>
    {isEncumbered && (
      <div className="encumbered-warning">Encumbered (Speed - 10)</div>
    )}
  </div>
);

// #endregion
