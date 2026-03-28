import {
  getClassById,
  getItemById,
  getRaceById,
  getSubraceById,
} from "../data/staticDataApi";
import { useCharacterStore } from "../store/useCharacterStore";
import type { Ability } from "../types/common";
import {
  calculateModifier,
  calculateTotalAbilityScore,
  calculateTotalASI,
} from "../utils/abilityUtils";
import { calculateArmorClass } from "../utils/acUtils";
import { calculateMaxHP } from "../utils/hpUtils";
import { calculateInitiative } from "../utils/initiativeUtils";
import { evaluateAllPredicates } from "../utils/predicateEngine";
import { calculateProficiencyBonus } from "../utils/progressionUtils";
import { getAllCharacterTraits } from "../utils/traitUtils";

export const useCharacterStats = () => {
  // Pull raw data from zustand
  const {
    level,
    raceId,
    subraceId,
    classId,
    subclassId,
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
  // TODO: get data from subclass

  // Aggregate all ASI choices from level 1 to current level
  const totalAsiBonuses = calculateTotalASI(level, choicesByLevel);

  // Calculate core attributes
  const totalStr = calculateTotalAbilityScore(
    "str",
    baseAbilityScores.str,
    raceData,
    subraceData,
    chosenRacialBonuses,
    totalAsiBonuses.str,
  );
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
  const totalInt = calculateTotalAbilityScore(
    "int",
    baseAbilityScores.int,
    raceData,
    subraceData,
    chosenRacialBonuses,
    totalAsiBonuses.int,
  );
  const totalWis = calculateTotalAbilityScore(
    "wis",
    baseAbilityScores.wis,
    raceData,
    subraceData,
    chosenRacialBonuses,
    totalAsiBonuses.wis,
  );
  const totalCha = calculateTotalAbilityScore(
    "cha",
    baseAbilityScores.cha,
    raceData,
    subraceData,
    chosenRacialBonuses,
    totalAsiBonuses.cha,
  );

  // Calculate total weight
  // Map over the inventory, look up the static weight of each item, multiply by quantity
  const totalWeight = inventory.reduce((total, record) => {
    const itemData = getItemById(record.itemId);
    return total + (itemData?.weight || 0) * record.quantity;
  }, 0);

  const strMod = calculateModifier(totalStr);
  const dexMod = calculateModifier(totalDex);
  const conMod = calculateModifier(totalCon);
  const intMod = calculateModifier(totalInt);
  const wisMod = calculateModifier(totalWis);
  const chaMod = calculateModifier(totalCha);

  const modifiers: Record<Ability, number> = {
    str: strMod,
    dex: dexMod,
    con: conMod,
    int: intMod,
    wis: wisMod,
    cha: chaMod,
  }; // TODO: iterate through this to generate it

  const totalScores: Record<Ability, number> = {
    str: totalStr,
    dex: totalDex,
    con: totalCon,
    int: totalInt,
    wis: totalWis,
    cha: totalCha,
  };

  const carryingCapacity = totalStr * 15;
  const isEncumbered = totalWeight > carryingCapacity;

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

  // region Armor Penalty Check
  const armorProficiencies = [...(classData?.proficiencies?.armor || [])];

  let isArmorPenalized = false;

  if (equippedArmorId) {
    if (
      equippedArmor?.armor_properties &&
      !armorProficiencies.includes(equippedArmor.armor_properties.armorType)
    ) {
      isArmorPenalized = true;
    }
  }

  if (isWearingShield) {
    if (!armorProficiencies.includes("category_armor_shield")) {
      isArmorPenalized = true;
    }
  }

  const allTraits = getAllCharacterTraits(
    level,
    raceId,
    subraceId,
    classId,
    subclassId,
  );

  const monkUnarmoredTrait = allTraits.find(
    (t) => t.id === "trait_unarmored_defense",
  );

  let armorClass = calculateArmorClass(
    dexMod,
    equippedArmor,
    isWearingShield,
  );

  let unarmoredDefense = 0;
  if (monkUnarmoredTrait) {
    // Grab the effects array
    const acEffect = monkUnarmoredTrait.effects?.find(
      (e) => e.type === "ac_calculation",
    );

    const isValid = evaluateAllPredicates(
      acEffect?.predicates,
      useCharacterStore.getState(),
      {
        totalScores,
        modifiers,
        proficiencyBonus,
        maxHp,
        currentHp,
        initiative,
        armorClass,
        isArmorPenalized,
        totalWeight,
        isEncumbered,
      },
    );

    if (isValid) {
      unarmoredDefense = modifiers.dex + modifiers.wis;
    }
  }

  armorClass = calculateArmorClass(
    dexMod,
    equippedArmor,
    isWearingShield,
    unarmoredDefense,
  );

  // Return clean data
  return {
    totalScores,
    modifiers,
    proficiencyBonus,
    maxHp,
    currentHp,
    initiative,
    armorClass,
    isArmorPenalized,
    totalWeight,
    isEncumbered,
  };
};
