import type React from "react";

interface HitDiceBlockProps {
  available: number;
  total: number;
  onShortRest: () => void;
  onLongRest: () => void;
}

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
