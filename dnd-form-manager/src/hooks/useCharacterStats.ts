import { getClassById, getItemById, getSubclassById } from "../data/staticDataApi";
import { useCharacterStore } from "../store/useCharacterStore";
import type { Ability, HitDie } from "../types/common";
import type {
  KnownSubclassStatScalingKey,
  SubclassSpecificScaling,
} from "../types/subclass";
import {
  calculateModifier,
  calculateTotalAbilityScore,
  calculateTotalASI,
} from "../utils/abilityUtils";
import { calculateArmorClass } from "../utils/acUtils";
import { calculateMulticlassMaxHP } from "../utils/hpUtils";
import { calculateInitiative } from "../utils/initiativeUtils";
import { evaluateAllPredicates } from "../utils/predicateEngine";
import { aggregateNonSkillProficienciesMulticlass } from "../utils/proficiencyAggregator";
import {
  calculateProficiencyBonus,
  mergeSubclassSpecificScaling,
} from "../utils/progressionUtils";
import {
  resolveBaseSpeedFromTraits,
  resolveFixedAbilityBonusesFromTraits,
} from "../utils/traitEffectResolvers";
import { getAllCharacterTraits } from "../utils/traitUtils";
import { resolveInstance } from "../utils/inventoryUtils";

// #region --- Type Constants ---

const SUBCLASS_SCALING_KEYS: Record<
  "initiative" | "ac" | "speed",
  KnownSubclassStatScalingKey[]
> = {
  initiative: ["initiative", "initiative_bonus"],
  ac: ["ac", "armor_class"],
  speed: ["speed"],
};

// #endregion

// #region --- Helper Functions ---

/**
 * Resolves the subclass scaling bonus for a given value and ability modifiers.
 * @param value The value to resolve, which can be a number or an ability key.
 * @param modifiers The ability modifiers to use for resolution.
 * @returns The resolved subclass scaling bonus.
 */
const resolveSubclassScalingBonus = (
  value: string | number | undefined,
  modifiers: Record<Ability, number>,
): number => {
  if (typeof value === "number") return value;
  if (!value) return 0;

  return modifiers[value as Ability] ?? 0;
};

/**
 * Retrieves the first defined value from a subclass-specific scaling object based on the provided keys.
 * @param scaling The subclass-specific scaling object to evaluate.
 * @param keys An array of keys to check in order of priority.
 * @returns The first defined value found for the given keys, or undefined if none are found.
 */
const getFirstDefinedScalingValue = (
  scaling: SubclassSpecificScaling,
  keys: KnownSubclassStatScalingKey[],
) => {
  for (const key of keys) {
    if (scaling[key] !== undefined) return scaling[key];
  }

  return undefined;
};

/**
 * Converts the character stats from the useCharacterStats hook into a CharacterStatsContext object.
 * @param stats The character stats returned by the useCharacterStats hook.
 * @returns A CharacterStatsContext object containing the derived stats.
 */
export const toCharacterStatsContext = (
  stats: UseCharacterStatsReturn,
): CharacterStatsContext => ({
  totalScores: stats.abilities.scores,
  modifiers: stats.abilities.modifiers,
  proficiencyBonus: stats.combat.proficiencyBonus,
  maxHp: stats.combat.hp.max,
  currentHp: stats.combat.hp.current,
  initiative: stats.combat.initiative,
  armorClass: stats.combat.armorClass,
  isArmorPenalized: stats.combat.isArmorPenalized,
  armorStealthDisadvantage: stats.combat.armorStealthDisadvantage,
  totalWeight: stats.encumbrance.totalWeight,
  isEncumbered: stats.encumbrance.isEncumbered,
  speed: stats.combat.speed,
});

// #endregion

// #region --- Return Types ---

export interface CharacterStatsContext {
  totalScores: Record<Ability, number>;
  modifiers: Record<Ability, number>;
  proficiencyBonus: number;
  maxHp: number;
  currentHp: number;
  initiative: number;
  armorClass: number;
  isArmorPenalized: boolean;
  armorStealthDisadvantage: boolean;
  totalWeight: number;
  isEncumbered: boolean;
  speed: number;
}

export interface UseCharacterStatsReturn {
  abilities: {
    scores: Record<Ability, number>;
    modifiers: Record<Ability, number>;
  };
  combat: {
    proficiencyBonus: number;
    hp: {
      max: number;
      current: number;
    };
    initiative: number;
    armorClass: number;
    isArmorPenalized: boolean;
    armorStealthDisadvantage: boolean;
    speed: number;
  };
  encumbrance: {
    totalWeight: number;
    carryingCapacity: number;
    isEncumbered: boolean;
  };
}

// #endregion

/**
 * Custom hook to calculate the character's derived stats based on their base ability scores,
 * racial and subracial bonuses, class and subclass features, and other traits.
 */
export const useCharacterStats = (): UseCharacterStatsReturn => {
  // #region --- Get Character State and Static Data ---
  const state = useCharacterStore();

  // fetch static definitions
  const classData = state.classId ? getClassById(state.classId) : null;
  const subclassData = state.subclassId
    ? getSubclassById(state.subclassId)
    : null;

  // #endregion

  // #region --- Calculate Total Ability Scores and Modifiers ---

  const allTraits = getAllCharacterTraits(
    state.level,
    state.raceId,
    state.subraceId,
    state.classId,
    state.subclassId,
    false,
    state.choicesByLevel,
    state.acquiredFeats ?? [],
    state.classTracks,
  );

  // Aggregate all ASI choices from level 1 to current level
  const totalAsiBonuses = calculateTotalASI(state.level, state.choicesByLevel);
  const fixedAncestryBonuses = resolveFixedAbilityBonusesFromTraits(
    allTraits,
    state.level,
  );

  // Calculate all ability scores and modifiers in one pass
  const abilities: Ability[] = ["str", "dex", "con", "int", "wis", "cha"];
  const totalScores = abilities.reduce(
    (acc, ability) => {
      acc[ability] = calculateTotalAbilityScore(
        ability,
        state.baseAbilityScores[ability],
        fixedAncestryBonuses,
        state.chosenRacialBonuses,
        totalAsiBonuses[ability],
      );
      return acc;
    },
    {} as Record<Ability, number>,
  );

  const modifiers = abilities.reduce(
    (acc, ability) => {
      acc[ability] = calculateModifier(totalScores[ability]);
      return acc;
    },
    {} as Record<Ability, number>,
  );

  // #endregion

  // #region --- Calculate Subclass-Specific Scaling Bonuses ---

  const subclassScaling = mergeSubclassSpecificScaling(
    subclassData?.progression ?? [],
    state.level,
  );

  const subclassInitiativeBonus = resolveSubclassScalingBonus(
    getFirstDefinedScalingValue(
      subclassScaling,
      SUBCLASS_SCALING_KEYS.initiative,
    ),
    modifiers,
  );
  const subclassAcBonus = resolveSubclassScalingBonus(
    getFirstDefinedScalingValue(subclassScaling, SUBCLASS_SCALING_KEYS.ac),
    modifiers,
  );
  const subclassSpeedBonus = resolveSubclassScalingBonus(
    getFirstDefinedScalingValue(subclassScaling, SUBCLASS_SCALING_KEYS.speed),
    modifiers,
  );

  // #endregion

  // #region --- Calculate Total Weight and Encumbrance ---

  // Calculate total weight from UUID-backed inventory
  const totalWeight =
    state.inventoryStacks.reduce((total, stack) => {
      const itemData = getItemById(stack.baseItemId);
      return total + (itemData?.weight ?? 0) * stack.quantity;
    }, 0) +
    state.inventoryInstances.reduce((total, instance) => {
      const itemData = getItemById(instance.baseItemId);
      return total + (itemData?.weight ?? 0);
    }, 0);

  const carryingCapacity = totalScores.str * 15;
  const isEncumbered = totalWeight > carryingCapacity;

  // #endregion

  // #region --- Calculate Proficiencies for Armor, Weapons, Tools, etc. ---

  // Calculate Derived Combat Stats
  const proficiencyBonus = calculateProficiencyBonus(state.level);

  // #endregion

  // #region --- Calculate Hit Points ---

  const hitDieByLevel: Record<number, HitDie | undefined> = {};

  if (state.level >= 1) {
    hitDieByLevel[1] = classData?.hitDie;
  }

  for (let currentLevel = 2; currentLevel <= state.level; currentLevel++) {
    const selectedClassIdForLevel =
      state.choicesByLevel[currentLevel]?.selectedClassId || state.classId;
    const selectedClassData = selectedClassIdForLevel
      ? getClassById(selectedClassIdForLevel)
      : null;

    hitDieByLevel[currentLevel] = selectedClassData?.hitDie;
  }

  const maxHp = calculateMulticlassMaxHP(
    state.level,
    hitDieByLevel,
    modifiers.con,
    state.hpRolls,
  );

  const currentHp = Math.max(0, maxHp - state.damageTaken);

  // #endregion

  // #region --- Calculate Initiative, Armor Class, Speed, and Other Derived Stats ---

  const baseInitiative = calculateInitiative(
    modifiers.dex,
    subclassInitiativeBonus,
    false,
    proficiencyBonus,
  );

  // Resolve equipment data (instance-first with template fallback)
  const equippedArmorInstance = resolveInstance(
    state.equippedArmorInstanceId,
    state.inventoryInstances,
  );

  const equippedArmorData = equippedArmorInstance
    ? getItemById(equippedArmorInstance.baseItemId)
    : null;

  const baseSpeed = resolveBaseSpeedFromTraits(allTraits, state.level, 30);

  const equippedArmor: Parameters<typeof calculateArmorClass>[1] = (() => {
    if (
      !equippedArmorData?.armorProperties ||
      equippedArmorData.type !== "armor"
    ) {
      return null;
    }
    const mergedArmorProps = equippedArmorInstance?.overrides?.armorProperties
      ? {
          ...equippedArmorData.armorProperties,
          ...equippedArmorInstance.overrides.armorProperties,
        }
      : equippedArmorData.armorProperties;
    return {
      ...equippedArmorData,
      armorProperties: mergedArmorProps,
    } as Exclude<Parameters<typeof calculateArmorClass>[1], null>;
  })();

  // Resolve shield instance for magic AC bonus
  const equippedShieldInstance = resolveInstance(
    state.equippedShieldInstanceId,
    state.inventoryInstances,
  );

  const isWearingShield = !!state.equippedShieldInstanceId;
  const armorStealthDisadvantage =
    !!equippedArmor?.armorProperties?.stealthDisadvantage;

  // Build local stats snapshot for predicate checks used during proficiency aggregation
  const proficiencyEvaluationStats = {
    totalScores,
    modifiers,
    proficiencyBonus,
    maxHp,
    currentHp,
    initiative: baseInitiative,
    armorClass: 0,
    isArmorPenalized: false,
    armorStealthDisadvantage,
    totalWeight,
    isEncumbered,
    speed: baseSpeed + subclassSpeedBonus,
  };

  const nonSkillProficiencies = aggregateNonSkillProficienciesMulticlass({
    choicesByLevel: state.choicesByLevel,
    classTracks: state.classTracks,
    currentLevel: state.level,
    traits: allTraits,
    state,
    stats: proficiencyEvaluationStats,
  });

  const isArmorPenalized =
    (!!state.equippedArmorInstanceId &&
      equippedArmor?.armorProperties &&
      !nonSkillProficiencies.armor.has(
        equippedArmor.armorProperties.armorType,
      )) ||
    (isWearingShield && !nonSkillProficiencies.armor.has("shield"));

  // Magic AC bonuses from equipped items (attunement-gated)
  const armorMagicAcBonus = (() => {
    if (!equippedArmorInstance) return 0;
    const magicProps =
      equippedArmorInstance.overrides?.magicItemProperties ??
      equippedArmorData?.magicItemProperties ??
      null;
    if (!magicProps) return 0;
    const isAttuned = state.attunedInstanceIds.includes(
      equippedArmorInstance.instanceId,
    );
    const bonusActive = !magicProps.requiresAttunement || isAttuned;
    return bonusActive ? (magicProps.bonusToAc ?? 0) : 0;
  })();

  const shieldMagicAcBonus = (() => {
    if (!equippedShieldInstance) return 0;
    const shieldData = getItemById(equippedShieldInstance.baseItemId);
    const magicProps =
      equippedShieldInstance.overrides?.magicItemProperties ??
      shieldData?.magicItemProperties ??
      null;
    if (!magicProps) return 0;
    const isAttuned = state.attunedInstanceIds.includes(
      equippedShieldInstance.instanceId,
    );
    const bonusActive = !magicProps.requiresAttunement || isAttuned;
    return bonusActive ? (magicProps.bonusToAc ?? 0) : 0;
  })();

  const baseArmorClass = calculateArmorClass(
    modifiers.dex,
    equippedArmor,
    isWearingShield,
    undefined,
    armorMagicAcBonus + shieldMagicAcBonus,
  );
  const baseArmorClassWithSubclassBonuses = baseArmorClass + subclassAcBonus;

  // #endregion

  // #region --- Apply Trait-Based Modifiers ---

  // Apply trait-based stat modifiers
  let finalArmorClass = baseArmorClassWithSubclassBonuses;
  let finalSpeed = baseSpeed + subclassSpeedBonus;
  let initiativeFlatBonuses = 0;
  let hasJackOfAllTrades = false;
  let finalInitiative = baseInitiative;

  allTraits.forEach((trait) => {
    trait.effects?.forEach((effect) => {
      const isActive = evaluateAllPredicates(effect.predicates, state, {
        totalScores,
        modifiers,
        proficiencyBonus,
        maxHp,
        currentHp,
        initiative: finalInitiative,
        armorClass: finalArmorClass,
        isArmorPenalized,
        armorStealthDisadvantage,
        totalWeight,
        isEncumbered,
        speed: finalSpeed,
      });

      if (!isActive) return;

      if (
        effect.type === "half_proficiency" &&
        effect.target === "unproficient_checks"
      ) {
        hasJackOfAllTrades = true;
        finalInitiative = calculateInitiative(
          modifiers.dex,
          initiativeFlatBonuses,
          hasJackOfAllTrades,
          proficiencyBonus,
        );
        return;
      }

      if (effect.type !== "stat_modifier") return;

      // Apply AC modifiers
      if (effect.target === "ac" && effect.value !== undefined) {
        let acBonus = 0;
        if (typeof effect.value === "number") {
          acBonus = effect.value;
        } else {
          acBonus = modifiers.dex + modifiers[effect.value as Ability];
        }
        finalArmorClass += acBonus;
      }

      if (effect.target === "initiative" && effect.value !== undefined) {
        if (typeof effect.value === "number") {
          initiativeFlatBonuses += effect.value;
        } else {
          initiativeFlatBonuses += modifiers[effect.value as Ability] ?? 0;
        }

        finalInitiative = calculateInitiative(
          modifiers.dex,
          initiativeFlatBonuses,
          hasJackOfAllTrades,
          proficiencyBonus,
        );
      }

      // Apply speed modifiers
      if (effect.target === "speed" && typeof effect.value === "number") {
        finalSpeed += effect.value;
      }
    });
  });

  if (
    equippedArmor?.armorProperties?.armorType === "heavy" &&
    equippedArmor.armorProperties.strengthRequirement !== undefined &&
    totalScores.str < equippedArmor.armorProperties.strengthRequirement
  ) {
    finalSpeed -= 10;
  }

  // #endregion

  // #region --- Return Final Derived Stats ---
  return {
    abilities: {
      scores: totalScores,
      modifiers,
    },
    combat: {
      proficiencyBonus,
      hp: {
        max: maxHp,
        current: currentHp,
      },
      initiative: finalInitiative,
      armorClass: finalArmorClass,
      isArmorPenalized,
      armorStealthDisadvantage,
      speed: finalSpeed,
    },
    encumbrance: {
      totalWeight,
      carryingCapacity,
      isEncumbered,
    },
  };
  // #endregion
};
