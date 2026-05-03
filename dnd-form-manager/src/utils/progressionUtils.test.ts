import { describe, expect, it } from "vitest";
import {
  calculateMulticlassCasterLevel,
  calculateProficiencyBonus,
  getCasterLevelContribution,
  getCasterContributionType,
  getActiveSubclassProgression,
  getMostRecentProgressionProperty,
  getPactMagicSlotsForLevel,
  getSharedSpellSlotsForCasterLevel,
  mergeSubclassSpecificScaling,
} from "./progressionUtils";
import type { SubclassProgressionLevel } from "../types/subclass";

describe("calculateProficiencyBonus", () => {
  it("clamps lower values to level 1", () => {
    expect(calculateProficiencyBonus(0)).toBe(2);
  });

  it("calculates the expected bonus at key thresholds", () => {
    expect(calculateProficiencyBonus(1)).toBe(2);
    expect(calculateProficiencyBonus(5)).toBe(3);
    expect(calculateProficiencyBonus(9)).toBe(4);
    expect(calculateProficiencyBonus(13)).toBe(5);
    expect(calculateProficiencyBonus(17)).toBe(6);
  });

  it("clamps upper values to level 20", () => {
    expect(calculateProficiencyBonus(99)).toBe(6);
  });
});

describe("subclass progression helpers", () => {
  const progression: SubclassProgressionLevel[] = [
    {
      level: 1,
      features: ["feature_a"],
      subclassSpecificScaling: {
        speed: 5,
        initiative_bonus: 1,
      },
    },
    {
      level: 3,
      features: ["feature_b"],
      subclassSpecificScaling: {
        speed: 10,
      },
    },
    {
      level: 7,
      features: ["feature_c"],
      subclassSpecificScaling: {
        ac: "dex",
      },
    },
  ];

  it("returns only progression entries up to the active level", () => {
    const active = getActiveSubclassProgression(progression, 3);

    expect(active).toHaveLength(2);
    expect(active[0].level).toBe(1);
    expect(active[1].level).toBe(3);
  });

  it("merges scaling keys with latest-level precedence", () => {
    expect(mergeSubclassSpecificScaling(progression, 3)).toEqual({
      speed: 10,
      initiative_bonus: 1,
    });
  });

  it("includes higher-level keys once they unlock", () => {
    expect(mergeSubclassSpecificScaling(progression, 7)).toEqual({
      speed: 10,
      initiative_bonus: 1,
      ac: "dex",
    });
  });

  it("gets most recent progression property at or below the level", () => {
    const result = getMostRecentProgressionProperty(progression, 6, (entry) =>
      entry.subclassSpecificScaling
        ? entry.subclassSpecificScaling.speed
        : undefined,
    );

    expect(result).toBe(10);
  });

  it("returns null when no progression property is found", () => {
    const result = getMostRecentProgressionProperty(progression, 1, (entry) =>
      entry.subclassSpecificScaling
        ? entry.subclassSpecificScaling.unknown_key
        : undefined,
    );

    expect(result).toBeNull();
  });
});

describe("multiclass spellcasting helpers", () => {
  it("classifies caster contribution types correctly", () => {
    expect(
      getCasterContributionType({
        classId: "class_wizard",
        classLevel: 5,
        spellcastingBase: { ability: "int", preparationType: "prepared", ritualCasting: true },
      }),
    ).toBe("full");

    expect(
      getCasterContributionType({
        classId: "class_paladin",
        classLevel: 6,
        spellcastingBase: { ability: "cha", preparationType: "prepared", ritualCasting: false },
      }),
    ).toBe("half");

    expect(
      getCasterContributionType({
        classId: "class_fighter",
        classLevel: 7,
        spellcastingBase: { ability: "int", preparationType: "known", ritualCasting: false },
      }),
    ).toBe("third");

    expect(
      getCasterContributionType({
        classId: "class_warlock",
        classLevel: 5,
        spellcastingBase: { ability: "cha", preparationType: "pact", ritualCasting: false },
      }),
    ).toBe("none");
  });

  it("calculates caster level contribution with half and third rounding down", () => {
    expect(
      getCasterLevelContribution({
        classId: "class_wizard",
        classLevel: 3,
        spellcastingBase: { ability: "int", preparationType: "prepared", ritualCasting: true },
      }),
    ).toBe(3);

    expect(
      getCasterLevelContribution({
        classId: "class_paladin",
        classLevel: 5,
        spellcastingBase: { ability: "cha", preparationType: "prepared", ritualCasting: false },
      }),
    ).toBe(2);

    expect(
      getCasterLevelContribution({
        classId: "class_fighter",
        classLevel: 8,
        spellcastingBase: { ability: "int", preparationType: "known", ritualCasting: false },
      }),
    ).toBe(2);
  });

  it("sums multiclass effective caster level across tracks", () => {
    const effectiveLevel = calculateMulticlassCasterLevel([
      {
        classId: "class_wizard",
        classLevel: 3,
        spellcastingBase: { ability: "int", preparationType: "prepared", ritualCasting: true },
      },
      {
        classId: "class_paladin",
        classLevel: 4,
        spellcastingBase: { ability: "cha", preparationType: "prepared", ritualCasting: false },
      },
      {
        classId: "class_warlock",
        classLevel: 3,
        spellcastingBase: { ability: "cha", preparationType: "pact", ritualCasting: false },
      },
    ]);

    expect(effectiveLevel).toBe(5);
  });

  it("returns PHB shared slot table values by effective caster level", () => {
    expect(getSharedSpellSlotsForCasterLevel(0)).toEqual({});
    expect(getSharedSpellSlotsForCasterLevel(5)).toEqual({ 1: 4, 2: 3, 3: 2 });
    expect(getSharedSpellSlotsForCasterLevel(20)).toEqual({
      1: 4,
      2: 3,
      3: 3,
      4: 3,
      5: 3,
      6: 2,
      7: 2,
      8: 1,
      9: 1,
    });
  });

  it("returns pact slot progression by warlock level", () => {
    expect(getPactMagicSlotsForLevel(0)).toBeNull();
    expect(getPactMagicSlotsForLevel(3)).toEqual({ level: 2, total: 2 });
    expect(getPactMagicSlotsForLevel(17)).toEqual({ level: 5, total: 4 });
  });
});
