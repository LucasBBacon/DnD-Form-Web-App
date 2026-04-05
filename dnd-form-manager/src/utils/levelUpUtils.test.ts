/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLevelUpRequirements } from "./levelUpUtils";
import { MECHANIC_IDS } from "./constants";
import { getPendingSkillChoices } from "./choiceUtils";
import type { ClassData } from "../types/class";
import type { SubclassData } from "../types/subclass";

vi.mock("./choiceUtils", () => ({
  getPendingSkillChoices: vi.fn(),
}));

const createLevelData = (
  level: number,
  options?: {
    features?: string[];
    spellsKnown?: number;
    cantripsKnown?: number;
  },
) =>
  ({
    level,
    features: options?.features ?? [],
    spellcastingProgression:
      options?.spellsKnown !== undefined ||
      options?.cantripsKnown !== undefined
        ? {
            spellsKnown: options?.spellsKnown,
            cantripsKnown: options?.cantripsKnown,
          }
        : undefined,
  }) as any;

const createClassData = ({
  id = "wizard",
  subclassChoiceLevel = 3,
  progression = [],
}: {
  id?: string;
  subclassChoiceLevel?: number;
  progression?: any[];
} = {}): ClassData =>
  ({
    id,
    subclassInfo: {
      choiceLevel: subclassChoiceLevel,
    },
    progression,
  }) as ClassData;

describe("getLevelUpRequirements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPendingSkillChoices).mockReturnValue([]);
  });

  it("returns the default requirements when class data is missing", () => {
    expect(getLevelUpRequirements(2, "human", null, null, null)).toEqual({
      requiresAsiOrFeat: false,
      requiresSubclass: false,
      requiresSkillSelection: false,
      newCantripsToLearn: 0,
      newSpellsToLearn: 0,
    });
  });

  describe("subclass selection", () => {
    it("requires subclass selection when the target level matches the class subclass choice level", () => {
      const classData = createClassData({ subclassChoiceLevel: 3 });

      const result = getLevelUpRequirements(3, null, null, classData, null);

      expect(result.requiresSubclass).toBe(true);
    });

    it("does not require subclass selection when the target level does not match the subclass choice level", () => {
      const classData = createClassData({ subclassChoiceLevel: 3 });

      const result = getLevelUpRequirements(2, null, null, classData, null);

      expect(result.requiresSubclass).toBe(false);
    });
  });

  describe("skill selection", () => {
    it("requires skill selection when pending skill choices exist", () => {
      const classData = createClassData({ id: "rogue" });
      vi.mocked(getPendingSkillChoices).mockReturnValue(["stealth"] as any);

      const result = getLevelUpRequirements(
        2,
        "human",
        "variant-human",
        classData,
        null,
      );

      expect(result.requiresSkillSelection).toBe(true);
    });

    it("does not require skill selection when no pending skill choices exist", () => {
      const classData = createClassData({ id: "fighter" });
      vi.mocked(getPendingSkillChoices).mockReturnValue([]);

      const result = getLevelUpRequirements(2, "human", null, classData, null);

      expect(result.requiresSkillSelection).toBe(false);
    });

    it("passes race, subrace, class, and null subclass ids into pending skill choice resolution", () => {
      const classData = createClassData({ id: "bard" });

      getLevelUpRequirements(4, "elf", "high-elf", classData, null);

      expect(getPendingSkillChoices).toHaveBeenCalledWith(
        4,
        "elf",
        "high-elf",
        "bard",
        null,
        {},
        [],
      );
    });

    it("passes subclass id into pending skill choice resolution when subclass data exists", () => {
      const classData = createClassData({ id: "wizard" });
      const subclassData = { id: "evocation" } as SubclassData;

      getLevelUpRequirements(5, "elf", null, classData, subclassData);

      expect(getPendingSkillChoices).toHaveBeenCalledWith(
        5,
        "elf",
        null,
        "wizard",
        "evocation",
        {},
        [],
      );
    });
  });

  describe("ASI / feat choice", () => {
    it("requires ASI or feat selection when the target level includes the ASI mechanic", () => {
      const classData = createClassData({
        progression: [
          createLevelData(3),
          createLevelData(4, { features: [MECHANIC_IDS.ASI] }),
        ],
      });

      const result = getLevelUpRequirements(4, null, null, classData, null);

      expect(result.requiresAsiOrFeat).toBe(true);
    });

    it("does not require ASI or feat selection when the target level does not include ASI", () => {
      const classData = createClassData({
        progression: [createLevelData(4, { features: ["extra_attack"] })],
      });

      const result = getLevelUpRequirements(4, null, null, classData, null);

      expect(result.requiresAsiOrFeat).toBe(false);
    });

    it("does not require ASI or feat selection when the target level progression is missing", () => {
      const classData = createClassData({
        progression: [createLevelData(3, { features: [MECHANIC_IDS.ASI] })],
      });

      const result = getLevelUpRequirements(4, null, null, classData, null);

      expect(result.requiresAsiOrFeat).toBe(false);
    });
  });

  describe("spellcasting progression", () => {
    it("calculates new spells and cantrips learned from the previous level", () => {
      const classData = createClassData({
        progression: [
          createLevelData(2, { spellsKnown: 3, cantripsKnown: 2 }),
          createLevelData(3, { spellsKnown: 5, cantripsKnown: 3 }),
        ],
      });

      const result = getLevelUpRequirements(3, null, null, classData, null);

      expect(result.newSpellsToLearn).toBe(2);
      expect(result.newCantripsToLearn).toBe(1);
    });

    it("treats missing previous level spellcasting progression as zero when leveling to level 1", () => {
      const classData = createClassData({
        progression: [createLevelData(1, { spellsKnown: 2, cantripsKnown: 3 })],
      });

      const result = getLevelUpRequirements(1, null, null, classData, null);

      expect(result.newSpellsToLearn).toBe(2);
      expect(result.newCantripsToLearn).toBe(3);
    });

    it("clamps new spells and cantrips to zero when counts do not increase", () => {
      const classData = createClassData({
        progression: [
          createLevelData(4, { spellsKnown: 6, cantripsKnown: 4 }),
          createLevelData(5, { spellsKnown: 6, cantripsKnown: 3 }),
        ],
      });

      const result = getLevelUpRequirements(5, null, null, classData, null);

      expect(result.newSpellsToLearn).toBe(0);
      expect(result.newCantripsToLearn).toBe(0);
    });

    it("returns zero spell and cantrip gains when spellcasting progression is absent", () => {
      const classData = createClassData({
        progression: [createLevelData(2), createLevelData(3)],
      });

      const result = getLevelUpRequirements(3, null, null, classData, null);

      expect(result.newSpellsToLearn).toBe(0);
      expect(result.newCantripsToLearn).toBe(0);
    });
  });

  describe("combined level-up scenarios", () => {
    it("can require subclass, skills, ASI, new spells, and new cantrips all at once", () => {
      const classData = createClassData({
        id: "bard",
        subclassChoiceLevel: 3,
        progression: [
          createLevelData(2, { spellsKnown: 4, cantripsKnown: 2 }),
          createLevelData(3, {
            features: [MECHANIC_IDS.ASI, "expertise"],
            spellsKnown: 6,
            cantripsKnown: 3,
          }),
        ],
      });
      const subclassData = { id: "lore" } as SubclassData;

      vi.mocked(getPendingSkillChoices).mockReturnValue(["arcana"] as any);

      const result = getLevelUpRequirements(
        3,
        "half-elf",
        null,
        classData,
        subclassData,
      );

      expect(result).toEqual({
        requiresAsiOrFeat: true,
        requiresSubclass: true,
        requiresSkillSelection: true,
        newCantripsToLearn: 1,
        newSpellsToLearn: 2,
      });
    });

    it("still evaluates skills and subclass requirements even when target level progression data is missing", () => {
      const classData = createClassData({
        id: "rogue",
        subclassChoiceLevel: 3,
        progression: [createLevelData(2)],
      });
      vi.mocked(getPendingSkillChoices).mockReturnValue(["perception"] as any);

      const result = getLevelUpRequirements(3, "human", null, classData, null);

      expect(result.requiresSubclass).toBe(true);
      expect(result.requiresSkillSelection).toBe(true);
      expect(result.requiresAsiOrFeat).toBe(false);
      expect(result.newSpellsToLearn).toBe(0);
      expect(result.newCantripsToLearn).toBe(0);
    });
  });
});