import type React from "react";
import type { Skill } from "../../../types/common";
import type { SkillProficiencyRequirement } from "../../../types/creationRequirement";

// Converts a snake_case skill id to a display label
const formatSkillName = (skill: string): string =>
  skill.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

interface SkillPickerSectionProps {
  requirement: SkillProficiencyRequirement;
  currentSelections: Skill[];
  onToggle: (skill: Skill) => void;
}

export const SkillPickerSection: React.FC<SkillPickerSectionProps> = ({
  requirement,
  currentSelections,
  onToggle,
}) => {
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
              className={`skill-chip ${isSelected ? "selected" : ""} ${
                isDisabled ? "disabled" : ""
              }`}
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
