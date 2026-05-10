import type React from "react";

interface SkillRowProps {
  label: string;
  modifier: number;
  isProficient: boolean;
  isExpertise?: boolean;
  hasAdvantage?: boolean;
  hasDisadvantage?: boolean;
  tooltip?: string;
  isSave?: boolean;
}

const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

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
