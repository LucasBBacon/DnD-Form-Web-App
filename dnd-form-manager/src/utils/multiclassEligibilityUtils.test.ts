import { describe, expect, it } from "vitest";
import {
  evaluateMulticlassEligibility,
  getMulticlassAbilityRequirementOptions,
} from "./multiclassEligibilityUtils";

describe("multiclassEligibilityUtils", () => {
  it("exposes requirement options for OR-based classes", () => {
    expect(getMulticlassAbilityRequirementOptions("class_fighter")).toEqual([
      { str: 13 },
      { dex: 13 },
    ]);
  });

  it("blocks multiclassing at level 1", () => {
    const result = evaluateMulticlassEligibility({
      currentClassIds: ["class_wizard"],
      targetClassId: "class_fighter",
      currentCharacterLevel: 1,
      totalScores: { str: 14, int: 14 },
    });

    expect(result.eligible).toBe(false);
    expect(result.failures.some((failure) => failure.code === "character_level_too_low")).toBe(true);
  });

  it("blocks adding a class that already exists", () => {
    const result = evaluateMulticlassEligibility({
      currentClassIds: ["class_wizard", "class_fighter"],
      targetClassId: "class_wizard",
      currentCharacterLevel: 5,
      totalScores: { str: 14, int: 14 },
    });

    expect(result.eligible).toBe(false);
    expect(result.failures).toContainEqual({
      code: "already_has_class",
      classId: "class_wizard",
    });
  });

  it("allows fighter multiclass when dex meets the OR requirement", () => {
    const result = evaluateMulticlassEligibility({
      currentClassIds: ["class_wizard"],
      targetClassId: "class_fighter",
      currentCharacterLevel: 3,
      totalScores: { dex: 14, int: 13 },
    });

    expect(result.eligible).toBe(true);
    expect(result.failures).toEqual([]);
  });

  it("reports deterministic deficits when requirements fail", () => {
    const result = evaluateMulticlassEligibility({
      currentClassIds: ["class_paladin"],
      targetClassId: "class_warlock",
      currentCharacterLevel: 6,
      totalScores: { str: 12, cha: 11 },
    });

    expect(result.eligible).toBe(false);
    expect(result.failures).toContainEqual({
      code: "ability_score_below_minimum",
      classId: "class_paladin",
      ability: "str",
      required: 13,
      actual: 12,
    });
    expect(result.failures).toContainEqual({
      code: "ability_score_below_minimum",
      classId: "class_paladin",
      ability: "cha",
      required: 13,
      actual: 11,
    });
    expect(result.failures).toContainEqual({
      code: "ability_score_below_minimum",
      classId: "class_warlock",
      ability: "cha",
      required: 13,
      actual: 11,
    });
  });
});
