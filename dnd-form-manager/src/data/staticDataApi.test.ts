import { describe, expect, it } from "vitest";
import {
  getActionById,
  getActionsByIds,
  getAllItemCategories,
  getAllSpells,
  getResolvedSpellDamageEntriesAtCastLevel,
  getSpellCastLevelOptions,
  getItemCategoryById,
  getItemsByCategory,
  getRaceById,
  resolveSpellDamageRollAtCastLevel,
  getSpellByID,
  getTraitById,
  getTraitsByIds,
  getSubracesForRace,
} from "./staticDataApi";
import type { SpellData } from "../types/spell";

describe("getSubracesForRace", () => {
  it("derives children from parentRaceId links", () => {
    const dwarfSubraces = getSubracesForRace("race_dwarf");

    expect(dwarfSubraces).toHaveLength(2);
    expect(dwarfSubraces.every((subrace) => subrace.parentRaceId === "race_dwarf")).toBe(true);
    expect(dwarfSubraces.map((subrace) => subrace.id).sort()).toEqual([
      "subrace_dwarf_hill",
      "subrace_dwarf_mountain",
    ]);
  });

  it("does not rely on race-level options pools", () => {
    const race = getRaceById("race_dwarf") as
      | { subraceInfo: Record<string, unknown> | null }
      | null;

    expect(race).not.toBeNull();
    expect(race?.subraceInfo).not.toBeNull();
    expect("optionsPool" in (race?.subraceInfo ?? {})).toBe(false);
  });
});

describe("Actions static API", () => {
  it("resolves an action by id", () => {
    const action = getActionById("action_breath_weapon_cold_cone");

    expect(action).not.toBeNull();
    expect(action?.name).toBe("Cold Breath");
    expect(action?.activation.actionType).toBe("action");
  });

  it("filters unresolved action ids when resolving in bulk", () => {
    const actions = getActionsByIds([
      "action_breath_weapon_cold_cone",
      "action_missing",
    ]);

    expect(actions).toHaveLength(1);
    expect(actions[0].id).toBe("action_breath_weapon_cold_cone");
  });
});

describe("Item categories static API", () => {
  it("resolves a category by id", () => {
    const category = getItemCategoryById("category_weapon_simple");

    expect(category).not.toBeNull();
    expect(category?.name).toBe("Simple Weapons");
  });

  it("returns all categories", () => {
    const categories = getAllItemCategories();

    expect(categories.length).toBeGreaterThan(0);
    expect(categories.every((c) => c.id.startsWith("category_"))).toBe(true);
  });

  it("resolves category item members to item data", () => {
    const items = getItemsByCategory("category_weapon_simple");

    expect(items.length).toBeGreaterThan(0);
    expect(items.some((item) => item.id === "item_weapon_club")).toBe(true);
  });

  it("returns empty for unknown category id", () => {
    expect(getItemsByCategory("category_missing")).toEqual([]);
  });
});

describe("Spells static API", () => {
  it("normalizes actionType into a display-safe castingTime string", () => {
    const spell = getSpellByID("spell_acid_splash");

    expect(spell).not.toBeNull();
    expect(spell?.actionType).toBe("action");
    expect(spell?.castingTime).toBe("1 action");
  });

  it("normalizes object range values into human-readable range strings", () => {
    const spells = getAllSpells();
    const rangedSpell = getSpellByID("spell_acid_splash");

    expect(rangedSpell).not.toBeNull();
    expect(rangedSpell?.range).toBe("60 feet");
    expect(typeof rangedSpell?.range).toBe("string");
    // Every spell in the array should have a string range after normalization
    expect(spells.every((s) => typeof s.range === "string")).toBe(true);
  });

  it("computes cast-level options from shared and pact slot pools", () => {
    const spell: SpellData = {
      id: "spell_test",
      name: "Test Spell",
      level: 1,
      school: "evocation",
      classes: ["class_wizard"],
      actionType: "action",
      castingTime: "1 action",
      range: "60 feet",
      duration: "Instantaneous",
      concentration: false,
      ritual: false,
      components: {
        vocal: true,
        somatic: true,
        material: false,
      },
      lore: {
        shortDescription: "test",
        fullText: "test",
      },
    };

    const options = getSpellCastLevelOptions(spell, {
      shared: {
        1: { total: 2, expended: 1 },
        2: { total: 1, expended: 0 },
      },
      pact: { level: 2, total: 2, expended: 1 },
    });

    expect(options).toEqual([
      {
        level: 1,
        canUseSharedSlot: true,
        canUsePactSlot: false,
        hasAvailableSlot: true,
      },
      {
        level: 2,
        canUseSharedSlot: true,
        canUsePactSlot: true,
        hasAvailableSlot: true,
      },
    ]);
  });

  it("resolves linear slotScaling damage rolls at higher cast levels", () => {
    const spell: SpellData = {
      id: "spell_linear",
      name: "Linear Spell",
      level: 1,
      school: "evocation",
      classes: ["class_wizard"],
      actionType: "action",
      castingTime: "1 action",
      range: "60 feet",
      duration: "Instantaneous",
      concentration: false,
      ritual: false,
      components: {
        vocal: true,
        somatic: true,
        material: false,
      },
      output: {
        damage: [
          {
            type: "fire",
            roll: "2d8",
            slotScaling: {
              mode: "linear",
              incrementPerSlotLevel: "1d8",
            },
          },
        ],
      },
      lore: {
        shortDescription: "test",
        fullText: "test",
      },
    };

    const damage = spell.output?.damage?.[0];
    expect(damage).toBeDefined();
    expect(resolveSpellDamageRollAtCastLevel(spell, damage!, 3)).toBe("4d8");
  });

  it("resolves table slotScaling damage rolls with threshold fallback", () => {
    const spell: SpellData = {
      id: "spell_table",
      name: "Table Spell",
      level: 2,
      school: "evocation",
      classes: ["class_wizard"],
      actionType: "action",
      castingTime: "1 action",
      range: "60 feet",
      duration: "Instantaneous",
      concentration: false,
      ritual: false,
      components: {
        vocal: true,
        somatic: true,
        material: false,
      },
      output: {
        damage: [
          {
            type: "fire",
            roll: "3d6",
            slotScaling: {
              mode: "table",
              bySlotLevel: {
                "3": "4d6",
                "5": "6d6",
              },
            },
          },
        ],
      },
      lore: {
        shortDescription: "test",
        fullText: "test",
      },
    };

    const resolved = getResolvedSpellDamageEntriesAtCastLevel(spell, 4);
    expect(resolved[0].roll).toBe("4d6");
  });
});

describe("Traits static API", () => {
  it("resolves a nested trait id from class/race subdirectories", () => {
    const classTrait = getTraitById("trait_barbarian_prof_armor");
    const raceTrait = getTraitById("trait_elf_speed");

    expect(classTrait).not.toBeNull();
    expect(classTrait?.name).toContain("Armor");
    expect(raceTrait).not.toBeNull();
    expect(raceTrait?.name).toContain("Speed");
  });

  it("filters unresolved trait ids when resolving in bulk", () => {
    const traits = getTraitsByIds([
      "trait_barbarian_prof_armor",
      "trait_missing",
      "trait_elf_speed",
    ]);

    expect(traits).toHaveLength(2);
    expect(traits.map((trait) => trait.id)).toEqual([
      "trait_barbarian_prof_armor",
      "trait_elf_speed",
    ]);
  });
});
