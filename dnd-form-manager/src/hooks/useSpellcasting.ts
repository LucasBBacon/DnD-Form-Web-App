import {
  getClassById,
  getRaceById,
  getSubclassById,
  getSubraceById,
} from "../data/staticDataApi";
import { useCharacterStore } from "../store/useCharacterStore";
import {
  calculateModifier,
  calculateTotalAbilityScore,
  calculateTotalASI,
} from "../utils/abilityUtils";
import { calculateProficiencyBonus } from "../utils/progressionUtils";
import { useCharacterStats } from "./useCharacterStats";

export const useSpellcasting = () => {
  const {
    level,
    raceId,
    subraceId,
    classId,
    subclassId,
    baseAbilityScores,
    chosenRacialBonuses,
    choicesByLevel,
    expendedSpellSlots,
    expendedPactSlots,
    spellsPrepared,
    spellsKnown,
  } = useCharacterStore();
  const { isArmorPenalized } = useCharacterStats();

  const raceData = raceId ? getRaceById(raceId) : null;
  const subraceData = subraceId ? getSubraceById(subraceId) : null;
  const classData = classId ? getClassById(classId) : null;
  const subclassData = subclassId ? getSubclassById(subclassId) : null; // TODO: Add subclass spells!

  const preparationType = classData?.spellcasting_base?.preparation_type;
  const isPactMagic = preparationType === "pact";

  // Find the total slots the character *should* have at this level
  const currentProgression = classData?.progression.find(
    (p) => p.level === level,
  );
  const spellProg = currentProgression?.spellcasting_progression;
  const totalSlots = spellProg?.spell_slots || {};

  // Generate a clean array for the UI to render slot checkboxes
  // e.g., Level 1: [true, true, false, false] (2 used, 2 available out of 4)
  const slotStatusByLevel: Record<number, { total: number; expended: number }> =
    {};
  let pactMagicInfo: {
    level: number;
    total: number;
    expended: number;
  } | null = null;

  if (spellProg) {
    if (isPactMagic) {
      // Warlock spells only have one tier of slots
      const slotLevels = Object.keys(spellProg.spell_slots || {});
      if (slotLevels.length > 0) {
        // Grab the single key (slot level) and its value (total slots)
        const pLevel = Math.max(...slotLevels.map(Number));
        const pTotal = spellProg.spell_slots
          ? spellProg.spell_slots[pLevel]
          : 0;

        pactMagicInfo = {
          level: pLevel,
          total: pTotal,
          expended: expendedPactSlots || 0,
        };
      }
    } else {
      for (let spellLevel = 1; spellLevel <= 9; spellLevel++) {
        const maxSlotsForThisLevel = totalSlots[spellLevel] || 0;

        if (maxSlotsForThisLevel > 0) {
          const usedSlots = expendedSpellSlots[spellLevel] || 0;
          slotStatusByLevel[spellLevel] = {
            total: maxSlotsForThisLevel,
            expended: usedSlots,
          };
        }
      }
    }
  }

  // Calculate spell math
  let spellSaveDC = 0;
  let spellAttackBonus = 0;
  const spellcastingAbility = classData?.spellcasting_base?.ability;

  if (spellcastingAbility) {
    const totalAsiBonuses = calculateTotalASI(level, choicesByLevel);
    const totalAbilityScore = calculateTotalAbilityScore(
      spellcastingAbility,
      baseAbilityScores[spellcastingAbility],
      raceData,
      subraceData,
      chosenRacialBonuses,
      totalAsiBonuses[spellcastingAbility],
    );

    const abilityMod = calculateModifier(totalAbilityScore);
    const profBonus = calculateProficiencyBonus(level);

    spellSaveDC = 8 + profBonus + abilityMod;
    spellAttackBonus = profBonus + abilityMod;
  }

  // Return the data needed to build the spellbook UI
  return {
    isSpellcaster: !!classData?.spellcasting_base,
    preparationType: classData?.spellcasting_base?.preparation_type,
    spellcastingAbility: classData?.spellcasting_base?.ability,
    spellSaveDC,
    spellAttackBonus,
    slotStatusByLevel,
    pactMagicInfo,
    spellsPrepared,
    spellsKnown,
    canCastSpells: !isArmorPenalized,
  };
};
