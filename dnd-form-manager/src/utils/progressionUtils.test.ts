import { describe, expect, it } from "vitest";
import {
  calculateProficiencyBonus,
  getActiveSubclassProgression,
  getMostRecentProgressionProperty,
  mergeSubclassSpecificScaling,
} from "./progressionUtils";

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
  const progression = [
    {
      level: 1,
      features: ["feature_a"],
      subclass_specific_scaling: {
        speed: 5,
        initiative_bonus: 1,
      },
    },
    {
      level: 3,
      features: ["feature_b"],
      subclass_specific_scaling: {
        speed: 10,
      },
    },
    {
      level: 7,
      features: ["feature_c"],
      subclass_specific_scaling: {
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
      entry.subclass_specific_scaling
        ? entry.subclass_specific_scaling.speed
        : undefined,
    );

    expect(result).toBe(10);
  });

  it("returns null when no progression property is found", () => {
    const result = getMostRecentProgressionProperty(progression, 1, (entry) =>
      entry.subclass_specific_scaling
        ? entry.subclass_specific_scaling.unknown_key
        : undefined,
    );

    expect(result).toBeNull();
  });
});
