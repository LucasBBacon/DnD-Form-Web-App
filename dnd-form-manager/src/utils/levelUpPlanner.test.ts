import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEmptyDraft } from "../types/levelUpDraft";
import type { ClassData } from "../types/class";
import { buildLevelUpPlan } from "./levelUpPlanner";

vi.mock("./levelUpUtils", () => ({
  getLevelUpRequirements: vi.fn(),
}));

vi.mock("./choiceUtils", () => ({
  getPendingProficiencyChoices: vi.fn(),
  getPendingFeatureChoices: vi.fn(),
}));

import { getLevelUpRequirements } from "./levelUpUtils";
import { getPendingFeatureChoices, getPendingProficiencyChoices } from "./choiceUtils";

const mockedGetLevelUpRequirements = vi.mocked(getLevelUpRequirements);
const mockedGetPendingProficiencyChoices = vi.mocked(getPendingProficiencyChoices);
const mockedGetPendingFeatureChoices = vi.mocked(getPendingFeatureChoices);

const TEST_CLASS: ClassData = {
  id: "class_wizard",
  name: "Wizard",
  hitDie: 6,
  startingEquipment: {
    given: [],
    choices: [],
  },
  subclassInfo: {
    displayLabel: "Arcane Tradition",
    choiceLevel: 2,
    optionsPool: "",
  },
  progression: [],
  lore: {
    shortDescription: "",
  },
};

describe("levelUpPlanner", () => {
  beforeEach(() => {
    mockedGetPendingFeatureChoices.mockReturnValue([]);
  });

  it("fails completion when per-source proficiency choices are incomplete", () => {
    mockedGetLevelUpRequirements.mockReturnValue({
      requiresAsiOrFeat: false,
      requiresSubclass: false,
      requiresProficiencySelection: true,
      requiresSkillSelection: true,
      newCantripsToLearn: 0,
      newSpellsToLearn: 0,
    });

    mockedGetPendingProficiencyChoices.mockReturnValue([
      {
        sourceId: "trait_skill_pick",
        sourceName: "Skilled Training",
        category: "skills",
        count: 2,
        pool: ["athletics", "arcana", "history"],
      },
    ]);

    const draft = createEmptyDraft();
    draft.targetClassId = "class_wizard";
    draft.hpGained = 4;
    draft.proficiencySelectionsBySource = {
      "skills:trait_skill_pick": ["athletics"],
    };
    draft.skillChoices = ["athletics"];

    const plan = buildLevelUpPlan({
      targetTotalLevel: 2,
      raceId: null,
      subraceId: null,
      classData: TEST_CLASS,
      subclassData: null,
      classLevel: 2,
      choicesByLevel: {},
      classTracks: [],
      draft,
    });

    expect(plan.isComplete).toBe(false);
    expect(plan.completionErrors.some((error) => error.includes("Skilled Training"))).toBe(true);
  });

  it("passes when per-source proficiency and spell selections are complete", () => {
    mockedGetLevelUpRequirements.mockReturnValue({
      requiresAsiOrFeat: false,
      requiresSubclass: false,
      requiresProficiencySelection: true,
      requiresSkillSelection: true,
      newCantripsToLearn: 1,
      newSpellsToLearn: 1,
    });

    mockedGetPendingProficiencyChoices.mockReturnValue([
      {
        sourceId: "trait_skill_pick",
        sourceName: "Skilled Training",
        category: "skills",
        count: 1,
        pool: ["athletics", "arcana"],
      },
      {
        sourceId: "trait_tool_pick",
        sourceName: "Tool Training",
        category: "tools",
        count: 1,
        pool: ["thieves_tools"],
      },
    ]);

    const draft = createEmptyDraft();
    draft.targetClassId = "class_wizard";
    draft.hpGained = 4;
    draft.proficiencySelectionsBySource = {
      "skills:trait_skill_pick": ["arcana"],
      "tools:trait_tool_pick": ["thieves_tools"],
    };
    draft.skillChoices = ["arcana"];
    draft.toolChoices = ["thieves_tools"];
    draft.cantripsLearned = ["spell_acid_splash"];
    draft.spellsLearned = ["spell_animal_friendship"];

    const plan = buildLevelUpPlan({
      targetTotalLevel: 2,
      raceId: null,
      subraceId: null,
      classData: TEST_CLASS,
      subclassData: null,
      classLevel: 2,
      choicesByLevel: {},
      classTracks: [],
      draft,
    });

    expect(plan.isComplete).toBe(true);
    expect(plan.completionErrors).toEqual([]);
  });

  it("flags duplicate spells even when counts match", () => {
    mockedGetLevelUpRequirements.mockReturnValue({
      requiresAsiOrFeat: false,
      requiresSubclass: false,
      requiresProficiencySelection: false,
      requiresSkillSelection: false,
      newCantripsToLearn: 0,
      newSpellsToLearn: 2,
    });

    mockedGetPendingProficiencyChoices.mockReturnValue([]);

    const draft = createEmptyDraft();
    draft.targetClassId = "class_wizard";
    draft.hpGained = 4;
    draft.spellsLearned = ["spell_bane", "spell_bane"];

    const plan = buildLevelUpPlan({
      targetTotalLevel: 2,
      raceId: null,
      subraceId: null,
      classData: TEST_CLASS,
      subclassData: null,
      classLevel: 2,
      choicesByLevel: {},
      classTracks: [],
      draft,
    });

    expect(plan.isComplete).toBe(false);
    expect(plan.completionErrors).toContain("Duplicate spell selections are not allowed.");
  });

  it("adds feature choice step and blocks completion until custom choice is selected", () => {
    mockedGetLevelUpRequirements.mockReturnValue({
      requiresAsiOrFeat: false,
      requiresSubclass: false,
      requiresProficiencySelection: false,
      requiresSkillSelection: false,
      newCantripsToLearn: 0,
      newSpellsToLearn: 0,
    });

    mockedGetPendingProficiencyChoices.mockReturnValue([]);
    mockedGetPendingFeatureChoices.mockReturnValue([
      {
        sourceId: "trait_cantrip:spell_grant:0",
        sourceName: "Cantrip",
        effectType: "spell_grant",
        count: 1,
        pool: ["spell_acid_splash", "spell_light"],
        allowCustomValue: false,
      },
    ]);

    const draft = createEmptyDraft();
    draft.targetClassId = "class_wizard";
    draft.hpGained = 4;

    const incompletePlan = buildLevelUpPlan({
      targetTotalLevel: 2,
      raceId: null,
      subraceId: null,
      classData: TEST_CLASS,
      subclassData: null,
      classLevel: 2,
      choicesByLevel: {},
      classTracks: [],
      draft,
    });

    expect(incompletePlan.orderedSteps).toContain("feature_choice");
    expect(incompletePlan.isComplete).toBe(false);

    draft.featureChoices = {
      "trait_cantrip:spell_grant:0": "spell_light",
    };

    const completePlan = buildLevelUpPlan({
      targetTotalLevel: 2,
      raceId: null,
      subraceId: null,
      classData: TEST_CLASS,
      subclassData: null,
      classLevel: 2,
      choicesByLevel: {},
      classTracks: [],
      draft,
    });

    expect(completePlan.isComplete).toBe(true);
  });
});
