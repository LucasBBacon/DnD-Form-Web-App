/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAttacks } from "./useAttacks";
import { useCharacterStore } from "../store/useCharacterStore";
import { useCharacterStats } from "./useCharacterStats";
import { getAllItemCategories, getItemById } from "../data/staticDataApi";
import {
  aggregateNonSkillProficienciesMulticlass,
  isWeaponProficient,
} from "../utils/proficiencyAggregator";
import { getAllCharacterTraits } from "../utils/traitUtils";
import { resolveSizeFromTraits } from "../utils/traitEffectResolvers";

vi.mock("../store/useCharacterStore");
vi.mock("./useCharacterStats");
vi.mock("../data/staticDataApi");
vi.mock("../utils/proficiencyAggregator");
vi.mock("../utils/traitUtils");
vi.mock("../utils/traitEffectResolvers");

describe("useAttacks thrown weapon behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCharacterStore).mockReturnValue({
      level: 3,
      raceId: null,
      subraceId: null,
      classId: "class_fighter",
      subclassId: null,
      choicesByLevel: {},
      acquiredFeats: [],
      classTracks: [],
      attunedInstanceIds: [],
      equippedWeaponInstanceIds: [],
      inventoryInstances: [],
      inventoryStacks: [],
    } as any);

    vi.mocked(useCharacterStats).mockReturnValue({
      abilities: {
        scores: { str: 14, dex: 16, con: 12, int: 10, wis: 10, cha: 8 },
        modifiers: { str: 2, dex: 3, con: 1, int: 0, wis: 0, cha: -1 },
      },
      combat: {
        proficiencyBonus: 2,
        hp: { max: 24, current: 24 },
        initiative: 3,
        armorClass: 14,
        isArmorPenalized: false,
        armorStealthDisadvantage: false,
        speed: 30,
      },
      encumbrance: {
        totalWeight: 0,
        isEncumbered: false,
      },
    } as any);

    vi.mocked(getAllCharacterTraits).mockReturnValue([] as any);
    vi.mocked(resolveSizeFromTraits).mockReturnValue("medium");

    vi.mocked(aggregateNonSkillProficienciesMulticlass).mockReturnValue({
      weapons: {
        has: () => true,
      },
    } as any);
    vi.mocked(isWeaponProficient).mockReturnValue(true);

    vi.mocked(getAllItemCategories).mockReturnValue([
      {
        id: "category_weapon_simple_melee",
        itemIds: ["weapon_dagger", "weapon_javelin"],
      },
    ] as any);
  });

  it("creates thrown variant for equipped thrown weapon with throwable count", () => {
    vi.mocked(useCharacterStore).mockReturnValue({
      ...vi.mocked(useCharacterStore).getMockImplementation?.(),
      level: 3,
      raceId: null,
      subraceId: null,
      classId: "class_fighter",
      subclassId: null,
      choicesByLevel: {},
      acquiredFeats: [],
      classTracks: [],
      attunedInstanceIds: [],
      equippedWeaponInstanceIds: ["instance-dagger-equipped"],
      inventoryInstances: [
        { instanceId: "instance-dagger-equipped", baseItemId: "weapon_dagger" },
        { instanceId: "instance-dagger-spare", baseItemId: "weapon_dagger" },
      ],
      inventoryStacks: [
        {
          stackId: "stack-dagger",
          baseItemId: "weapon_dagger",
          quantity: 2,
        },
      ],
    } as any);

    vi.mocked(getItemById).mockImplementation((id: string | null) => {
      if (id !== "weapon_dagger") return null;
      return {
        id: "weapon_dagger",
        name: "Dagger",
        weaponProperties: {
          category: "simple_melee",
          damageDice: "1d4",
          damageType: "piercing",
          range: "Melee",
          propertyIds: ["property_finesse", "property_light", "property_thrown"],
          properties: [],
          rules: {
            attackAbility: "choice",
            isRangedWeapon: false,
            meleeReachFeet: 5,
            thrownRange: { normal: 20, long: 60 },
          },
        },
      } as any;
    });

    const { result } = renderHook(() => useAttacks());
    const thrown = result.current.attacks.find(
      (attack) => attack.weaponId === "weapon_dagger" && attack.isThrown,
    );

    expect(thrown).toBeDefined();
    expect(thrown?.name).toBe("Dagger [Thrown]");
    expect(thrown?.throwableItemId).toBe("weapon_dagger");
    expect(thrown?.throwableCount).toBe(4);
    expect(thrown?.canAttack).toBe(true);
  });

  it("creates attack entries for stack-only thrown weapons", () => {
    vi.mocked(useCharacterStore).mockReturnValue({
      level: 3,
      raceId: null,
      subraceId: null,
      classId: "class_fighter",
      subclassId: null,
      choicesByLevel: {},
      acquiredFeats: [],
      classTracks: [],
      attunedInstanceIds: [],
      equippedWeaponInstanceIds: [],
      inventoryInstances: [],
      inventoryStacks: [
        {
          stackId: "stack-javelin",
          baseItemId: "weapon_javelin",
          quantity: 3,
        },
      ],
    } as any);

    vi.mocked(getItemById).mockImplementation((id: string | null) => {
      if (id !== "weapon_javelin") return null;
      return {
        id: "weapon_javelin",
        name: "Javelin",
        weaponProperties: {
          category: "simple_melee",
          damageDice: "1d6",
          damageType: "piercing",
          range: "Melee",
          propertyIds: ["property_thrown"],
          properties: [],
          rules: {
            attackAbility: "str",
            isRangedWeapon: false,
            meleeReachFeet: 5,
            thrownRange: { normal: 30, long: 120 },
          },
        },
      } as any;
    });

    const { result } = renderHook(() => useAttacks());
    const thrown = result.current.attacks.find(
      (attack) => attack.weaponId === "weapon_javelin" && attack.isThrown,
    );

    expect(thrown).toBeDefined();
    expect(thrown?.instanceId).toBeNull();
    expect(thrown?.name).toBe("Javelin [Thrown]");
    expect(thrown?.range).toBe("30/120 ft");
    expect(thrown?.throwableItemId).toBe("weapon_javelin");
    expect(thrown?.throwableCount).toBe(3);
    expect(thrown?.canAttack).toBe(true);
  });
});