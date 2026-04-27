import { describe, expect, it } from "vitest";
import type { TraitData } from "../types/trait";
import {
  getPendingAbilityBonusChoicesFromTraits,
  resolveBaseSpeedFromTraits,
  resolveFixedAbilityBonusesFromTraits,
  resolveSizeFromTraits,
} from "./traitEffectResolvers";

describe("traitEffectResolvers", () => {
  it("aggregates fixed ability bonuses from active traits", () => {
    const traits: TraitData[] = [
      {
        id: "trait_a",
        name: "A",
        lore: { shortDescription: "" },
        effects: [
          { type: "ability_bonus_fixed", target: "str", value: 2 },
          { type: "ability_bonus_fixed", target: "str", value: 1, levelAvailable: 2 },
        ],
      },
      {
        id: "trait_b",
        name: "B",
        lore: { shortDescription: "" },
        effects: [{ type: "ability_bonus_fixed", target: "dex", value: 1 }],
      },
    ];

    expect(resolveFixedAbilityBonusesFromTraits(traits, 1)).toEqual({ str: 2, dex: 1 });
    expect(resolveFixedAbilityBonusesFromTraits(traits, 2)).toEqual({ str: 3, dex: 1 });
  });

  it("extracts pending ability choice grants with normalized pools", () => {
    const traits: TraitData[] = [
      {
        id: "trait_choice",
        name: "Choice",
        lore: { shortDescription: "" },
        effects: [
          {
            type: "ability_bonus_choice",
            choice: {
              count: 2,
              bonus: 1,
              pool: ["str", "dex", "not_an_ability"],
            },
          },
        ],
      },
    ];

    expect(getPendingAbilityBonusChoicesFromTraits(traits, 1)).toEqual([
      {
        sourceId: "trait_choice",
        sourceName: "Choice",
        count: 2,
        bonus: 1,
        pool: ["str", "dex"],
      },
    ]);
  });

  it("resolves base speed and ancestry size using latest active assignment", () => {
    const traits: TraitData[] = [
      {
        id: "trait_speed",
        name: "Speed",
        lore: { shortDescription: "" },
        effects: [
          { type: "stat_modifier", target: "base_speed", value: 25 },
          { type: "stat_modifier", target: "base_speed", value: 35, levelAvailable: 3 },
        ],
      },
      {
        id: "trait_size",
        name: "Size",
        lore: { shortDescription: "" },
        effects: [
          { type: "size_set", value: "small" },
          { type: "size_set", value: "medium", levelAvailable: 5 },
        ],
      },
    ];

    expect(resolveBaseSpeedFromTraits(traits, 1, 30)).toBe(25);
    expect(resolveBaseSpeedFromTraits(traits, 3, 30)).toBe(35);
    expect(resolveSizeFromTraits(traits, 1, "medium")).toBe("small");
    expect(resolveSizeFromTraits(traits, 5, "small")).toBe("medium");
  });
});
