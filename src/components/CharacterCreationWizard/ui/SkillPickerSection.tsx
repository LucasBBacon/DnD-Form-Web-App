import type React from "react";
import "./SkillPickerSection.css";
import type { Skill } from "../../../types/common";
import type { SkillProficiencyRequirement } from "../../../types/creationRequirement";

// #region Imports and Types

/**
 * Helper function to convert skill identifiers like "animal_handling" into "Animal Handling" for display purposes.
 * @param skill The skill identifier to format.
 * @returns A human-readable skill name.
 */
const formatSkillName = (skill: string): string =>
  skill.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

interface SkillPickerSectionProps {
  /** The skill proficiency requirement to be displayed */
  requirement: SkillProficiencyRequirement;
  /** The currently selected skills */
  currentSelections: Skill[];
  /** Callback function when a skill is toggled */
  onToggle: (skill: Skill) => void;
}

// #endregion

// #region Component

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

// #endregion
