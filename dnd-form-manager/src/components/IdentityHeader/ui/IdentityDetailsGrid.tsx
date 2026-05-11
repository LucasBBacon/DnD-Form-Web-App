import type React from "react";
import { LabeledField } from "../../LabeledField/LabeledField";
import { LevelUpModeSelector } from "./LevelUpModeSelector";
import type { LevelUpMode } from "../../../types/progression";

interface IdentityDetailsGridProps {
  classNameDisplay: string;
  backgroundNameDisplay: string;
  playerName: string;
  raceNameDisplay: string;
  alignment: string;
  xp: number | string;
  levelUpMode: LevelUpMode;
  onNameChange: (newValue: string) => void;
  onAlignmentChange: (newValue: string) => void;
  onXpChange: (newValue: number) => void;
  onLevelUpModeChange: (newMode: LevelUpMode) => void;
  onClassModalClick: () => void;
  onBackgroundModalClick: () => void;
  onRaceModalClick: () => void;
}

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
