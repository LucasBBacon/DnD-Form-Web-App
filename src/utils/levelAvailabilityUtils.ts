import type { CharacterClassTrack } from "../store/useCharacterStore";
import type { LevelChoice, LevelUpMode } from "../types/progression";
import { isLevelUpAvailable } from "./xpUtils";

interface LevelAvailabilityContext {
  xp: number;
  level: number;
  levelUpMode: LevelUpMode;
  classTracks?: CharacterClassTrack[];
}

interface LevelUpTargetContext extends LevelAvailabilityContext {
  choicesByLevel?: Record<number, LevelChoice>;
}

export const getCharacterLevelFromClassTracks = (
  classTracks: CharacterClassTrack[] | undefined,
  fallbackLevel: number,
): number => {
  if (!classTracks || classTracks.length === 0) {
    return Math.max(1, Math.floor(fallbackLevel));
  }

  const totalFromTracks = classTracks.reduce(
    (total, track) => total + Math.max(1, Math.floor(track.level)),
    0,
  );

  return Math.max(1, Math.min(20, totalFromTracks));
};

export const isLevelUpAvailableForCharacter = ({
  xp,
  level,
  levelUpMode,
  classTracks,
}: LevelAvailabilityContext): boolean => {
  const effectiveLevel = getCharacterLevelFromClassTracks(classTracks, level);
  return isLevelUpAvailable(xp, effectiveLevel, levelUpMode);
};

export const getFirstIncompleteLevelChoice = (
  level: number,
  choicesByLevel: Record<number, LevelChoice> = {},
  classTracks?: CharacterClassTrack[],
): number | null => {
  const effectiveLevel = getCharacterLevelFromClassTracks(classTracks, level);

  for (
    let candidateLevel = 1;
    candidateLevel <= effectiveLevel;
    candidateLevel += 1
  ) {
    if (!choicesByLevel[candidateLevel]) {
      return candidateLevel;
    }
  }

  return null;
};

export const getAvailableLevelUpTargetForCharacter = ({
  xp,
  level,
  levelUpMode,
  classTracks,
  choicesByLevel = {},
}: LevelUpTargetContext): number | null => {
  const effectiveLevel = getCharacterLevelFromClassTracks(classTracks, level);
  const incompleteLevel = getFirstIncompleteLevelChoice(
    effectiveLevel,
    choicesByLevel,
    classTracks,
  );

  console.log("Effective level:", effectiveLevel);
  console.log("Incomplete level:", incompleteLevel);

  if (incompleteLevel !== null) {
    return incompleteLevel;
  }

  if (effectiveLevel >= 20) {
    return null;
  }

  console.log(levelUpMode);

  if (levelUpMode === "milestone") {
    return effectiveLevel + 1;
  }

  return isLevelUpAvailable(xp, effectiveLevel, levelUpMode)
    ? effectiveLevel + 1
    : null;
};
