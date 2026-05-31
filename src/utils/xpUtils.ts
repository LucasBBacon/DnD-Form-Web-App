import type { LevelUpMode } from "../types/progression";

const MIN_LEVEL = 1;
const MAX_LEVEL = 20;

// DnD 5e 2014 XP thresholds keyed by level (index 0 is intentionally unused).
const XP_THRESHOLDS_BY_LEVEL: number[] = [
  0,
  0,
  300,
  900,
  2700,
  6500,
  14000,
  23000,
  34000,
  48000,
  64000,
  85000,
  100000,
  120000,
  140000,
  165000,
  195000,
  225000,
  265000,
  305000,
  355000,
];

const clampLevel = (level: number): number =>
  Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, Math.floor(level)));

export const getXpThresholdForLevel = (level: number): number => {
  const clampedLevel = clampLevel(level);
  return XP_THRESHOLDS_BY_LEVEL[clampedLevel];
};

export const getLevelFromXp = (xp: number): number => {
  const normalizedXp = Math.max(0, Math.floor(xp));

  for (let level = MAX_LEVEL; level >= MIN_LEVEL; level -= 1) {
    if (normalizedXp >= XP_THRESHOLDS_BY_LEVEL[level]) {
      return level;
    }
  }

  return MIN_LEVEL;
};

export const isLevelUpAvailable = (
  xp: number,
  currentLevel: number,
  levelUpMode: LevelUpMode,
): boolean => {
  const clampedLevel = clampLevel(currentLevel);

  if (clampedLevel >= MAX_LEVEL) {
    return false;
  }

  if (levelUpMode === "milestone_anytime") {
    return true;
  }

  return Math.max(0, Math.floor(xp)) >= getXpThresholdForLevel(clampedLevel + 1);
};

export const MAX_CHARACTER_LEVEL = MAX_LEVEL;
