import type { ClassData } from "../types/class";
import type { Skill } from "../types/common";
import type { LevelChoice } from "../types/progression";
import type { Race } from "../types/race";

export const aggregateSkills = (
  raceData: Race | null,
  classData: ClassData | null, // TODO: expand to an array for multi-classing
  chosenRacialSkills: Skill[],
  chosenBackgroundSkills: Skill[],
  choicesByLevel: Record<number, LevelChoice>,
  currentLevel: number,
) => {
  const proficiencies = new Set<Skill>();
  const expertise = new Set<Skill>();

  // Fixed Racial Skills (e.g., Elf -> Perception)
  // Assume Race schema has a traits array, or 'fixed_skills' array to race schema

  // Chosen Racial and Background Skills
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

  return {
    proficiencies: Array.from(proficiencies),
    expertise: Array.from(expertise),
  };
};
