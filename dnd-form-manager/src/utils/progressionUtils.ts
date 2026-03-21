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
