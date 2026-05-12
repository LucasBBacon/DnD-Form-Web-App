import type React from "react";
import { StatsTopBar } from "./ui/StatsTopBar";
import { AbilityCard, type AbilityCardSkill } from "./ui/AbilityCard";
import "./CoreStatsBoard.css";

// #region Interfaces

export interface CoreStatsAbilityEntry {
  /** The unique key for the ability (e.g., "str", "dex") */
  key: string;
  /** The display name of the ability (e.g., "Strength", "Dexterity") */
  abilityName: string;
  /** The ability score (e.g., 16, 14) */
  score: number;
  /** The ability modifier (e.g., +3, +2) */
  modifier: number;
  /** The saving throw for the ability, including modifier and proficiency */
  save: {
    /** The saving throw modifier for the ability (e.g., +3, +2) */
    modifier: number;
    /** Whether the character is proficient in the saving throw */
    isProficient: boolean;
  };
  /** The skills associated with the ability */
  skills: AbilityCardSkill[];
}

export interface CoreStatsBoardViewProps {
  /** The character's proficiency bonus */
  proficiencyBonus: number;
  /** The character's passive scores for perception, investigation, and insight */
  passives: {
    /** The character's passive perception score */
    perception: number;
    /** The character's passive investigation score */
    investigation: number;
    /** The character's passive insight score */
    insight: number;
  };
  /** An array of ability entries to display on the board */
  abilities: CoreStatsAbilityEntry[];
}

// #endregion

// #region View Component

export const CoreStatsBoardView: React.FC<CoreStatsBoardViewProps> = ({
  proficiencyBonus,
  passives,
  abilities,
}) => {
  return (
    <section className="core-stats-container">
      <StatsTopBar proficiencyBonus={proficiencyBonus} passives={passives} />

      <div className="ability-grid">
        {abilities.map((ability) => (
          <AbilityCard
            key={ability.key}
            abilityName={ability.abilityName}
            score={ability.score}
            modifier={ability.modifier}
            save={ability.save}
            skills={ability.skills}
          />
        ))}
      </div>
    </section>
  );
};

// #endregion
