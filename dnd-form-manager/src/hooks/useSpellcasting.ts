import { getClassById, getSubclassById } from "../data/staticDataApi";
import { useCharacterStore } from "../store/useCharacterStore";
import type { Ability } from "../types/common";
import { useCharacterStats } from "./useCharacterStats";

export const useSpellcasting = () => {
  const {
    level,
    classId,
    subclassId,
    expendedSpellSlots,
    expendedPactSlots,
    spellsPrepared,
    spellsKnown,
  } = useCharacterStore();
  const { modifiers, proficiencyBonus, isArmorPenalized } = useCharacterStats();

  const classData = classId ? getClassById(classId) : null;
  const subclassData = subclassId ? getSubclassById(subclassId) : null;

  // --- Identify caster type ---
  // Subclass takes priority if it grants spellcasting
  const activeSpellcastingBase =
    subclassData?.spellcasting_override || classData?.spellcasting_base;
  const isSpellcaster = !!activeSpellcastingBase;
  const preparationType = activeSpellcastingBase?.preparation_type;
  const spellcastingAbility =
    (activeSpellcastingBase?.ability as Ability) || undefined;
  const isPactMagic = preparationType === "pact";

  // --- Find progression for current level ---
  // Look backwards from current level to find most recent spell slot update
  const getActiveSpellProgression = () => {
    if (subclassData?.spellcasting_override) {
      for (let i = level; i >= 1; i--) {
        const prog = subclassData.progression.find((p) => p.level === i);
        if (prog?.spellcasting_progression_additions) {
          return prog.spellcasting_progression_additions;
        }
      }
    }

    if (classData?.spellcasting_base) {
      for (let i = level; i >= 1; i--) {
        const prog = classData.progression.find((p) => p.level === i);
        if (prog?.spellcasting_progression) {
          return prog.spellcasting_progression;
        }
      }
    }

    return null;
  };

  const spellProg = getActiveSpellProgression();

  // --- Slot generation ---
  const slotStatusByLevel: Record<number, { total: number; expended: number }> =
    {};
  let pactMagicInfo: {
    level: number;
    total: number;
    expended: number;
  } | null = null;
  const maxCantrips = spellProg?.cantrips_known || 0;
  const maxSpellsKnown = spellProg?.spells_known || 0;

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
      // All other magic casting
      const slots = spellProg.spell_slots || {};
      Object.entries(slots).forEach(([lvlStr, totalSlots]) => {
        const lvl = Number(lvlStr);
        if (totalSlots > 0) {
          slotStatusByLevel[lvl] = {
            total: totalSlots,
            expended: expendedSpellSlots[lvl] || 0,
          };
        }
      });
    }
  }

  // --- Calculate spell math ---
  const statMod = spellcastingAbility ? modifiers[spellcastingAbility] || 0 : 0;
  const spellSaveDC = 8 + proficiencyBonus + statMod;
  const spellAttackBonus = proficiencyBonus + statMod;

  // Return the data needed to build the spellbook UI
  return {
    isSpellcaster,
    preparationType,
    spellcastingAbility,
    spellSaveDC,
    spellAttackBonus,

    slotStatusByLevel,
    pactMagicInfo,

    maxCantrips,
    maxSpellsKnown,
    spellsPrepared,
    spellsKnown,
    canCastSpells: !isArmorPenalized,
  };
};
