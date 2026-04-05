import type { HitDie } from "../types/common";

/**
 * Calculates a character's Maximum Hit Points.
 * @param level Level gain of raw HP.
 * @param hitDie Current class hit die, undefined if a class is not picked.
 * @param conModifier Current con mod.
 * @param hpRolls Hp gained per level.
 */
export const calculateMaxHP = (
  level: number,
  hitDie: HitDie | undefined,
  conModifier: number,
  hpRolls: Record<number, number> = {},
): number => {
  // if no class selected, they have 0 hp
  if (!hitDie) return 0;

  // level 1: Max Hit Die + CON modifier
  // NOTE: 5e rules state a min of 1 HP per level is gained, even with negative con mod
  let totalHp = Math.max(1, hitDie + conModifier);

  // Levels 2+: Add the rolled/chosen HP + CON mod for each level
  for (let currentLevel = 2; currentLevel <= level; currentLevel++) {
    // if they haven't rolled for this level yet, default to 5e average (HitDie / 2 + 1)
    const averageHp = hitDie / 2 + 1;

    // use their recorded roll, or fallback to average
    const baseHpGained = hpRolls[currentLevel] || averageHp;

    // Add the level's HP gain (min 1)
    totalHp += Math.max(1, baseHpGained + conModifier);
  }

  return totalHp;
};

/**
 * Calculates max HP when the hit die can vary by character level (multiclass).
 *
 * hitDieByLevel is keyed by total character level and should include a hit die
 * for level 1. Missing later levels fall back to the previous level's hit die.
 */
export const calculateMulticlassMaxHP = (
  level: number,
  hitDieByLevel: Record<number, HitDie | undefined>,
  conModifier: number,
  hpRolls: Record<number, number> = {},
): number => {
  const levelOneDie = hitDieByLevel[1];
  if (!levelOneDie || level < 1) return 0;

  let totalHp = Math.max(1, levelOneDie + conModifier);
  let previousHitDie = levelOneDie;

  for (let currentLevel = 2; currentLevel <= level; currentLevel++) {
    const currentHitDie = hitDieByLevel[currentLevel] || previousHitDie;
    const averageHp = currentHitDie / 2 + 1;
    const baseHpGained = hpRolls[currentLevel] || averageHp;

    totalHp += Math.max(1, baseHpGained + conModifier);
    previousHitDie = currentHitDie;
  }

  return totalHp;
};
