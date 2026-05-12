import type React from "react";
import "./HpDisplay.css";

// #region Interface

interface HpDisplayProps {
  /** The current hit points */
  current: number;
  /** The maximum hit points */
  max: number;
  /** The temporary hit points */
  temp: number;
}

// #endregion

// #region Component

export const HpDisplay: React.FC<HpDisplayProps> = ({ current, max, temp }) => (
  <div className="hp-display">
    <div className="current-hp">
      <span className="label">CURRENT HP</span>
      <span className="value">{current}</span>
    </div>
    <div className="max-hp">
      <span className="label">MAX HP</span>
      <span className="value">{max}</span>
    </div>
    {temp > 0 && (
      <div className="temp-hp">
        <span className="label">TEMP</span>
        <span className="value">{temp}</span>
      </div>
    )}
  </div>
);

// #endregion
