import type { Ability } from "../types/common";
import type { Race } from "../types/race";

/**
 * Converts a total ability score into its corresponding modifier.
 * e.g., 10 -> 0, 14 -> 2, 8 -> -1
 */
export const calculateModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

/**
 * Calculates the final score for a specific ability.
 * @param ability Ability to calculate final score of.
 * @param baseScore Base roll.
 * @param race Fixed racial bonuses.
 * @param userChosenRacialBonuses Chosen racial bonuses.
 */
export const calculateTotalAbilityScore = (
  ability: Ability,
  baseScore: number,
  race: Race | null,
  userChosenRacialBonuses: Partial<Record<Ability, number>> = {},
): number => {
  let total = baseScore;

  if (race) {
    // Add fixed racial bonuses (if the race has one for this ability)
    const fixedBonus = race.ability_bonuses.fixed[ability] || 0;
    total += fixedBonus;
  }

  // Add any user-selected racial bonuses
  const chosenBonus = userChosenRacialBonuses[ability] || 0;
  total += chosenBonus;

  // TODO: Add feats and magic items

  return total;
};
