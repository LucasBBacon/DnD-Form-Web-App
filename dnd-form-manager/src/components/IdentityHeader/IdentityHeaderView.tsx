import type React from "react";
import { LabeledField } from "../LabeledField/LabeledField";
import { IdentityDetailsGrid } from "./ui/IdentityDetailsGrid";
import "./IdentityHeader.css";
import type { LevelUpMode } from "../../types/progression";

export interface IdentityHeaderViewProps {
  name: string;
  classNameDisplay: string;
  backgroundNameDisplay: string;
  playerName: string;
  raceNameDisplay: string;
  alignment: string;
  xp: number | string;
  levelUpMode: LevelUpMode;
  onCharacterNameChange: (newValue: string) => void;
  onPlayerNameChange: (newValue: string) => void;
  onAlignmentChange: (newValue: string) => void;
  onXpChange: (newValue: number) => void;
  onLevelUpModeChange: (newMode: LevelUpMode) => void;
  onClassModalClick: () => void;
  onBackgroundModalClick: () => void;
  onRaceModalClick: () => void;
}

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
