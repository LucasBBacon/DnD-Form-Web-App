import { describe, expect, it } from "vitest";
import type { LevelChoice } from "../types/progression";
import {
  getSelectedProficiencyChoices,
  getSelectedSkillChoices,
  resolveSkillChoicePool,
} from "./choiceUtils";

describe("resolveSkillChoicePool", () => {
  it("expands the any sentinel into the full skill list", () => {
    const resolvedPool = resolveSkillChoicePool("any");

    expect(resolvedPool).toContain("perception");
    expect(resolvedPool).toContain("stealth");
    expect(resolvedPool.length).toBeGreaterThan(0);
  });

  it("returns explicit pools unchanged", () => {
    const pool = ["arcana", "history"] as const;

    expect(resolveSkillChoicePool([...pool])).toEqual(pool);
  });
});

describe("getSelectedSkillChoices", () => {
  it("aggregates skill and expertise choices up to the current level", () => {
    const choicesByLevel: Record<number, LevelChoice> = {
      1: {
        skillChoices: ["arcana", "history"],
      },
      2: {
        expertiseChoices: ["arcana"],
      },
      4: {
        skillChoices: ["history", "investigation"],
        expertiseChoices: ["investigation"],
      },
    };

    expect(getSelectedSkillChoices(choicesByLevel, 3)).toEqual({
      skillChoices: ["arcana", "history"],
      expertiseChoices: ["arcana"],
    });

    expect(getSelectedSkillChoices(choicesByLevel, 4)).toEqual({
      skillChoices: ["arcana", "history", "investigation"],
      expertiseChoices: ["arcana", "investigation"],
    });
  });
});

describe("getSelectedProficiencyChoices", () => {
  it("aggregates weapon, tool, and language choices up to the current level", () => {
    const choicesByLevel: Record<number, LevelChoice> = {
      1: {
        weaponChoices: ["simple"],
        toolChoices: ["thieves_tools"],
      },
      2: {
        weaponChoices: ["longsword", "simple"],
        languageChoices: ["elvish"],
      },
      5: {
        toolChoices: ["alchemists_supplies"],
        languageChoices: ["elvish", "draconic"],
      },
    };

    expect(getSelectedProficiencyChoices(choicesByLevel, 2)).toEqual({
      weaponChoices: ["simple", "longsword"],
      toolChoices: ["thieves_tools"],
      languageChoices: ["elvish"],
    });

    expect(getSelectedProficiencyChoices(choicesByLevel, 5)).toEqual({
      weaponChoices: ["simple", "longsword"],
      toolChoices: ["thieves_tools", "alchemists_supplies"],
      languageChoices: ["elvish", "draconic"],
    });
  });
});
