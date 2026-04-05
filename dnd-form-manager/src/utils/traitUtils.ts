import {
  getClassById,
  getRaceById,
  getSubclassById,
  getSubraceById,
  getTraitsByIds,
} from "../data/staticDataApi";
import type { CharacterClassTrack } from "../store/useCharacterStore";
import type { FeatAcquisitionEntry } from "../types/feat";
import type { LevelChoice } from "../types/progression";
import { getOwnedFeats } from "./featUtils";

const addProgressionTraitIds = (
  traitIds: Set<string>,
  progression: Array<{ level: number; features: string[] }> | undefined,
  level: number,
  exactLevel: boolean,
) => {
  if (!progression) return;

  const levelFilter = exactLevel
    ? (entry: { level: number }) => entry.level === level
    : (entry: { level: number }) => entry.level <= level;

  progression
    .filter(levelFilter)
    .forEach((entry) => entry.features.forEach((id) => traitIds.add(id)));
};

export const getAllCharacterTraits = (
  level: number,
  raceId: string | null,
  subraceId: string | null,
  classId: string | null,
  subclassId: string | null,
  exactLevel = false,
  choicesByLevel: Record<number, LevelChoice> = {},
  acquiredFeats: FeatAcquisitionEntry[] = [],
  classTracks: CharacterClassTrack[] = [],
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
    subraceData?.traitsAdded?.forEach((id) => traitIds.add(id));
  }
  // #endregion

  // #region Class and Subclass Traits
  if (classTracks.length > 0) {
    if (exactLevel) {
      const selectedClassId =
        choicesByLevel[level]?.selectedClassId || classTracks[0]?.classId || classId;
      const selectedTrack = selectedClassId
        ? classTracks.find((track) => track.classId === selectedClassId)
        : null;

      if (selectedTrack) {
        const selectedClassData = getClassById(selectedTrack.classId);
        addProgressionTraitIds(
          traitIds,
          selectedClassData?.progression,
          selectedTrack.level,
          true,
        );

        const selectedSubclassData = selectedTrack.subclassId
          ? getSubclassById(selectedTrack.subclassId)
          : null;
        addProgressionTraitIds(
          traitIds,
          selectedSubclassData?.progression,
          selectedTrack.level,
          true,
        );
      }
    } else {
      classTracks.forEach((track) => {
        const trackClassData = getClassById(track.classId);
        addProgressionTraitIds(
          traitIds,
          trackClassData?.progression,
          track.level,
          false,
        );

        const trackSubclassData = track.subclassId
          ? getSubclassById(track.subclassId)
          : null;
        addProgressionTraitIds(
          traitIds,
          trackSubclassData?.progression,
          track.level,
          false,
        );
      });
    }
  } else {
    addProgressionTraitIds(traitIds, classData?.progression, level, exactLevel);
    addProgressionTraitIds(traitIds, subclassData?.progression, level, exactLevel);
  }

  const selectedFeats = getOwnedFeats(
    level,
    choicesByLevel,
    acquiredFeats,
    exactLevel,
  );
  selectedFeats.forEach((feat) => {
    feat.grantedTraits.forEach((id) => traitIds.add(id));
  });

  return getTraitsByIds(Array.from(traitIds));
};
