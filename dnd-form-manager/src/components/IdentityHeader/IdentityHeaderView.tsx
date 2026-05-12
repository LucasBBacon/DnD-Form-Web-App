import type React from "react";
import { LabeledField } from "../LabeledField/LabeledField";
import { IdentityDetailsGrid } from "./ui/IdentityDetailsGrid";
import "./IdentityHeader.css";
import type { LevelUpMode } from "../../types/progression";

// #region Interface

export interface IdentityHeaderViewProps {
  /** The name of the character */
  name: string;
  /** The display name of the character's class */
  classNameDisplay: string;
  /** The display name of the character's background */
  backgroundNameDisplay: string;
  /** The name of the player controlling the character */
  playerName: string;
  /** The display name of the character's race */
  raceNameDisplay: string;
  /** The alignment of the character */
  alignment: string;
  /** The experience points of the character */
  xp: number | string;
  /** The level up mode of the character */
  levelUpMode: LevelUpMode;

  /** Callback for when the character's name changes */
  onCharacterNameChange: (newValue: string) => void;
  /** Callback for when the player's name changes */
  onPlayerNameChange: (newValue: string) => void;
  /** Callback for when the character's alignment changes */
  onAlignmentChange: (newValue: string) => void;
  /** Callback for when the character's experience points change */
  onXpChange: (newValue: number) => void;
  /** Callback for when the character's level up mode changes */
  onLevelUpModeChange: (newMode: LevelUpMode) => void;
  /** Callback for when the class modal is clicked */
  onClassModalClick: () => void;
  /** Callback for when the background modal is clicked */
  onBackgroundModalClick: () => void;
  /** Callback for when the race modal is clicked */
  onRaceModalClick: () => void;
}

// #endregion

// #region View Component

export const IdentityHeaderView: React.FC<IdentityHeaderViewProps> = ({
  name,
  classNameDisplay,
  backgroundNameDisplay,
  playerName,
  raceNameDisplay,
  alignment,
  xp,
  levelUpMode,
  onCharacterNameChange,
  onPlayerNameChange,
  onAlignmentChange,
  onXpChange,
  onLevelUpModeChange,
  onClassModalClick,
  onBackgroundModalClick,
  onRaceModalClick,
}) => {
  return (
    <header className="identity-header">
      <div className="character-name-box">
        <LabeledField
          label="Character Name"
          value={name}
          editMode="inline"
          onChange={onCharacterNameChange}
          className="name-field"
        />
      </div>

      <IdentityDetailsGrid
        classNameDisplay={classNameDisplay}
        backgroundNameDisplay={backgroundNameDisplay}
        playerName={playerName}
        raceNameDisplay={raceNameDisplay}
        alignment={alignment}
        xp={xp}
        levelUpMode={levelUpMode}
        onNameChange={onPlayerNameChange}
        onAlignmentChange={onAlignmentChange}
        onXpChange={onXpChange}
        onLevelUpModeChange={onLevelUpModeChange}
        onClassModalClick={onClassModalClick}
        onBackgroundModalClick={onBackgroundModalClick}
        onRaceModalClick={onRaceModalClick}
      />
    </header>
  );
};

// #endregion
