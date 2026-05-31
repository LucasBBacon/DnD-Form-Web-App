import { describe, expect, it } from "vitest";
import {
  getActionById,
  getActionsByIds,
  getAllItemCategories,
  getAllWeaponProperties,
  getAllSpells,
  getResolvedSpellDamageEntriesAtCastLevel,
  getResolvedSpellHealingEntriesAtCastLevel,
  getSpellCastLevelOptions,
  getItemCategoryById,
  getItemById,
  getItemsByCategory,
  getRaceById,
  resolveSpellDamageRollAtCastLevel,
  resolveSpellHealingRollAtCastLevel,
  getSpellByID,
  getWeaponPropertyById,
  getTraitById,
  getTraitsByIds,
  getSubracesForRace,
  getProseUpcastEffectsAtLevel,
  getAvailablePoolsForLevel,
  formatSpellCastConfirmation,
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

describe("Weapon properties static API", () => {
  it("resolves weapon property catalog entries by id", () => {
    const finesse = getWeaponPropertyById("property_finesse");

    expect(finesse).not.toBeNull();
    expect(finesse?.name).toBe("Finesse");
    expect(finesse?.lore.shortDescription).toContain("Dexterity");
  });

  it("returns the full weapon property catalog", () => {
    const properties = getAllWeaponProperties();

    expect(properties.map((property) => property.id)).toContain(
      "property_reach",
    );
  });

  it("exposes normalized compiled weapon data", () => {
    const dagger = getItemById("item_weapon_dagger");

    expect(dagger?.weaponProperties?.propertyIds).toEqual([
      "property_finesse",
      "property_light",
      "property_thrown",
    ]);
    expect(dagger?.weaponProperties?.properties.map((property) => property.name)).toEqual([
      "Finesse",
      "Light",
      "Thrown",
    ]);
    expect(dagger?.weaponProperties?.rules).toMatchObject({
      attackAbility: "choice",
      meleeReachFeet: 5,
      thrownRange: { normal: 20, long: 60 },
      requiresAmmunition: false,
      finesse: true,
      light: true,
    });
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

  it("resolves linear slotScaling healing rolls at higher cast levels", () => {
    const spell: SpellData = {
      id: "spell_healing_linear",
      name: "Linear Healing Spell",
      level: 1,
      school: "evocation",
      classes: ["class_cleric"],
      actionType: "action",
      castingTime: "1 action",
      range: "Touch",
      duration: "Instantaneous",
      concentration: false,
      ritual: false,
      components: {
        vocal: true,
        somatic: true,
        material: false,
      },
      output: {
        healing: [
          {
            roll: "1d8",
            addModifier: true,
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

    const healing = spell.output?.healing?.[0];
    expect(healing).toBeDefined();
    expect(resolveSpellHealingRollAtCastLevel(spell, healing!, 3)).toBe("3d8");
  });

  it("resolves table slotScaling healing rolls with threshold fallback", () => {
    const spell: SpellData = {
      id: "spell_healing_table",
      name: "Table Healing Spell",
      level: 2,
      school: "evocation",
      classes: ["class_cleric"],
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
        healing: [
          {
            roll: "2d4",
            slotScaling: {
              mode: "table",
              bySlotLevel: {
                "3": "3d4",
                "5": "5d4",
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

    const resolved = getResolvedSpellHealingEntriesAtCastLevel(spell, 4);
    expect(resolved[0].roll).toBe("3d4");
  });

  it("preserves migrated slotScaling data for thunderwave and resolves upcast damage", () => {
    const spell = getSpellByID("spell_thunderwave");

    expect(spell).not.toBeNull();
    expect(spell?.output?.damage?.[0].slotScaling).toEqual({
      mode: "linear",
      incrementPerSlotLevel: "1d8",
    });
    expect(getResolvedSpellDamageEntriesAtCastLevel(spell!, 3)[0].roll).toBe(
      "4d8",
    );
  });

  it("hydrates newly-modeled damage output for spirit guardians", () => {
    const spell = getSpellByID("spell_spirit_guardians");

    expect(spell).not.toBeNull();
    expect(spell?.output?.damage?.[0].roll).toBe("3d8");
    expect(getResolvedSpellDamageEntriesAtCastLevel(spell!, 5)[0].roll).toBe(
      "5d8",
    );
  });

  it("hydrates flaming sphere damage and resolves linear upcast damage", () => {
    const spell = getSpellByID("spell_flaming_sphere");

    expect(spell).not.toBeNull();
    expect(spell?.output?.damage?.[0].roll).toBe("2d6");
    expect(getResolvedSpellDamageEntriesAtCastLevel(spell!, 4)[0].roll).toBe(
      "4d6",
    );
  });

  it("resolves ice storm upcast scaling only on the bludgeoning damage entry", () => {
    const spell = getSpellByID("spell_ice_storm");

    expect(spell).not.toBeNull();
    const resolved = getResolvedSpellDamageEntriesAtCastLevel(spell!, 6);
    expect(resolved[0].roll).toBe("4d8");
    expect(resolved[1].roll).toBe("4d6");
  });

  it("hydrates insect plague damage and resolves linear upcast damage", () => {
    const spell = getSpellByID("spell_insect_plague");

    expect(spell).not.toBeNull();
    expect(spell?.output?.damage?.[0].roll).toBe("4d10");
    expect(getResolvedSpellDamageEntriesAtCastLevel(spell!, 7)[0].roll).toBe(
      "6d10",
    );
  });

  it("preserves flame strike multi-entry slotScaling metadata for both damage types", () => {
    const spell = getSpellByID("spell_flame_strike");

    expect(spell).not.toBeNull();
    expect(spell?.output?.damage).toHaveLength(2);
    expect(spell?.output?.damage?.[0].slotScaling).toEqual({
      mode: "linear",
      incrementPerSlotLevel: "1d6",
    });
    expect(spell?.output?.damage?.[1].slotScaling).toEqual({
      mode: "linear",
      incrementPerSlotLevel: "1d6",
    });
  });

  it("hydrates cure wounds healing output with linear slot scaling", () => {
    const spell = getSpellByID("spell_cure_wounds");

    expect(spell).not.toBeNull();
    expect(spell?.output?.healing?.[0]).toEqual({
      roll: "1d8",
      addModifier: true,
      scaling: {
        type: "spell_slot",
      },
      slotScaling: {
        mode: "linear",
        incrementPerSlotLevel: "1d8",
      },
    });
    expect(getResolvedSpellHealingEntriesAtCastLevel(spell!, 3)[0].roll).toBe(
      "3d8",
    );
  });

  it("hydrates healing word healing output with linear slot scaling", () => {
    const spell = getSpellByID("spell_healing_word");

    expect(spell).not.toBeNull();
    expect(spell?.output?.healing?.[0]).toEqual({
      roll: "1d4",
      addModifier: true,
      scaling: {
        type: "spell_slot",
      },
      slotScaling: {
        mode: "linear",
        incrementPerSlotLevel: "1d4",
      },
    });
    expect(getResolvedSpellHealingEntriesAtCastLevel(spell!, 4)[0].roll).toBe(
      "4d4",
    );
  });

  it("hydrates mass cure wounds healing output with linear slot scaling", () => {
    const spell = getSpellByID("spell_mass_cure_wounds");

    expect(spell).not.toBeNull();
    expect(spell?.output?.healing?.[0]).toEqual({
      roll: "3d8",
      addModifier: true,
      scaling: {
        type: "spell_slot",
      },
      slotScaling: {
        mode: "linear",
        incrementPerSlotLevel: "1d8",
      },
    });
    expect(getResolvedSpellHealingEntriesAtCastLevel(spell!, 7)[0].roll).toBe(
      "5d8",
    );
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

describe("getAvailablePoolsForLevel", () => {
  it("returns available pools when both have slots", () => {
    const result = getAvailablePoolsForLevel(
      3, // spellLevel
      {}, // no expended slots
      5, // max shared slots
      0, // no expended pact slots
      3, // max pact slots
    );

    expect(result.canUseShared).toBe(true);
    expect(result.canUsePact).toBe(true);
    expect(result.availablePools).toEqual(["shared", "pact"]);
  });

  it("returns only shared pool when pact slots are exhausted", () => {
    const result = getAvailablePoolsForLevel(
      3,
      {},
      5,
      3, // all pact slots expended
      3,
    );

    expect(result.canUseShared).toBe(true);
    expect(result.canUsePact).toBe(false);
    expect(result.availablePools).toEqual(["shared"]);
  });

  it("returns no pools when both are exhausted", () => {
    const result = getAvailablePoolsForLevel(
      3,
      { 3: 5 }, // all shared slots expended
      5,
      3, // all pact slots expended
      3,
    );

    expect(result.canUseShared).toBe(false);
    expect(result.canUsePact).toBe(false);
    expect(result.availablePools).toEqual([]);
  });
});

describe("formatSpellCastConfirmation", () => {
  it("formats a cantrip cast without slot info", () => {
    const message = formatSpellCastConfirmation("Fire Bolt", 0, 0, null, 0);
    expect(message).toBe("Cast Fire Bolt");
  });

  it("formats a base-level spell cast with shared slot", () => {
    const message = formatSpellCastConfirmation(
      "Fireball",
      3,
      3,
      "shared",
      4,
    );
    expect(message).toBe(
      "Cast Fireball using Shared Slot (4 slots remain)",
    );
  });

  it("formats an upcasted spell with pact slot", () => {
    const message = formatSpellCastConfirmation(
      "Fireball",
      3,
      5,
      "pact",
      2,
    );
    expect(message).toBe(
      "Cast Fireball at 5th level using Pact Slot (2 slots remain)",
    );
  });

  it("handles singular 'slot' correctly", () => {
    const message = formatSpellCastConfirmation(
      "Magic Missile",
      1,
      1,
      "shared",
      1,
    );
    expect(message).toBe(
      "Cast Magic Missile using Shared Slot (1 slot remains)",
    );
  });
});

describe('getProseUpcastEffectsAtLevel', () => {
    it('should return prose upcast effects for the given level', () => {
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
            proseUpcastEffects: [
                { level: 3, description: 'You create one additional ray.' },
                { level: 4, description: 'You create two additional rays.' }
            ]
        };

        expect(getProseUpcastEffectsAtLevel(spell, 3)).toEqual([
            { level: 3, description: 'You create one additional ray.' }
        ]);

        expect(getProseUpcastEffectsAtLevel(spell, 4)).toEqual([
            { level: 3, description: 'You create one additional ray.' },
            { level: 4, description: 'You create two additional rays.' }
        ]);
    });

    it('should return an empty array if no effects are available for the level', () => {
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
            proseUpcastEffects: [
                { level: 3, description: 'You create one additional ray.' }
            ]
        };

        expect(getProseUpcastEffectsAtLevel(spell, 2)).toEqual([]);
    });
});
