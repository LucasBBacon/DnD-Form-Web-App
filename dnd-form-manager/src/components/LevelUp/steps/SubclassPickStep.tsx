import React from "react";
import { getSubclassesForClass } from "../../../data/staticDataApi";
import type { ClassData } from "../../../types/class";
import type { LevelUpDraft } from "../../../types/levelUpDraft";
import type { SubclassData } from "../../../types/subclass";
import type { LevelUpPlannerResult } from "../../../utils/levelUpPlanner";

// #region --- Types ---

interface SubclassPickStepProps {
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
}

// #endregion

/**
 * Step for picking which subclass to choose at a subclass choice level. 
 * Only shown if the class being leveled up has a subclass choice at this level.
 */
export const SubclassPickStep: React.FC<SubclassPickStepProps> = ({
  draft,
  onUpdateDraft,
  classData,
}) => {
  if (!classData) {
    return (
      <div className="level-up-step">
        <p className="level-up-step__description">Select a class first.</p>
      </div>
    );
  }

  const options = getSubclassesForClass(classData.id);

  const handleSelect = (subclassId: string) => {
    onUpdateDraft({ newSubclassId: subclassId });
  };

  // #region --- Render ---

  return (
    <div className="level-up-step">
      <h3 className="level-up-step__title">
        Choose Your {classData.subclassInfo.displayLabel ?? "Subclass"}
      </h3>
      <p className="level-up-step__description">
        At {classData.name} level {classData.subclassInfo.choiceLevel} you
        choose a{" "}
        {classData.subclassInfo.displayLabel?.toLowerCase() ?? "subclass"}. This
        shapes your specialization going forward.
      </p>

      <ul className="level-up-step__option-list">
        {options.map((sub) => {
          const isSelected = draft.newSubclassId === sub.id;
          return (
            <li key={sub.id}>
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
                  name="subclass-pick"
                  checked={isSelected}
                  onChange={() => handleSelect(sub.id)}
                />
                <span>
                  <span className="level-up-step__option-label">
                    {sub.name}
                  </span>
                  <br />
                  {sub.lore?.shortDescription && (
                    <span className="level-up-step__option-hint">
                      {sub.lore.shortDescription}
                    </span>
                  )}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );

  // #endregion
};
