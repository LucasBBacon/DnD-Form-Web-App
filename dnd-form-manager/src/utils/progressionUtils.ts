import type {
  SubclassProgressionLevel,
  SubclassSpecificScaling,
} from "../types/subclass";

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

export const getActiveSubclassProgression = (
  progression: SubclassProgressionLevel[],
  level: number,
): SubclassProgressionLevel[] => {
  return progression.filter((entry) => entry.level <= level);
};

export const mergeSubclassSpecificScaling = (
  progression: SubclassProgressionLevel[],
  level: number,
): SubclassSpecificScaling => {
  return getActiveSubclassProgression(progression, level).reduce(
    (acc, entry) => {
      if (!entry.subclass_specific_scaling) return acc;

      Object.entries(entry.subclass_specific_scaling).forEach(([key, value]) => {
        acc[key] = value;
      });

      return acc;
    },
    {} as SubclassSpecificScaling,
  );
};

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
