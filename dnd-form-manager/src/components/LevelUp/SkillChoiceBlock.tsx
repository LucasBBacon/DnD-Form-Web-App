import { useState } from "react";
import type { Skill } from "../../types/common";
import { useCharacterStore } from "../../store/useCharacterStore";
import { getPendingSkillChoices } from "../../utils/choiceUtils";
import type { LevelChoice } from "../../types/progression";

const formatSkillName = (skill: string) => {
  return skill
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const SkillChoiceBlock = ({
  level,
  onSave,
  onConfirm,
}: {
  level: number;
  onSave: (choice: Partial<LevelChoice>) => void;
  onConfirm: () => void;
}) => {
  const { raceId, subraceId, classId, subclassId } = useCharacterStore();

  // Ask engine what choice this level requires
  const pendingChoices = getPendingSkillChoices(
    level,
    raceId,
    subraceId,
    classId,
    subclassId,
  );

  // Local state to track selections per source
  const [selections, setSelection] = useState<Record<string, Skill[]>>({});

  if (pendingChoices.length === 0) {
    return null; // No choices to make at this level!
  }

  const handleToggle = (sourceId: string, skill: Skill, maxCount: number) => {
    setSelection((prev) => {
      const current = prev[sourceId] || [];
      if (current.includes(skill)) {
        return { ...prev, [sourceId]: current.filter((s) => s !== skill) };
      } else if (current.length < maxCount) {
        return { ...prev, [sourceId]: [...current, skill] };
      }
      return prev;
    });
  };

  const handleSave = () => {
    // Flatten all selections into a single array
    const allChosenSkills = Object.values(selections).flat();

    // Persist through parent callback (same pattern as ASIChoiceBlock)
    onSave({ skillChoices: allChosenSkills });
    onConfirm();
  };

  // Ensure all choice blocks are fully satisfied
  const isValid = pendingChoices.every(
    (choice) => (selections[choice.sourceId] || []).length === choice.count,
  );

  return (
    <div className="choice-block">
      <h3>Level {level} Skill Proficiencies</h3>

      {pendingChoices.map((choice) => {
        const selected = selections[choice.sourceId] || [];
        const isFull = selected.length >= choice.count;

        return (
          <div key={choice.sourceId} className="choice-group">
            <p>
              From <strong>{choice.sourceName}</strong>: Choose{" "}
              {choice.count - selected.length} more.
            </p>

            <div className="skill-grid">
              {choice.pool.map((skill) => {
                const isChecked = selected.includes(skill);
                const isDisabled = !isChecked && isFull;

                return (
                  <label
                    key={skill}
                    className={`checkbox-label ${isDisabled ? "disabled" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isDisabled}
                      onChange={() =>
                        handleToggle(choice.sourceId, skill, choice.count)
                      }
                    />
                      {formatSkillName(skill)}
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      <button disabled={!isValid} onClick={handleSave}>
        Confirm Skills
      </button>
    </div>
  );
};
