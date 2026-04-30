import { describe, expect, it } from "vitest";
import {
  getActionById,
  getActionsByIds,
  getAllSpells,
  getRaceById,
  getSpellByID,
  getSubracesForRace,
} from "./staticDataApi";

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
});
