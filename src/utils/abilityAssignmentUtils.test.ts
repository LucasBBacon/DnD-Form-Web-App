import { describe, expect, it } from "vitest";
import type { Ability } from "../types/common";
import {
  calculatePointBuyCost,
  isStandardArrayAssignment,
  roll4d6DropLowest,
  rollAbilitySet,
  toVirtualAbilityRoll,
  validatePointBuyAssignment,
} from "./abilityAssignmentUtils";

const asScores = (values: number[]): Record<Ability, number> => ({
  str: values[0],
  dex: values[1],
  con: values[2],
  int: values[3],
  wis: values[4],
  cha: values[5],
});

describe("abilityAssignmentUtils", () => {
  describe("isStandardArrayAssignment", () => {
    it("returns true for the standard array in any order", () => {
      expect(
        isStandardArrayAssignment(asScores([10, 15, 8, 13, 12, 14])),
      ).toBe(true);
    });

    it("returns false when values do not match the standard array multiset", () => {
      expect(
        isStandardArrayAssignment(asScores([15, 15, 13, 12, 10, 8])),
      ).toBe(false);
    });
  });

  describe("point buy", () => {
    it("calculates expected score costs", () => {
      expect(calculatePointBuyCost(8)).toBe(0);
      expect(calculatePointBuyCost(14)).toBe(7);
      expect(calculatePointBuyCost(15)).toBe(9);
    });

    it("returns null for out-of-range scores", () => {
      expect(calculatePointBuyCost(7)).toBeNull();
      expect(calculatePointBuyCost(16)).toBeNull();
    });

    it("marks strict-valid arrays under or at 27 points", () => {
      const result = validatePointBuyAssignment(asScores([15, 15, 15, 8, 8, 8]));
      expect(result.totalCost).toBe(27);
      expect(result.isInRange).toBe(true);
      expect(result.isStrictlyValid).toBe(true);
      expect(result.overBudgetBy).toBe(0);
    });

    it("marks over-budget arrays as invalid", () => {
      const result = validatePointBuyAssignment(asScores([15, 15, 15, 10, 8, 8]));
      expect(result.totalCost).toBeGreaterThan(27);
      expect(result.isStrictlyValid).toBe(false);
      expect(result.overBudgetBy).toBe(result.totalCost - 27);
    });

    it("marks out-of-range arrays as invalid", () => {
      const result = validatePointBuyAssignment(asScores([16, 12, 12, 10, 8, 8]));
      expect(result.isInRange).toBe(false);
      expect(result.isStrictlyValid).toBe(false);
    });
  });

  describe("rolling", () => {
    it("converts fixed dice into VirtualAbilityRoll shape", () => {
      const roll = toVirtualAbilityRoll([6, 2, 5, 3]);

      expect(roll.dice).toEqual([6, 2, 5, 3]);
      expect(roll.dropped).toBe(2);
      expect(roll.kept).toEqual([3, 5, 6]);
      expect(roll.total).toBe(14);
    });

    it("rolls 4d6 and drops the lowest die", () => {
      const seq = [0.1, 0.2, 0.95, 0.35];
      let idx = 0;
      const random = () => {
        const value = seq[idx];
        idx += 1;
        return value;
      };

      const roll = roll4d6DropLowest(random);

      // d6 values: 1, 2, 6, 3 -> drop 1, keep 2+3+6 = 11
      expect(roll.dice).toEqual([1, 2, 6, 3]);
      expect(roll.dropped).toBe(1);
      expect(roll.kept).toEqual([2, 3, 6]);
      expect(roll.total).toBe(11);
    });

    it("generates six rolls by default", () => {
      const rolls = rollAbilitySet();
      expect(rolls).toHaveLength(6);
      rolls.forEach((roll) => {
        expect(roll.total).toBeGreaterThanOrEqual(3);
        expect(roll.total).toBeLessThanOrEqual(18);
      });
    });
  });
});
