import {
  getAllSpells,
  getClassById,
  getSpellByID,
  getSubclassById,
} from "../data/staticDataApi";
import { useCharacterStore } from "../store/useCharacterStore";
import type { CharacterClassTrack } from "../store/useCharacterStore";
import type { Ability } from "../types/common";
import type { SpellcastingProgression } from "../types/class";
import {
  calculateMulticlassCasterLevel,
  getMostRecentProgressionProperty,
  getPactMagicSlotsForLevel,
  getSharedSpellSlotsForCasterLevel,
} from "../utils/progressionUtils";
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

interface ClassSpellcastingSummary {
  classId: string;
  classLevel: number;
  preparationType: "known" | "prepared" | "pact";
  spellcastingAbility: Ability;
  maxCantrips: number;
  maxSpellsKnown: number;
  maxPreparedSpells: number;
}

interface SpellSelectionDiagnostics {
  invalidKnownSpellIds: string[];
  invalidPreparedSpellIds: string[];
  knownSpellOverflow: number;
  preparedSpellOverflow: number;
}

const resolveClassTracks = (
  classTracks: CharacterClassTrack[],
  classId: string | null,
  subclassId: string | null,
  level: number,
): CharacterClassTrack[] => {
  if (classTracks.length > 0) return classTracks;
  if (!classId) return [];

  return [
    {
      classId,
      subclassId,
      level,
    },
  ];
};

const resolvePreparedSpellLimit = (classLevel: number, spellcastingMod: number) =>
  Math.max(1, classLevel + spellcastingMod);

const dedupe = <T>(values: T[]): T[] => Array.from(new Set(values));

export const useSpellcasting = () => {
  const {
    level,
    raceId,
    subraceId,
    classId,
    subclassId,
    classTracks,
    choicesByLevel,
    acquiredFeats,
    expendedSpellSlots,
    expendedPactSlots,
    spellsPrepared,
    spellsKnown,
  } = useCharacterStore();
  const { modifiers, proficiencyBonus, isArmorPenalized } = useCharacterStats();

  const activeTracks = resolveClassTracks(classTracks, classId, subclassId, level);

  const spellcastingTracks = activeTracks
    .map((track) => {
      const classData = getClassById(track.classId);
      if (!classData) return null;

      const subclassData = track.subclassId ? getSubclassById(track.subclassId) : null;
      const activeSpellcastingBase =
        subclassData?.spellcastingOverride || classData.spellcastingBase;

      if (!activeSpellcastingBase) return null;

      const progression = subclassData?.spellcastingOverride
        ? getMostRecentProgressionProperty(
            subclassData.progression,
            track.level,
            (entry) => entry.spellcastingProgressionAdditions,
          )
        : getMostRecentProgressionProperty(
            classData.progression,
            track.level,
            (entry) => entry.spellcastingProgression,
          );

      if (!progression) return null;

      return {
        classId: track.classId,
        classLevel: track.level,
        spellcastingBase: activeSpellcastingBase,
        progression,
      };
    })
    .filter(
      (
        profile,
      ): profile is {
        classId: string;
        classLevel: number;
        spellcastingBase: { ability: Ability; preparationType: "known" | "prepared" | "pact"; ritualCasting: boolean };
        progression: Exclude<SpellcastingProgression, null>;
      } => profile !== null,
    );

  const nonPactTracks = spellcastingTracks.filter(
    (track) => track.spellcastingBase.preparationType !== "pact",
  );
  const pactTracks = spellcastingTracks.filter(
    (track) => track.spellcastingBase.preparationType === "pact",
  );

  const effectiveCasterLevel = calculateMulticlassCasterLevel(nonPactTracks);
  const combinedSlots = getSharedSpellSlotsForCasterLevel(effectiveCasterLevel);

  const primaryCastingTrack = spellcastingTracks[0] || null;
  const preparationType = primaryCastingTrack?.spellcastingBase.preparationType;
  const spellcastingAbility = primaryCastingTrack?.spellcastingBase.ability;

  // --- Slot generation ---
  const slotStatusByLevel: Record<number, { total: number; expended: number }> =
    {};
  let pactMagicInfo: {
    level: number;
    total: number;
    expended: number;
  } | null = null;

  Object.entries(combinedSlots).forEach(([lvlStr, totalSlots]) => {
    const lvl = Number(lvlStr);
    slotStatusByLevel[lvl] = {
      total: totalSlots,
      expended: expendedSpellSlots[lvl] || 0,
    };
  });

  const highestPactLevel = pactTracks.reduce(
    (maxLevel, track) => Math.max(maxLevel, track.classLevel),
    0,
  );
  const pactSlots = getPactMagicSlotsForLevel(highestPactLevel);
  if (pactSlots) {
    pactMagicInfo = {
      level: pactSlots.level,
      total: pactSlots.total,
      expended: expendedPactSlots || 0,
    };
  }

  const classSpellcastingSummaries: ClassSpellcastingSummary[] = spellcastingTracks.map(
    (track) => {
      const abilityMod = modifiers[track.spellcastingBase.ability] || 0;

      return {
        classId: track.classId,
        classLevel: track.classLevel,
        preparationType: track.spellcastingBase.preparationType,
        spellcastingAbility: track.spellcastingBase.ability,
        maxCantrips: track.progression.cantripsKnown || 0,
        maxSpellsKnown: track.progression.spellsKnown || 0,
        maxPreparedSpells:
          track.spellcastingBase.preparationType === "prepared"
            ? resolvePreparedSpellLimit(track.classLevel, abilityMod)
            : 0,
      };
    },
  );

  const maxCantrips = classSpellcastingSummaries.reduce(
    (total, summary) => total + summary.maxCantrips,
    0,
  );
  const maxSpellsKnown = classSpellcastingSummaries.reduce(
    (total, summary) => total + summary.maxSpellsKnown,
    0,
  );

  const allSpells = getAllSpells();
  const knownEligibleClassIds = classSpellcastingSummaries
    .filter((summary) => summary.preparationType === "known")
    .map((summary) => summary.classId);
  const preparedEligibleClassIds = classSpellcastingSummaries
    .filter((summary) => summary.preparationType === "prepared")
    .map((summary) => summary.classId);

  const invalidKnownSpellIds = dedupe(
    spellsKnown.filter((spellId) => {
      const spell = allSpells.find((entry) => entry.id === spellId);
      if (!spell) return true;

      return !spell.classes.some((spellClass) =>
        knownEligibleClassIds.includes(spellClass),
      );
    }),
  );
  const invalidPreparedSpellIds = dedupe(
    spellsPrepared.filter((spellId) => {
      const spell = allSpells.find((entry) => entry.id === spellId);
      if (!spell) return true;

      return !spell.classes.some((spellClass) =>
        preparedEligibleClassIds.includes(spellClass),
      );
    }),
  );

  const validKnownSpellCount =
    dedupe(spellsKnown).length - invalidKnownSpellIds.length;
  const validPreparedSpellCount =
    dedupe(spellsPrepared).length - invalidPreparedSpellIds.length;
  const maxPreparedSpells = classSpellcastingSummaries.reduce(
    (total, summary) => total + summary.maxPreparedSpells,
    0,
  );

  const spellSelectionDiagnostics: SpellSelectionDiagnostics = {
    invalidKnownSpellIds,
    invalidPreparedSpellIds,
    knownSpellOverflow: Math.max(0, validKnownSpellCount - maxSpellsKnown),
    preparedSpellOverflow: Math.max(0, validPreparedSpellCount - maxPreparedSpells),
  };

  // --- Innate spellcasting (Traits)
  const allTraits = getAllCharacterTraits(
    level,
    raceId,
    subraceId,
    classId,
    subclassId,
    false,
    choicesByLevel,
    acquiredFeats,
    classTracks,
  );
  const innateSpells: InnateSpellcastingEntry[] = [];

  allTraits.forEach((trait) => {
    if (!trait.effects) return;

    trait.effects.forEach((effect) => {
      // Check if it's a spell grant and the character is high enough level
      if (
        effect.type === "spell_grant" &&
        effect.target &&
        (effect.levelAvailable || 1) <= level
      ) {
        const spellId = effect.target;
        const spell = getSpellByID(spellId);
        // Innate spells often have their own specific casting ability
        // If not specified, default to the class casting ability, 0 if neither
        const ability = effect.spellcastingAbility || spellcastingAbility;
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
  const isSpellcaster = spellcastingTracks.length > 0 || innateSpells.length > 0;

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
    maxPreparedSpells,
    spellsPrepared,
    spellsKnown,
    classSpellcastingSummaries,
    spellSelectionDiagnostics,
    innateSpells,

    canCastSpells: !isArmorPenalized,
  };
};
