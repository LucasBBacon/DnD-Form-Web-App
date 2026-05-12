import type React from "react";
import "./SkillRow.css";

// #region Interfaces

interface SkillRowProps {
  /** The label of the skill */
  label: string;
  /** The modifier for the skill */
  modifier: number;
  /** Whether the character is proficient in the skill */
  isProficient: boolean;
  /** Whether the character has expertise in the skill */
  isExpertise?: boolean;
  /** Whether the character has advantage on the skill */
  hasAdvantage?: boolean;
  /** Whether the character has disadvantage on the skill */
  hasDisadvantage?: boolean;
  /** Tooltip text for the skill */
  tooltip?: string;
  /** Whether the skill is a saving throw */
  isSave?: boolean;
}

// #endregion

// #region Helpers

const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

// #endregion

// #region Component

export const SkillRow: React.FC<SkillRowProps> = ({
  label,
  modifier,
  isProficient,
  isExpertise = false,
  hasAdvantage = false,
  hasDisadvantage = false,
  tooltip,
  isSave = false,
}) => (
  <div
    className={`skill-row${isSave ? " save-row" : ""}`}
    title={tooltip?.trim()}
  >
    <span
      className={`prof-dot ${isProficient ? "active" : ""} ${isExpertise ? "expertise" : ""}`}
    />
    <span className="skill-mod">{formatMod(modifier)}</span>
    <span className="skill-name">
      {label}
      {hasAdvantage && <span className="adv-indicator"> (A)</span>}
      {hasDisadvantage && <span className="dis-indicator"> (D)</span>}
    </span>
  </div>
);

// #endregion
