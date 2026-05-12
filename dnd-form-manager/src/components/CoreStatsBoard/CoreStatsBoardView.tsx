import type React from "react";
import { StatsTopBar } from "./ui/StatsTopBar";
import { AbilityCard, type AbilityCardSkill } from "./ui/AbilityCard";
import "./CoreStatsBoard.css";

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

export interface CoreStatsBoardViewProps {
  proficiencyBonus: number;
  passives: {
    perception: number;
    investigation: number;
    insight: number;
  };
  abilities: CoreStatsAbilityEntry[];
}

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
