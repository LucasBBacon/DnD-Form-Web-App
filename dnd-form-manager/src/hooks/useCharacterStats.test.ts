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
      inventoryStacks: [],
      inventoryInstances: [],
      equippedArmorInstanceId: null,
      equippedShieldInstanceId: null,
      attunedInstanceIds: [],
      damageTaken: 0,
      classTracks: [],
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
    vi.mocked(hpUtils.calculateMulticlassMaxHP).mockReturnValue(10);
    vi.mocked(initiativeUtils.calculateInitiative).mockReturnValue(2);
    vi.mocked(acUtils.calculateArmorClass).mockReturnValue(10);

    // Mock data API
    vi.mocked(staticDataApi.getRaceById).mockReturnValue(null);
    vi.mocked(staticDataApi.getSubraceById).mockReturnValue(null);
    vi.mocked(staticDataApi.getClassById).mockReturnValue({
      hitDie: 10,
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

      expect(result.abilities.scores).toBeDefined();
      expect(result.abilities.scores.str).toBe(15);
      expect(result.abilities.scores.dex).toBe(14);
      expect(result.abilities.scores.con).toBe(13);
      expect(result.abilities.scores.int).toBe(10);
      expect(result.abilities.scores.wis).toBe(12);
      expect(result.abilities.scores.cha).toBe(8);
    });

    it("should calculate modifiers from ability scores", () => {
      const result = useCharacterStats();

      expect(result.abilities.modifiers.str).toBe(2); // (15-10)/2
      expect(result.abilities.modifiers.dex).toBe(2); // (14-10)/2
      expect(result.abilities.modifiers.con).toBe(1); // (13-10)/2
      expect(result.abilities.modifiers.int).toBe(0); // (10-10)/2
      expect(result.abilities.modifiers.wis).toBe(1); // (12-10)/2
      expect(result.abilities.modifiers.cha).toBe(-1); // (8-10)/2
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
        parentClassId: "class_barbarian",
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
        parentClassId: "class_fighter",
        progression: [
          {
            level: 1,
            features: [],
            subclassSpecificScaling: {
              ac: 1,
              initiative_bonus: 2,
              speed: 10,
            },
          },
          {
            level: 3,
            features: [],
            subclassSpecificScaling: {
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
      expect(result.combat.armorClass).toBe(11);
      expect(result.combat.speed).toBe(45);
    });
  });

  describe("Equipment Resolution - Armor", () => {
    it("should set equippedArmor to null when no armor is equipped", () => {
      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        equippedArmorInstanceId: null,
      } as any);

      useCharacterStats();

      expect(staticDataApi.getItemById).not.toHaveBeenCalledWith(
        expect.any(String)
      );
    });

    it("should resolve armor data when armor is equipped with valid armorProperties", () => {
      const armorId = "plate_armor";
      const mockArmor = {
        id: armorId,
        type: "armor",
        armorProperties: {
          armorType: "heavy",
          baseAc: 18,
        },
      };

      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        equippedArmorInstanceId: "test-armor-instance",
        inventoryInstances: [{ instanceId: "test-armor-instance", baseItemId: armorId }],
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
        equippedArmorInstanceId: "test-item-instance",
        inventoryInstances: [{ instanceId: "test-item-instance", baseItemId: itemId }],
      } as any);

      vi.mocked(staticDataApi.getItemById).mockReturnValue(mockItem as any);

      useCharacterStats();

      expect(staticDataApi.getItemById).toHaveBeenCalledWith(itemId);
    });

    it("should set equippedArmor to null when armor lacks armorProperties", () => {
      const armorId = "broken_armor";
      const mockArmor = {
        id: armorId,
        type: "armor",
        armorProperties: null,
      };

      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        equippedArmorInstanceId: "test-armor-instance",
        inventoryInstances: [{ instanceId: "test-armor-instance", baseItemId: armorId }],
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
        equippedShieldInstanceId: "test-shield-instance",
        inventoryInstances: [{ instanceId: "test-shield-instance", baseItemId: "wooden_shield" }],
      } as any);

      const result = useCharacterStats();

      expect(result).toBeDefined();
    });

    it("should identify when no shield is equipped", () => {
      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        equippedShieldInstanceId: null,
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
        armorProperties: {
          armorType: "heavy",
          baseAc: 18,
        },
      };

      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        equippedArmorInstanceId: "test-armor-instance",
        inventoryInstances: [{ instanceId: "test-armor-instance", baseItemId: armorId }],
      } as any);

      vi.mocked(staticDataApi.getItemById).mockReturnValue(mockArmor as any);
      vi.mocked(staticDataApi.getClassById).mockReturnValue({
        hitDie: 10,
        proficiencies: { armor: ["light"] }, // Only proficient in light armor
      } as any);

      const result = useCharacterStats();

      expect(result.combat.isArmorPenalized).toBe(true);
    });

    it("should not penalize AC when wearing proficient armor", () => {
      const armorId = "plate_armor";
      const mockArmor = {
        id: armorId,
        type: "armor",
        armorProperties: {
          armorType: "heavy",
          baseAc: 18,
        },
      };

      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        equippedArmorInstanceId: "test-armor-instance",
        inventoryInstances: [{ instanceId: "test-armor-instance", baseItemId: armorId }],
      } as any);

      vi.mocked(staticDataApi.getItemById).mockReturnValue(mockArmor as any);
      vi.mocked(traitUtils.getAllCharacterTraits).mockReturnValue([
        {
          id: "heavy_armor_training",
          effects: [
            {
              type: "proficiency",
              target: "armor",
              value: "heavy",
              predicates: [],
            },
          ],
        },
      ] as any);
      vi.mocked(predicateEngine.evaluateAllPredicates).mockReturnValue(true);

      const result = useCharacterStats();

      expect(result.combat.isArmorPenalized).toBe(false);
    });

    it("should penalize AC when wearing shield without shield proficiency", () => {
      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        equippedShieldInstanceId: "test-shield-instance",
        inventoryInstances: [{ instanceId: "test-shield-instance", baseItemId: "wooden_shield" }],
      } as any);

      vi.mocked(traitUtils.getAllCharacterTraits).mockReturnValue([] as any);

      const result = useCharacterStats();

      expect(result.combat.isArmorPenalized).toBe(true);
    });

    it("should not penalize AC when wearing shield with shield proficiency", () => {
      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        equippedShieldInstanceId: "test-shield-instance",
        inventoryInstances: [{ instanceId: "test-shield-instance", baseItemId: "wooden_shield" }],
      } as any);

      vi.mocked(traitUtils.getAllCharacterTraits).mockReturnValue([
        {
          id: "shield_training",
          effects: [
            {
              type: "proficiency",
              target: "armor",
              value: "shield",
              predicates: [],
            },
          ],
        },
      ] as any);
      vi.mocked(predicateEngine.evaluateAllPredicates).mockReturnValue(true);

      const result = useCharacterStats();

      expect(result.combat.isArmorPenalized).toBe(false);
    });
  });

  describe("Armor Class Calculation", () => {
    it("should calculate base armor class without equipment", () => {
      const result = useCharacterStats();

      expect(acUtils.calculateArmorClass).toHaveBeenCalled();
      expect(result.combat.armorClass).toBe(10);
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

      expect(result.combat.armorClass).toBeDefined();
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

      expect(result.combat.armorClass).toBe(11); // 10 + 1
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

      expect(result.combat.armorClass).toBe(10); // No modification applied
    });
  });

  describe("Derived Combat Stats", () => {
    it("should calculate proficiency bonus based on level", () => {
      const result = useCharacterStats();

      expect(progressionUtils.calculateProficiencyBonus).toHaveBeenCalledWith(1);
      expect(result.combat.proficiencyBonus).toBe(2);
    });

    it("should calculate max HP from level, hit die, and CON modifier", () => {
      const result = useCharacterStats();

      expect(hpUtils.calculateMulticlassMaxHP).toHaveBeenCalledWith(
        1,
        { 1: 10 },
        1,
        [6, 5, 4]
      );
      expect(result.combat.hp.max).toBe(10);
    });

    it("should calculate current HP as max HP minus damage taken", () => {
      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        damageTaken: 3,
      } as any);

      vi.mocked(hpUtils.calculateMulticlassMaxHP).mockReturnValue(10);

      const result = useCharacterStats();

      expect(result.combat.hp.current).toBe(7); // 10 - 3
    });

    it("should clamp current HP to minimum of 0", () => {
      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        damageTaken: 15,
      } as any);

      vi.mocked(hpUtils.calculateMulticlassMaxHP).mockReturnValue(10);

      const result = useCharacterStats();

      expect(result.combat.hp.current).toBe(0);
    });

    it("should calculate initiative from DEX modifier", () => {
      const result = useCharacterStats();

      expect(initiativeUtils.calculateInitiative).toHaveBeenCalledWith(
        2,
        0,
        false,
        2
      );
      expect(result.combat.initiative).toBe(2);
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
      expect(result.combat.initiative).toBe(7);
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
      expect(result.combat.initiative).toBe(6);
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
      expect(result.combat.initiative).toBe(3);
    });
  });

  describe("Encumbrance Calculation", () => {
    it("should calculate total weight from inventory", () => {
      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        inventoryStacks: [
          { stackId: "stack-1", baseItemId: "item1", quantity: 2 },
          { stackId: "stack-2", baseItemId: "item2", quantity: 1 },
        ],
      } as any);

      vi.mocked(staticDataApi.getItemById).mockImplementation((id) => {
        if (id === "item1") return { weight: 5 } as any;
        if (id === "item2") return { weight: 10 } as any;
        return null;
      });

      const result = useCharacterStats();

      expect(result.encumbrance.totalWeight).toBe(20); // (5 * 2) + (10 * 1)
    });

    it("should calculate carrying capacity as STR score * 15", () => {
      const result = useCharacterStats();

      expect(result.encumbrance.totalWeight).toBe(0);
      // carryingCapacity = 15 * 15 = 225
    });

    it("should identify encumbrance when weight exceeds capacity", () => {
      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        inventoryStacks: [{ stackId: "stack-1", baseItemId: "heavy_item", quantity: 20 }],
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
      expect(result.encumbrance.isEncumbered).toBe(true);
    });

    it("should not identify encumbrance when weight is within capacity", () => {
      vi.mocked(useCharacterStore).mockReturnValue({
        ...createDefaultCharacterState(),
        inventoryStacks: [{ stackId: "stack-1", baseItemId: "light_item", quantity: 5 }],
      } as any);

      vi.mocked(staticDataApi.getItemById).mockReturnValue({
        weight: 2,
      } as any);

      const result = useCharacterStats();

      // weight: 2 * 5 = 10, capacity: 15 * 15 = 225
      expect(result.encumbrance.isEncumbered).toBe(false);
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
        [],
        [],
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

      expect(result.combat.speed).toBe(40); // 30 + 10
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

      expect(result.combat.speed).toBe(45); // 30 + 5 + 10
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

      expect(result.combat.speed).toBe(30); // Unchanged
    });
  });

  describe("Return Value Structure", () => {
    it("should return all required stat properties", () => {
      const result = useCharacterStats();

      expect(result).toHaveProperty("abilities");
      expect(result).toHaveProperty("abilities.scores");
      expect(result).toHaveProperty("abilities.modifiers");
      expect(result).toHaveProperty("combat");
      expect(result).toHaveProperty("combat.proficiencyBonus");
      expect(result).toHaveProperty("combat.hp.max");
      expect(result).toHaveProperty("combat.hp.current");
      expect(result).toHaveProperty("combat.initiative");
      expect(result).toHaveProperty("combat.armorClass");
      expect(result).toHaveProperty("combat.isArmorPenalized");
      expect(result).toHaveProperty("combat.speed");
      expect(result).toHaveProperty("encumbrance");
      expect(result).toHaveProperty("encumbrance.totalWeight");
      expect(result).toHaveProperty("encumbrance.carryingCapacity");
      expect(result).toHaveProperty("encumbrance.isEncumbered");
    });

    it("should have correct types for all properties", () => {
      const result = useCharacterStats();

      expect(typeof result.abilities.scores.str).toBe("number");
      expect(typeof result.abilities.modifiers.dex).toBe("number");
      expect(typeof result.combat.proficiencyBonus).toBe("number");
      expect(typeof result.combat.hp.max).toBe("number");
      expect(typeof result.combat.hp.current).toBe("number");
      expect(typeof result.combat.initiative).toBe("number");
      expect(typeof result.combat.armorClass).toBe("number");
      expect(typeof result.combat.isArmorPenalized).toBe("boolean");
      expect(typeof result.encumbrance.totalWeight).toBe("number");
      expect(typeof result.encumbrance.isEncumbered).toBe("boolean");
      expect(typeof result.combat.speed).toBe("number");
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle a fully equipped fighter at level 5", () => {
      const mockArmor = {
        id: "plate_armor",
        type: "armor",
        armorProperties: { armorType: "heavy", baseAc: 18 },
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
        inventoryStacks: [
          { stackId: "stack-1", baseItemId: "longsword", quantity: 1 },
          { stackId: "stack-2", baseItemId: "backpack", quantity: 1 },
        ],
        inventoryInstances: [
          { instanceId: "armor-instance-1", baseItemId: "plate_armor" },
          { instanceId: "shield-instance-1", baseItemId: "shield" },
        ],
        equippedArmorInstanceId: "armor-instance-1",
        equippedShieldInstanceId: "shield-instance-1",
        attunedInstanceIds: [],
        damageTaken: 5,
      } as any);

      vi.mocked(progressionUtils.calculateProficiencyBonus).mockReturnValue(3);
      vi.mocked(hpUtils.calculateMulticlassMaxHP).mockReturnValue(45);
      vi.mocked(staticDataApi.getItemById).mockImplementation((id) => {
        if (id === "plate_armor") return mockArmor;
        return { weight: 3 } as any;
      });
      vi.mocked(staticDataApi.getClassById).mockReturnValue({
        hitDie: 10,
      } as any);
      vi.mocked(traitUtils.getAllCharacterTraits).mockReturnValue([
        {
          id: "fighter_proficiencies",
          effects: [
            {
              type: "proficiency",
              target: "armor",
              value: "heavy",
              predicates: [],
            },
            {
              type: "proficiency",
              target: "armor",
              value: "shield",
              predicates: [],
            },
          ],
        },
      ] as any);
      vi.mocked(predicateEngine.evaluateAllPredicates).mockReturnValue(true);

      const result = useCharacterStats();

      expect(result).not.toHaveProperty("level");
      expect(result.combat.hp.max).toBe(45);
      expect(result.combat.hp.current).toBe(40);
      expect(result.combat.proficiencyBonus).toBe(3);
      expect(result.combat.isArmorPenalized).toBe(false);
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
        inventoryStacks: [{ stackId: "stack-1", baseItemId: "dagger", quantity: 2 }],
        inventoryInstances: [],
        equippedArmorInstanceId: null,
        equippedShieldInstanceId: null,
        attunedInstanceIds: [],
        damageTaken: 0,
      } as any);

      vi.mocked(acUtils.calculateArmorClass).mockReturnValue(15); // 10 + DEX mod
      vi.mocked(hpUtils.calculateMulticlassMaxHP).mockReturnValue(20);
      vi.mocked(initiativeUtils.calculateInitiative).mockReturnValue(3);

      const result = useCharacterStats();

      expect(result.combat.armorClass).toBe(15);
      expect(result.combat.isArmorPenalized).toBe(false);
      expect(result.combat.initiative).toBe(3);
    });
  });
});
