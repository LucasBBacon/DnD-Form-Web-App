import type { Skill } from "../types/common";
import type { LevelChoice } from "../types/progression";
import type { TraitData } from "../types/trait";
import { evaluateAllPredicates } from "./predicateEngine";

export const aggregateSkills = (
  chosenRacialSkills: Skill[],
  chosenBackgroundSkills: Skill[],
  choicesByLevel: Record<number, LevelChoice>,
  currentLevel: number,
  allTraits: TraitData[],
  state: any,
  stats: any,
) => {
  const proficiencies = new Set<Skill>();
  const expertise = new Set<Skill>();

  // #region Chosen Racial and Background Skills
  chosenRacialSkills.forEach((s) => proficiencies.add(s));
  chosenBackgroundSkills.forEach((s) => proficiencies.add(s));

  // Loop through Level Choices (Class skills, Feat skills, Expertise)
  for (let i = 1; i <= currentLevel; i++) {
    const choice = choicesByLevel[i];
    if (choice) {
      choice.skillChoices?.forEach((s) => proficiencies.add(s));
      choice.expertiseChoices?.forEach((s) => expertise.add(s));
    }
  }

  // #region Trait Effects
  allTraits.forEach((trait) => {
    trait.effects?.forEach((effect) => {
      // Ask engine if conditions are met
      const isActive = evaluateAllPredicates(effect.predicates, state, stats);

      if (isActive) {
        if (effect.type === "proficiency") {
          proficiencies.add(effect.target as Skill);
        }
        if (effect.type === "expertise") {
          expertise.add(effect.target as Skill);
        }
      }
    });
  });

  return {
    proficiencies: Array.from(proficiencies),
    expertise: Array.from(expertise),
  };
};
