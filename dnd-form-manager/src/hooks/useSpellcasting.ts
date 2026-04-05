import {
  getClassById,
  getSpellByID,
  getSubclassById,
} from "../data/staticDataApi";
import { useCharacterStore } from "../store/useCharacterStore";
import type { Ability } from "../types/common";
import { getMostRecentProgressionProperty } from "../utils/progressionUtils";
import { getAllCharacterTraits } from "../utils/traitUtils";
import { useCharacterStats } from "./useCharacterStats";

export interface InnateSpellcastingEntry {
  spellId: string;
  spellName: string;
  isResolvedSpell: boolean;
  sourceTraitName: string;
  spellSaveDC: number;
  spellAttackBonus: number;
  uses?: { count: number | string; reset: string };
}

export const useSpellcasting = () => {
  const {
    level,
    raceId,
    subraceId,
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
  const preparationType = activeSpellcastingBase?.preparation_type;
  const spellcastingAbility =
    (activeSpellcastingBase?.ability as Ability) || undefined;
  const isPactMagic = preparationType === "pact";

  const spellProg = subclassData?.spellcasting_override
    ? getMostRecentProgressionProperty(
        subclassData.progression,
        level,
        (entry) => entry.spellcasting_progression_additions,
      )
    : classData?.spellcasting_base
      ? getMostRecentProgressionProperty(
          classData.progression,
          level,
          (entry) => entry.spellcasting_progression,
        )
      : null;

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

  // --- Innate spellcasting (Traits)
  const allTraits = getAllCharacterTraits(
    level,
    raceId,
    subraceId,
    classId,
    subclassId,
  );
  const innateSpells: InnateSpellcastingEntry[] = [];

  allTraits.forEach((trait) => {
    if (!trait.effects) return;

    trait.effects.forEach((effect) => {
      // Check if it's a spell grant and the character is high enough level
      if (
        effect.type === "spell_grant" &&
        effect.target &&
        (effect.level_available || 1) <= level
      ) {
        const spellId = effect.target;
        const spell = getSpellByID(spellId);
        // Innate spells often have their own specific casting ability
        // If not specified, default to the class casting ability, 0 if neither
        const ability = effect.spellcasting_ability || spellcastingAbility;
        const statMod = ability ? modifiers[ability] || 0 : 0;

        innateSpells.push({
          spellId,
          spellName: spell?.name ?? `Unknown Spell (${spellId})`,
          isResolvedSpell: !!spell,
          sourceTraitName: trait.name,
          spellSaveDC: 8 + proficiencyBonus + statMod,
          spellAttackBonus: proficiencyBonus + statMod,
          uses: effect.uses,
        });
      }
    });
  });

  // A level 1 fighter with high elf cantrip is a spellcaster still
  const isSpellcaster = !!activeSpellcastingBase || innateSpells.length > 0;

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
    innateSpells,

    canCastSpells: !isArmorPenalized,
  };
};
