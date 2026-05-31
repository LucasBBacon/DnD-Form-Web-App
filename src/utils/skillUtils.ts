import type { Skill } from "../types/common";
import type { LevelChoice } from "../types/progression";
import type { TraitData } from "../types/trait";
import {
  aggregateSkillProficiencies,
  type CharacterState,
  type DerivedStats,
} from "./proficiencyAggregator";

export const aggregateSkills = (
  chosenRacialSkills: Skill[],
  chosenBackgroundSkills: Skill[],
  choicesByLevel: Record<number, LevelChoice>,
  currentLevel: number,
  allTraits: TraitData[],
  state: CharacterState,
  stats: DerivedStats,
) => {
  const aggregatedSkills = aggregateSkillProficiencies({
    chosenRacialSkills,
    chosenBackgroundSkills,
    choicesByLevel,
    currentLevel,
    traits: allTraits,
    state,
    stats,
  });

  return {
    proficiencies: aggregatedSkills.proficiencies.list,
    expertise: aggregatedSkills.proficiencies.list,
  };
};
