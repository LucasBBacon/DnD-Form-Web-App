import { describe, expect, test } from "vitest";
import { calculateMaxHP } from "./hpUtils";
import type { HitDie } from "../types/common";

const D6 = 6 as HitDie;
const D8 = 8 as HitDie;
const D10 = 10 as HitDie;
const D12 = 12 as HitDie;

describe("calculateMaxHP", () => {
  describe("base behavior", () => {
    test("returns 0 when no hit die is selected", () => {
      expect(calculateMaxHP(1, undefined, 2)).toBe(0);
    });

    test("uses max hit die plus Con modifier at level 1", () => {
      expect(calculateMaxHP(1, D10, 3)).toBe(13);
    });

    test("enforces a minimum of 1 HP at level 1 with a very negative Con modifier", () => {
      expect(calculateMaxHP(1, D6, -10)).toBe(1);
    });

    test("ignores hpRolls for level 1 because first level is always max hit die", () => {
      expect(calculateMaxHP(1, D8, 2, { 1: 1 })).toBe(10);
    });
  });

  describe("average HP progression", () => {
    test("uses 5e average HP for levels after 1 when no rolls are provided", () => {
      // d8 class, Con +2
      // Level 1: 8 + 2 = 10
      // Level 2: average 5 + 2 = 7
      // Level 3: average 5 + 2 = 7
      expect(calculateMaxHP(3, D8, 2)).toBe(24);
    });

    test("uses the correct average for a d12 hit die across multiple levels", () => {
      // d12 average is 7
      // Level 1: 12 + 0 = 12
      // Levels 2-4: 7 each
      expect(calculateMaxHP(4, D12, 0)).toBe(33);
    });

    test("applies Con modifier to average HP gained at later levels", () => {
      // d6 average is 4
      // Level 1: 6 + 1 = 7
      // Level 2: 4 + 1 = 5
      // Level 3: 4 + 1 = 5
      expect(calculateMaxHP(3, D6, 1)).toBe(17);
    });
  });

  describe("recorded HP rolls", () => {
    test("uses recorded rolls for levels after 1 instead of averages", () => {
      // Level 1: 10 + 1 = 11
      // Level 2: 9 + 1 = 10
      // Level 3: 4 + 1 = 5
      // Level 4: 7 + 1 = 8
      expect(
        calculateMaxHP(4, D10, 1, {
          2: 9,
          3: 4,
          4: 7,
        }),
      ).toBe(34);
    });

    test("mixes recorded rolls with average HP for missing levels", () => {
      // d8 average is 5
      // Level 1: 8 + 2 = 10
      // Level 2: roll 6 + 2 = 8
      // Level 3: average 5 + 2 = 7
      // Level 4: roll 3 + 2 = 5
      expect(
        calculateMaxHP(4, D8, 2, {
          2: 6,
          4: 3,
        }),
      ).toBe(30);
    });

    test("ignores rolls for levels above the current level", () => {
      // Current level is 2, so levels 3 and 4 should not matter.
      // Level 1: 8 + 1 = 9
      // Level 2: roll 7 + 1 = 8
      expect(
        calculateMaxHP(2, D8, 1, {
          2: 7,
          3: 100,
          4: 100,
        }),
      ).toBe(17);
    });
  });

  describe("minimum 1 HP gained per level rule", () => {
    test("enforces a minimum of 1 HP gained at later levels when rolls plus Con would be 0 or less", () => {
      // Level 1: max(1, 6 - 4) = 2
      // Level 2: max(1, 1 - 4) = 1
      // Level 3: max(1, 2 - 4) = 1
      expect(
        calculateMaxHP(3, D6, -4, {
          2: 1,
          3: 2,
        }),
      ).toBe(4);
    });

    test("enforces minimum 1 HP per level when using average HP with a negative Con modifier", () => {
      // d6 average is 4
      // Level 1: max(1, 6 - 5) = 1
      // Level 2: max(1, 4 - 5) = 1
      // Level 3: max(1, 4 - 5) = 1
      // Level 4: max(1, 4 - 5) = 1
      expect(calculateMaxHP(4, D6, -5)).toBe(4);
    });

    test("supports mixed later-level gains where some values are clamped and some are not", () => {
      // d10 average is 6
      // Level 1: 10 - 2 = 8
      // Level 2: roll 1 - 2 => min 1
      // Level 3: average 6 - 2 = 4
      // Level 4: roll 8 - 2 = 6
      expect(
        calculateMaxHP(4, D10, -2, {
          2: 1,
          4: 8,
        }),
      ).toBe(19);
    });
  });
});
