import type {
  SubclassProgressionLevel,
  SubclassSpecificScaling,
} from "../types/subclass";
import type { ClassData } from "../types/class";
import type { Ability } from "../types/common";
import type { SpellPreparationType } from "../types/trait";

// #region Public Types

export type CasterContributionType = "full" | "half" | "third" | "none";

export interface SpellcastingTrackProfile {
  classId: string;
  classLevel: number;
  spellcastingBase: {
    ability: Ability;
    preparationType: SpellPreparationType;
    ritualCasting: boolean;
  };
}

// #endregion

// #region Spellcasting Constants

const MULTICLASS_SHARED_SLOT_TABLE: Record<number, Record<number, number>> = {
  1: { 1: 2 },
  2: { 1: 3 },
  3: { 1: 4, 2: 2 },
  4: { 1: 4, 2: 3 },
  5: { 1: 4, 2: 3, 3: 2 },
  6: { 1: 4, 2: 3, 3: 3 },
  7: { 1: 4, 2: 3, 3: 3, 4: 1 },
  8: { 1: 4, 2: 3, 3: 3, 4: 2 },
  9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
  11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
  18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
  19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
  20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 },
};

const PACT_SLOT_TABLE: Record<number, { level: number; total: number }> = {
  1: { level: 1, total: 1 },
  2: { level: 1, total: 2 },
  3: { level: 2, total: 2 },
  4: { level: 2, total: 2 },
  5: { level: 3, total: 2 },
  6: { level: 3, total: 2 },
  7: { level: 4, total: 2 },
  8: { level: 4, total: 2 },
  9: { level: 5, total: 2 },
  10: { level: 5, total: 2 },
  11: { level: 5, total: 3 },
  12: { level: 5, total: 3 },
  13: { level: 5, total: 3 },
  14: { level: 5, total: 3 },
  15: { level: 5, total: 3 },
  16: { level: 5, total: 3 },
  17: { level: 5, total: 4 },
  18: { level: 5, total: 4 },
  19: { level: 5, total: 4 },
  20: { level: 5, total: 4 },
};

const HALF_CASTER_CLASS_IDS = new Set(["class_paladin", "class_ranger"]);
const THIRD_CASTER_CLASS_IDS = new Set(["class_fighter", "class_rogue"]);

// #endregion

// #region Internal Helpers

const clampLevelToSupportedRange = (level: number): number =>
  Math.max(0, Math.min(20, Math.floor(level)));

// #endregion

// #region Spellcasting Utilities

/**
 * Determines the type of caster contribution for a given spellcasting track profile.
 * @param profile The spellcasting track profile to evaluate.
 * @returns The caster contribution type: "full", "half", "third", or "none".
 */
export const getCasterContributionType = (
  profile: SpellcastingTrackProfile,
): CasterContributionType => {
  if (profile.spellcastingBase.preparationType === "pact") return "none";
  if (HALF_CASTER_CLASS_IDS.has(profile.classId)) return "half";
  if (THIRD_CASTER_CLASS_IDS.has(profile.classId)) return "third";

  return "full";
};

/**
 * Determines the caster level contribution for a given spellcasting track profile.
 * @param profile The spellcasting track profile to evaluate.
 * @returns The caster level contribution based on the caster type: "full", "half", "third", or "none".
 */
export const getCasterLevelContribution = (
  profile: SpellcastingTrackProfile,
): number => {
  const contributionType = getCasterContributionType(profile);

  if (contributionType === "none") return 0;
  if (contributionType === "half") return Math.floor(profile.classLevel / 2);
  if (contributionType === "third") return Math.floor(profile.classLevel / 3);

  return profile.classLevel;
};

/**
 * Calculates the total caster level for a character with multiple spellcasting classes.
 * @param profiles An array of spellcasting track profiles representing each class's contribution.
 * @returns The total caster level for multiclass spellcasting.
 */
export const calculateMulticlassCasterLevel = (
  profiles: SpellcastingTrackProfile[],
): number => {
  // Sum the caster level contributions from each profile to get the total caster level
  return profiles.reduce(
    (total, profile) => total + getCasterLevelContribution(profile),
    0,
  );
};

/**
 * Determines the shared spell slots for a given caster level.
 * @param casterLevel The total caster level to evaluate.
 * @returns A record mapping spell slot levels to the number of available slots.
 */
export const getSharedSpellSlotsForCasterLevel = (
  casterLevel: number,
): Record<number, number> => {
  const clamped = clampLevelToSupportedRange(casterLevel);
  if (clamped === 0) return {};

  return MULTICLASS_SHARED_SLOT_TABLE[clamped] || {};
};

/**
 * Determines the pact magic slots for a given warlock level.
 * @param warlockLevel The warlock level to evaluate.
 * @returns An object containing the pact magic slot level and total slots, or null if the level is 0.
 */
export const getPactMagicSlotsForLevel = (
  warlockLevel: number,
): { level: number; total: number } | null => {
  const clamped = clampLevelToSupportedRange(warlockLevel);
  if (clamped === 0) return null;

  return PACT_SLOT_TABLE[clamped] || null;
};

/**
 * Determines if a subclass provides spellcasting capabilities.
 * @param classData The class data to evaluate.
 * @param subclassId The ID of the subclass to check.
 * @returns True if the subclass provides spellcasting, false otherwise.
 */
export const hasSpellcastingFromSubclass = (
  classData: ClassData,
  subclassId: string | null,
): boolean => {
  if (!subclassId) return false;

  return THIRD_CASTER_CLASS_IDS.has(classData.id);
};

// #endregion

// #region Progression Utilities

/**
 * Retrieves the most recent progression property for a given level.
 * @param progression An array of progression entries.
 * @param level The current level to evaluate.
 * @param getValue A function to extract the desired value from a progression entry.
 * @returns The most recent value for the given level, or null if none is found.
 */
export const getMostRecentProgressionProperty = <
  TProgression extends { level: number },
  TValue,
>(
  progression: TProgression[],
  level: number,
  getValue: (entry: TProgression) => TValue | null | undefined,
): TValue | null => {
  let resolvedValue: TValue | null = null;
  let resolvedLevel = -1;

  progression.forEach((entry) => {
    if (entry.level > level || entry.level < resolvedLevel) return;

    const value = getValue(entry);
    if (value === null || value === undefined) return;

    resolvedValue = value;
    resolvedLevel = entry.level;
  });

  return resolvedValue;
};

/**
 * Calculates the proficiency bonus based on the character's total level.
 * @param level Total level of a given character.
 * * Level 1-4: +2
 * * Level 5-8: +3
 * * Level 9-12: +4
 * * Level 13-16: +5
 * * Level 17-20: +6
 */
export const calculateProficiencyBonus = (level: number): number => {
  // Constrain the level between 1 and 20 to be safe
  const clampedLevel = Math.max(1, Math.min(20, level));

  return Math.ceil(clampedLevel / 4) + 1;
};

/**
 * Retrieves the active subclass progression entries for a given level.
 * @param progression An array of subclass progression entries.
 * @param level The current level to evaluate.
 * @returns An array of active subclass progression entries for the given level.
 */
export const getActiveSubclassProgression = (
  progression: SubclassProgressionLevel[],
  level: number,
): SubclassProgressionLevel[] => {
  return progression.filter((entry) => entry.level <= level);
};

/**
 * Merges the subclass-specific scaling for a given level.
 * @param progression An array of subclass progression entries.
 * @param level The current level to evaluate.
 * @returns An object containing the merged subclass-specific scaling for the given level.
 */
export const mergeSubclassSpecificScaling = (
  progression: SubclassProgressionLevel[],
  level: number,
): SubclassSpecificScaling => {
  return getActiveSubclassProgression(progression, level).reduce(
    (acc, entry) => {
      // If the progression entry doesn't have subclass-specific scaling, skip it
      if (!entry.subclassSpecificScaling) return acc;

      // Merge the subclass-specific scaling from this entry into the accumulated scaling object
      Object.entries(entry.subclassSpecificScaling).forEach(([key, value]) => {
        acc[key] = value;
      });

      return acc;
    },
    {} as SubclassSpecificScaling,
  );
};

// #endregion
