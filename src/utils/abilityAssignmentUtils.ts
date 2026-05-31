import type { Ability } from "../types/common";

export const STANDARD_ARRAY_VALUES = [15, 14, 13, 12, 10, 8] as const;

export type AbilityAssignmentMethod =
  | "rolling"
  | "standard_array"
  | "point_buy";

export type RollingInputMode = "virtual" | "physical";

export interface VirtualAbilityRoll {
  dice: [number, number, number, number];
  dropped: number;
  kept: [number, number, number];
  total: number;
}

export const toVirtualAbilityRoll = (
  dice: [number, number, number, number],
): VirtualAbilityRoll => {
  const sorted = [...dice].sort((a, b) => a - b);
  const dropped = sorted[0];
  const kept = [sorted[1], sorted[2], sorted[3]] as [number, number, number];
  const total = kept[0] + kept[1] + kept[2];

  return {
    dice,
    dropped,
    kept,
    total,
  };
};

const POINT_BUY_COST_BY_SCORE: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export interface PointBuyValidationResult {
  totalCost: number;
  isInRange: boolean;
  isStrictlyValid: boolean;
  overBudgetBy: number;
}

const toSortedNumberList = (scores: Record<Ability, number>): number[] =>
  Object.values(scores)
    .map((score) => Math.floor(score))
    .sort((a, b) => a - b);

export const isStandardArrayAssignment = (
  scores: Record<Ability, number>,
): boolean => {
  const assigned = toSortedNumberList(scores);
  const standard = [...STANDARD_ARRAY_VALUES].sort((a, b) => a - b);

  return assigned.length === standard.length
    && assigned.every((score, index) => score === standard[index]);
};

export const calculatePointBuyCost = (score: number): number | null => {
  const normalized = Math.floor(score);
  return POINT_BUY_COST_BY_SCORE[normalized] ?? null;
};

export const validatePointBuyAssignment = (
  scores: Record<Ability, number>,
): PointBuyValidationResult => {
  const costs = Object.values(scores).map((score) => calculatePointBuyCost(score));
  const isInRange = costs.every((cost) => cost !== null);

  const totalCost = costs.reduce<number>((sum, cost) => sum + (cost ?? 0), 0);
  const overBudgetBy = Math.max(0, totalCost - 27);

  return {
    totalCost,
    isInRange,
    isStrictlyValid: isInRange && totalCost <= 27,
    overBudgetBy,
  };
};

const rollD6 = (random: () => number): number =>
  Math.floor(random() * 6) + 1;

export const roll4d6DropLowest = (
  random: () => number = Math.random,
): VirtualAbilityRoll => {
  const dice: [number, number, number, number] = [
    rollD6(random),
    rollD6(random),
    rollD6(random),
    rollD6(random),
  ];

  return toVirtualAbilityRoll(dice);
};

export const rollAbilitySet = (
  count = 6,
  random: () => number = Math.random,
): VirtualAbilityRoll[] => {
  const safeCount = Math.max(1, Math.floor(count));
  return Array.from({ length: safeCount }, () => roll4d6DropLowest(random));
};
