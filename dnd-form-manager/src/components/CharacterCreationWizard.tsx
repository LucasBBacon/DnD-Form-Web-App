import { useState } from "react";
import { useCharacterStore } from "../store/useCharacterStore";
import { WizardSelectionStage } from "./WizardSelectionStage";
import { getAllClasses, getAllRaces } from "../data/staticDataApi";
import {
  toClassSelectionOption,
  toRaceSelectionOption,
} from "../utils/wizardSelectionUtils";
import "./CharacterCreationWizard.css"

const WIZARD_STEPS = [
  { id: "race", label: "1. Race" },
  { id: "class", label: "2. Class" },
  { id: "abilities", label: "3. Abilities" },
  { id: "background", label: "4. Background" },
  { id: "equipment", label: "5. Equipment" },
  { id: "identity", label: "6. Identity" },
];

export const CharacterCreationWizard: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const store = useCharacterStore();
  const raceOptions = getAllRaces().map((race) =>
    toRaceSelectionOption(race, store.subraceId),
  );
  const classOptions = getAllClasses().map(toClassSelectionOption);

  // #region Actions

  const advanceStep = () => {
    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleCompleteCreation = () => {
    store.completeSetup();
  };

  // #endregion

  // #region Render Center Stage Content

  const renderCenterStage = () => {
    const stepId = WIZARD_STEPS[currentStepIndex].id;

    switch (stepId) {
      case "race":
        return (
          <WizardSelectionStage
            title="Race"
            options={raceOptions}
            currentSelectionId={store.raceId}
            onSelect={(id) => {
              store.setRace(id);
              advanceStep();
            }}
          />
        );
      case "class":
        return (
          <WizardSelectionStage
            title="Class"
            options={classOptions}
            currentSelectionId={store.classId}
            onSelect={(id) => {
              store.setClass(id);
              advanceStep();
            }}
          />
        );
      case "abilities":
        return <div>Ability Score UI goes here</div>;
      case "identity":
        return (
          <div className="finish-stage">
            <h2>Final Details</h2>
            {/* TODO: Render Roleplay fields here */}
            <button
              className="massive-finish-btn"
              onClick={handleCompleteCreation}
            >
              COMPLETE CHARACTER
            </button>
          </div>
        );

      default:
        return <div>Work in progress!</div>;
    }
  };

  // #endregion

  return (
    <div className="wizard-workspace">
      {/* Stepper navigation */}
      <aside className="wizard-sidebar-left">
        <h1 className="wizard-brand">Character Creator</h1>
        <nav className="stepper-nav">
          {WIZARD_STEPS.map((step, index) => {
            const isActive = currentStepIndex === index;
            // Basic locking logic; disable class if no race is selected
            const isDisabled = index > 0 && !store.raceId;

            return (
              <button
                key={step.id}
                className={`stepper-btn ${isActive ? "active" : ""} ${isDisabled ? "disabled" : ""}`}
                onClick={() => setCurrentStepIndex(index)}
                disabled={isDisabled}
              >
                {step.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Interactive Stage */}
      <main className="wizard-center-stage">{renderCenterStage()}</main>

      {/* Live Draft Sheet */}
      <aside className="wizard-sidebar-right">
        <h3 className="draft-header">Live Draft</h3>
        <div className="draft-content">
          <div className="draft-row">
            <span className="label">Name:</span>
            <span className="value">{store.name || "Unknown"}</span>
          </div>
          <div className="draft-row">
            <span className="label">Race:</span>
            <span className="value">
              {store.raceId ? store.raceId.toUpperCase() : "..."}
            </span>
          </div>
          <div className="draft-row">
            <span className="label">Class:</span>
            <span className="value">
              {store.classId ? store.classId.toUpperCase() : "..."}
            </span>
          </div>
          <hr className="draft-divider" />
          <div className="draft-stats-grid">
            {/* TODO: Map over store.baseAbilitySCores here */}
            <div className="draft-stat-box">
              <span className="draft-stat-name">STR</span>
              <span className="draft-stat-val">
                {store.baseAbilityScores.str}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
