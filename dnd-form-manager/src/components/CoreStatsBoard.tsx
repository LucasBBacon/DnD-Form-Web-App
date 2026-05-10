import type React from "react";
import type { Skill } from "../types/common";
import { useCharacterStats } from "../hooks/useCharacterStats";
import { useSkills } from "../hooks/useSkills";
import "./CoreStatsBoard.css"
import { ABILITIES, ABILITY_LABELS as ABILITY_NAMES } from "../utils/abilityConstants";
import { StatsTopBar } from "./CoreStatsBoard/ui/StatsTopBar";
import { AbilityCard } from "./CoreStatsBoard/ui/AbilityCard";

const formatSkillName = (str: string) => {
  const spaced = str.replace(/([A-Z])/g, " $1");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

export const CoreStatsBoard: React.FC = () => {
  const { abilities } = useCharacterStats();
  const { calculatedSkills, calculatedSaves, proficiencyBonus, passives } =
    useSkills();

  return (
    <section className="core-stats-container">
      <StatsTopBar proficiencyBonus={proficiencyBonus} passives={passives} />

      <div className="ability-grid">
        {ABILITIES.map((ability) => {
          const score = abilities.scores[ability];
          const modifier = abilities.modifiers[ability];
          const save = calculatedSaves[ability];
          const skillsForAbility = Object.entries(calculatedSkills).filter(
            ([_, skillData]) => skillData.stat === ability,
          ) as [Skill, (typeof calculatedSkills)[Skill]][];

          const skillEntries = skillsForAbility.map(([skillKey, skillData]) => {
            let tooltip = "";
            if (skillData.advantageSources.length > 0)
              tooltip += `Advantage: ${skillData.advantageSources.join(", ")}\n`;
            if (skillData.disadvantageSources.length > 0)
              tooltip += `Disadvantage: ${skillData.disadvantageSources.join(", ")}\n`;

            return {
              key: skillKey as string,
              label: formatSkillName(skillKey as string),
              modifier: skillData.total,
              isProficient: skillData.isProficient,
              isExpertise: skillData.isExpertise,
              hasAdvantage: skillData.advantageSources.length > 0,
              hasDisadvantage: skillData.disadvantageSources.length > 0,
              tooltip,
            };
          });

          return (
            <AbilityCard
              key={ability}
              abilityName={ABILITY_NAMES[ability]}
              score={score}
              modifier={modifier}
              save={{
                modifier: save?.total ?? modifier,
                isProficient: save?.isProficient ?? false,
              }}
              skills={skillEntries}
            />
          );
        })}
      </div>
    </section>
  );
};
