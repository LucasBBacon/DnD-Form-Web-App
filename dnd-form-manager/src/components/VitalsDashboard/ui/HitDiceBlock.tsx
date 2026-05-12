import type React from "react";
import "./HitDiceBlock.css";

// #region Interface

interface HitDiceBlockProps {
  /** The number of available hit dice */
  available: number;
  /** The total number of hit dice */
  total: number;

  /** Callback for when a short rest is taken */
  onShortRest: () => void;
  /** Callback for when a long rest is taken */
  onLongRest: () => void;
}

// #endregion

// #region Component

export const HitDiceBlock: React.FC<HitDiceBlockProps> = ({
  available,
  total,
  onShortRest,
  onLongRest,
}) => (
  <div className="hit-dice-block">
    <div className="block-header">
      <span>HIT DICE</span>
      <span>
        {available} / {total}
      </span>
    </div>
    <div className="rest-actions">
      <button type="button" className="rest-btn short" onClick={onShortRest}>
        Short Rest
      </button>
      <button type="button" className="rest-btn long" onClick={onLongRest}>
        Long Rest
      </button>
    </div>
  </div>
);

// #endregion
