import type React from "react";
import type { LevelUpMode } from "../../../types/progression";

// #region Interface

interface LevelUpModeSelectorProps {
  /** The current level up mode */
  value: LevelUpMode;
  /** Callback when the level up mode changes */
  onChange: (newMode: LevelUpMode) => void;
}

// #endregion

// #region Component

export const LevelUpModeSelector: React.FC<LevelUpModeSelectorProps> = ({
  value,
  onChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as LevelUpMode);
  };

  return (
    <div className="labeled-field-container mode-readonly identity-levelup-mode-field">
      <div className="field-value-wrapper">
        <select
          className="identity-levelup-mode-select"
          aria-label="Level Up Mode"
          value={value}
          onChange={handleChange}
        >
          <option value="xp_gated">XP Gated</option>
          <option value="milestone_anytime">Milestone Anytime</option>
        </select>
      </div>
      <span className="field-label">LEVEL UP MODE</span>
    </div>
  );
};

// #endregion
