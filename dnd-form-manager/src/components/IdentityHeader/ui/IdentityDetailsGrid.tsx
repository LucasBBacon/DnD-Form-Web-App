import type React from "react";
import { LabeledField } from "../../LabeledField/LabeledField";
import { LevelUpModeSelector } from "./LevelUpModeSelector";
import type { LevelUpMode } from "../../../types/progression";

// #region Interface

interface IdentityDetailsGridProps {
  /** The display value for the character's class and level */
  classNameDisplay: string;
  /** The display value for the character's background */
  backgroundNameDisplay: string;
  /** The display value for the player's name */
  playerName: string;
  /** The display value for the character's race */
  raceNameDisplay: string;
  /** The display value for the character's alignment */
  alignment: string;
  /** The display value for the character's experience points */
  xp: number | string;
  /** The current level up mode for the character */
  levelUpMode: LevelUpMode;

  /** Callback when the player's name changes */
  onNameChange: (newValue: string) => void;
  /** Callback when the character's alignment changes */
  onAlignmentChange: (newValue: string) => void;
  /** Callback when the character's experience points change */
  onXpChange: (newValue: number) => void;
  /** Callback when the level up mode changes */
  onLevelUpModeChange: (newMode: LevelUpMode) => void;
  /** Callback when the class modal is clicked */
  onClassModalClick: () => void;
  /** Callback when the background modal is clicked */
  onBackgroundModalClick: () => void;
  /** Callback when the race modal is clicked */
  onRaceModalClick: () => void;
}

// #endregion

// #region Component

export const IdentityDetailsGrid: React.FC<IdentityDetailsGridProps> = ({
  classNameDisplay,
  backgroundNameDisplay,
  playerName,
  raceNameDisplay,
  alignment,
  xp,
  levelUpMode,
  onNameChange,
  onAlignmentChange,
  onXpChange,
  onLevelUpModeChange,
  onClassModalClick,
  onBackgroundModalClick,
  onRaceModalClick,
}) => {
  const handleXpChange = (newVal: string) => {
    const numXp = parseInt(newVal, 10);
    if (!isNaN(numXp)) {
      onXpChange(numXp);
    }
  };

  return (
    <div className="identity-details-grid">
      <LabeledField
        label="Class & Level"
        value={classNameDisplay}
        editMode="modal"
        onClickModal={onClassModalClick}
      />
      <LabeledField
        label="Background"
        value={backgroundNameDisplay}
        editMode="modal"
        onClickModal={onBackgroundModalClick}
      />
      <LabeledField
        label="Player Name"
        value={playerName}
        editMode="inline"
        onChange={onNameChange}
      />
      <LabeledField
        label="Race"
        value={raceNameDisplay}
        editMode="modal"
        onClickModal={onRaceModalClick}
      />
      <LabeledField
        label="Alignment"
        value={alignment}
        editMode="inline"
        onChange={onAlignmentChange}
      />
      <LabeledField
        label="Experience Points"
        value={xp}
        editMode="inline"
        onChange={handleXpChange}
      />
      <LevelUpModeSelector value={levelUpMode} onChange={onLevelUpModeChange} />
    </div>
  );
};

// #endregion
