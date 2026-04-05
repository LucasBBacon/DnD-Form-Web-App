import { describe, expect, test } from "vitest";
import { calculateTotalAbilityScore } from "./abilityUtils";
import type { Ability } from "../types/common";
import type { Race } from "../types/race";
import type { SubraceData } from "../types/subrace";

const STRENGTH = "strength" as Ability;
const DEXTERITY = "dexterity" as Ability;

const createRaceWithFixedBonuses = (
  fixed: Partial<Record<Ability, number>>,
): Race =>
  ({
    abilityBonuses: {
      fixed,
    },
  }) as unknown as Race;

const createSubraceWithFixedBonuses = (
  fixed: Partial<Record<Ability, number>>,
): SubraceData =>
  ({
    abilityBonuses: {
      fixed,
    },
  }) as unknown as SubraceData;

describe("calculateTotalAbilityScore", () => {
  test("returns base score when no bonuses are provided", () => {
    const total = calculateTotalAbilityScore(STRENGTH, 10, null, null);
    expect(total).toBe(10);
  });

  test("adds fixed racial bonus for the selected ability", () => {
    const race = createRaceWithFixedBonuses({ [STRENGTH]: 2 });

    const total = calculateTotalAbilityScore(STRENGTH, 10, race, null);

    expect(total).toBe(12);
  });

  test("adds fixed subrace bonus for the selected ability", () => {
    const subrace = createSubraceWithFixedBonuses({ [DEXTERITY]: 1 });

    const total = calculateTotalAbilityScore(DEXTERITY, 13, null, subrace);

    expect(total).toBe(14);
  });

  test("stacks race and subrace fixed bonuses", () => {
    const race = createRaceWithFixedBonuses({ [STRENGTH]: 1 });
    const subrace = createSubraceWithFixedBonuses({ [STRENGTH]: 2 });

    const total = calculateTotalAbilityScore(STRENGTH, 8, race, subrace);

    expect(total).toBe(11);
  });

  test("adds user-selected racial bonus", () => {
    const total = calculateTotalAbilityScore(
      STRENGTH,
      10,
      null,
      null,
      { [STRENGTH]: 1 },
      undefined,
    );

    expect(total).toBe(11);
  });

  test("adds ASI bonus", () => {
    const total = calculateTotalAbilityScore(DEXTERITY, 14, null, null, {}, 2);

    expect(total).toBe(16);
  });

  test("adds all supported bonus sources together", () => {
    const race = createRaceWithFixedBonuses({ [STRENGTH]: 2 });
    const subrace = createSubraceWithFixedBonuses({ [STRENGTH]: 1 });

    const total = calculateTotalAbilityScore(
      STRENGTH,
      10, // base
      race, // +2
      subrace, // +1
      { [STRENGTH]: 1 }, // +1
      2, // +2 ASI
    );

    expect(total).toBe(16);
  });

  test("ignores race bonus entries for other abilities", () => {
    const race = createRaceWithFixedBonuses({ [DEXTERITY]: 2 });

    const total = calculateTotalAbilityScore(STRENGTH, 10, race, null);

    expect(total).toBe(10);
  });

  test("treats undefined ASI bonus as 0", () => {
    const race = createRaceWithFixedBonuses({ [STRENGTH]: 1 });

    const total = calculateTotalAbilityScore(
      STRENGTH,
      10,
      race,
      null,
      { [STRENGTH]: 1 },
      undefined,
    );

    expect(total).toBe(12);
  });

  test("handles explicit zero-value bonuses without changing total", () => {
    const race = createRaceWithFixedBonuses({ [STRENGTH]: 0 });
    const subrace = createSubraceWithFixedBonuses({ [STRENGTH]: 0 });

    const total = calculateTotalAbilityScore(
      STRENGTH,
      15,
      race,
      subrace,
      { [STRENGTH]: 0 },
      0,
    );

    expect(total).toBe(15);
  });

  test("includes negative bonuses arithmetically", () => {
    const race = createRaceWithFixedBonuses({ [STRENGTH]: -1 });
    const subrace = createSubraceWithFixedBonuses({ [STRENGTH]: -1 });

    const total = calculateTotalAbilityScore(
      STRENGTH,
      12,
      race,
      subrace,
      { [STRENGTH]: -1 },
      -1,
    );

    expect(total).toBe(8);
  });
});

describe("calculateTotalAbilityScore - future feat requirements (expected to fail for now)", () => {
  test("should include fixed feat bonus to an ability score", () => {
    const race = createRaceWithFixedBonuses({ [STRENGTH]: 1 });

    const total = (
      calculateTotalAbilityScore as unknown as (
        ability: Ability,
        baseScore: number,
        race: Race | null,
        subrace: SubraceData | null,
        userChosenRacialBonuses?: Partial<Record<Ability, number>>,
        totalAsiBonus?: number,
        featBonuses?: Partial<Record<Ability, number>>,
      ) => number
    )(
      STRENGTH,
      10,
      race,
      null,
      { [STRENGTH]: 1 },
      2,
      { [STRENGTH]: 1 }, // future: feat should add +1
    );

    // Expected when feats are implemented: 10 + 1 (race) + 1 (chosen) + 2 (ASI) + 1 (feat) = 15
    expect(total).toBe(15);
  });

  test("should stack multiple feat bonuses with all existing sources", () => {
    const race = createRaceWithFixedBonuses({ [DEXTERITY]: 2 });
    const subrace = createSubraceWithFixedBonuses({ [DEXTERITY]: 1 });

    const total = (
      calculateTotalAbilityScore as unknown as (
        ability: Ability,
        baseScore: number,
        race: Race | null,
        subrace: SubraceData | null,
        userChosenRacialBonuses?: Partial<Record<Ability, number>>,
        totalAsiBonus?: number,
        featBonuses?: Partial<Record<Ability, number>>,
      ) => number
    )(
      DEXTERITY,
      10,
      race,
      subrace,
      { [DEXTERITY]: 1 },
      2,
      { [DEXTERITY]: 2 }, // future: e.g., cumulative feat-granted increases
    );

    // Expected when feats are implemented: 10 + 2 + 1 + 1 + 2 + 2 = 18
    expect(total).toBe(18);
  });
});
