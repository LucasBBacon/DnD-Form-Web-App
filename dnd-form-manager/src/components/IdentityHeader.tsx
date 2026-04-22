import type React from "react";
import { LabeledField } from "./Utils/LabeledField";
import "./IdentityHeader.css";
import { useCharacterStore } from "../store/useCharacterStore";
import { getClassById, getRaceById } from "../data/staticDataApi";

export const IdentityHeader: React.FC = () => {
  const {
    name,
    setName,
    level,
    classId,
    raceId,
    backgroundId,
    playerName,
    setPlayerName,
    alignment,
    setAlignment,
    xp,
    setXp,
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
    console.log("Trigger Level Up Modal / Routing");
  };

  const openOriginModal = () => {
    console.log("Trigger Race/Background Modal");
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
      <div className="identity-details-grid">
        <LabeledField
          label="Class & Level"
          value={classNameDisplay}
          editMode="modal"
          onClickModal={openLevelUpWizard}
        />
        <LabeledField
          label="Background"
          value={backgroundNameDisplay}
          editMode="modal"
          onClickModal={openOriginModal}
        />
        <LabeledField
          label="Player Name"
          value={playerName}
          editMode="inline"
          onChange={(newVal) => setPlayerName(newVal)}
        />
        <LabeledField
          label="Race"
          value={raceNameDisplay}
          editMode="modal"
          onClickModal={openOriginModal}
        />
        <LabeledField
          label="Alignment"
          value={alignment}
          editMode="inline"
          onChange={(newVal) => setAlignment(newVal)}
        />
        <LabeledField
          label="Experience Points"
          value={xp}
          editMode="inline"
          onChange={(newVal) => {
            const numXp = parseInt(newVal, 10);
            if (!isNaN(numXp)) {
              setXp(numXp);
            }
          }}
        />
      </div>
    </header>
  );
};
