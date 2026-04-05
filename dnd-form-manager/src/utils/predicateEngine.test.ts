/* eslint-disable @typescript-eslint/no-explicit-any */
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
    equippedWeaponIds: [],
    choicesByLevel: {},
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
        false,
        {},
        [],
        [],
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

    it("returns false for malformed predicates and warns in dev", () => {
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

  describe("weapon_property", () => {
    it("returns false when no weapons are equipped", () => {
      const result = evaluatePredicate(
        { type: "weapon_property", target: "finesse" },
        createState(),
        createStats(),
      );

      expect(result).toBe(false);
    });

    it("returns false for a malformed predicate and warns in dev", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = evaluatePredicate(
        { type: "weapon_property", target: "   " },
        createState(),
        createStats(),
      );

      expect(result).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith(
        "Invalid weapon_property predicate: missing target property name",
        { type: "weapon_property", target: "   " },
      );
    });

    it("returns true when an equipped weapon has the target property", () => {
      vi.mocked(getItemById).mockReturnValue({
        weaponProperties: {
          category: "martial_melee",
          properties: ["finesse", "light"],
        },
      } as any);

      const result = evaluatePredicate(
        { type: "weapon_property", target: "finesse" },
        { ...createState(), equippedWeaponIds: ["item_rapier"] },
        createStats(),
      );

      expect(result).toBe(true);
    });

    it("returns false when no equipped weapons has the target property", () => {
      vi.mocked(getItemById).mockReturnValue({
        weaponProperties: {
          category: "simple_melee",
          properties: ["light"],
        },
      } as any);

      const result = evaluatePredicate(
        { type: "weapon_property", target: "finesse" },
        { ...createState(), equippedWeaponIds: ["item_club"] },
        createStats(),
      );

      expect(result).toBe(false);
    });

    it("returns true when matching the ranged token against a ranged weapon category", () => {
      vi.mocked(getItemById).mockReturnValue({
        weaponProperties: {
          category: "simple_ranged",
          properties: ["ammunition"],
        },
      } as any);

      const result = evaluatePredicate(
        { type: "weapon_property", target: "ranged" },
        { ...createState(), equippedWeaponIds: ["item_shortbow"] },
        createStats(),
      );

      expect(result).toBe(true);
    });

    it("returns true when only one of multiple equipped weapons satisfies the predicate", () => {
      vi.mocked(getItemById)
        .mockReturnValueOnce({
          weaponProperties: {
            category: "simple_melee",
            properties: ["light"],
          },
        } as any)
        .mockReturnValueOnce({
          weaponProperties: {
            category: "martial_melee",
            properties: ["finesse", "reach"],
          },
        } as any);

      const result = evaluatePredicate(
        { type: "weapon_property", target: "reach" },
        { ...createState(), equippedWeaponIds: ["item_club", "item_whip"] },
        createStats(),
      );

      expect(result).toBe(true);
    });

    it("returns false when the equipped weapon has no weaponProperties", () => {
      vi.mocked(getItemById).mockReturnValue({
        type: "gear",
      } as any);

      const result = evaluatePredicate(
        { type: "weapon_property", target: "finesse" },
        { ...createState(), equippedWeaponIds: ["item_torch"] },
        createStats(),
      );

      expect(result).toBe(false);
    });
  });

  describe("armor_prohibited", () => {
    it("returns false when the equipped armor matches the prohibited type", () => {
      vi.mocked(getItemById).mockReturnValue({
        armorProperties: { armorType: "heavy" },
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
