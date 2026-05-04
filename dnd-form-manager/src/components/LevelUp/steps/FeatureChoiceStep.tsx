import React from "react";
import { getSpellByID } from "../../../data/staticDataApi";
import type { ClassData } from "../../../types/class";
import type { LevelUpDraft } from "../../../types/levelUpDraft";
import type { SubclassData } from "../../../types/subclass";
import type { LevelUpPlannerResult } from "../../../utils/levelUpPlanner";

interface FeatureChoiceStepProps {
  draft: LevelUpDraft;
  onUpdateDraft: (updates: Partial<LevelUpDraft>) => void;
  plan: LevelUpPlannerResult;
  classData: ClassData | null;
  subclassData: SubclassData | null;
}

const toDisplayLabel = (value: string): string => {
  const spell = value.startsWith("spell_") ? getSpellByID(value) : null;
  if (spell?.name) {
    return spell.name;
  }

  return value.replace(/^lang_/, "").replace(/_/g, " ");
};

export const FeatureChoiceStep: React.FC<FeatureChoiceStepProps> = ({
  draft,
  onUpdateDraft,
  plan,
}) => {
  const { pendingFeatureChoices } = plan;

  if (pendingFeatureChoices.length === 0) {
    return (
      <div className="level-up-step">
        <h3 className="level-up-step__title">Feature Choices</h3>
        <p className="level-up-step__description">No custom feature choices at this level.</p>
      </div>
    );
  }

  const setChoiceValue = (sourceId: string, value: string) => {
    onUpdateDraft({
      featureChoices: {
        ...draft.featureChoices,
        [sourceId]: value,
      },
    });
  };

  return (
    <div className="level-up-step">
      <h3 className="level-up-step__title">Feature Choices</h3>
      <p className="level-up-step__description">
        Resolve custom trait and feature options granted at this level.
      </p>

      {pendingFeatureChoices.map((choice) => {
        const selectedValue = draft.featureChoices[choice.sourceId] ?? "";

        return (
          <div key={choice.sourceId} style={{ marginBottom: "1rem" }}>
            <p className="level-up-step__section-label">{choice.sourceName}</p>

            {choice.pool.length > 0 ? (
              <ul className="level-up-step__option-list">
                {choice.pool.map((entry) => {
                  const isSelected = selectedValue === entry;
                  return (
                    <li key={entry}>
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
                          name={`feature-${choice.sourceId}`}
                          checked={isSelected}
                          onChange={() => setChoiceValue(choice.sourceId, entry)}
                        />
                        <span className="level-up-step__option-label">
                          {toDisplayLabel(entry)}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="level-up-step__row">
                <label htmlFor={`feature-input-${choice.sourceId}`}>
                  {choice.allowCustomValue
                    ? "Enter your selected option"
                    : "No predefined options were found; enter the selected value"}
                </label>
                <input
                  id={`feature-input-${choice.sourceId}`}
                  type="text"
                  className="level-up-step__inline-number"
                  style={{ width: "220px", textAlign: "left" }}
                  value={selectedValue}
                  onChange={(event) => setChoiceValue(choice.sourceId, event.target.value)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
