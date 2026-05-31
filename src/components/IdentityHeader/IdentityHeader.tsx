import type React from "react";
import { useCharacterStore } from "../../store/useCharacterStore.ts";
import { getClassById, getRaceById } from "../../data/staticDataApi.ts";
import { getAvailableLevelUpTargetForCharacter } from "../../utils/levelAvailabilityUtils.ts";
import { IdentityHeaderView } from "./IdentityHeaderView.tsx";

// #region Component

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
    <IdentityHeaderView
      name={name}
      classNameDisplay={classNameDisplay}
      backgroundNameDisplay={backgroundNameDisplay}
      playerName={playerName}
      raceNameDisplay={raceNameDisplay}
      alignment={alignment}
      xp={xp}
      levelUpMode={levelUpMode}
      onCharacterNameChange={setName}
      onPlayerNameChange={setPlayerName}
      onAlignmentChange={setAlignment}
      onXpChange={setXp}
      onLevelUpModeChange={handleLevelUpModeChange}
      onClassModalClick={openLevelUpWizard}
      onBackgroundModalClick={openOriginModal}
      onRaceModalClick={openOriginModal}
    />
  );
};

// #endregion
