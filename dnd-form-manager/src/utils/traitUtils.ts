import {
  getClassById,
  getRaceById,
  getSubclassById,
  getSubraceById,
  getTraitsByIds,
} from "../data/staticDataApi";

export const getAllCharacterTraits = (
  level: number,
  raceId: string | null,
  subraceId: string | null,
  classId: string | null,
  subclassId: string | null,
) => {
  const raceData = raceId ? getRaceById(raceId) : null;
  const subraceData = subraceId ? getSubraceById(subraceId) : null;
  const classData = classId ? getClassById(classId) : null;
  const subclassData = subclassId ? getSubclassById(subclassId) : null;

  const traitIds = new Set<string>();

  // #region Racial Traits
  raceData?.traits?.forEach((id) => traitIds.add(id));
  subraceData?.traits_added?.forEach((id) => traitIds.add(id));
  // #endregion

  // #region Class and Subclass Traits
  if (classData) {
    classData.progression
      .filter((p) => p.level <= level)
      .forEach((p) => p.features.forEach((id) => traitIds.add(id)));
  }

  if (subclassData) {
    subclassData.progression
      .filter((p) => p.level <= level)
      .forEach((p) => p.features.forEach((id) => traitIds.add(id)));
  }

  return getTraitsByIds(Array.from(traitIds));
};
