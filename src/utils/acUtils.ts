import type { ItemData } from "../types/item";

export type EquippedArmorItem = ItemData & {
  type: "armor";
  armorProperties: NonNullable<ItemData["armorProperties"]>;
};

export interface UnarmoredDefenseModifier {
  statName: "con" | "wis";
  modifier: number;
}

const resolveDexModeFromArmorType = (
  armorType: EquippedArmorItem["armorProperties"]["armorType"],
): { mode: "full" | "capped" | "none"; cap?: number } => {
  switch (armorType) {
    case "medium":
      return { mode: "capped", cap: 2 };
    case "heavy":
    case "shield":
      return { mode: "none" };
    default:
      return { mode: "full" };
  }
};

const resolveDexContribution = (
  dexModifier: number,
  equippedArmor: EquippedArmorItem,
): number => {
  const dexModifierConfig = equippedArmor.armorProperties.dexModifier;
  const dexMode = dexModifierConfig?.mode;

  if (dexMode === "none") {
    return 0;
  }

  if (dexMode === "capped") {
    const cap = dexModifierConfig.cap ?? 2;
    return Math.min(cap, dexModifier);
  }

  if (dexMode === "full") {
    return dexModifier;
  }

  // Backward-compatible fallback for legacy data without dexModifier config.
  const legacyDexMode = resolveDexModeFromArmorType(
    equippedArmor.armorProperties.armorType,
  );
  if (legacyDexMode.mode === "none") {
    return 0;
  }
  if (legacyDexMode.mode === "capped") {
    return Math.min(legacyDexMode.cap ?? 2, dexModifier);
  }

  return dexModifier;
};

/**
 * Calculates a character's total Armor Class (AC).
 * @param dexModifier Character's Dex mod.
 * @param equippedArmor Equipped armor item, null if unarmored.
 * @param equippedShield Equipped shield item, null if no shield is equipped.
 * @param unarmoredDefense Optional extra modifier used by unarmored defense status.
 * @param flatBonuses Any additional AC bonuses from effects, items, feats.
 * @returns The final calculated AC value.
 */
export const calculateArmorClass = (
  dexModifier: number,
  equippedArmor: EquippedArmorItem | null,
  equippedShield: EquippedArmorItem | null,
  unarmoredDefense?: number,
  flatBonuses: number = 0,
): number => {
  let baseAc = 10;
  let allowableDexMod = dexModifier;

  if (!equippedArmor) {
    // Unarmored
    baseAc = 10;

    // Monk & Barbarian get a second modifier added
    if (unarmoredDefense) {
      baseAc += unarmoredDefense;
    }
  } else {
    const acApplication =
      equippedArmor.armorProperties.acApplication ??
      (equippedArmor.armorProperties.armorType === "shield" ? "bonus" : "set");

    if (acApplication === "set") {
      baseAc = equippedArmor.armorProperties.baseAc;
      allowableDexMod = resolveDexContribution(dexModifier, equippedArmor);
    }
  }

  let totalAc = baseAc + allowableDexMod;

  if (equippedShield?.armorProperties) {
    const shieldAcApplication =
      equippedShield.armorProperties.acApplication ??
      (equippedShield.armorProperties.armorType === "shield" ? "bonus" : "set");

    if (shieldAcApplication === "bonus") {
      totalAc += equippedShield.armorProperties.baseAc;
    }
  }

  // Flat bonuses
  totalAc += flatBonuses;

  return totalAc;
};
