import { beforeEach, describe, expect, it, vi } from "vitest";
import * as predicateEngine from "./predicateEngine";
import type { TraitData } from "../types/trait";
import {
  aggregateNonSkillProficiencies,
  aggregateProficiencies,
  aggregateSaveProficiencies,
  aggregateSkillProficiencies,
} from "./proficiencyAggregator";

vi.mock("./predicateEngine");

describe("proficiencyAggregator", () => {
  const state = {
    level: 14,
    choicesByLevel: {},
  } as any;
  const stats = {
    totalScores: {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10,
    },
    modifiers: {
      str: 0,
      dex: 0,
      con: 0,
      int: 0,
      wis: 0,
      cha: 0,
    },
    proficiencyBonus: 5,
    maxHp: 50,
    currentHp: 50,
    initiative: 0,
    armorClass: 10,
    isArmorPenalized: false,
    totalWeight: 0,
    isEncumbered: false,
    speed: 30,
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(predicateEngine.evaluateAllPredicates).mockReturnValue(true);
  });

  it("merges static, choice, and trait grants without duplicating the final list", () => {
    const traits: TraitData[] = [
      {
        id: "trait_duplicate_simple",
        name: "Duplicate Simple",
        lore: { shortDescription: "Simple weapons again." },
        effects: [{ type: "proficiency", target: "weapon_simple" }],
      },
    ];

    const result = aggregateProficiencies<string>({
      currentLevel: 3,
      state,
      stats,
      staticValues: ["simple"],
      choiceValuesByLevel: {
        1: ["simple", "weapon_longsword"],
      },
      traits,
      matchEffectTypes: ["proficiency"],
      mapTarget: (target) => (target === "weapon_simple" ? "simple" : target),
    });

    expect(result.list).toEqual(["simple", "weapon_longsword"]);
    expect(result.grants).toHaveLength(4);
    expect(result.has("simple")).toBe(true);
  });

  it("ignores trait grants when predicates fail", () => {
    vi.mocked(predicateEngine.evaluateAllPredicates).mockReturnValue(false);

    const result = aggregateSaveProficiencies({
      classSavingThrows: ["str"],
      currentLevel: 14,
      state,
      stats,
      traits: [
        {
          id: "trait_diamond_soul",
          name: "Diamond Soul",
          lore: { shortDescription: "All saves." },
          effects: [{ type: "save_proficiency", target: "dex" }],
        },
      ],
    });

    expect(result.list).toEqual(["str"]);
  });

  it("aggregates skill proficiencies and expertise from all configured sources", () => {
    const result = aggregateSkillProficiencies({
      chosenRacialSkills: ["perception"],
      chosenBackgroundSkills: ["stealth"],
      choicesByLevel: {
        1: { skillChoices: ["acrobatics"] },
        2: { expertiseChoices: ["stealth"] },
      },
      currentLevel: 2,
      traits: [
        {
          id: "trait_keen_senses",
          name: "Keen Senses",
          lore: { shortDescription: "Perception proficiency." },
          effects: [{ type: "proficiency", target: "insight" }],
        },
        {
          id: "trait_expertise",
          name: "Expertise",
          lore: { shortDescription: "Stealth expertise" },
          effects: [{ type: "expertise", target: "perception" }],
        },
      ],
      state,
      stats,
    });

    expect(result.proficiencies.list).toEqual([
      "perception",
      "stealth",
      "acrobatics",
      "insight",
    ]);
    expect(result.expertise.list).toEqual(["stealth", "perception"]);
  });

  it("maps save proficiency effects only for valid abilities", () => {
    const result = aggregateSaveProficiencies({
      classSavingThrows: ["str", "dex"],
      currentLevel: 14,
      state,
      stats,
      traits: [
        {
          id: "trait_diamond_soul",
          name: "Diamond Soul",
          lore: { shortDescription: "All saves." },
          effects: [
            { type: "save_proficiency", target: "wis" },
            { type: "save_proficiency", target: "not_a_save" },
          ],
        },
      ],
    });

    expect(result.list).toEqual(["str", "dex", "wis"]);
  });

  it("normalizes non-skill proficiency identifiers into stable slices", () => {
    const result = aggregateNonSkillProficiencies({
      choicesByLevel: {
        1: {
          weaponChoices: ["simple", "longsword"],
          toolChoices: ["thieves_tools"],
          languageChoices: ["elvish"],
        },
      },
      currentLevel: 1,
      state,
      stats,
      traits: [
        {
          id: "trait_fighter_proficiencies",
          name: "Fighter Proficiencies",
          lore: { shortDescription: "Armor and Martial weapons." },
          effects: [
            { type: "proficiency", target: "armor_shields" },
            { type: "proficiency", target: "weapon_martial" },
            { type: "proficiency", target: "category_artisans_tools" },
          ],
        },
      ],
    });

    expect(result.weapons.list).toEqual([
      "simple",
      "weapon_longsword",
      "martial",
    ]);
    expect(result.armor.list).toEqual(["shield"]);
    expect(result.tools.list).toEqual([
      "tool_thieves_tools",
      "category_artisans_tools",
    ]);
    expect(result.languagesAndOther.list).toEqual(["elvish"]);
  });
});
