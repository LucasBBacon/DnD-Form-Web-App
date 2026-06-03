import type React from "react";
import { useMemo } from "react";
import { useCharacterStats } from "../../hooks/useCharacterStats";
import { useSkills } from "../../hooks/useSkills";
import type { Skill } from "../../types/common";
import { ABILITIES, ABILITY_LABELS } from "../../utils/abilityConstants";
import { SKILL_ABILITY_MAP } from "../../utils/constants";
import { CoreStatsBoard } from "./CoreStatsBoard";
import type { AbilityCardSkill, CoreStatsAbilityEntry } from "./ui/AbilityCard";

const toSkillLabel = (skill: Skill): string =>
  skill.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const toTooltip = (advantageSources: string[], disadvantageSources: string[]): string => {
  const parts: string[] = [];
  if (advantageSources.length > 0) {
    parts.push(`Advantage: ${advantageSources.join(", ")}`);
  }
  if (disadvantageSources.length > 0) {
    parts.push(`Disadvantage: ${disadvantageSources.join(", ")}`);
  }
  return parts.join(" | ");
};

export const CoreStatsBoardContainer: React.FC = () => {
  const { abilities: abilityStats } = useCharacterStats();
  const { calculatedSkills, calculatedSaves, proficiencyBonus, passives } = useSkills();

  const abilities = useMemo<CoreStatsAbilityEntry[]>(() => {
    return ABILITIES.map((ability) => {
      const skills = (Object.keys(SKILL_ABILITY_MAP) as Skill[])
        .filter((skill) => SKILL_ABILITY_MAP[skill] === ability)
        .map((skill) => {
          const calculated = calculatedSkills[skill];
          const entry: AbilityCardSkill = {
            key: skill,
            label: toSkillLabel(skill),
            modifier: calculated.total,
            isProficient: calculated.isProficient,
            isExpertise: calculated.isExpertise,
            hasAdvantage: calculated.advantageSources.length > 0,
            hasDisadvantage: calculated.disadvantageSources.length > 0,
            tooltip: toTooltip(
              calculated.advantageSources,
              calculated.disadvantageSources,
            ),
          };
          return entry;
        });

      return {
        key: ability,
        abilityName: ABILITY_LABELS[ability],
        score: abilityStats.scores[ability],
        modifier: abilityStats.modifiers[ability],
        save: {
          modifier: calculatedSaves[ability].total,
          isProficient: calculatedSaves[ability].isProficient,
        },
        skills,
      };
    });
  }, [abilityStats.modifiers, abilityStats.scores, calculatedSaves, calculatedSkills]);

  return (
    <CoreStatsBoard
      proficiencyBonus={proficiencyBonus}
      passives={passives}
      abilities={abilities}
    />
  );
};
