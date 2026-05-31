import type { Ability } from "../types/common";
import type { LevelChoice } from "../types/progression";

/**
 * Converts a total ability score into its corresponding modifier.
 * e.g., 10 -> 0, 14 -> 2, 8 -> -1
 */
export const calculateModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

/**
 * Calculates the final score for a specific ability score.
 *
 * The result starts with the base score, then adds fixed ancestry bonuses,
 * user-selected ancestry bonuses, and the aggregated ASI/feat bonuses.
 */
export const calculateTotalAbilityScore = (
  ability: Ability,
  baseScore: number,
  fixedAncestryBonuses: Partial<Record<Ability, number>> = {},
  userChosenAncestryBonuses: Partial<Record<Ability, number>> = {},
  totalAsiBonus?: number,
  featBonuses: Partial<Record<Ability, number>> = {},
): number => {
  let total = baseScore;

  total += fixedAncestryBonuses[ability] || 0;
  total += userChosenAncestryBonuses[ability] || 0;
  total += totalAsiBonus || 0;
  total += featBonuses[ability] || 0;

  return total;
};

/**
 * Aggregates all Ability Score Improvement (ASI) selections made from level 1
 * through the character's current level.
 *
 * For each level that contains asiChoices, the selected increases are summed by
 * ability and returned as a single object. Abilities with no ASI increases are
 * omitted from the result.
 *
 * @param currentLevel The character's current level.
 * @param choicesByLevel Level-based progression choices keyed by level.
 * @returns A map of abilities to their total ASI bonuses across all eligible levels.
 */
export const calculateTotalASI = (
  currentLevel: number,
  choicesByLevel: Record<number, LevelChoice>,
): Partial<Record<Ability, number>> => {
  const aggregatedAsi: Partial<Record<Ability, number>> = {};

  for (let i = 1; i <= currentLevel; i++) {
    const levelChoice = choicesByLevel[i];
    if (levelChoice?.asiChoices) {
      // Loop through whatever stats was bumped and add them to total
      (Object.keys(levelChoice.asiChoices) as Ability[]).forEach((stat) => {
        aggregatedAsi[stat] =
          (aggregatedAsi[stat] || 0) + (levelChoice.asiChoices![stat] || 0);
      });
    }
  }

  return aggregatedAsi;
};
