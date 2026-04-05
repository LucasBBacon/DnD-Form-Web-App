import { useEffect, useState } from "react";
import type { CharacterClassTrack } from "../../store/useCharacterStore";
import type { Skill } from "../../types/common";
import { useCharacterStore } from "../../store/useCharacterStore";
import { getPendingSkillChoices } from "../../utils/choiceUtils";
import type { LevelChoice } from "../../types/progression";

interface SkillChoiceBlockProps {
  level: number;
  onChange: (draft: Partial<LevelChoice>, isValid: boolean) => void;
  classIdOverride?: string | null;
  subclassIdOverride?: string | null;
  choicesByLevelOverride?: Record<number, LevelChoice>;
  classTracksOverride?: CharacterClassTrack[];
}

const formatSkillName = (skill: string) => {
  return skill
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const SkillChoiceBlock: React.FC<SkillChoiceBlockProps> = ({
  level,
  onChange,
  classIdOverride,
  subclassIdOverride,
  choicesByLevelOverride,
  classTracksOverride,
}) => {
  const { raceId, subraceId, classId, subclassId, choicesByLevel, classTracks } =
    useCharacterStore();

  const resolvedClassId = classIdOverride ?? classId;
  const resolvedSubclassId = subclassIdOverride ?? subclassId;
  const resolvedChoicesByLevel = choicesByLevelOverride ?? choicesByLevel;
  const resolvedClassTracks = classTracksOverride ?? classTracks;

  // Ask engine what choice this level requires
  const pendingChoices = getPendingSkillChoices(
    level,
    raceId,
    subraceId,
    resolvedClassId,
    resolvedSubclassId,
    resolvedChoicesByLevel,
    resolvedClassTracks,
  );

  // Local state to track selections per source
  const [selections, setSelection] = useState<Record<string, Skill[]>>({});

  useEffect(() => {
    const isValid = pendingChoices.every(
      (choice) => (selections[choice.sourceId] || []).length === choice.count,
    );
    const allChosenSkills = Object.values(selections).flat();

    onChange({ skillChoices: allChosenSkills }, isValid);
  }, [selections, pendingChoices, onChange]);

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
    </div>
  );
};
