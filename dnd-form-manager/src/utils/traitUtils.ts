import {
  getClassById,
  getRaceById,
  getSubclassById,
  getSubraceById,
  getTraitsByIds,
} from "../data/staticDataApi";
import type { FeatAcquisitionEntry } from "../types/feat";
import type { LevelChoice } from "../types/progression";
import { getOwnedFeats } from "./featUtils";

export const getAllCharacterTraits = (
  level: number,
  raceId: string | null,
  subraceId: string | null,
  classId: string | null,
  subclassId: string | null,
  exactLevel = false,
  choicesByLevel: Record<number, LevelChoice> = {},
  acquiredFeats: FeatAcquisitionEntry[] = [],
) => {
  const raceData = raceId ? getRaceById(raceId) : null;
  const subraceData = subraceId ? getSubraceById(subraceId) : null;
  const classData = classId ? getClassById(classId) : null;
  const subclassData = subclassId ? getSubclassById(subclassId) : null;

  const traitIds = new Set<string>();

  // #region Racial Traits
  // Racial traits are granted at character creation (level 1).
  // When filtering by exact level, only include them if we're at level 1.
  if (!exactLevel || level === 1) {
    raceData?.traits?.forEach((id) => traitIds.add(id));
    subraceData?.traits_added?.forEach((id) => traitIds.add(id));
  }
  // #endregion

  // #region Class and Subclass Traits
  const levelFilter = exactLevel
    ? (p: { level: number }) => p.level === level
    : (p: { level: number }) => p.level <= level;

  if (classData) {
    classData.progression
      .filter(levelFilter)
      .forEach((p) => p.features.forEach((id) => traitIds.add(id)));
  }

  if (subclassData) {
    subclassData.progression
      .filter(levelFilter)
      .forEach((p) => p.features.forEach((id) => traitIds.add(id)));
  }

  const selectedFeats = getOwnedFeats(
    level,
    choicesByLevel,
    acquiredFeats,
    exactLevel,
  );
  selectedFeats.forEach((feat) => {
    feat.granted_traits.forEach((id) => traitIds.add(id));
  });

  return getTraitsByIds(Array.from(traitIds));
};
