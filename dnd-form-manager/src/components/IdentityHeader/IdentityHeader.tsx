import type React from "react";
import { LabeledField } from "../LabeledField/LabeledField";
import { IdentityDetailsGrid } from "./ui/IdentityDetailsGrid";
import "./IdentityHeader.css";
import { useCharacterStore } from "../../store/useCharacterStore";
import { getClassById, getRaceById } from "../../data/staticDataApi";
import { getAvailableLevelUpTargetForCharacter } from "../../utils/levelAvailabilityUtils";

export const IdentityHeader: React.FC = () => {
  const {
    name,
    setName,
    level,
    classId,
    raceId,
    playerName,
    setPlayerName,
    alignment,
    setAlignment,
    xp,
    setXp,
    levelUpMode,
    setLevelUpMode,
    classTracks,
    choicesByLevel,
    openLevelUpModal,
  } = useCharacterStore();

  const classData = classId ? getClassById(classId) : null;
  const classNameDisplay = classData
    ? `${classData.name} ${level}`
    : "Choose Class";

  const raceData = raceId ? getRaceById(raceId) : null;
  const raceNameDisplay = raceData?.name || "Choose Race";

  // TODO: Implement getBackgroundById
  const backgroundNameDisplay = "Choose Background";

  // Modal handlers
  const openLevelUpWizard = () => {
    const targetLevel = getAvailableLevelUpTargetForCharacter({
      xp,
      level,
      levelUpMode,
      classTracks,
      choicesByLevel,
    });

    console.log("Calculated level-up target:", targetLevel);

    if (targetLevel !== null) {
      openLevelUpModal(targetLevel, { isBlocking: false });
    }
  };

  const openOriginModal = () => {
    console.log("Trigger Race/Background Modal");
  };

  const handleLevelUpModeChange = (newMode: typeof levelUpMode) => {
    setLevelUpMode(newMode);
  };

  return (
    <header className="identity-header">
      {/* Left Side: Character Name */}
      <div className="character-name-box">
        <LabeledField
          label="Character Name"
          value={name}
          editMode="inline"
          onChange={(newVal) => setName(newVal)}
          className="name-field"
        />
      </div>

      {/* Right Side: Identity Grid */}
      <IdentityDetailsGrid
        classNameDisplay={classNameDisplay}
        backgroundNameDisplay={backgroundNameDisplay}
        playerName={playerName}
        raceNameDisplay={raceNameDisplay}
        alignment={alignment}
        xp={xp}
        levelUpMode={levelUpMode}
        onNameChange={(newVal) => setPlayerName(newVal)}
        onAlignmentChange={(newVal) => setAlignment(newVal)}
        onXpChange={(newVal) => setXp(newVal)}
        onLevelUpModeChange={handleLevelUpModeChange}
        onClassModalClick={openLevelUpWizard}
        onBackgroundModalClick={openOriginModal}
        onRaceModalClick={openOriginModal}
      />
    </header>
  );
};
