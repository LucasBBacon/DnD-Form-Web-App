import {
  getAllSpells,
  getClassById,
  getRaceById,
  getSpellByID,
  getSubclassById,
  getSubraceById,
  getTraitsByIds,
} from "../data/staticDataApi";
import { useCharacterStore } from "../store/useCharacterStore";
import type { CharacterClassTrack } from "../store/useCharacterStore";
import type { Ability } from "../types/common";
import type { SpellcastingProgression } from "../types/class";
import type { SpellSchool } from "../types/trait";
import {
  calculateMulticlassCasterLevel,
  getMostRecentProgressionProperty,
  getPactMagicSlotsForLevel,
  getSharedSpellSlotsForCasterLevel,
} from "../utils/progressionUtils";
import { getAllCharacterTraits } from "../utils/traitUtils";
import { useCharacterStats } from "./useCharacterStats";

// #region --- Types and Interfaces ---

export interface InnateSpellcastingEntry {
  spellId: string;
  spellName: string;
  isResolvedSpell: boolean;
  sourceTraitName: string;
  spellSaveDC: number;
  spellAttackBonus: number;
  uses?: { count: number | string; reset: string };
}

export interface ClassSpellcastingSummary {
  classId: string;
  classLevel: number;
  preparationType: "known" | "prepared" | "pact";
  spellcastingAbility: Ability;
  maxCantrips: number;
  maxSpellsKnown: number;
  maxPreparedSpells: number;
  schoolRestrictions: SpellSchool[] | null;
  expandedSpellIds: string[];
  spellListSource: string[] | null;
}

export interface SpellSelectionDiagnostics {
  invalidKnownSpellIds: string[];
  invalidPreparedSpellIds: string[];
  knownSpellOverflow: number;
  preparedSpellOverflow: number;
}

export interface UseSpellcastingReturn {
  isSpellcaster: boolean;
  canCastSpells: boolean;
  casting: {
    ability: Ability | null;
    preparationType: "known" | "prepared" | "pact" | null;
    saveDC: number;
    attackBonus: number;
  };
  pools: {
    known: {
      selected: string[];
      max: number;
    };
    prepared: {
      selected: string[];
      max: number;
    };
    cantrips: {
      max: number;
    };
    bonusPrepared: string[];
    innate: InnateSpellcastingEntry[];
  };
  slots: {
    shared: Record<number, { total: number; expended: number }>;
    pact: { level: number; total: number; expended: number } | null;
  };
  diagnostics: {
    selections: SpellSelectionDiagnostics;
    classBreakdown: ClassSpellcastingSummary[];
  };
}

// #endregion

// #region --- Helper Functions ---

/**
 * Resolves the character's class tracks, ensuring there is at least one track for the character's current class and subclass.
 * @param classTracks The existing class tracks for the character.
 * @param classId The ID of the character's current class.
 * @param subclassId The ID of the character's current subclass.
 * @param level The character's current level in the class.
 * @returns An array of resolved class tracks.
 */
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

/**
 * Resolves the maximum number of prepared spells for a given class level and spellcasting modifier.
 * @param classLevel The character's level in the class.
 * @param spellcastingMod The character's spellcasting ability modifier.
 * @returns The maximum number of prepared spells.
 */
const resolvePreparedSpellLimit = (
  classLevel: number,
  spellcastingMod: number,
) => Math.max(1, classLevel + spellcastingMod);

/**
 * Removes duplicate values from an array.
 * @param values The array of values to deduplicate.
 * @returns A new array with duplicate values removed.
 */
const dedupe = <T>(values: T[]): T[] => Array.from(new Set(values));

const getSpellcastingTraitsForTrack = (
  track: CharacterClassTrack,
): Array<{
  sourceType: "class";
  classId: string;
  classLevel: number;
  spellcastingBase: {
    ability: Ability;
    preparationType: "known" | "prepared" | "pact";
    ritualCasting: boolean;
  };
  progression: Exclude<SpellcastingProgression, null>;
  schoolRestrictions: SpellSchool[] | null;
  expandedSpellIds: string[];
  bonusPreparedSpellIds: string[];
  spellListSource: string[] | null;
}> => {
  const classData = getClassById(track.classId);
  if (!classData) return [];

  const subclassData = track.subclassId ? getSubclassById(track.subclassId) : null;
  const traitIds = new Set<string>();

  classData.progression
    .filter((entry) => entry.level <= track.level)
    .forEach((entry) => {
      entry.features.forEach((featureId) => {
        traitIds.add(featureId);
      });
    });

  subclassData?.progression
    .filter((entry) => entry.level <= track.level)
    .forEach((entry) => {
      entry.features.forEach((featureId) => {
        traitIds.add(featureId);
      });
    });

  const traitSpellcastingProfiles = (getTraitsByIds(Array.from(traitIds)) || [])
    .map((trait) => {
      if (!trait.spellcasting) return null;

      const progression = getMostRecentProgressionProperty(
        trait.spellcasting.progressionByLevel,
        track.level,
        (entry) => ({
          cantripsKnown: entry.cantripsKnown,
          spellsKnown: entry.spellsKnown,
          spellSlots: entry.spellSlots,
        }) as Exclude<SpellcastingProgression, null>,
      );

      if (!progression) return null;

      const allLevelEntries = trait.spellcasting.progressionByLevel.filter(
        (entry) => entry.level <= track.level,
      );
      const expandedSpellIds = dedupe(
        allLevelEntries.flatMap((e) => e.spellsAddedToList ?? []),
      );
      const bonusPreparedSpellIds = dedupe(
        allLevelEntries.flatMap((e) => e.bonusSpells ?? []),
      );

      return {
        sourceType: "class" as const,
        classId: track.classId,
        classLevel: track.level,
        spellcastingBase: {
          ability: trait.spellcasting.ability,
          preparationType: trait.spellcasting.preparationType,
          ritualCasting: trait.spellcasting.ritualCasting,
        },
        progression,
        schoolRestrictions: trait.spellcasting.schoolRestrictions ?? null,
        expandedSpellIds,
        bonusPreparedSpellIds,
        spellListSource: trait.spellcasting.spellListSource ?? null,
      };
    })
    .filter((profile): profile is NonNullable<typeof profile> => profile !== null);

  return traitSpellcastingProfiles;
};

const getSpellcastingTraitsForRaceTrack = (
  raceId: string | null,
  subraceId: string | null,
  level: number,
): Array<{
  sourceType: "race";
  classId: string;
  classLevel: number;
  spellcastingBase: {
    ability: Ability;
    preparationType: "known" | "prepared" | "pact";
    ritualCasting: boolean;
  };
  progression: Exclude<SpellcastingProgression, null>;
  schoolRestrictions: SpellSchool[] | null;
  expandedSpellIds: string[];
  bonusPreparedSpellIds: string[];
  spellListSource: string[] | null;
}> => {
  if (!raceId) return [];

  const raceData = getRaceById(raceId);
  if (!raceData) return [];

  const subraceData = subraceId ? getSubraceById(subraceId) : null;
  const traitIds = new Set<string>();

  raceData.traits?.forEach((id) => traitIds.add(id));
  subraceData?.traitsAdded?.forEach((id) => traitIds.add(id));

  return (getTraitsByIds(Array.from(traitIds)) || [])
    .map((trait) => {
      if (!trait.spellcasting) return null;

      const progression = getMostRecentProgressionProperty(
        trait.spellcasting.progressionByLevel,
        level,
        (entry) => ({
          cantripsKnown: entry.cantripsKnown,
          spellsKnown: entry.spellsKnown,
          spellSlots: entry.spellSlots,
        }) as Exclude<SpellcastingProgression, null>,
      );

      if (!progression) return null;

      const allLevelEntries = trait.spellcasting.progressionByLevel.filter(
        (entry) => entry.level <= level,
      );
      const expandedSpellIds = dedupe(
        allLevelEntries.flatMap((e) => e.spellsAddedToList ?? []),
      );
      const bonusPreparedSpellIds = dedupe(
        allLevelEntries.flatMap((e) => e.bonusSpells ?? []),
      );

      return {
        sourceType: "race" as const,
        classId: raceId,
        classLevel: level,
        spellcastingBase: {
          ability: trait.spellcasting.ability,
          preparationType: trait.spellcasting.preparationType,
          ritualCasting: trait.spellcasting.ritualCasting,
        },
        progression,
        schoolRestrictions: trait.spellcasting.schoolRestrictions ?? null,
        expandedSpellIds,
        bonusPreparedSpellIds,
        spellListSource: trait.spellcasting.spellListSource ?? null,
      };
    })
    .filter((profile): profile is NonNullable<typeof profile> => profile !== null);
};

/**
 * Custom hook to calculate the character's spellcasting-related values based on their class, subclass, level, and other relevant state.
 * Handles multiclass spellcasting, innate spells from traits, and provides diagnostics for invalid spell selections.
 * @returns An object containing the character's spellcasting information, including spell slots,
 * known and prepared spells, and innate spellcasting entries.
 */
export const useSpellcasting = (): UseSpellcastingReturn => {
  // #region --- Get Character State and Derived Stats ---

  const state = useCharacterStore();
  const { abilities, combat } = useCharacterStats();
  const modifiers = abilities.modifiers;
  const proficiencyBonus = combat.proficiencyBonus;
  const isArmorPenalized = combat.isArmorPenalized;

  // #endregion

  // #region --- Resolve Spellcasting Tracks ---

  const activeTracks = resolveClassTracks(
    state.classTracks,
    state.classId,
    state.subclassId,
    state.level,
  );

  const classSpellcastingTracks = activeTracks.flatMap((track) =>
    getSpellcastingTraitsForTrack(track),
  );

  const raceSpellcastingTracks = getSpellcastingTraitsForRaceTrack(
    state.raceId,
    state.subraceId,
    state.level,
  );

  const spellcastingTracks = [...classSpellcastingTracks, ...raceSpellcastingTracks];

  const nonPactTracks = spellcastingTracks.filter(
    (track) => track.spellcastingBase.preparationType !== "pact",
  );
  const pactTracks = spellcastingTracks.filter(
    (track) => track.spellcastingBase.preparationType === "pact",
  );

  // #endregion

  // #region --- Derived Caster Properties ---

  const effectiveCasterLevel = calculateMulticlassCasterLevel(nonPactTracks);
  const primaryCastingTrack = spellcastingTracks[0] || null;
  const preparationType = primaryCastingTrack?.spellcastingBase.preparationType;
  const spellcastingAbility = primaryCastingTrack?.spellcastingBase.ability;
  const highestPactLevel = pactTracks.reduce(
    (maxLevel, track) => Math.max(maxLevel, track.classLevel),
    0,
  );

  // #endregion

  // #region --- Spell Slot Calculation ---

  const combinedSlots = getSharedSpellSlotsForCasterLevel(effectiveCasterLevel);
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
      expended: state.expendedSpellSlots[lvl] || 0,
    };
  });

  const pactSlots = getPactMagicSlotsForLevel(highestPactLevel);
  if (pactSlots) {
    pactMagicInfo = {
      level: pactSlots.level,
      total: pactSlots.total,
      expended: state.expendedPactSlots || 0,
    };
  }

  // #endregion

  // #region --- Class Summaries and Spell Counts ---

  // Generate a summary of each class's contribution to the character's spellcasting, 
  // used for diagnostics and UI display
  const classSpellcastingSummaries: ClassSpellcastingSummary[] =
    spellcastingTracks.map((track) => {
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
        schoolRestrictions: track.schoolRestrictions,
        expandedSpellIds: track.expandedSpellIds,
        spellListSource: track.spellListSource,
      };
    });

  const maxCantrips = classSpellcastingSummaries.reduce(
    (total, summary) => total + summary.maxCantrips,
    0,
  );
  const maxSpellsKnown = classSpellcastingSummaries.reduce(
    (total, summary) => total + summary.maxSpellsKnown,
    0,
  );

  const allBonusPreparedSpellIds = dedupe(
    spellcastingTracks.flatMap((track) => track.bonusPreparedSpellIds),
  );

  // #endregion

  // #region --- Spell Selection Diagnostics ---

  const allSpells = getAllSpells();

  const isSpellValidForTrack = (
    spell: { id: string; classes: string[]; school: string },
    summary: ClassSpellcastingSummary,
  ): boolean => {
    const effectiveClassIds = summary.spellListSource ?? [summary.classId];
    const classMatch = effectiveClassIds.some((c) => spell.classes.includes(c));
    const expandedMatch = summary.expandedSpellIds.includes(spell.id);
    const schoolMatch =
      !summary.schoolRestrictions ||
      summary.schoolRestrictions.includes(spell.school as SpellSchool);
    return (classMatch || expandedMatch) && schoolMatch;
  };

  const knownSummaries = classSpellcastingSummaries.filter(
    (s) => s.preparationType === "known",
  );
  const preparedSummaries = classSpellcastingSummaries.filter(
    (s) => s.preparationType === "prepared",
  );

  const invalidKnownSpellIds = dedupe(
    state.spellsKnown.filter((spellId) => {
      const spell = allSpells.find((entry) => entry.id === spellId);
      if (!spell) return true;
      return !knownSummaries.some((summary) => isSpellValidForTrack(spell, summary));
    }),
  );
  const invalidPreparedSpellIds = dedupe(
    state.spellsPrepared.filter((spellId) => {
      if (allBonusPreparedSpellIds.includes(spellId)) return false;
      const spell = allSpells.find((entry) => entry.id === spellId);
      if (!spell) return true;
      return !preparedSummaries.some((summary) => isSpellValidForTrack(spell, summary));
    }),
  );

  const validKnownSpellCount =
    dedupe(state.spellsKnown).length - invalidKnownSpellIds.length;
  const bonusPreparedCount = allBonusPreparedSpellIds.filter((id) =>
    state.spellsPrepared.includes(id),
  ).length;
  const validPreparedSpellCount =
    dedupe(state.spellsPrepared).length -
    invalidPreparedSpellIds.length -
    bonusPreparedCount;
  const maxPreparedSpells = classSpellcastingSummaries.reduce(
    (total, summary) => total + summary.maxPreparedSpells,
    0,
  );

  const spellSelectionDiagnostics: SpellSelectionDiagnostics = {
    invalidKnownSpellIds,
    invalidPreparedSpellIds,
    knownSpellOverflow: Math.max(0, validKnownSpellCount - maxSpellsKnown),
    preparedSpellOverflow: Math.max(
      0,
      validPreparedSpellCount - maxPreparedSpells,
    ),
  };

  // #endregion

  // #region --- Innate Spellcasting ---

  const allTraits = getAllCharacterTraits(
    state.level,
    state.raceId,
    state.subraceId,
    state.classId,
    state.subclassId,
    false,
    state.choicesByLevel,
    state.acquiredFeats,
    state.classTracks,
  );
  const innateSpells: InnateSpellcastingEntry[] = [];

  allTraits.forEach((trait) => {
    if (!trait.effects) return;

    trait.effects.forEach((effect) => {
      // Check if it's a spell grant and the character is high enough level
      if (
        effect.type === "spell_grant" &&
        effect.target &&
        (effect.levelAvailable || 1) <= state.level
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

  // #endregion

  // #region --- Build Return Object ---

  // A level 1 fighter with high elf cantrip is a spellcaster still
  const isSpellcaster =
    spellcastingTracks.length > 0 || innateSpells.length > 0;

  const statMod = spellcastingAbility ? modifiers[spellcastingAbility] || 0 : 0;
  const spellSaveDC = 8 + proficiencyBonus + statMod;
  const spellAttackBonus = proficiencyBonus + statMod;

  const casting = {
    ability: spellcastingAbility ?? null,
    preparationType: preparationType ?? null,
    saveDC: spellSaveDC,
    attackBonus: spellAttackBonus,
  };

  const pools = {
    known: {
      selected: state.spellsKnown,
      max: maxSpellsKnown,
    },
    prepared: {
      selected: state.spellsPrepared,
      max: maxPreparedSpells,
    },
    cantrips: {
      max: maxCantrips,
    },
    bonusPrepared: allBonusPreparedSpellIds,
    innate: innateSpells,
  };

  const slots = {
    shared: slotStatusByLevel,
    pact: pactMagicInfo,
  };

  const diagnostics = {
    selections: spellSelectionDiagnostics,
    classBreakdown: classSpellcastingSummaries,
  };

  return {
    isSpellcaster,
    canCastSpells: !isArmorPenalized,
    casting,
    pools,
    slots,
    diagnostics,
  };

  // #endregion
};
