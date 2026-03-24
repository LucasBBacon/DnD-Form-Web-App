import type { Ability } from "../types/common";
import type { LevelChoice } from "../types/progression";
import type { Race } from "../types/race";
import type { SubraceData } from "../types/subrace";

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
 * The result starts with the base score, then adds any fixed racial bonus,
 * any user-selected racial bonus, and the aggregated ASI bonus for that ability.
 *
 * @param ability Ability to calculate the total for.
 * @param baseScore Starting score before racial bonuses or ASIs.
 * @param race Selected race used to apply fixed racial bonuses.
 * @param userChosenRacialBonuses User-selected racial bonuses keyed by ability.
 * @param totalAsiBonus Total ASI bonus already aggregated for this ability.
 * @returns The final ability score after all applied bonuses.
 */
export const calculateTotalAbilityScore = (
  ability: Ability,
  baseScore: number,
  race: Race | null,
  subrace: SubraceData | null,
  userChosenRacialBonuses: Partial<Record<Ability, number>> = {},
  totalAsiBonus?: number,
): number => {
  let total = baseScore;

  if (race) {
    // Add fixed racial bonuses (if the race has one for this ability)
    total += race.ability_bonuses.fixed[ability] || 0;
  }

  if (subrace) {
    total += subrace.ability_bonuses?.fixed?.[ability] || 0;
  }

  // Add any user-selected racial bonuses
  total += userChosenRacialBonuses[ability] || 0;

  // Add ASI bonus
  total += totalAsiBonus || 0;

  // TODO: Add feats and magic items

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
