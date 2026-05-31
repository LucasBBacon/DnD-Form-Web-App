import {
  getAllSpells,
  getClassById,
  getResolvedSpellDamageEntriesAtCastLevel,
  getResolvedSpellHealingEntriesAtCastLevel,
  getRaceById,
  getSpellByID,
  getSpellCastLevelOptions,
  getSubclassById,
  getSubraceById,
  getTraitsByIds,
} from "../data/staticDataApi";
import { useCharacterStore } from "../store/useCharacterStore";
import type { CharacterClassTrack } from "../store/useCharacterStore";
import type { Ability } from "../types/common";
import type { SpellcastingProgression } from "../types/class";
import type { SpellDamageEntry } from "../types/spell";
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
  maxSpellLevel: number;
  maxCantrips: number;
  maxSpellsKnown: number;
  maxPreparedSpells: number;
  schoolRestrictions: SpellSchool[] | null;
  expandedSpellIds: string[];
  spellListSource: string[] | null;
  freeSchoolSpellSlots: number;
}

export interface SpellSelectionDiagnostics {
  invalidKnownSpellIds: string[];
  invalidPreparedSpellIds: string[];
  knownSpellOverflow: number;
  preparedSpellOverflow: number;
  freeSchoolOverflow: number;
}

import type { SpellHealingEntry } from "../types/spell";

export interface SpellCastMetadata {
  spellId: string;
  baseSpellLevel: number;
  availableCastLevels: number[];
  selectedCastLevel: number;
  canCast: boolean;
  canUseSharedSlot: boolean;
  canUsePactSlot: boolean;
  unavailableReason?: string;
  resolvedDamageEntries: SpellDamageEntry[];
  resolvedHealingEntries: SpellHealingEntry[];
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
    allExpandedSpellIds: string[];
    freeSchoolDesignated: string[];
    freeSchoolSlots: number;
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
  spellMetadata?: {
    byId: Record<string, SpellCastMetadata>;
    activeSpellIds: string[];
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
  isBonusOnly: boolean;
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
  freeSchoolSpellSlots: number;
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

      const allLevelEntries = trait.spellcasting.progressionByLevel.filter(
        (entry) => entry.level <= track.level,
      );
      const expandedSpellIds = dedupe(
        allLevelEntries.flatMap((e) => e.spellsAddedToList ?? []),
      );
      const bonusPreparedSpellIds = dedupe(
        allLevelEntries.flatMap((e) => e.bonusSpells ?? []),
      );

      const progression = getMostRecentProgressionProperty(
        trait.spellcasting.progressionByLevel,
        track.level,
        (entry) => {
          if (
            entry.cantripsKnown === undefined &&
            entry.spellsKnown === undefined &&
            entry.spellSlots === undefined
          ) {
            return null;
          }
          return {
            cantripsKnown: entry.cantripsKnown,
            spellsKnown: entry.spellsKnown,
            spellSlots: entry.spellSlots,
          } as Exclude<SpellcastingProgression, null>;
        },
      );

      if (!progression) {
        if (bonusPreparedSpellIds.length === 0 && expandedSpellIds.length === 0) {
          return null;
        }
        return {
          sourceType: "class" as const,
          classId: track.classId,
          classLevel: track.level,
          isBonusOnly: true,
          spellcastingBase: {
            ability: trait.spellcasting.ability,
            preparationType: trait.spellcasting.preparationType,
            ritualCasting: trait.spellcasting.ritualCasting,
          },
          progression: {} as Exclude<SpellcastingProgression, null>,
          schoolRestrictions: null,
          expandedSpellIds,
          bonusPreparedSpellIds,
          spellListSource: null,
          freeSchoolSpellSlots: 0,
        };
      }

      return {
        sourceType: "class" as const,
        classId: track.classId,
        classLevel: track.level,
        isBonusOnly: false,
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
        freeSchoolSpellSlots:
          getMostRecentProgressionProperty(
            trait.spellcasting.progressionByLevel,
            track.level,
            (entry) => entry.freeSchoolSpellSlots ?? null,
          ) ?? 0,
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
  isBonusOnly: boolean;
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
  freeSchoolSpellSlots: number;
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

      const allLevelEntries = trait.spellcasting.progressionByLevel.filter(
        (entry) => entry.level <= level,
      );
      const expandedSpellIds = dedupe(
        allLevelEntries.flatMap((e) => e.spellsAddedToList ?? []),
      );
      const bonusPreparedSpellIds = dedupe(
        allLevelEntries.flatMap((e) => e.bonusSpells ?? []),
      );

      const progression = getMostRecentProgressionProperty(
        trait.spellcasting.progressionByLevel,
        level,
        (entry) => {
          if (
            entry.cantripsKnown === undefined &&
            entry.spellsKnown === undefined &&
            entry.spellSlots === undefined
          ) {
            return null;
          }
          return {
            cantripsKnown: entry.cantripsKnown,
            spellsKnown: entry.spellsKnown,
            spellSlots: entry.spellSlots,
          } as Exclude<SpellcastingProgression, null>;
        },
      );

      if (!progression) {
        if (bonusPreparedSpellIds.length === 0 && expandedSpellIds.length === 0) {
          return null;
        }
        return {
          sourceType: "race" as const,
          classId: raceId,
          classLevel: level,
          isBonusOnly: true,
          spellcastingBase: {
            ability: trait.spellcasting.ability,
            preparationType: trait.spellcasting.preparationType,
            ritualCasting: trait.spellcasting.ritualCasting,
          },
          progression: {} as Exclude<SpellcastingProgression, null>,
          schoolRestrictions: null,
          expandedSpellIds,
          bonusPreparedSpellIds,
          spellListSource: null,
          freeSchoolSpellSlots: 0,
        };
      }

      return {
        sourceType: "race" as const,
        classId: raceId,
        classLevel: level,
        isBonusOnly: false,
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
        freeSchoolSpellSlots:
          getMostRecentProgressionProperty(
            trait.spellcasting.progressionByLevel,
            level,
            (entry) => entry.freeSchoolSpellSlots ?? null,
          ) ?? 0,
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
  const primaryCastingTrack = spellcastingTracks.find((t) => !t.isBonusOnly) || null;
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
  // Bonus-only tracks (e.g. domain spell traits) are excluded — they contribute no
  // cantrips, spell slots, or prepared-spell limits; their spells surface via bonusPrepared.
  // However, any expandedSpellIds they carry are merged into the matching class summary
  // so that off-list spells added via spellsAddedToList are still considered valid.
  const bonusOnlyExpandedByClass = new Map<string, string[]>();
  for (const track of spellcastingTracks) {
    if (!track.isBonusOnly || track.expandedSpellIds.length === 0) continue;
    const existing = bonusOnlyExpandedByClass.get(track.classId) ?? [];
    bonusOnlyExpandedByClass.set(track.classId, [...existing, ...track.expandedSpellIds]);
  }

  const classSpellcastingSummaries: ClassSpellcastingSummary[] =
    spellcastingTracks
      .filter((track) => !track.isBonusOnly)
      .map((track) => {
        const abilityMod = modifiers[track.spellcastingBase.ability] || 0;
        const extraExpanded = bonusOnlyExpandedByClass.get(track.classId) ?? [];

        return {
          classId: track.classId,
          classLevel: track.classLevel,
          preparationType: track.spellcastingBase.preparationType,
          spellcastingAbility: track.spellcastingBase.ability,
          maxSpellLevel: Math.max(
            0,
            ...Object.entries(track.progression.spellSlots ?? {})
              .filter(([, slots]) => Number(slots) > 0)
              .map(([level]) => Number(level)),
          ),
          maxCantrips: track.progression.cantripsKnown || 0,
          maxSpellsKnown: track.progression.spellsKnown || 0,
          maxPreparedSpells:
            track.spellcastingBase.preparationType === "prepared"
              ? resolvePreparedSpellLimit(track.classLevel, abilityMod)
              : 0,
          schoolRestrictions: track.schoolRestrictions,
          expandedSpellIds: dedupe([...track.expandedSpellIds, ...extraExpanded]),
          spellListSource: track.spellListSource,
          freeSchoolSpellSlots: track.freeSchoolSpellSlots,
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

  const allExpandedSpellIds = dedupe(
    classSpellcastingSummaries.flatMap((s) => s.expandedSpellIds),
  );

  // Sum of free-school slots across all known-type tracks that have school restrictions
  const freeSchoolSlots = classSpellcastingSummaries
    .filter(
      (s) => s.preparationType === "known" && s.schoolRestrictions !== null,
    )
    .reduce((total, s) => total + s.freeSchoolSpellSlots, 0);

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
    const freeSchoolMatch =
      summary.freeSchoolSpellSlots > 0 &&
      (state.freeSchoolKnownSpellIds ?? []).includes(spell.id) &&
      effectiveClassIds.some((c) => spell.classes.includes(c));
    return (classMatch && schoolMatch) || expandedMatch || freeSchoolMatch;
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
    freeSchoolOverflow: Math.max(
      0,
      (state.freeSchoolKnownSpellIds ?? []).length - freeSchoolSlots,
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
    allExpandedSpellIds,
    freeSchoolDesignated: state.freeSchoolKnownSpellIds ?? [],
    freeSchoolSlots,
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

  const activeSpellIds = dedupe([
    ...state.spellsKnown,
    ...state.spellsPrepared,
    ...allBonusPreparedSpellIds,
  ]);

  const spellMetadataById: Record<string, SpellCastMetadata> = {};
  activeSpellIds.forEach((spellId) => {
    const spell = getSpellByID(spellId);
    if (!spell) return;

    const castLevelOptions = getSpellCastLevelOptions(spell, slots);
    const selectedCastLevel =
      spell.level === 0 ? 0 : castLevelOptions[0]?.level ?? spell.level;
    const selectedLevelOption = castLevelOptions.find(
      (option) => option.level === selectedCastLevel,
    );
    const canUseSharedSlot = selectedLevelOption?.canUseSharedSlot ?? false;
    const canUsePactSlot = selectedLevelOption?.canUsePactSlot ?? false;
    const hasAvailableSlot = selectedLevelOption?.hasAvailableSlot ?? false;
    const canCast = !isArmorPenalized && (spell.level === 0 || hasAvailableSlot);
    const unavailableReason = isArmorPenalized
      ? "Cannot cast spells while wearing armor you are not proficient with."
      : spell.level > 0 && !hasAvailableSlot
        ? `No Level ${spell.level}+ spell slots available.`
        : undefined;

    spellMetadataById[spell.id] = {
      spellId: spell.id,
      baseSpellLevel: spell.level,
      availableCastLevels: castLevelOptions.map((option) => option.level),
      selectedCastLevel,
      canCast,
      canUseSharedSlot,
      canUsePactSlot,
      unavailableReason,
      resolvedDamageEntries: getResolvedSpellDamageEntriesAtCastLevel(
        spell,
        selectedCastLevel,
      ),
      resolvedHealingEntries: getResolvedSpellHealingEntriesAtCastLevel(
        spell,
        selectedCastLevel,
      ),
    };
  });

  return {
    isSpellcaster,
    canCastSpells: !isArmorPenalized,
    casting,
    pools,
    slots,
    diagnostics,
    spellMetadata: {
      byId: spellMetadataById,
      activeSpellIds,
    },
  };

  // #endregion
};
