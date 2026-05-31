import { describe, expect, test } from "vitest";
import { calculateTotalAbilityScore } from "./abilityUtils";
import type { Ability } from "../types/common";

const STRENGTH = "str" as Ability;
const DEXTERITY = "dex" as Ability;

describe("calculateTotalAbilityScore", () => {
  test("returns base score when no bonuses are provided", () => {
    const total = calculateTotalAbilityScore(STRENGTH, 10);
    expect(total).toBe(10);
  });

  test("adds fixed ancestry bonus for the selected ability", () => {
    const total = calculateTotalAbilityScore(STRENGTH, 10, { [STRENGTH]: 2 });

    expect(total).toBe(12);
  });

  test("adds user-selected ancestry bonus", () => {
    const total = calculateTotalAbilityScore(
      STRENGTH,
      10,
      {},
      { [STRENGTH]: 1 },
      undefined,
    );

    expect(total).toBe(11);
  });

  test("adds ASI bonus", () => {
    const total = calculateTotalAbilityScore(DEXTERITY, 14, {}, {}, 2);

    expect(total).toBe(16);
  });

  test("adds all supported bonus sources together", () => {
    const total = calculateTotalAbilityScore(
      STRENGTH,
      10,
      { [STRENGTH]: 3 },
      { [STRENGTH]: 1 },
      2,
      { [STRENGTH]: 1 },
    );

    expect(total).toBe(17);
  });

  test("ignores bonus entries for other abilities", () => {
    const total = calculateTotalAbilityScore(STRENGTH, 10, { [DEXTERITY]: 2 });

    expect(total).toBe(10);
  });

  test("handles explicit zero-value bonuses without changing total", () => {
    const total = calculateTotalAbilityScore(
      STRENGTH,
      15,
      { [STRENGTH]: 0 },
      { [STRENGTH]: 0 },
      0,
      { [STRENGTH]: 0 },
    );

    expect(total).toBe(15);
  });

  test("includes negative bonuses arithmetically", () => {
    const total = calculateTotalAbilityScore(
      STRENGTH,
      12,
      { [STRENGTH]: -2 },
      { [STRENGTH]: -1 },
      -1,
      { [STRENGTH]: -1 },
    );

    expect(total).toBe(7);
  });
});
