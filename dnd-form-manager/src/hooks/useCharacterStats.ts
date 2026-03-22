import { getClassById, getRaceById } from "../data/staticDataApi";
import { useCharacterStore } from "../store/useCharacterStore";
import {
  calculateModifier,
  calculateTotalAbilityScore,
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
    classId,
    baseAbilityScores,
    hpRolls,
    chosenRacialBonuses,
  } = useCharacterStore();

  // fetch static definitions
  const raceData = raceId ? getRaceById(raceId) : null;
  const classData = classId ? getClassById(classId) : null;

  // Calculate core attributes
  const totalDex = calculateTotalAbilityScore(
    "dex",
    baseAbilityScores.dex,
    raceData,
    chosenRacialBonuses,
  );
  const totalCon = calculateTotalAbilityScore(
    "con",
    baseAbilityScores.con,
    raceData,
    chosenRacialBonuses,
  );

  const dexMod = calculateModifier(totalDex);
  const conMod = calculateModifier(totalCon);

  // Calculate Derived Combat Stats
  const proficiencyBonus = calculateProficiencyBonus(level);

  const maxHp = calculateMaxHP(level, classData?.hit_die, conMod, hpRolls);

  const initiative = calculateInitiative(dexMod);

  // For now pass null for armor to default to unarmored AC (TODO: FIX THIS)
  const armorClass = calculateArmorClass(dexMod, null, false);

  // Return clean data
  return {
    modifiers: { dex: dexMod, con: conMod /* add others */ },
    proficiencyBonus,
    maxHp,
    initiative,
    armorClass,
  };
};
