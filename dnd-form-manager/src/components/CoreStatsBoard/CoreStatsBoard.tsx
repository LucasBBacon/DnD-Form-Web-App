import type React from "react";
import type { Skill } from "../../types/common";
import { useCharacterStats } from "../../hooks/useCharacterStats";
import { useSkills } from "../../hooks/useSkills";
import {
  ABILITIES,
  ABILITY_LABELS as ABILITY_NAMES,
} from "../../utils/abilityConstants";
import { CoreStatsBoardView } from "./CoreStatsBoardView.tsx";

// #region Helpers

/**
 * Converts camelCase skill names to a more readable format with spaces and capitalization.
 * @param str The camelCase string to format (e.g., "stealth", "arcanaKnowledge").
 * @returns A formatted string with spaces and capitalization (e.g., "Stealth", "Arcana Knowledge").
 */
const formatSkillName = (str: string) => {
  const spaced = str.replace(/([A-Z])/g, " $1");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

// #endregion

// #region Component

export const CoreStatsBoard: React.FC = () => {
  const { abilities } = useCharacterStats();
  const { calculatedSkills, calculatedSaves, proficiencyBonus, passives } =
    useSkills();

  const abilityEntries = ABILITIES.map((ability) => {
    const score = abilities.scores[ability];
    const modifier = abilities.modifiers[ability];
    const save = calculatedSaves[ability];
    const skillsForAbility = Object.entries(calculatedSkills).filter(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_, skillData]) => skillData.stat === ability,
    ) as [Skill, (typeof calculatedSkills)[Skill]][];

    const skillEntries = skillsForAbility.map(([skillKey, skillData]) => {
      let tooltip = "";
      if (skillData.advantageSources.length > 0) {
        tooltip += `Advantage: ${skillData.advantageSources.join(", ")}\n`;
      }
      if (skillData.disadvantageSources.length > 0) {
        tooltip += `Disadvantage: ${skillData.disadvantageSources.join(", ")}\n`;
      }

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

    return {
      key: ability,
      abilityName: ABILITY_NAMES[ability],
      score,
      modifier,
      save: {
        modifier: save?.total ?? modifier,
        isProficient: save?.isProficient ?? false,
      },
      skills: skillEntries,
    };
  });

  return (
    <CoreStatsBoardView
      proficiencyBonus={proficiencyBonus}
      passives={passives}
      abilities={abilityEntries}
    />
  );
};

// #endregion
