import {
  getFeatById,
  getClassById,
  getRaceById,
  getSubclassById,
  getSubraceById,
  getTraitById,
  getTraitsByIds,
} from "../data/staticDataApi";
import type { CharacterClassTrack } from "../store/useCharacterStore";
import type { FeatAcquisitionEntry } from "../types/feat";
import type { LevelChoice } from "../types/progression";
import type { SourcedTrait, TraitSource } from "../types/trait";
import { getOwnedFeats, getOwnedFeatsWithSources } from "./featUtils";

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
    .forEach((entry) => entry.features?.forEach((id) => traitIds.add(id)));
};

const addSourcedTrait = (
  sourcedTraits: Map<string, SourcedTrait>,
  traitId: string,
  source: TraitSource,
) => {
  const trait = getTraitById(traitId);
  if (!trait) return;

  const existing = sourcedTraits.get(traitId);
  if (!existing) {
    sourcedTraits.set(traitId, {
      trait,
      sources: [source],
    });
    return;
  }

  const alreadyHasSource = existing.sources.some(
    (candidate) =>
      candidate.kind === source.kind &&
      candidate.sourceId === source.sourceId &&
      candidate.level === source.level &&
      candidate.label === source.label,
  );

  if (!alreadyHasSource) {
    existing.sources.push(source);
  }
};

const buildRaceSource = (
  raceId: string | null,
): TraitSource | null => {
  const race = raceId ? getRaceById(raceId) : null;
  if (!raceId) return null;

  return {
    kind: "race",
    label: race?.name ?? "Race",
    sourceId: raceId,
    sourceName: race?.name,
  };
};

const buildSubraceSource = (
  subraceId: string | null,
): TraitSource | null => {
  const subrace = subraceId ? getSubraceById(subraceId) : null;
  if (!subraceId) return null;

  return {
    kind: "subrace",
    label: subrace?.name ?? "Subrace",
    sourceId: subraceId,
    sourceName: subrace?.name,
  };
};

const buildClassSource = (
  classId: string,
  level: number,
): TraitSource => {
  const classData = getClassById(classId);

  return {
    kind: "class",
    label: classData?.name ? `${classData.name} level ${level}` : `Class level ${level}`,
    sourceId: classId,
    sourceName: classData?.name,
    level,
  };
};

const buildSubclassSource = (
  subclassId: string,
  level: number,
): TraitSource => {
  const subclassData = getSubclassById(subclassId);

  return {
    kind: "subclass",
    label: subclassData?.name
      ? `${subclassData.name} level ${level}`
      : `Subclass level ${level}`,
    sourceId: subclassId,
    sourceName: subclassData?.name,
    level,
  };
};

const buildFeatSource = (
  featId: string,
): TraitSource => {
  const feat = getFeatById(featId);

  return {
    kind: "feat",
    label: feat?.name ? `Feat: ${feat.name}` : "Feat",
    sourceId: featId,
    sourceName: feat?.name,
  };
};

const addProgressionSourcedTraits = (
  sourcedTraits: Map<string, SourcedTrait>,
  progression: Array<{ level: number; features: string[] }> | undefined,
  level: number,
  exactLevel: boolean,
  buildSource: (level: number) => TraitSource,
) => {
  if (!progression) return;

  const levelFilter = exactLevel
    ? (entry: { level: number }) => entry.level === level
    : (entry: { level: number }) => entry.level <= level;

  progression.filter(levelFilter).forEach((entry) => {
    entry.features?.forEach((traitId) => {
      addSourcedTrait(sourcedTraits, traitId, buildSource(entry.level));
    });
  });
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
      classTracks.forEach((track, trackIndex) => {
        const trackClassData = getClassById(track.classId);
        const isPrimary = trackIndex === 0;

        if (isPrimary) {
          // Primary class: add all progression traits including starting proficiency traits
          addProgressionTraitIds(
            traitIds,
            trackClassData?.progression,
            track.level,
            false,
          );
        } else {
          // Non-primary (multiclass): skip traits marked isStartingProficiency,
          // and inject the class's designated multiclassTraits instead
          if (trackClassData?.progression) {
            const candidateIds = new Set<string>();
            addProgressionTraitIds(
              candidateIds,
              trackClassData.progression,
              track.level,
              false,
            );
            candidateIds.forEach((id) => {
              if (!getTraitById(id)?.isStartingProficiency) {
                traitIds.add(id);
              }
            });
          }
          trackClassData?.multiclassTraits?.forEach((id) => traitIds.add(id));
        }

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

export const getAllCharacterTraitsWithSources = (
  level: number,
  raceId: string | null,
  subraceId: string | null,
  classId: string | null,
  subclassId: string | null,
  exactLevel = false,
  choicesByLevel: Record<number, LevelChoice> = {},
  acquiredFeats: FeatAcquisitionEntry[] = [],
  classTracks: CharacterClassTrack[] = [],
): SourcedTrait[] => {
  const sourcedTraits = new Map<string, SourcedTrait>();
  const raceSource = buildRaceSource(raceId);
  const subraceSource = buildSubraceSource(subraceId);
  const raceData = raceId ? getRaceById(raceId) : null;
  const subraceData = subraceId ? getSubraceById(subraceId) : null;
  const classData = classId ? getClassById(classId) : null;
  const subclassData = subclassId ? getSubclassById(subclassId) : null;

  if (!exactLevel || level === 1) {
    if (raceSource) {
      raceData?.traits?.forEach((traitId) => {
        addSourcedTrait(sourcedTraits, traitId, raceSource);
      });
    }

    if (subraceSource) {
      subraceData?.traitsAdded?.forEach((traitId) => {
        addSourcedTrait(sourcedTraits, traitId, subraceSource);
      });
    }
  }

  if (classTracks.length > 0) {
    if (exactLevel) {
      const selectedClassId =
        choicesByLevel[level]?.selectedClassId ||
        classTracks[0]?.classId ||
        classId;
      const selectedTrack = selectedClassId
        ? classTracks.find((track) => track.classId === selectedClassId)
        : null;

      if (selectedTrack) {
        const selectedClassData = getClassById(selectedTrack.classId);
        addProgressionSourcedTraits(
          sourcedTraits,
          selectedClassData?.progression,
          selectedTrack.level,
          true,
          (traitLevel) => buildClassSource(selectedTrack.classId, traitLevel),
        );

        if (selectedTrack.subclassId) {
          const selectedSubclassData = getSubclassById(selectedTrack.subclassId);
          addProgressionSourcedTraits(
            sourcedTraits,
            selectedSubclassData?.progression,
            selectedTrack.level,
            true,
            (traitLevel) =>
              buildSubclassSource(selectedTrack.subclassId as string, traitLevel),
          );
        }
      }
    } else {
      classTracks.forEach((track, trackIndex) => {
        const trackClassData = getClassById(track.classId);
        const isPrimary = trackIndex === 0;

        if (isPrimary) {
          addProgressionSourcedTraits(
            sourcedTraits,
            trackClassData?.progression,
            track.level,
            false,
            (traitLevel) => buildClassSource(track.classId, traitLevel),
          );
        } else {
          trackClassData?.progression
            ?.filter((entry) => entry.level <= track.level)
            .forEach((entry) => {
              entry.features.forEach((traitId) => {
                if (!getTraitById(traitId)?.isStartingProficiency) {
                  addSourcedTrait(
                    sourcedTraits,
                    traitId,
                    buildClassSource(track.classId, entry.level),
                  );
                }
              });
            });

          trackClassData?.multiclassTraits?.forEach((traitId) => {
            addSourcedTrait(
              sourcedTraits,
              traitId,
              buildClassSource(track.classId, 1),
            );
          });
        }

        if (track.subclassId) {
          const trackSubclassData = getSubclassById(track.subclassId);
          addProgressionSourcedTraits(
            sourcedTraits,
            trackSubclassData?.progression,
            track.level,
            false,
            (traitLevel) => buildSubclassSource(track.subclassId as string, traitLevel),
          );
        }
      });
    }
  } else {
    if (classId) {
      addProgressionSourcedTraits(
        sourcedTraits,
        classData?.progression,
        level,
        exactLevel,
        (traitLevel) => buildClassSource(classId, traitLevel),
      );
    }

    if (subclassId) {
      addProgressionSourcedTraits(
        sourcedTraits,
        subclassData?.progression,
        level,
        exactLevel,
        (traitLevel) => buildSubclassSource(subclassId, traitLevel),
      );
    }
  }

  getOwnedFeatsWithSources(level, choicesByLevel, acquiredFeats, exactLevel).forEach(
    ({ feat }) => {
      feat.grantedTraits.forEach((traitId) => {
        addSourcedTrait(sourcedTraits, traitId, buildFeatSource(feat.id));
      });
    },
  );

  return Array.from(sourcedTraits.values());
};
