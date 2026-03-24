import type { ItemData } from "../types/item";

export type EquippedArmorItem = ItemData & {
  type: "armor";
  armor_properties: NonNullable<ItemData["armor_properties"]>;
};

export interface UnarmoredDefenseModifier {
  statName: "con" | "wis";
  modifier: number;
}

/**
 * Calculates a character's total Armor Class (AC).
 * @param dexModifier Character's Dex mod.
 * @param equippedArmor Equipped armor item, null if unarmored.
 * @param isWearingShield Whether a shield is equipped.
 * @param unarmoredDefense Optional extra modifier used by unarmored defense status.
 * @param flatBonuses Any additional AC bonuses from effects, items, feats.
 * @returns The final calculated AC value.
 */
export const calculateArmorClass = (
  dexModifier: number,
  equippedArmor: EquippedArmorItem | null,
  isWearingShield: boolean,
  unarmoredDefense?: UnarmoredDefenseModifier,
  flatBonuses: number = 0,
): number => {
  let baseAc = 10;
  let allowableDexMod = dexModifier;

  if (!equippedArmor) {
    // Unarmored
    baseAc = 10;

    // Monk & Barbarian get a second modifier added
    if (unarmoredDefense) {
      baseAc += unarmoredDefense.modifier;
    }
  } else {
    // Wearing armor
    baseAc = equippedArmor.armor_properties.baseAc;

    switch (equippedArmor.armor_properties.armorType) {
      case "light":
        // Full Dex mod
        break;
      case "medium":
        // Medium armor caps the dex bonus at +2 (ignore negative dex caps as per 5e rules, negative dex still applies fully)
        allowableDexMod = Math.min(2, dexModifier);
        break;
      case "heavy":
        // Heavy armor ignores Dex mod completely
        allowableDexMod = 0;
        break;
      default:
        break;
    }
  }

  let totalAc = baseAc + allowableDexMod;

  // Shields
  if (isWearingShield) {
    totalAc += 2;
  }

  // Flat bonuses
  totalAc += flatBonuses;

  return totalAc;
};
