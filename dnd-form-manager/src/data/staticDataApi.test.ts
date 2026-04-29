import { describe, expect, it } from "vitest";
import { getRaceById, getSubracesForRace } from "./staticDataApi";

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
