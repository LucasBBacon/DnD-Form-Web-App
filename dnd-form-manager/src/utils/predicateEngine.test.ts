import { beforeEach, describe, expect, it, vi } from "vitest";
import { getItemById } from "../data/staticDataApi";
import { getAllCharacterTraits } from "./traitUtils";
import { evaluateAllPredicates, evaluatePredicate } from "./predicateEngine";

vi.mock("../data/staticDataApi", () => ({
  getItemById: vi.fn(),
}));

vi.mock("./traitUtils", () => ({
  getAllCharacterTraits: vi.fn(),
}));

const createState = () =>
  ({
    level: 5,
    raceId: "race_elf",
    subraceId: "subrace_high_elf",
    classId: "class_wizard",
    subclassId: "subclass_evocation",
    equippedArmorId: null,
    equippedShieldId: null,
  }) as any;

const createStats = () =>
  ({
    totalScores: {
      str: 10,
      dex: 14,
      con: 12,
      int: 16,
      wis: 10,
      cha: 8,
    },
  }) as any;

describe("evaluatePredicate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAllCharacterTraits).mockReturnValue([] as any);
  });

  describe("requires_trait", () => {
    it("returns true when the derived character traits include the target id", () => {
      vi.mocked(getAllCharacterTraits).mockReturnValue([
        { id: "trait_arcane_recovery" },
        { id: "trait_spellcasting" },
      ] as any);

      const result = evaluatePredicate(
        { type: "requires_trait", target: "trait_spellcasting" },
        createState(),
        createStats(),
      );

      expect(result).toBe(true);
      expect(getAllCharacterTraits).toHaveBeenCalledWith(
        5,
        "race_elf",
        "subrace_high_elf",
        "class_wizard",
        "subclass_evocation",
      );
    });

    it("returns false when the derived character traits do not include the target id", () => {
      vi.mocked(getAllCharacterTraits).mockReturnValue([
        { id: "trait_arcane_recovery" },
      ] as any);

      const result = evaluatePredicate(
        { type: "requires_trait", target: "trait_spellcasting" },
        createState(),
        createStats(),
      );

      expect(result).toBe(false);
    });

    it("returns false for malformed predicates and warns in development", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = evaluatePredicate(
        { type: "requires_trait", target: "   " },
        createState(),
        createStats(),
      );

      expect(result).toBe(false);
      expect(getAllCharacterTraits).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        "Invalid requires_trait predicate: missing target trait id",
        { type: "requires_trait", target: "   " },
      );
    });
  });

  describe("armor_prohibited", () => {
    it("returns false when the equipped armor matches the prohibited type", () => {
      vi.mocked(getItemById).mockReturnValue({
        armor_properties: { armorType: "heavy" },
      } as any);

      const result = evaluatePredicate(
        { type: "armor_prohibited", value: "heavy" },
        {
          ...createState(),
          equippedArmorId: "item_plate_armor",
        },
        createStats(),
      );

      expect(result).toBe(false);
    });
  });
});

describe("evaluateAllPredicates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAllCharacterTraits).mockReturnValue([
      { id: "trait_spellcasting" },
    ] as any);
  });

  it("returns true only when every predicate passes", () => {
    const result = evaluateAllPredicates(
      [
        { type: "requires_trait", target: "trait_spellcasting" },
        { type: "stat_minimum", target: "int", value: 13 },
      ],
      createState(),
      createStats(),
    );

    expect(result).toBe(true);
  });

  it("returns false when requires_trait fails among multiple predicates", () => {
    const result = evaluateAllPredicates(
      [
        { type: "requires_trait", target: "trait_missing" },
        { type: "stat_minimum", target: "int", value: 13 },
      ],
      createState(),
      createStats(),
    );

    expect(result).toBe(false);
  });
});
