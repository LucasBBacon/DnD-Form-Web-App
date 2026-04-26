import { describe, expect, it } from "vitest";
import { getClassById, getRaceById } from "../data/staticDataApi";
import {
  resolveTraitSegments,
  toClassSelectionOption,
  toRaceSelectionOption,
} from "./wizardSelectionUtils";

describe("resolveTraitSegments", () => {
  it("returns placeholder segments for unresolved trait ids", () => {
    const segments = resolveTraitSegments(["trait_does_not_exist"]);

    expect(segments).toHaveLength(1);
    expect(segments[0].name).toContain("Unknown Trait");
    expect(segments[0].shortDescription).toContain("could not be resolved");
  });

  it("deduplicates trait ids while preserving a single display entry", () => {
    const segments = resolveTraitSegments([
      "trait_barbarian_proficiencies",
      "trait_barbarian_proficiencies",
    ]);

    expect(segments).toHaveLength(1);
    expect(segments[0].name).toBe("Barbarian Proficiencies");
  });
});

describe("toRaceSelectionOption", () => {
  it("maps race trait ids to wizard trait segments", () => {
    const race = getRaceById("race_dwarf");
    expect(race).not.toBeNull();

    const option = toRaceSelectionOption(race!, null);

    expect(option.id).toBe("race_dwarf");
    expect(option.name).toBe("Dwarf");
    expect(option.traits.length).toBeGreaterThan(0);
    expect(option.traits[0].name).toContain("Unknown Trait");
  });

  it("includes selected subrace traits when the subrace belongs to the race", () => {
    const race = getRaceById("race_dwarf");
    expect(race).not.toBeNull();

    const baseOption = toRaceSelectionOption(race!, null);
    const option = toRaceSelectionOption(race!, "subrace_dwarf_hill");

    expect(option.traits.length).toBeGreaterThan(baseOption.traits.length);
  });
});

describe("toClassSelectionOption", () => {
  it("maps level-1 class features to wizard trait segments", () => {
    const cls = getClassById("class_barbarian");
    expect(cls).not.toBeNull();

    const option = toClassSelectionOption(cls!);

    expect(option.id).toBe("class_barbarian");
    expect(option.tagline).toBe("Hit Die: d12");
    expect(option.traits.length).toBeGreaterThan(0);
    expect(
      option.traits.some((trait) => trait.name === "Barbarian Proficiencies"),
    ).toBe(true);
  });
});
