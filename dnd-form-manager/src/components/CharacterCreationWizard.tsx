import { useState } from "react";
import { useCharacterStore } from "../store/useCharacterStore";
import { WizardSelectionStage } from "./WizardSelectionStage";
import {
  getAllClasses,
  getAllRaces,
  getClassById,
  getRaceById,
  getSubraceById,
  getSubclassById,
} from "../data/staticDataApi";
import type { Ability } from "../types/common";
import {
  toClassSelectionOption,
  toRaceSelectionOption,
} from "../utils/wizardSelectionUtils";
import { calculateProficiencyBonus } from "../utils/progressionUtils";
import { useCharacterStats } from "../hooks/useCharacterStats";
import "./CharacterCreationWizard.css"

const ABILITIES: Ability[] = ["str", "dex", "con", "int", "wis", "cha"];

const ABILITY_LABELS: Record<Ability, string> = {
  str: "STR",
  dex: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA",
};

const formatIdFallback = (id: string | null): string => {
  if (!id) return "...";

  return id
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatModifier = (modifier: number): string =>
  modifier >= 0 ? `+${modifier}` : `${modifier}`;

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
  const selectedRace = getRaceById(store.raceId);
  const selectedSubrace = getSubraceById(store.subraceId);
  const selectedClass = getClassById(store.classId);
  const selectedSubclass = getSubclassById(store.subclassId);
  const { abilities } = useCharacterStats();
  const proficiencyBonus = calculateProficiencyBonus(store.level);
  const selectedRaceOption = raceOptions.find((option) => option.id === store.raceId);
  const selectedClassOption = classOptions.find(
    (option) => option.id === store.classId,
  );
  const subraceRequired = (selectedRaceOption?.subOptions?.length ?? 0) > 0;
  const subclassRequired = (selectedClassOption?.subOptions?.length ?? 0) > 0;
  const progressChecks = [
    {
      label: "Race",
      isComplete: !!store.raceId,
    },
    {
      label: "Subrace",
      isComplete: !subraceRequired || !!store.subraceId,
    },
    {
      label: "Class",
      isComplete: !!store.classId,
    },
    {
      label: "Subclass",
      isComplete: !subclassRequired || !!store.subclassId,
    },
    {
      label: "Background",
      isComplete: !!store.backgroundId,
    },
  ];

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
            currentSubSelectionId={store.subraceId}
            onSelect={(baseId, subId) => {
              store.setRace(baseId);
              store.setSubrace(subId)
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
            currentSubSelectionId={store.subclassId}
            onSelect={(baseId, subId) => {
              store.setClass(baseId);
              store.setSubclass(subId);
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
          <div className="draft-section-title">Identity</div>
          <div className="draft-row">
            <span className="label">Name:</span>
            <span className="value">{store.name || "Unknown"}</span>
          </div>
          <div className="draft-row">
            <span className="label">Race:</span>
            <span className="value">
              {selectedRace?.name ?? formatIdFallback(store.raceId)}
            </span>
          </div>
          <div className="draft-row">
            <span className="label">Subrace:</span>
            <span className="value">
              {selectedSubrace?.name ?? formatIdFallback(store.subraceId)}
            </span>
          </div>
          <div className="draft-row">
            <span className="label">Class:</span>
            <span className="value">
              {selectedClass?.name ?? formatIdFallback(store.classId)}
            </span>
          </div>
          <div className="draft-row">
            <span className="label">Subclass:</span>
            <span className="value">
              {selectedSubclass?.name ?? formatIdFallback(store.subclassId)}
            </span>
          </div>
          <div className="draft-row">
            <span className="label">Background:</span>
            <span className="value">{formatIdFallback(store.backgroundId)}</span>
          </div>
          <div className="draft-row">
            <span className="label">Level:</span>
            <span className="value">{store.level}</span>
          </div>
          <div className="draft-row">
            <span className="label">Prof. Bonus:</span>
            <span className="value">{formatModifier(proficiencyBonus)}</span>
          </div>
          <hr className="draft-divider" />

          <div className="draft-section-title">Core Stats</div>
          <div className="draft-stats-grid">
            {ABILITIES.map((ability) => {
              const score = abilities.scores[ability];
              const modifier = abilities.modifiers[ability];

              return (
                <div className="draft-stat-box" key={ability}>
                  <span className="draft-stat-name">{ABILITY_LABELS[ability]}</span>
                  <span className="draft-stat-val">{score}</span>
                  <span className="draft-stat-mod">{formatModifier(modifier)}</span>
                </div>
              );
            })}
          </div>

          <hr className="draft-divider" />

          <div className="draft-section-title">Progress</div>
          <div className="draft-progress-list">
            {progressChecks.map((check) => (
              <div className="draft-progress-row" key={check.label}>
                <span className="label">{check.label}</span>
                <span
                  className={`draft-status-chip ${check.isComplete ? "done" : "pending"}`}
                >
                  {check.isComplete ? "Complete" : "Missing"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};
