import { useState } from "react";
import type { Skill } from "../../types/common";
import type { LevelChoice } from "../../types/progression";

interface SkillChoiceBlockProps {
  level: number;
  count: number;
  pool: Skill[];
  onSave: (choice: Partial<LevelChoice>) => void;
}

const formatSkillName = (skill: string) => {
  return skill
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const SkillChoiceBlock: React.FC<SkillChoiceBlockProps> = ({
  level,
  count,
  pool,
  onSave,
}) => {
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);

  const toggleSkill = (skill: Skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else if (selectedSkills.length < count) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSave = () => {
    onSave({ skillChoices: selectedSkills });
  };

  const isComplete = selectedSkills.length === count;

  return (
    <div className="choice-block skill-block">
      <h3>Level {level}: Skill Proficiencies</h3>
      <p>
        Choose <strong>{count - selectedSkills.length}</strong> more skill(s)
        from the list below:
      </p>

      <div className="skill-grid">
        {pool.map((skill) => {
          const isChecked = selectedSkills.includes(skill);
          // Disable unchecked boxes if limit reached
          const isDisabled = !isChecked && selectedSkills.length >= count;

          return (
            <label
              key={skill}
              className={`skill-checkbox ${isDisabled ? "disabled" : ""}`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                disabled={isDisabled}
                onChange={() => toggleSkill(skill)}
              />
              {formatSkillName(skill)}
            </label>
          );
        })}
      </div>

      <button
        className="confirm-btn"
        disabled={!isComplete}
        onClick={handleSave}
      >
        COnfirm Proficiencies
      </button>
    </div>
  );
};
