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

  // region --- Racial Traits ---
  raceData?.traits?.forEach((id) => traitIds.add(id));
  subraceData?.traits_added?.forEach((id) => traitIds.add(id));

  // region --- Class and Subclass Traits ---
  for (let i = 1; i < level; i++) {
    classData?.progression
      .find((p) => p.level === i)
      ?.features.forEach((id) => traitIds.add(id));
    subclassData?.progression
      .find((p) => p.level === i)
      ?.features.forEach((id) => traitIds.add(id));
  }

  return getTraitsByIds(Array.from(traitIds));
};
