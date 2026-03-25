import {
  getClassById,
  getRaceById,
  getSubclassById,
  getSubraceById,
} from "../data/staticDataApi";
import { useCharacterStore } from "../store/useCharacterStore";
import type { Ability, Skill } from "../types/common";
import { MECHANIC_IDS, SKILL_ABILITY_MAP } from "../utils/constants";
import { getUnlockedFeatures } from "../utils/progressionUtils";
import { aggregateSkills } from "../utils/skillUtils";
import { useCharacterStats } from "./useCharacterStats";

export const useSkill = () => {
  // pull from zustand
  const {
    level,
    raceId,
    subraceId,
    classId,
    subclassId,
    chosenRacialSkills,
    chosenBackgroundSkills,
    choicesByLevel,
  } = useCharacterStore();

  // pull derived modifiers and PB from existing hook
  const { modifiers, proficiencyBonus } = useCharacterStats();

  const raceData = raceId ? getRaceById(raceId) : null;
  const subraceData = subraceId ? getSubraceById(subraceId) : null;
  const classData = classId ? getClassById(classId) : null;
  const subclassData = subclassId ? getSubclassById(subclassId) : null;

  // get aggregated lists
  const { proficiencies, expertise } = aggregateSkills(
    raceData,
    classData,
    chosenRacialSkills,
    chosenBackgroundSkills,
    choicesByLevel,
    level,
  );

  // check for Jack of All Trades (bard feat)
  const unlockedFeatures = getUnlockedFeatures(
    level,
    subraceData,
    classData,
    subclassData,
  );
  const hasJackOfAllTrades = unlockedFeatures.includes(
    MECHANIC_IDS.JACK_ALL_TRADES,
  );

  // Build the final dictionary for UI
  const skillList = Object.keys(SKILL_ABILITY_MAP) as Skill[];

  const calculatedSkills = {} as Record<
    Skill,
    {
      total: number;
      isProficient: boolean;
      isExpertise: boolean;
      stat: Ability;
    }
  >;

  skillList.forEach((skill) => {
    const governingStat = SKILL_ABILITY_MAP[skill];
    const baseMod = modifiers[governingStat] || 0;

    const isProficient = proficiencies.includes(skill);
    const isExpertise = expertise.includes(skill);

    let finalMod = baseMod;

    if (isExpertise) {
      finalMod += proficiencyBonus * 2;
    } else if (isProficient) {
      finalMod += proficiencyBonus;
    } else if (hasJackOfAllTrades) {
      finalMod += Math.floor(proficiencyBonus / 2);
    }

    calculatedSkills[skill] = {
      total: finalMod,
      isProficient,
      isExpertise,
      stat: governingStat,
    };
  });
};
