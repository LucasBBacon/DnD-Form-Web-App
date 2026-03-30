import type { Skill } from "../types/common";
import type { LevelChoice } from "../types/progression";
import type { TraitData } from "../types/trait";
import { getSelectedSkillChoices } from "./choiceUtils";
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

  const selectedSkillChoices = getSelectedSkillChoices(
    choicesByLevel,
    currentLevel,
  );
  selectedSkillChoices.skillChoices.forEach((skill) =>
    proficiencies.add(skill),
  );
  selectedSkillChoices.expertiseChoices.forEach((skill) =>
    expertise.add(skill),
  );

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
