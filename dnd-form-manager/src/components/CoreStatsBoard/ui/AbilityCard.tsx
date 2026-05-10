import type React from "react";
import { SkillRow } from "./SkillRow";

export interface AbilityCardSkill {
  key: string;
  label: string;
  modifier: number;
  isProficient: boolean;
  isExpertise: boolean;
  hasAdvantage: boolean;
  hasDisadvantage: boolean;
  tooltip: string;
}

export interface AbilityCardSave {
  modifier: number;
  isProficient: boolean;
}

interface AbilityCardProps {
  abilityName: string;
  score: number;
  modifier: number;
  save: AbilityCardSave;
  skills: AbilityCardSkill[];
}

const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

export const AbilityCard: React.FC<AbilityCardProps> = ({
  abilityName,
  score,
  modifier,
  save,
  skills,
}) => (
  <div className="ability-card">
    <div className="ability-header">
      <div className="ability-name">{abilityName.toUpperCase()}</div>
      <div className="ability-score-block">
        <span className="score">{score}</span>
        <span className="modifier">{formatMod(modifier)}</span>
      </div>
    </div>

    <div className="ability-details">
      <SkillRow
        label="Saving Throw"
        modifier={save.isProficient ? save.modifier : modifier}
        isProficient={save.isProficient}
        isSave
      />

      <hr className="divider" />

      {skills.length > 0 ? (
        skills.map((skill) => (
          <SkillRow
            key={skill.key}
            label={skill.label}
            modifier={skill.modifier}
            isProficient={skill.isProficient}
            isExpertise={skill.isExpertise}
            hasAdvantage={skill.hasAdvantage}
            hasDisadvantage={skill.hasDisadvantage}
            tooltip={skill.tooltip}
          />
        ))
      ) : (
        <div className="no-skill-msg">No associated skills</div>
      )}
    </div>
  </div>
);
