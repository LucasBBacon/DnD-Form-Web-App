import {
  getClassById,
  getItemById,
  getRaceById,
  getSubraceById,
} from "../data/staticDataApi";
import { useCharacterStore } from "../store/useCharacterStore";
import {
  calculateModifier,
  calculateTotalAbilityScore,
  calculateTotalASI,
} from "../utils/abilityUtils";
import { calculateArmorClass } from "../utils/acUtils";
import { calculateMaxHP } from "../utils/hpUtils";
import { calculateInitiative } from "../utils/initiativeUtils";
import { calculateProficiencyBonus } from "../utils/progressionUtils";

export const useCharacterStats = () => {
  // Pull raw data from zustand
  const {
    level,
    raceId,
    subraceId,
    classId,
    baseAbilityScores,
    hpRolls,
    chosenRacialBonuses,
    choicesByLevel,
    inventory,
    equippedArmorId,
    equippedShieldId,
    damageTaken,
  } = useCharacterStore();

  // fetch static definitions
  const raceData = raceId ? getRaceById(raceId) : null;
  const subraceData = subraceId ? getSubraceById(subraceId) : null;
  const classData = classId ? getClassById(classId) : null;

  // Aggregate all ASI choices from level 1 to current level
  const totalAsiBonuses = calculateTotalASI(level, choicesByLevel);

  // Calculate core attributes
  const totalDex = calculateTotalAbilityScore(
    "dex",
    baseAbilityScores.dex,
    raceData,
    subraceData,
    chosenRacialBonuses,
    totalAsiBonuses.dex,
  );
  const totalCon = calculateTotalAbilityScore(
    "con",
    baseAbilityScores.con,
    raceData,
    subraceData,
    chosenRacialBonuses,
    totalAsiBonuses.con,
  );

  // Calculate total weight
  // Map over the inventory, look up the static weight of each item, multiply by quantity
  const totalWeight = inventory.reduce((total, record) => {
    const itemData = getItemById(record.itemId);
    return total + (itemData?.weight || 0) * record.quantity;
  }, 0);

  const dexMod = calculateModifier(totalDex);
  const conMod = calculateModifier(totalCon);

  // Calculate Derived Combat Stats
  const proficiencyBonus = calculateProficiencyBonus(level);

  const maxHp = calculateMaxHP(level, classData?.hit_die, conMod, hpRolls);

  const currentHp = Math.max(0, maxHp - damageTaken);

  const initiative = calculateInitiative(dexMod);

  const equippedArmorData = equippedArmorId
    ? getItemById(equippedArmorId)
    : null;
  const equippedArmor: Parameters<typeof calculateArmorClass>[1] =
    equippedArmorData?.type === "armor" && equippedArmorData.armor_properties
      ? (equippedArmorData as Exclude<
          Parameters<typeof calculateArmorClass>[1],
          null
        >)
      : null;
  const isWearingShield = !!equippedShieldId;

  const armorClass = calculateArmorClass(
    dexMod,
    equippedArmor,
    isWearingShield,
  );

  // Return clean data
  return {
    modifiers: { dex: dexMod, con: conMod /* add others */ },
    proficiencyBonus,
    maxHp,
    currentHp,
    initiative,
    armorClass,
    totalWeight,
  };
};
