import type { Skill } from "../types/common";
import { SKILL_ABILITY_MAP } from "./constants";
import { getAllCharacterTraits } from "./traitUtils";

export const getPendingSkillChoices = (
  level: number,
  raceId: string | null,
  subraceId: string | null,
  classId: string | null,
  subclassId: string | null,
) => {
  // Only get traits granted AT THIS LEVEL to avoid re-prompting old choices.
  const allTraits = getAllCharacterTraits(
    level,
    raceId,
    subraceId,
    classId,
    subclassId,
    true,
  );

  const pendingChoices: Array<{
    sourceId: string;
    sourceName: string;
    count: number;
    pool: Skill[];
  }> = [];

  allTraits.forEach((trait) => {
    trait.effects?.forEach((effect) => {
      if (effect.type === "proficiency_choice" && effect.choice) {
        // Resolve 'any' to literally every skill in game
        const resolvedPool =
          effect.choice.pool === "any"
            ? (Object.keys(SKILL_ABILITY_MAP) as Skill[])
            : effect.choice.pool;

        pendingChoices.push({
          sourceId: trait.id,
          sourceName: trait.name,
          count: effect.choice.count,
          pool: resolvedPool,
        });
      }
    });
  });

  return pendingChoices;
};
