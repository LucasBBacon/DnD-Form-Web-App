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

/**
 * Adds trait IDs from a progression to the provided set of trait IDs.
 * @param traitIds The set of trait IDs to add to.
 * @param progression The progression data containing features by level.
 * @param level The current level of the character.
 * @param exactLevel Whether to include only traits from the exact level or all levels up to the current level.
 */
const addProgressionTraitIds = (
  traitIds: Set<string>,
  progression: Array<{ level: number; features: string[] }> | undefined,
  level: number,
  exactLevel: boolean,
) => {
  // If there's no progression data, simply return.
  if (!progression) return;

  // Filter the progression entries based on the level and whether
  // traits from only the exact level should be included or all levels up to the current level
  const levelFilter = exactLevel
    ? (entry: { level: number }) => entry.level === level
    : (entry: { level: number }) => entry.level <= level;

  // Iterate through the filtered progression entries and add their feature IDs to the traitIds set
  progression
    .filter(levelFilter)
    .forEach((entry) => entry.features.forEach((id) => traitIds.add(id)));
};

/**
 * Retrieves all traits for a character based on their level, race, class, subclass, and other factors.
 * @param level The current level of the character.
 * @param raceId The ID of the character's race.
 * @param subraceId The ID of the character's subrace.
 * @param classId The ID of the character's class.
 * @param subclassId The ID of the character's subclass.
 * @param exactLevel Whether to include only traits from the exact level or all levels up to the current level.
 * @param choicesByLevel The choices made by the character at each level.
 * @param acquiredFeats The feats acquired by the character.
 * @param classTracks The class tracks of the character.
 * @returns An array of traits for the character.
 */
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
  // #region --- Fetch Static Data ---

  const raceData = raceId ? getRaceById(raceId) : null;
  const subraceData = subraceId ? getSubraceById(subraceId) : null;
  const classData = classId ? getClassById(classId) : null;
  const subclassData = subclassId ? getSubclassById(subclassId) : null;

  // #endregion

  const traitIds = new Set<string>();

  // #region --- Racial Traits ---

  // Racial traits are granted at character creation (level 1).
  // When filtering by exact level, only include them if we're at level 1.
  if (!exactLevel || level === 1) {
    raceData?.traits?.forEach((id) => traitIds.add(id));
    subraceData?.traitsAdded?.forEach((id) => traitIds.add(id));
  }

  // #endregion

  // #region --- Class and Subclass Traits ---

  // Class and subclass traits are granted based on the character's class progression
  if (classTracks.length > 0) {
    // If class tracks are present, consider the traits from each track up to the current level (or exact level if filtering)
    if (exactLevel) {
      // If filtering by exact level, find the track that matches the selected class at that level (or fallback to main class and subclass IDs)
      // Determine the selected class ID for the current level from choicesByLevel or classTracks
      const selectedClassId =
        choicesByLevel[level]?.selectedClassId ||
        classTracks[0]?.classId ||
        classId;
      // Find the track that matches the selected class ID at the current level
      const selectedTrack = selectedClassId
        ? classTracks.find((track) => track.classId === selectedClassId)
        : null;

      if (selectedTrack) {
        // If a matching track is found, add traits from that track's class and subclass progression for the current level
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
      // If not filtering by exact level, simply add traits from all class tracks up to the current level
      // Iterate through each class track and add traits from their class and subclass progression for all levels up to the current level
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
    // If no class tracks are present, fall back to using the main class and subclass IDs with the current level (or exact level if filtering)
    addProgressionTraitIds(traitIds, classData?.progression, level, exactLevel);
    addProgressionTraitIds(
      traitIds,
      subclassData?.progression,
      level,
      exactLevel,
    );
  }

  // #endregion

  // #region --- Feat Traits ---

  // Feats can be acquired at various levels and may grant additional traits. Consider the feats acquired up to the current level (or exact level if filtering).
  const selectedFeats = getOwnedFeats(
    level,
    choicesByLevel,
    acquiredFeats,
    exactLevel,
  );
  selectedFeats.forEach((feat) => {
    feat.grantedTraits.forEach((id) => traitIds.add(id));
  });
  
  // #endregion

  return getTraitsByIds(Array.from(traitIds));
};
