import React from "react";
import "./ClassPickStep.css";
import type { CharacterClassTrack } from "../../../store/useCharacterStore";
import { getAllClasses, getClassById } from "../../../data/staticDataApi";
import type { ClassData } from "../../../types/class";
import type { LevelUpDraft } from "../../../types/levelUpDraft";
import type { SubclassData } from "../../../types/subclass";
import type { LevelUpPlannerResult } from "../../../utils/levelUpPlanner";
import {
  evaluateMulticlassEligibility,
  type MulticlassEligibilityFailure,
} from "../../../utils/multiclassEligibilityUtils";
import { useCharacterStats } from "../../../hooks/useCharacterStats";
import {
  AlertCircle,
  ArrowRight,
  Lock,
  PlusCircle,
  Swords,
} from "lucide-react";

// #region --- Types ---

interface ClassPickStepProps {
  /** The current draft of the level-up process */
  draft: LevelUpDraft;
  /** Callback to update the draft with new values */
  onUpdateDraft: (updates: Partial<LevelUpDraft>) => void;
  /** The result of the level-up planner */
  plan: LevelUpPlannerResult;
  /** Data for the currently selected class */
  classData: ClassData | null;
  /** Data for the currently selected subclass */
  subclassData: SubclassData | null;
  /** The target level for the level-up */
  targetLevel: number;
  /** The character's class tracks */
  classTracks: CharacterClassTrack[];
}

const formatFailureReason = (failure: MulticlassEligibilityFailure): string => {
  switch (failure.code) {
    case "already_has_class":
      return "Already pursuing this discipline.";
    case "character_level_too_low":
      return `Requires character level ${failure.required || 2}`;
    case "missing_current_class":
      return "Missing prerequisite discipline";
    case "missing_ability_score":
      return `Requires a valid ${failure.ability?.toUpperCase() || "ability"} score.`;
    case "ability_score_below_minimum":
      return `Requires ${failure.ability?.toUpperCase()} ${failure.required} (Current: ${failure.actual || 0})`;
    default:
      return "Requirements not met.";
  }
};

// #endregion

/**
 * Step for picking which class to level up, or whether to add a new multiclass.
 */
export const ClassPickStep: React.FC<ClassPickStepProps> = ({
  draft,
  onUpdateDraft,
  targetLevel,
  classTracks,
}) => {
  const { abilities } = useCharacterStats();

  const totalScores = abilities.scores;

  const isLevelingExisting = !draft.isNewMulticlass;
  const existingClassIds = new Set(classTracks.map((t) => t.classId));

  // #region --- Class Selection ---

  const handleSelectExistingTrack = (track: CharacterClassTrack) => {
    const cd = getClassById(track.classId);
    if (!cd) return;
    onUpdateDraft({
      targetClassId: track.classId,
      isNewMulticlass: false,
      targetClassLevel: track.level + 1,
    });
  };

  const handleSelectNewClass = (newClassId: string) => {
    onUpdateDraft({
      targetClassId: newClassId,
      isNewMulticlass: true,
      targetClassLevel: 1,
    });
  };

  const availableNewClasses = getAllClasses().filter(
    (c) => !existingClassIds.has(c.id),
  );

  // #endregion

  // #region --- Multiclass Eligibility ---

  const multiclassEligibilityByClassId = Object.fromEntries(
    availableNewClasses.map((c) => {
      const result = evaluateMulticlassEligibility({
        targetClassId: c.id,
        currentClassIds: Array.from(existingClassIds),
        currentCharacterLevel: targetLevel - 1,
        totalScores,
      });
      return [c.id, result];
    }),
  );

  // #endregion

  // If single class and not multiclassing, auto-display for confirmation
  const showAutoSelected = classTracks.length === 1 && !draft.isNewMulticlass;

  // #region --- Render ---

  return (
    <div className="step-container class-pick-step">
      <div className="ste-intro">
        <h3 className="step-title">Choose Your Path</h3>
        <p className="step-description">
          Will you continue to hone your current disciplines, or branch into a
          new martial or arcane art?
        </p>
      </div>

      {/* Existing Paths */}
      <div className="class-selection-group">
        <h4 className="group-label">Current Disciplines</h4>
        <div
          className={`class-cards-grid ${showAutoSelected ? "single-path-mode" : ""}`}
        >
          {classTracks.map((track) => {
            const isSelected =
              draft.targetClassId === track.classId && isLevelingExisting;

            const classD = getClassById(track.classId);
            if (!classD) return null;

            return (
              <button
                key={`existing-${track.classId}`}
                className={`class-card ${isSelected ? "is-selected" : ""}`}
                onClick={() => handleSelectExistingTrack(track)}
              >
                <div className="card-primary">
                  <Swords
                    size={showAutoSelected ? 28 : 20}
                    className="card-icon"
                  />
                  <span className="class-name">{classD.name}</span>
                </div>
                <div className="card-secondary">
                  <span className="level-preview">
                    Level {track.level}{" "}
                    <ArrowRight size={12} className="arrow-icon" /> Level{" "}
                    {track.level + 1}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <hr className="filigree-divider subtle-divider" />

      {/* SECTION 2: MULTICLASSING */}
      <div className="class-selection-group">
        <h4 className="group-label">Forge a New Path (Multiclass)</h4>

        <div className="class-cards-grid multiclass-grid">
          {availableNewClasses.map((newClass) => {
            const isSelected =
              draft.targetClassId === newClass.id && draft.isNewMulticlass;
            const eligibility = multiclassEligibilityByClassId[newClass.id];
            const isEligible = eligibility?.eligible ?? true;

            const classD = getClassById(newClass.id);
            if (!classD) return null;

            if (!isEligible) {
              return (
                <div
                  key={`locked-${newClass.id}`}
                  className="class-card multiclass-card is-locked"
                >
                  <div className="card-primary">
                    <Lock size={16} className="card-icon locked-icon" />
                    <span className="class-name">{classD.name}</span>
                  </div>
                  <div className="card-secondary locked-reasons-list">
                    {eligibility?.failures.map((failure, idx) => (
                      <div key={idx} className="locked-reason-item">
                        <AlertCircle size={12} />
                        <span>{formatFailureReason(failure)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <button
                key={`new-${newClass.id}`}
                className={`class-card multiclass-card ${isSelected ? "is-selected" : ""}`}
                onClick={() => handleSelectNewClass(newClass.id)}
              >
                <div className="card-primary">
                  <PlusCircle size={16} className="card-icon" />
                  <span className="class-name">{classD.name}</span>
                </div>
                <div className="card-secondary">
                  <span className="level-preview">New Level 1</span>
                </div>
              </button>
            );
          })}
        </div>

        {availableNewClasses.length === 0 && (
          <div className="empty-state-text">
            No available disciplines for multiclassing.
          </div>
        )}
      </div>
    </div>
  );

  // #endregion
};
