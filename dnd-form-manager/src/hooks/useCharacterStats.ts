import {
  getClassById,
  getItemById,
  getRaceById,
  getSubclassById,
  getSubraceById,
} from "../data/staticDataApi";
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
import { getAllCharacterTraits } from "../utils/traitUtils";

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

// #region --- Public Types ---

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

// #endregion

export interface CharacterStatsContext {
  totalScores: Record<Ability, number>;
  modifiers: Record<Ability, number>;
  proficiencyBonus: number;
  maxHp: number;
  currentHp: number;
  initiative: number;
  armorClass: number;
  isArmorPenalized: boolean;
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
    speed: number;
  };
  encumbrance: {
    totalWeight: number;
    carryingCapacity: number;
    isEncumbered: boolean;
  };
}

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
  totalWeight: stats.encumbrance.totalWeight,
  isEncumbered: stats.encumbrance.isEncumbered,
  speed: stats.combat.speed,
});

/**
 * Custom hook to calculate the character's derived stats based on their base ability scores,
 * racial and subracial bonuses, class and subclass features, and other traits.
 */
export const useCharacterStats = (): UseCharacterStatsReturn => {
  // #region --- Get Character State and Static Data ---
  const state = useCharacterStore();

  // fetch static definitions
  const raceData = state.raceId ? getRaceById(state.raceId) : null;
  const subraceData = state.subraceId ? getSubraceById(state.subraceId) : null;
  const classData = state.classId ? getClassById(state.classId) : null;
  const subclassData = state.subclassId ? getSubclassById(state.subclassId) : null;

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

  // Calculate all ability scores and modifiers in one pass
  const abilities: Ability[] = ["str", "dex", "con", "int", "wis", "cha"];
  const totalScores = abilities.reduce(
    (acc, ability) => {
      acc[ability] = calculateTotalAbilityScore(
        ability,
        state.baseAbilityScores[ability],
        raceData,
        subraceData,
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
    getFirstDefinedScalingValue(subclassScaling, SUBCLASS_SCALING_KEYS.initiative),
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

  // Calculate total weight from inventory
  const totalWeight = state.inventory.reduce((total, record) => {
    const itemData = getItemById(record.itemId);
    return total + (itemData?.weight || 0) * record.quantity;
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

  // Resolve equipment data
  const equippedArmorData = state.equippedArmorId
    ? getItemById(state.equippedArmorId)
    : null;
  const equippedArmor: Parameters<typeof calculateArmorClass>[1] =
    equippedArmorData?.type === "armor" && equippedArmorData.armorProperties
      ? (equippedArmorData as Exclude<
          Parameters<typeof calculateArmorClass>[1],
          null
        >)
      : null;
  const isWearingShield = !!state.equippedShieldId;

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
    totalWeight,
    isEncumbered,
    speed: 30 + subclassSpeedBonus,
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
    (!!state.equippedArmorId &&
      equippedArmor?.armorProperties &&
      !nonSkillProficiencies.armor.has(equippedArmor.armorProperties.armorType)) ||
    (isWearingShield && !nonSkillProficiencies.armor.has("shield"));

  const baseArmorClass = calculateArmorClass(
    modifiers.dex,
    equippedArmor,
    isWearingShield,
  );
  const baseArmorClassWithSubclassBonuses = baseArmorClass + subclassAcBonus;

  // #endregion

  // #region --- Apply Trait-Based Modifiers ---

  // Apply trait-based stat modifiers
  let finalArmorClass = baseArmorClassWithSubclassBonuses;
  let finalSpeed = 30 + subclassSpeedBonus;
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

  // #endregion

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
      speed: finalSpeed,
    },
    encumbrance: {
      totalWeight,
      carryingCapacity,
      isEncumbered,
    },
  };
};
