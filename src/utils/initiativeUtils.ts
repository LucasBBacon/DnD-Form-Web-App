/**
 * Calculates the character's total initiative bonus.
 * @param dexModifier Base bonus for all characters.
 * @param flatBonuses Catch-all for Alert feat (+5), Swashbuckler (+Cha), etc.
 * @param hasJackOfAllTrades Bard-specific bonus.
 * @param proficiencyBonus Only needed if Jack of All Trades is true.
 * @returns Character total initiative bonus.
 */
export const calculateInitiative = (
  dexModifier: number,
  flatBonuses: number = 0,
  hasJackOfAllTrades: boolean = false,
  proficiencyBonus: number = 0,
): number => {
  let total = dexModifier + flatBonuses;

  // Bards add half their proficiency bonus (rounded down) to ability checks they aren't proficient in.
  if (hasJackOfAllTrades) {
    total += Math.floor(proficiencyBonus / 2);
  }

  return total;
};
