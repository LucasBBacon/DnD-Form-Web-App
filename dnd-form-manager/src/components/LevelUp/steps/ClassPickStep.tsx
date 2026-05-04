import React from "react";
import type { CharacterClassTrack } from "../../../store/useCharacterStore";
import { getAllClasses, getClassById } from "../../../data/staticDataApi";
import type { ClassData } from "../../../types/class";
import type { LevelUpDraft } from "../../../types/levelUpDraft";
import type { SubclassData } from "../../../types/subclass";
import type { LevelUpPlannerResult } from "../../../utils/levelUpPlanner";
import { evaluateMulticlassEligibility } from "../../../utils/multiclassEligibilityUtils";
import { useCharacterStats } from "../../../hooks/useCharacterStats";

interface ClassPickStepProps {
  draft: LevelUpDraft;
  onUpdateDraft: (updates: Partial<LevelUpDraft>) => void;
  plan: LevelUpPlannerResult;
  classData: ClassData | null;
  subclassData: SubclassData | null;
  targetLevel: number;
  classTracks: CharacterClassTrack[];
}

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

  const availableNewClasses = getAllClasses().filter((c) => !existingClassIds.has(c.id));

  // Check multiclass eligibility for adding a new class
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

  // If single class and not multiclassing, auto-display for confirmation
  const showAutoSelected = classTracks.length === 1 && !draft.isNewMulticlass;

  return (
    <div className="level-up-step">
      <h3 className="level-up-step__title">Choose Class to Level</h3>
      <p className="level-up-step__description">
        Select which class to advance, or add a new multiclass.
      </p>

      {/* Existing class tracks */}
      {classTracks.length > 0 && (
        <>
          <p className="level-up-step__section-label">Level up an existing class</p>
          <ul className="level-up-step__option-list">
            {classTracks.map((track) => {
              const cd = getClassById(track.classId);
              if (!cd) return null;
              const isSelected =
                draft.targetClassId === track.classId && isLevelingExisting;
              return (
                <li key={track.classId}>
                  <label
                    className={[
                      "level-up-step__option",
                      isSelected ? "level-up-step__option--selected" : "",
                    ]
                      .join(" ")
                      .trim()}
                  >
                    <input
                      type="radio"
                      name="class-pick"
                      checked={isSelected}
                      onChange={() => handleSelectExistingTrack(track)}
                    />
                    <span>
                      <span className="level-up-step__option-label">
                        {cd.name}
                      </span>
                      <br />
                      <span className="level-up-step__option-hint">
                        Currently level {track.level} → becoming level {track.level + 1}
                        {track.subclassId ? ` · ${track.subclassId}` : ""}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {/* Add new multiclass */}
      {targetLevel > 1 && availableNewClasses.length > 0 && (
        <>
          <p className="level-up-step__section-label">Add a new multiclass</p>
          <ul className="level-up-step__option-list">
            {availableNewClasses.map((c) => {
              const eligibility = multiclassEligibilityByClassId[c.id];
              const isEligible = eligibility?.eligible ?? false;
              const isSelected = draft.targetClassId === c.id && draft.isNewMulticlass;
              return (
                <li key={c.id}>
                  <label
                    className={[
                      "level-up-step__option",
                      isSelected ? "level-up-step__option--selected" : "",
                      !isEligible ? "level-up-step__option--disabled" : "",
                    ]
                      .join(" ")
                      .trim()}
                  >
                    <input
                      type="radio"
                      name="class-pick"
                      checked={isSelected}
                      onChange={() => isEligible && handleSelectNewClass(c.id)}
                      disabled={!isEligible}
                    />
                    <span>
                      <span className="level-up-step__option-label">{c.name}</span>
                      <br />
                      <span className="level-up-step__option-hint">
                        {isEligible
                          ? `Add ${c.name} level 1`
                          : `Not eligible: ${(eligibility?.failures ?? [])
                              .map((f) => f.code)
                              .join(", ")}`}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {showAutoSelected && draft.targetClassId && (
        <p
          style={{
            fontSize: "0.8rem",
            color: "var(--color-text-muted, #888)",
            marginTop: "0.75rem",
          }}
        >
          Your class is auto-selected. Click Next to continue.
        </p>
      )}
    </div>
  );
};
