import type { ClassData } from "../types/class";
import type { SubclassData } from "../types/subclass";
import type { SubraceData } from "../types/subrace";

/**
 * Calculates the proficiency bonus based on the character's total level.
 * @param level Total level of a given character.
 * * Level 1-4: +2
 * * Level 5-8: +3
 * * Level 9-12: +4
 * * Level 13-16: +5
 * * Level 17-20: +6
 */
export const calculateProficiencyBonus = (level: number): number => {
  // Constrain the level between 1 and 20 to be safe
  const clampedLevel = Math.max(1, Math.min(20, level));

  return Math.ceil(clampedLevel / 4) + 1;
};

export const getUnlockedFeatures = (
  currentLevel: number,
  subraceData: SubraceData | null,
  classData: ClassData | null,
  subclassData: SubclassData | null,
): string[] => {
  const unlockedFeatures = new Set<string>();

  // Grab subrace traits
  if (subraceData && subraceData.traits_added) {
    subraceData.traits_added.forEach(f => unlockedFeatures.add(f));
  }

  // Grab base class features
  if (classData) {
    classData.progression
      .filter((p) => p.level <= currentLevel)
      .forEach((p) => p.features.forEach((f) => unlockedFeatures.add(f)));
  }

  // Grab subclass features
  if (subclassData) {
    subclassData.progression
      .filter((p) => p.level <= currentLevel)
      .forEach((p) => p.features.forEach((f) => unlockedFeatures.add(f)));
  }

  return Array.from(unlockedFeatures);
};
