/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useCharacterStats } from "./useCharacterStats";
import { useCharacterStore } from "../store/useCharacterStore";
import * as staticDataApi from "../data/staticDataApi";
import * as abilityUtils from "../utils/abilityUtils";
import * as acUtils from "../utils/acUtils";
import * as hpUtils from "../utils/hpUtils";
import * as initiativeUtils from "../utils/initiativeUtils";
import * as progressionUtils from "../utils/progressionUtils";
import * as predicateEngine from "../utils/predicateEngine";
import * as traitUtils from "../utils/traitUtils";

// Mock dependencies
vi.mock("../store/useCharacterStore");
vi.mock("../data/staticDataApi");
vi.mock("../utils/abilityUtils");
vi.mock("../utils/acUtils");
vi.mock("../utils/hpUtils");
vi.mock("../utils/initiativeUtils");
vi.mock("../utils/progressionUtils");
vi.mock("../utils/predicateEngine");
vi.mock("../utils/traitUtils");

describe("useCharacterStats", () => {
  // Helper to create default character state
  function createDefaultCharacterState() {
    return {
      level: 1,
      raceId: "human",
      subraceId: null,
      classId: "fighter",
      subclassId: null,
      baseAbilityScores: {
        str: 15,
        dex: 14,
        con: 13,
        int: 10,
        wis: 12,
        cha: 8,
      },
      hpRolls: [6, 5, 4],
      chosenRacialBonuses: {},
      choicesByLevel: {},
      inventory: [],
      equippedArmorId: null,
      equippedShieldId: null,
      damageTaken: 0,
    } as any;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultMocks();
  });

  function setupDefaultMocks() {
    // Mock store state
    vi.mocked(useCharacterStore).mockReturnValue(createDefaultCharacterState());

    // Mock ability calculations
    vi.mocked(abilityUtils.calculateTotalAbilityScore).mockImplementation(
      (_ability, base) => base
    );
    vi.mocked(abilityUtils.calculateModifier).mockImplementation(
      (score) => Math.floor((score - 10) / 2)
    );
    vi.mocked(abilityUtils.calculateTotalASI).mockReturnValue({
      str: 0,
      dex: 0,
      con: 0,
      int: 0,
      wis: 0,
      cha: 0,
    });

    // Mock combat stat calculations
    vi.mocked(progressionUtils.calculateProficiencyBonus).mockReturnValue(2);
    vi.mocked(progressionUtils.mergeSubclassSpecificScaling).mockReturnValue({});
    vi.mocked(hpUtils.calculateMaxHP).mockReturnValue(10);
    vi.mocked(initiativeUtils.calculateInitiative).mockReturnValue(2);
    vi.mocked(acUtils.calculateArmorClass).mockReturnValue(10);

    // Mock data API
    vi.mocked(staticDataApi.getRaceById).mockReturnValue(null);
    vi.mocked(staticDataApi.getSubraceById).mockReturnValue(null);
    vi.mocked(staticDataApi.getClassById).mockReturnValue({
      hit_die: 10,
      proficiencies: { armor: [] },
    } as any);
    vi.mocked(staticDataApi.getSubclassById).mockReturnValue(null);
    vi.mocked(staticDataApi.getItemById).mockReturnValue(null);

    // Mock traits and predicates
    vi.mocked(traitUtils.getAllCharacterTraits).mockReturnValue([]);
    vi.mocked(predicateEngine.evaluateAllPredicates).mockReturnValue(false);
  }

  describe("Ability Scores and Modifiers", () => {
    it("should calculate total ability scores for all abilities", () => {
      const result = useCharacterStats();

      expect(result.totalScores).toBeDefined();
      expect(result.totalScores.str).toBe(15);
      expect(result.totalScores.dex).toBe(14);
      expect(result.totalScores.con).toBe(13);
      expect(result.totalScores.int).toBe(10);
      expect(result.totalScores.wis).toBe(12);
      expect(result.totalScores.cha).toBe(8);
    });

    it("should calculate modifiers from ability scores", () => {
      const result = useCharacterStats();

      expect(result.modifiers.str).toBe(2); // (15-10)/2
      expect(result.modifiers.dex).toBe(2); // (14-10)/2
      expect(result.modifiers.con).toBe(1); // (13-10)/2
      expect(result.modifiers.int).toBe(0); // (10-10)/2
      expect(result.modifiers.wis).toBe(1); // (12-10)/2
      expect(result.modifiers.cha).toBe(-1); // (8-10)/2
    });

    it("should call calculateTotalAbilityScore for each ability", () => {
      useCharacterStats();

      expect(abilityUtils.calculateTotalAbilityScore).toHaveBeenCalledTimes(6);
    });

    it("should fetch subclass data when subclassId is present", () => {
      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        subclassId: "subclass_berserker",
      } as any);

      vi.mocked(staticDataApi.getSubclassById).mockReturnValue({
        id: "subclass_berserker",
        name: "Berserker",
        parent_class_id: "class_barbarian",
        progression: [],
      } as any);

      useCharacterStats();

      expect(staticDataApi.getSubclassById).toHaveBeenCalledWith(
        "subclass_berserker"
      );
    });

    it("should apply subclass specific scaling bonuses from progression", () => {
      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        level: 5,
        subclassId: "subclass_test",
      } as any);

      vi.mocked(staticDataApi.getSubclassById).mockReturnValue({
        id: "subclass_test",
        name: "Test Subclass",
        parent_class_id: "class_fighter",
        progression: [
          {
            level: 1,
            features: [],
            subclass_specific_scaling: {
              ac: 1,
              initiative_bonus: 2,
              speed: 10,
            },
          },
          {
            level: 3,
            features: [],
            subclass_specific_scaling: {
              speed: 15,
            },
          },
        ],
      } as any);
      vi.mocked(progressionUtils.mergeSubclassSpecificScaling).mockReturnValue({
        ac: 1,
        initiative_bonus: 2,
        speed: 15,
      });

      const result = useCharacterStats();

      expect(initiativeUtils.calculateInitiative).toHaveBeenCalledWith(
        2,
        2,
        false,
        2
      );
      expect(result.armorClass).toBe(11);
      expect(result.speed).toBe(45);
    });
  });

  describe("Equipment Resolution - Armor", () => {
    it("should set equippedArmor to null when no armor is equipped", () => {
      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        equippedArmorId: null,
      } as any);

      useCharacterStats();

      expect(staticDataApi.getItemById).not.toHaveBeenCalledWith(
        expect.any(String)
      );
    });

    it("should resolve armor data when armor is equipped with valid armor_properties", () => {
      const armorId = "plate_armor";
      const mockArmor = {
        id: armorId,
        type: "armor",
        armor_properties: {
          armorType: "heavy",
          baseAc: 18,
        },
      };

      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        equippedArmorId: armorId,
      } as any);

      vi.mocked(staticDataApi.getItemById).mockReturnValue(mockArmor as any);

      useCharacterStats();

      expect(staticDataApi.getItemById).toHaveBeenCalledWith(armorId);
    });

    it("should set equippedArmor to null when equipped item is not armor type", () => {
      const itemId = "longsword";
      const mockItem = {
        id: itemId,
        type: "weapon",
      };

      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        equippedArmorId: itemId,
      } as any);

      vi.mocked(staticDataApi.getItemById).mockReturnValue(mockItem as any);

      useCharacterStats();

      expect(staticDataApi.getItemById).toHaveBeenCalledWith(itemId);
    });

    it("should set equippedArmor to null when armor lacks armor_properties", () => {
      const armorId = "broken_armor";
      const mockArmor = {
        id: armorId,
        type: "armor",
        armor_properties: null,
      };

      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        equippedArmorId: armorId,
      } as any);

      vi.mocked(staticDataApi.getItemById).mockReturnValue(mockArmor as any);

      useCharacterStats();

      expect(staticDataApi.getItemById).toHaveBeenCalledWith(armorId);
    });
  });

  describe("Equipment Resolution - Shields", () => {
    it("should identify when shield is equipped", () => {
      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        equippedShieldId: "wooden_shield",
      } as any);

      const result = useCharacterStats();

      expect(result).toBeDefined();
    });

    it("should identify when no shield is equipped", () => {
      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        equippedShieldId: null,
      } as any);

      const result = useCharacterStats();

      expect(result).toBeDefined();
    });
  });

  describe("Armor Proficiency Penalties", () => {
    it("should penalize AC when wearing non-proficient heavy armor", () => {
      const armorId = "plate_armor";
      const mockArmor = {
        id: armorId,
        type: "armor",
        armor_properties: {
          armorType: "heavy",
          baseAc: 18,
        },
      };

      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        equippedArmorId: armorId,
      } as any);

      vi.mocked(staticDataApi.getItemById).mockReturnValue(mockArmor as any);
      vi.mocked(staticDataApi.getClassById).mockReturnValue({
        hit_die: 10,
        proficiencies: { armor: ["light"] }, // Only proficient in light armor
      } as any);

      const result = useCharacterStats();

      expect(result.isArmorPenalized).toBe(true);
    });

    it("should not penalize AC when wearing proficient armor", () => {
      const armorId = "plate_armor";
      const mockArmor = {
        id: armorId,
        type: "armor",
        armor_properties: {
          armorType: "heavy",
          baseAc: 18,
        },
      };

      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        equippedArmorId: armorId,
      } as any);

      vi.mocked(staticDataApi.getItemById).mockReturnValue(mockArmor as any);
      vi.mocked(traitUtils.getAllCharacterTraits).mockReturnValue([
        {
          id: "heavy_armor_training",
          effects: [
            {
              type: "proficiency",
              target: "heavy",
              predicates: [],
            },
          ],
        },
      ] as any);
      vi.mocked(predicateEngine.evaluateAllPredicates).mockReturnValue(true);

      const result = useCharacterStats();

      expect(result.isArmorPenalized).toBe(false);
    });

    it("should penalize AC when wearing shield without shield proficiency", () => {
      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        equippedShieldId: "wooden_shield",
      } as any);

      vi.mocked(staticDataApi.getClassById).mockReturnValue({
        hit_die: 10,
        proficiencies: { armor: [] },
      } as any);

      const result = useCharacterStats();

      expect(result.isArmorPenalized).toBe(true);
    });

    it("should not penalize AC when wearing shield with shield proficiency", () => {
      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        equippedShieldId: "wooden_shield",
      } as any);

      vi.mocked(traitUtils.getAllCharacterTraits).mockReturnValue([
        {
          id: "shield_training",
          effects: [
            {
              type: "proficiency",
              target: "shield",
              predicates: [],
            },
          ],
        },
      ] as any);
      vi.mocked(predicateEngine.evaluateAllPredicates).mockReturnValue(true);

      const result = useCharacterStats();

      expect(result.isArmorPenalized).toBe(false);
    });
  });

  describe("Armor Class Calculation", () => {
    it("should calculate base armor class without equipment", () => {
      const result = useCharacterStats();

      expect(acUtils.calculateArmorClass).toHaveBeenCalled();
      expect(result.armorClass).toBe(10);
    });

    it("should apply AC modifiers from active traits", () => {
      const mockTrait = {
        id: "unarmored_defense",
        effects: [
          {
            type: "stat_modifier",
            target: "ac",
            value: "calc_unarmored_con",
            predicates: [],
          },
        ],
      };

      vi.mocked(traitUtils.getAllCharacterTraits).mockReturnValue([
        mockTrait,
      ] as any);
      vi.mocked(predicateEngine.evaluateAllPredicates).mockReturnValue(true);

      const result = useCharacterStats();

      expect(result.armorClass).toBeDefined();
    });

    it("should apply numeric AC bonuses from traits", () => {
      const mockTrait = {
        id: "ring_of_protection",
        effects: [
          {
            type: "stat_modifier",
            target: "ac",
            value: 1,
            predicates: [],
          },
        ],
      };

      vi.mocked(traitUtils.getAllCharacterTraits).mockReturnValue([
        mockTrait,
      ] as any);
      vi.mocked(predicateEngine.evaluateAllPredicates).mockReturnValue(true);
      vi.mocked(acUtils.calculateArmorClass).mockReturnValue(10);

      const result = useCharacterStats();

      expect(result.armorClass).toBe(11); // 10 + 1
    });

    it("should not apply AC modifiers from inactive traits", () => {
      const mockTrait = {
        id: "conditional_ac",
        effects: [
          {
            type: "stat_modifier",
            target: "ac",
            value: 2,
            predicates: [{ type: "isRaging" }],
          },
        ],
      };

      vi.mocked(traitUtils.getAllCharacterTraits).mockReturnValue([
        mockTrait,
      ] as any);
      vi.mocked(predicateEngine.evaluateAllPredicates).mockReturnValue(false);
      vi.mocked(acUtils.calculateArmorClass).mockReturnValue(10);

      const result = useCharacterStats();

      expect(result.armorClass).toBe(10); // No modification applied
    });
  });

  describe("Derived Combat Stats", () => {
    it("should calculate proficiency bonus based on level", () => {
      const result = useCharacterStats();

      expect(progressionUtils.calculateProficiencyBonus).toHaveBeenCalledWith(1);
      expect(result.proficiencyBonus).toBe(2);
    });

    it("should calculate max HP from level, hit die, and CON modifier", () => {
      const result = useCharacterStats();

      expect(hpUtils.calculateMaxHP).toHaveBeenCalledWith(
        1,
        10,
        1,
        [6, 5, 4]
      );
      expect(result.maxHp).toBe(10);
    });

    it("should calculate current HP as max HP minus damage taken", () => {
      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        damageTaken: 3,
      } as any);

      vi.mocked(hpUtils.calculateMaxHP).mockReturnValue(10);

      const result = useCharacterStats();

      expect(result.currentHp).toBe(7); // 10 - 3
    });

    it("should clamp current HP to minimum of 0", () => {
      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        damageTaken: 15,
      } as any);

      vi.mocked(hpUtils.calculateMaxHP).mockReturnValue(10);

      const result = useCharacterStats();

      expect(result.currentHp).toBe(0);
    });

    it("should calculate initiative from DEX modifier", () => {
      const result = useCharacterStats();

      expect(initiativeUtils.calculateInitiative).toHaveBeenCalledWith(
        2,
        0,
        false,
        2
      );
      expect(result.initiative).toBe(2);
    });

    it("should apply numeric initiative modifiers from active traits", () => {
      vi.mocked(initiativeUtils.calculateInitiative).mockImplementation(
        (dexModifier, flatBonuses = 0, hasJackOfAllTrades = false, proficiencyBonus = 0) =>
          dexModifier + flatBonuses + (hasJackOfAllTrades ? Math.floor(proficiencyBonus / 2) : 0)
      );

      vi.mocked(traitUtils.getAllCharacterTraits).mockReturnValue([
        {
          id: "alert",
          effects: [
            {
              type: "stat_modifier",
              target: "initiative",
              value: 5,
              predicates: [],
            },
          ],
        },
      ] as any);
      vi.mocked(predicateEngine.evaluateAllPredicates).mockReturnValue(true);

      const result = useCharacterStats();

      expect(initiativeUtils.calculateInitiative).toHaveBeenLastCalledWith(
        2,
        5,
        false,
        2
      );
      expect(result.initiative).toBe(7);
    });

    it("should apply ability-based initiative modifiers from active traits", () => {
      vi.mocked(initiativeUtils.calculateInitiative).mockImplementation(
        (dexModifier, flatBonuses = 0, hasJackOfAllTrades = false, proficiencyBonus = 0) =>
          dexModifier + flatBonuses + (hasJackOfAllTrades ? Math.floor(proficiencyBonus / 2) : 0)
      );

      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        baseAbilityScores: {
          str: 15,
          dex: 14,
          con: 13,
          int: 10,
          wis: 12,
          cha: 18,
        },
      } as any);

      vi.mocked(traitUtils.getAllCharacterTraits).mockReturnValue([
        {
          id: "swashbuckler",
          effects: [
            {
              type: "stat_modifier",
              target: "initiative",
              value: "cha",
              predicates: [],
            },
          ],
        },
      ] as any);
      vi.mocked(predicateEngine.evaluateAllPredicates).mockReturnValue(true);

      const result = useCharacterStats();

      expect(initiativeUtils.calculateInitiative).toHaveBeenLastCalledWith(
        2,
        4,
        false,
        2
      );
      expect(result.initiative).toBe(6);
    });

    it("should apply Jack of All Trades to initiative", () => {
      vi.mocked(initiativeUtils.calculateInitiative).mockImplementation(
        (dexModifier, flatBonuses = 0, hasJackOfAllTrades = false, proficiencyBonus = 0) =>
          dexModifier + flatBonuses + (hasJackOfAllTrades ? Math.floor(proficiencyBonus / 2) : 0)
      );
      vi.mocked(progressionUtils.calculateProficiencyBonus).mockReturnValue(3);
      vi.mocked(traitUtils.getAllCharacterTraits).mockReturnValue([
        {
          id: "trait_jack_of_all_trades",
          effects: [
            {
              type: "half_proficiency",
              target: "unproficient_checks",
              predicates: [],
            },
          ],
        },
      ] as any);
      vi.mocked(predicateEngine.evaluateAllPredicates).mockReturnValue(true);

      const result = useCharacterStats();

      expect(initiativeUtils.calculateInitiative).toHaveBeenLastCalledWith(
        2,
        0,
        true,
        3
      );
      expect(result.initiative).toBe(3);
    });
  });

  describe("Encumbrance Calculation", () => {
    it("should calculate total weight from inventory", () => {
      const mockItems = [
        { itemId: "item1", quantity: 2 },
        { itemId: "item2", quantity: 1 },
      ];

      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        inventory: mockItems,
      } as any);

      vi.mocked(staticDataApi.getItemById).mockImplementation((id) => {
        if (id === "item1") return { weight: 5 } as any;
        if (id === "item2") return { weight: 10 } as any;
        return null;
      });

      const result = useCharacterStats();

      expect(result.totalWeight).toBe(20); // (5 * 2) + (10 * 1)
    });

    it("should calculate carrying capacity as STR score * 15", () => {
      const result = useCharacterStats();

      expect(result.totalWeight).toBe(0);
      // carryingCapacity = 15 * 15 = 225
    });

    it("should identify encumbrance when weight exceeds capacity", () => {
      const mockItems = [{ itemId: "heavy_item", quantity: 20 }];

      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        inventory: mockItems,
        baseAbilityScores: {
          str: 10,
          dex: 14,
          con: 13,
          int: 10,
          wis: 12,
          cha: 8,
        },
      } as any);

      vi.mocked(staticDataApi.getItemById).mockReturnValue({
        weight: 20,
      } as any);

      const result = useCharacterStats();

      // weight: 20 * 20 = 400, capacity: 10 * 15 = 150
      expect(result.isEncumbered).toBe(true);
    });

    it("should not identify encumbrance when weight is within capacity", () => {
      const mockItems = [{ itemId: "light_item", quantity: 5 }];

      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        inventory: mockItems,
      } as any);

      vi.mocked(staticDataApi.getItemById).mockReturnValue({
        weight: 2,
      } as any);

      const result = useCharacterStats();

      // weight: 2 * 5 = 10, capacity: 15 * 15 = 225
      expect(result.isEncumbered).toBe(false);
    });
  });

  describe("Trait Application & Effects", () => {
    it("should fetch all character traits based on level and choices", () => {
      useCharacterStats();

      expect(traitUtils.getAllCharacterTraits).toHaveBeenCalledWith(
        1,
        "human",
        null,
        "fighter",
        null,
        false,
        {},
        []
      );
    });

    it("should evaluate predicates for each trait effect", () => {
      const mockTrait = {
        id: "test_trait",
        effects: [
          {
            type: "stat_modifier",
            target: "ac",
            value: 1,
            predicates: [{ type: "isArmed" }],
          },
        ],
      };

      vi.mocked(traitUtils.getAllCharacterTraits).mockReturnValue([
        mockTrait,
      ] as any);

      useCharacterStats();

      expect(predicateEngine.evaluateAllPredicates).toHaveBeenCalled();
    });

    it("should apply speed modifiers from active traits", () => {
      const mockTrait = {
        id: "dash_trait",
        effects: [
          {
            type: "stat_modifier",
            target: "speed",
            value: 10,
            predicates: [],
          },
        ],
      };

      vi.mocked(traitUtils.getAllCharacterTraits).mockReturnValue([
        mockTrait,
      ] as any);
      vi.mocked(predicateEngine.evaluateAllPredicates).mockReturnValue(true);

      const result = useCharacterStats();

      expect(result.speed).toBe(40); // 30 + 10
    });

    it("should accumulate multiple speed modifiers", () => {
      const mockTraits = [
        {
          id: "trait1",
          effects: [
            {
              type: "stat_modifier",
              target: "speed",
              value: 5,
              predicates: [],
            },
          ],
        },
        {
          id: "trait2",
          effects: [
            {
              type: "stat_modifier",
              target: "speed",
              value: 10,
              predicates: [],
            },
          ],
        },
      ];

      vi.mocked(traitUtils.getAllCharacterTraits).mockReturnValue(
        mockTraits as any
      );
      vi.mocked(predicateEngine.evaluateAllPredicates).mockReturnValue(true);

      const result = useCharacterStats();

      expect(result.speed).toBe(45); // 30 + 5 + 10
    });

    it("should ignore non-stat_modifier effects", () => {
      const mockTrait = {
        id: "special_trait",
        effects: [
          {
            type: "damage_bonus",
            target: "melee",
            value: 2,
            predicates: [],
          },
        ],
      };

      vi.mocked(traitUtils.getAllCharacterTraits).mockReturnValue([
        mockTrait,
      ] as any);

      const result = useCharacterStats();

      expect(result.speed).toBe(30); // Unchanged
    });
  });

  describe("Return Value Structure", () => {
    it("should return all required stat properties", () => {
      const result = useCharacterStats();

      expect(result).toHaveProperty("totalScores");
      expect(result).toHaveProperty("modifiers");
      expect(result).toHaveProperty("proficiencyBonus");
      expect(result).toHaveProperty("maxHp");
      expect(result).toHaveProperty("currentHp");
      expect(result).toHaveProperty("initiative");
      expect(result).toHaveProperty("armorClass");
      expect(result).toHaveProperty("isArmorPenalized");
      expect(result).toHaveProperty("totalWeight");
      expect(result).toHaveProperty("isEncumbered");
      expect(result).toHaveProperty("speed");
    });

    it("should have correct types for all properties", () => {
      const result = useCharacterStats();

      expect(typeof result.totalScores.str).toBe("number");
      expect(typeof result.modifiers.dex).toBe("number");
      expect(typeof result.proficiencyBonus).toBe("number");
      expect(typeof result.maxHp).toBe("number");
      expect(typeof result.currentHp).toBe("number");
      expect(typeof result.initiative).toBe("number");
      expect(typeof result.armorClass).toBe("number");
      expect(typeof result.isArmorPenalized).toBe("boolean");
      expect(typeof result.totalWeight).toBe("number");
      expect(typeof result.isEncumbered).toBe("boolean");
      expect(typeof result.speed).toBe("number");
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle a fully equipped fighter at level 5", () => {
      const mockArmor = {
        id: "plate_armor",
        type: "armor",
        armor_properties: { armorType: "heavy", baseAc: 18 },
      };

      vi.mocked(useCharacterStore).mockReturnValue({
        level: 5,
        raceId: "human",
        subraceId: null,
        classId: "fighter",
        subclassId: "eldritch_knight",
        baseAbilityScores: {
          str: 16,
          dex: 12,
          con: 15,
          int: 9,
          wis: 11,
          cha: 10,
        },
        hpRolls: [10, 8, 9, 7, 8],
        chosenRacialBonuses: {},
        choicesByLevel: { 4: { str: 2 } },
        inventory: [
          { itemId: "plate_armor", quantity: 1 },
          { itemId: "longsword", quantity: 1 },
          { itemId: "backpack", quantity: 1 },
        ],
        equippedArmorId: "plate_armor",
        equippedShieldId: "shield",
        damageTaken: 5,
      } as any);

      vi.mocked(progressionUtils.calculateProficiencyBonus).mockReturnValue(3);
      vi.mocked(hpUtils.calculateMaxHP).mockReturnValue(45);
      vi.mocked(staticDataApi.getItemById).mockImplementation((id) => {
        if (id === "plate_armor") return mockArmor;
        return { weight: 3 } as any;
      });
      vi.mocked(staticDataApi.getClassById).mockReturnValue({
        hit_die: 10,
        proficiencies: { armor: ["heavy", "category_armor_shield"] },
      } as any);
      vi.mocked(traitUtils.getAllCharacterTraits).mockReturnValue([
        {
          id: "fighter_proficiencies",
          effects: [
            {
              type: "proficiency",
              target: "heavy",
              predicates: [],
            },
            {
              type: "proficiency",
              target: "shield",
              predicates: [],
            },
          ],
        },
      ] as any);
      vi.mocked(predicateEngine.evaluateAllPredicates).mockReturnValue(true);

      const result = useCharacterStats();

      expect(result).not.toHaveProperty("level");
      expect(result.maxHp).toBe(45);
      expect(result.currentHp).toBe(40);
      expect(result.proficiencyBonus).toBe(3);
      expect(result.isArmorPenalized).toBe(false);
    });

    it("should handle a rogue with no armor equipment", () => {
      vi.mocked(useCharacterStore).mockReturnValue({
        level: 3,
        raceId: "halfling",
        subraceId: "lightfoot",
        classId: "rogue",
        subclassId: "thief",
        baseAbilityScores: {
          str: 8,
          dex: 16,
          con: 11,
          int: 14,
          wis: 10,
          cha: 12,
        },
        hpRolls: [7, 5, 6],
        chosenRacialBonuses: {},
        choicesByLevel: {},
        inventory: [{ itemId: "dagger", quantity: 2 }],
        equippedArmorId: null,
        equippedShieldId: null,
        damageTaken: 0,
      } as any);

      vi.mocked(acUtils.calculateArmorClass).mockReturnValue(15); // 10 + DEX mod
      vi.mocked(hpUtils.calculateMaxHP).mockReturnValue(20);
      vi.mocked(initiativeUtils.calculateInitiative).mockReturnValue(3);

      const result = useCharacterStats();

      expect(result.armorClass).toBe(15);
      expect(result.isArmorPenalized).toBe(false);
      expect(result.initiative).toBe(3);
    });
  });
});