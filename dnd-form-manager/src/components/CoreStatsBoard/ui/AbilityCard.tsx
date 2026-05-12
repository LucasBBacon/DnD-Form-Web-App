import type React from "react";
import "./AbilityCard.css";
import { SkillRow } from "./SkillRow";

// #region Interfaces

export interface AbilityCardSkill {
  /** The unique key for the skill */
  key: string;
  /** The label displayed for the skill */
  label: string;
  /** The modifier value for the skill */
  modifier: number;
  /** Indicates if the skill is proficient */
  isProficient: boolean;
  /** Indicates if the skill has expertise */
  isExpertise: boolean;
  /** Indicates if the skill has advantage */
  hasAdvantage: boolean;
  /** Indicates if the skill has disadvantage */
  hasDisadvantage: boolean;
  /** The tooltip text for the skill */
  tooltip: string;
}

export interface AbilityCardSave {
  /** The modifier value for the saving throw */
  modifier: number;
  /** Indicates if the saving throw is proficient */
  isProficient: boolean;
}

interface AbilityCardProps {
  /** The name of the ability */
  abilityName: string;
  /** The score of the ability */
  score: number;
  /** The modifier for the ability */
  modifier: number;
  /** The saving throw information for the ability */
  save: AbilityCardSave;
  /** The skills associated with the ability */
  skills: AbilityCardSkill[];
}

// #endregion

// #region Helpers

const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

// #endregion

// #region Component

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

// #endregion
