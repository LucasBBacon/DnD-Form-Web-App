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
    equippedArmorInstanceId: null,
    equippedShieldInstanceId: null,
    equippedWeaponInstanceIds: [],
    inventoryInstances: [],
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

const makeProperty = (id: string, name: string) => ({
  id,
  name,
  lore: {
    shortDescription: `${name} property`,
    fullText: `${name} property`,
  },
});

const makeWeaponProperties = (
  category: string,
  propertyIds: string[],
  overrides: Partial<Record<string, unknown>> = {},
) => ({
  category,
  damageDice: "1d6",
  damageType: "slashing",
  properties: propertyIds.map((id) => makeProperty(id, id.replace(/^property_/, "").replace(/_/g, " "))),
  propertyIds,
  range: "5 ft",
  rules: {
    attackAbility: category.includes("ranged") ? "dex" : propertyIds.includes("property_finesse") ? "choice" : "str",
    isRangedWeapon: category.includes("ranged"),
    meleeReachFeet: propertyIds.includes("property_reach") ? 10 : 5,
    range: category.includes("ranged") ? { normal: 5 } : undefined,
    thrownRange: propertyIds.includes("property_thrown") && !category.includes("ranged") ? { normal: 20, long: 60 } : undefined,
    requiresAmmunition: propertyIds.includes("property_ammunition"),
    loading: propertyIds.includes("property_loading"),
    light: propertyIds.includes("property_light"),
    heavy: propertyIds.includes("property_heavy"),
    twoHanded: propertyIds.includes("property_two_handed"),
    special: propertyIds.includes("property_special"),
    finesse: propertyIds.includes("property_finesse"),
    versatile: propertyIds.includes("property_versatile"),
    ...overrides,
  },
});

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
        weaponProperties: makeWeaponProperties("martial_melee", [
          "property_finesse",
          "property_light",
        ]),
      } as any);

      const result = evaluatePredicate(
        { type: "weapon_property", target: "finesse" },
        {
          ...createState(),
          equippedWeaponInstanceIds: ["inst-rapier"],
          inventoryInstances: [{ instanceId: "inst-rapier", baseItemId: "item_rapier" }],
        },
        createStats(),
      );

      expect(result).toBe(true);
    });

    it("returns false when no equipped weapons has the target property", () => {
      vi.mocked(getItemById).mockReturnValue({
        weaponProperties: makeWeaponProperties("simple_melee", ["property_light"]),
      } as any);

      const result = evaluatePredicate(
        { type: "weapon_property", target: "finesse" },
        {
          ...createState(),
          equippedWeaponInstanceIds: ["inst-club"],
          inventoryInstances: [{ instanceId: "inst-club", baseItemId: "item_club" }],
        },
        createStats(),
      );

      expect(result).toBe(false);
    });

    it("returns true when matching the ranged token against a ranged weapon category", () => {
      vi.mocked(getItemById).mockReturnValue({
        weaponProperties: makeWeaponProperties("simple_ranged", [
          "property_ammunition",
          "property_range",
        ]),
      } as any);

      const result = evaluatePredicate(
        { type: "weapon_property", target: "ranged" },
        {
          ...createState(),
          equippedWeaponInstanceIds: ["inst-shortbow"],
          inventoryInstances: [{ instanceId: "inst-shortbow", baseItemId: "item_shortbow" }],
        },
        createStats(),
      );

      expect(result).toBe(true);
    });

    it("returns true when only one of multiple equipped weapons satisfies the predicate", () => {
      vi.mocked(getItemById)
        .mockReturnValueOnce({
          weaponProperties: makeWeaponProperties("simple_melee", ["property_light"]),
        } as any)
        .mockReturnValueOnce({
          weaponProperties: makeWeaponProperties("martial_melee", [
            "property_finesse",
            "property_reach",
          ]),
        } as any);

      const result = evaluatePredicate(
        { type: "weapon_property", target: "reach" },
        {
          ...createState(),
          equippedWeaponInstanceIds: ["inst-club", "inst-whip"],
          inventoryInstances: [
            { instanceId: "inst-club", baseItemId: "item_club" },
            { instanceId: "inst-whip", baseItemId: "item_whip" },
          ],
        },
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
        {
          ...createState(),
          equippedWeaponInstanceIds: ["inst-torch"],
          inventoryInstances: [{ instanceId: "inst-torch", baseItemId: "item_torch" }],
        },
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
          equippedArmorInstanceId: "inst-plate",
          inventoryInstances: [{ instanceId: "inst-plate", baseItemId: "item_plate_armor" }],
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
