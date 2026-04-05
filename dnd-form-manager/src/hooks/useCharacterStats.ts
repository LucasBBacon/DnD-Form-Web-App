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
import { aggregateNonSkillProficiencies } from "../utils/proficiencyAggregator";
import {
  calculateProficiencyBonus,
  mergeSubclassSpecificScaling,
} from "../utils/progressionUtils";
import { getAllCharacterTraits } from "../utils/traitUtils";

const resolveSubclassScalingBonus = (
  value: string | number | undefined,
  modifiers: Record<Ability, number>,
): number => {
  if (typeof value === "number") return value;
  if (!value) return 0;

  return modifiers[value as Ability] ?? 0;
};

const SUBCLASS_SCALING_KEYS: Record<
  "initiative" | "ac" | "speed",
  KnownSubclassStatScalingKey[]
> = {
  initiative: ["initiative", "initiative_bonus"],
  ac: ["ac", "armor_class"],
  speed: ["speed"],
};

const getFirstDefinedScalingValue = (
  scaling: SubclassSpecificScaling,
  keys: KnownSubclassStatScalingKey[],
) => {
  for (const key of keys) {
    if (scaling[key] !== undefined) return scaling[key];
  }

  return undefined;
};

export const useCharacterStats = () => {
  // Pull raw data from zustand
  const state = useCharacterStore();

  // fetch static definitions
  const raceData = state.raceId ? getRaceById(state.raceId) : null;
  const subraceData = state.subraceId ? getSubraceById(state.subraceId) : null;
  const classData = state.classId ? getClassById(state.classId) : null;
  const subclassData = state.subclassId ? getSubclassById(state.subclassId) : null;

  const allTraits = getAllCharacterTraits(
    state.level,
    state.raceId,
    state.subraceId,
    state.classId,
    state.subclassId,
    false,
    state.choicesByLevel,
    state.acquiredFeats ?? [],
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

  // Calculate total weight from inventory
  const totalWeight = state.inventory.reduce((total, record) => {
    const itemData = getItemById(record.itemId);
    return total + (itemData?.weight || 0) * record.quantity;
  }, 0);

  const carryingCapacity = totalScores.str * 15;
  const isEncumbered = totalWeight > carryingCapacity;

  // Calculate Derived Combat Stats
  const proficiencyBonus = calculateProficiencyBonus(state.level);

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

  const nonSkillProficiencies = aggregateNonSkillProficiencies({
    choicesByLevel: state.choicesByLevel,
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

  return {
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
  };
};
