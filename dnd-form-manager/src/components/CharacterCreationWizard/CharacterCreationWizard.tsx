import { useState } from "react";
import { useCharacterStore } from "../../store/useCharacterStore";
import { WizardSelectionStage } from "./WizardSelectionStage";
import { WizardEquipmentSelectionStage } from "./WizardEquipmentSelectionStage";
import { WizardSpellSelectionStage } from "./WizardSpellSelectionStage";
import { WizardAbilityScoreStage } from "./WizardAbilityScoreStage";
import {
  getAllClasses,
  getItemsByCategory,
  getAllRaces,
  getClassById,
  getRaceById,
  getSubraceById,
  getSubclassById,
} from "../../data/staticDataApi";
import type { Skill } from "../../types/common";
import {
  makeStartingEquipmentCategorySelectionKey,
  normalizeEquipmentReference,
} from "../../types/class";
import type { SkillProficiencyRequirement } from "../../types/creationRequirement";
import {
  toClassSelectionOption,
  toRaceSelectionOption,
} from "../../utils/wizardSelectionUtils";
import { calculateProficiencyBonus } from "../../utils/progressionUtils";
import { useCharacterStats } from "../../hooks/useCharacterStats";
import { useCreationRequirements } from "../../hooks/useCreationRequirements";
import "./CharacterCreationWizard.css";
import "./WizardPickerStage.css";
import {
  ABILITIES,
  ABILITY_SHORT_LABELS as ABILITY_LABELS,
} from "../../utils/abilityConstants";

const formatIdFallback = (id: string | null): string => {
  if (!id) return "...";

  return id.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatModifier = (modifier: number): string =>
  modifier >= 0 ? `+${modifier}` : `${modifier}`;

const WIZARD_STEPS = [
  { id: "race", label: "1. Race" },
  { id: "class", label: "2. Class" },
  { id: "spells", label: "3. Spells" },
  { id: "abilities", label: "4. Abilities" },
  { id: "background", label: "5. Background" },
  { id: "equipment", label: "6. Equipment" },
  { id: "identity", label: "7. Identity" },
];

// Converts a snake_case skill id to a display label
const formatSkillName = (skill: string): string =>
  skill.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// Inline skill picker rendered at the bottom of the race / class stage
const SkillPickerSection: React.FC<{
  requirement: SkillProficiencyRequirement;
  currentSelections: Skill[];
  onToggle: (skill: Skill) => void;
}> = ({ requirement, currentSelections, onToggle }) => {
  const remaining = requirement.required - currentSelections.length;
  return (
    <div className="skill-picker-inline">
      <div className="skill-picker-title">
        {requirement.label}
        {remaining <= 0 ? " ✓" : ` (${remaining} more needed)`}
      </div>
      <div className="skill-picker-grid">
        {requirement.pool.map((skill) => {
          const isSelected = currentSelections.includes(skill as Skill);
          const isDisabled =
            !isSelected && currentSelections.length >= requirement.required;
          return (
            <div
              key={skill}
              className={`skill-chip ${
                isSelected ? "selected" : ""
              } ${isDisabled ? "disabled" : ""}`}
              onClick={() => !isDisabled && onToggle(skill as Skill)}
            >
              {formatSkillName(skill)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const CharacterCreationWizard: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const store = useCharacterStore();
  const {
    all: allRequirements,
    blocking,
    isStageComplete,
  } = useCreationRequirements();
  const raceOptions = getAllRaces().map((race) =>
    toRaceSelectionOption(race, store.subraceId),
  );
  const classOptions = getAllClasses().map((classData) =>
    toClassSelectionOption(classData, store.level),
  );
  const selectedRace = getRaceById(store.raceId);
  const selectedSubrace = getSubraceById(store.subraceId);
  const selectedClass = getClassById(store.classId);
  const selectedSubclass = getSubclassById(store.subclassId);
  const { abilities } = useCharacterStats();
  const proficiencyBonus = calculateProficiencyBonus(store.level);
  const selectedRaceOption = raceOptions.find(
    (option) => option.id === store.raceId,
  );
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
    // Dynamic checks from the requirement engine (skills, spells, equipment)
    ...allRequirements
      .filter((r) => r.isBlocking)
      .map((r) => ({ label: r.label, isComplete: r.isResolved })),
  ];

  // #region Actions

  const advanceStep = () => {
    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleCompleteCreation = () => {
    if (blocking.length > 0) return;

    // Apply given starting equipment items to inventory
    const classData = getClassById(store.classId);

    const resolveCategorySelection = (
      categoryId: string,
      selectionKey?: string,
    ): string | null => {
      const categoryItems = getItemsByCategory(categoryId);
      if (categoryItems.length === 0) {
        return null;
      }

      const selectedId =
        selectionKey && store.startingEquipmentCategorySelections[selectionKey]
          ? store.startingEquipmentCategorySelections[selectionKey]
          : null;

      if (selectedId && categoryItems.some((item) => item.id === selectedId)) {
        return selectedId;
      }

      return categoryItems[0].id;
    };

    const addResolvedEquipment = (
      rawReference: Parameters<typeof normalizeEquipmentReference>[0],
      context?: {
        groupIndex: number;
        optionIndex: number;
        bundleIndex: number;
      },
    ) => {
      const reference = normalizeEquipmentReference(rawReference);

      if (reference.kind === "item") {
        store.addInventoryItem(reference.refId, reference.quantity);
        return;
      }

      const selectionKey = context
        ? makeStartingEquipmentCategorySelectionKey(
            context.groupIndex,
            context.optionIndex,
            context.bundleIndex,
            reference.refId,
          )
        : undefined;
      const resolvedItemId = resolveCategorySelection(
        reference.refId,
        selectionKey,
      );
      if (!resolvedItemId) {
        return;
      }

      store.addInventoryItem(resolvedItemId, reference.quantity);
    };

    if (classData) {
      classData.startingEquipment.given.forEach((reference) => {
        addResolvedEquipment(reference);
      });

      classData.startingEquipment.choices.forEach((group, i) => {
        const selectedOptionIndex = store.startingEquipmentSelections[i];
        if (selectedOptionIndex !== undefined) {
          const bundle =
            group.options[selectedOptionIndex]?.equipmentBundle ?? [];
          bundle.forEach((reference, bundleIndex) => {
            addResolvedEquipment(reference, {
              groupIndex: i,
              optionIndex: selectedOptionIndex,
              bundleIndex,
            });
          });
        }
      });
    }

    store.completeSetup();
  };

  // #endregion

  // #region Render Center Stage Content

  const renderCenterStage = () => {
    const stepId = WIZARD_STEPS[currentStepIndex].id;

    switch (stepId) {
      case "race": {
        const racialSkillReqs = allRequirements.filter(
          (r): r is SkillProficiencyRequirement =>
            r.wizardStage === "race" && r.type === "skill_proficiency",
        );
        const stageReady =
          !!store.raceId &&
          (!subraceRequired || !!store.subraceId) &&
          isStageComplete("race");
        return (
          <>
            <WizardSelectionStage
              title="Race"
              options={raceOptions}
              currentSelectionId={store.raceId}
              currentSubSelectionId={store.subraceId}
              onSelect={(baseId, subId) => {
                store.setRace(baseId);
                store.setSubrace(subId);
              }}
            />
            {racialSkillReqs.map((req) => (
              <SkillPickerSection
                key={req.id}
                requirement={req}
                currentSelections={store.chosenRacialSkills}
                onToggle={(skill) => {
                  const current = store.chosenRacialSkills;
                  const next = current.includes(skill)
                    ? current.filter((s) => s !== skill)
                    : [...current, skill];
                  store.setRacialSkills(next);
                }}
              />
            ))}
            {!!store.raceId && (
              <button
                className="wizard-continue-btn"
                disabled={!stageReady}
                onClick={() => stageReady && advanceStep()}
              >
                Continue →
              </button>
            )}
          </>
        );
      }

      case "class": {
        const classSkillReqs = allRequirements.filter(
          (r): r is SkillProficiencyRequirement =>
            r.wizardStage === "class" && r.type === "skill_proficiency",
        );
        const classLevel1Skills = store.choicesByLevel[1]?.skillChoices ?? [];
        const stageReady = !!store.classId && isStageComplete("class");
        return (
          <>
            <WizardSelectionStage
              title="Class"
              options={classOptions}
              currentSelectionId={store.classId}
              currentSubSelectionId={store.subclassId}
              onSelect={(baseId, subId) => {
                const classData = getClassById(baseId);
                const canChooseSubclassNow =
                  classData !== null &&
                  store.level >= classData.subclassInfo.choiceLevel;
                store.setClass(baseId);
                store.setSubclass(canChooseSubclassNow ? subId : null);
              }}
            />
            {classSkillReqs.map((req, reqIdx) => {
              // Each requirement occupies a contiguous slice of classLevel1Skills
              const priorCount = classSkillReqs
                .slice(0, reqIdx)
                .reduce((sum, r) => sum + r.required, 0);
              const currentSlice = classLevel1Skills.slice(
                priorCount,
                priorCount + req.required,
              );
              return (
                <SkillPickerSection
                  key={req.id}
                  requirement={req}
                  currentSelections={currentSlice}
                  onToggle={(skill) => {
                    const allChosen = [...classLevel1Skills];
                    const idx = allChosen.indexOf(skill);
                    if (idx !== -1) {
                      allChosen.splice(idx, 1);
                    } else if (currentSlice.length < req.required) {
                      // Insert into this requirement's slot
                      allChosen.splice(
                        priorCount + currentSlice.length,
                        0,
                        skill,
                      );
                    }
                    store.updateLevelChoice(1, { skillChoices: allChosen });
                  }}
                />
              );
            })}
            {!!store.classId && (
              <button
                className="wizard-continue-btn"
                disabled={!stageReady}
                onClick={() => stageReady && advanceStep()}
              >
                Continue →
              </button>
            )}
          </>
        );
      }

      case "spells":
        return <WizardSpellSelectionStage />;

      case "abilities":
        return (
          <WizardAbilityScoreStage
            onContinue={() => {
              if (isStageComplete("abilities")) {
                advanceStep();
              }
            }}
          />
        );

      case "background":
        return <div>Background selection — work in progress!</div>;

      case "equipment":
        return <WizardEquipmentSelectionStage />;

      case "identity":
        return (
          <div className="finish-stage">
            <h2>Final Details</h2>
            {/* TODO: Render Roleplay fields here */}
            <button
              className="massive-finish-btn"
              disabled={blocking.length > 0}
              onClick={handleCompleteCreation}
            >
              COMPLETE CHARACTER
            </button>
            {blocking.length > 0 && (
              <p className="finish-blocking-hint">
                {blocking.length} requirement{blocking.length !== 1 ? "s" : ""}{" "}
                still pending
              </p>
            )}
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
            // A step is locked when the previous step is not yet complete.
            // Step 0 (Race) is always accessible.
            const prevStep = WIZARD_STEPS[index - 1];
            const isDisabled =
              index > 0 &&
              (!store.raceId ||
                (prevStep !== undefined &&
                  !isStageComplete(
                    prevStep.id as Parameters<typeof isStageComplete>[0],
                  )));

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
            <span className="value">
              {formatIdFallback(store.backgroundId)}
            </span>
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
                  <span className="draft-stat-name">
                    {ABILITY_LABELS[ability]}
                  </span>
                  <span className="draft-stat-val">{score}</span>
                  <span className="draft-stat-mod">
                    {formatModifier(modifier)}
                  </span>
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
