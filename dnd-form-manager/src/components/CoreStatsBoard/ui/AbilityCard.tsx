import type React from "react";
import "./AbilityCard.css";
import { DiceRoller } from "../../ui/DiceRoller/DiceRoller";

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

export interface CoreStatsAbilityEntry {
  key: string;
  abilityName: string;
  score: number;
  modifier: number;
  save: {
    modifier: number;
    isProficient: boolean;
  };

  skills: AbilityCardSkill[];
}

interface AbilityCardProps {
  ability: CoreStatsAbilityEntry;
  onSkillRoll: (skillKey: string, total: number) => void;
  onSaveRoll: (abilityKey: string, total: number) => void;
  onAbilityCheckRoll: (abilityKey: string, total: number) => void;
}

// #endregion

// #region Component

export const AbilityCard: React.FC<AbilityCardProps> = ({
  ability,
  onSkillRoll,
  onSaveRoll,
  onAbilityCheckRoll,
}) => {
  const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

  // Helper to render the proficiency "wax seal"
  const renderProficiencySeal = (
    isProficient: boolean,
    isExpertise: boolean = false,
  ) => {
    let sealClass = "is-empty";
    if (isExpertise) sealClass = "is-expertise";
    else if (isProficient) sealClass = "is-proficient";

    return <div className={`proficiency-seal ${sealClass}`} />;
  };

  return (
    <div className="ability-card">
      {/* Ability Header: Massive Modifier, Subdued Score */}
      <div className="ability-header">
        <div className="ability-title">{ability.abilityName}</div>
        <DiceRoller
          sides={20}
          count={1}
          rollLabel={formatMod(ability.modifier)}
          className="ability-core-roller"
          onRollComplete={(_, summary) =>
            onAbilityCheckRoll(ability.key, summary.total)
          }
        />
        <div className="ability-score-badge">Score {ability.score}</div>
      </div>

      <hr className="filigree-divider" />

      {/* Saving Throw & Skills Ledger */}
      <div className="skills-ledger">
        {/* Saving Throw Row */}
        <div className="skill-row save-row">
          <div className="skill-info">
            {renderProficiencySeal(ability.save.isProficient)}
            <span className="skill-name">Saving Throw</span>
          </div>
          <DiceRoller
            sides={20}
            count={1}
            rollLabel={formatMod(ability.save.modifier)}
            className="skill-mini-roller"
            onRollComplete={(_, summary) =>
              onSaveRoll(ability.key, summary.total)
            }
          />
        </div>

        {/* Associated Skills */}
        {ability.skills.map((skill) => (
          <div key={skill.key} className="skill-row" title={skill.tooltip}>
            <div className="skill-info">
              {renderProficiencySeal(skill.isProficient, skill.isExpertise)}
              <span className="skill-name">
                {skill.label}
                {/* Optional Advantage/Disadvantage Runes */}
                {skill.hasAdvantage && <span className="adv-rune">A</span>}
                {skill.hasDisadvantage && <span className="dis-rune">D</span>}
              </span>
            </div>
            <DiceRoller
              sides={20}
              count={1}
              rollLabel={formatMod(skill.modifier)}
              className="skill-mini-roller"
              onRollComplete={(_, summary) =>
                onSkillRoll(skill.key, summary.total)
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// #endregion
