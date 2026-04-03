import {
  getClassById,
  getItemById,
  getRaceById,
  getSubraceById,
} from "../data/staticDataApi";
import { useCharacterStore } from "../store/useCharacterStore";
import type { Ability } from "../types/common";
import {
  calculateModifier,
  calculateTotalAbilityScore,
  calculateTotalASI,
} from "../utils/abilityUtils";
import { calculateArmorClass } from "../utils/acUtils";
import { calculateMaxHP } from "../utils/hpUtils";
import { calculateInitiative } from "../utils/initiativeUtils";
import { evaluateAllPredicates } from "../utils/predicateEngine";
import { aggregateNonSkillProficiencies } from "../utils/proficiencyAggregator";
import { calculateProficiencyBonus } from "../utils/progressionUtils";
import { getAllCharacterTraits } from "../utils/traitUtils";

export const useCharacterStats = () => {
  // Pull raw data from zustand
  const state = useCharacterStore();

  // fetch static definitions
  const raceData = state.raceId ? getRaceById(state.raceId) : null;
  const subraceData = state.subraceId ? getSubraceById(state.subraceId) : null;
  const classData = state.classId ? getClassById(state.classId) : null;
  // TODO: get data from subclass and process

  const allTraits = getAllCharacterTraits(
    state.level,
    state.raceId,
    state.subraceId,
    state.classId,
    state.subclassId,
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

  // Calculate total weight from inventory
  const totalWeight = state.inventory.reduce((total, record) => {
    const itemData = getItemById(record.itemId);
    return total + (itemData?.weight || 0) * record.quantity;
  }, 0);

  const carryingCapacity = totalScores.str * 15;
  const isEncumbered = totalWeight > carryingCapacity;

  // Calculate Derived Combat Stats
  const proficiencyBonus = calculateProficiencyBonus(state.level);

  const maxHp = calculateMaxHP(
    state.level,
    classData?.hit_die,
    modifiers.con,
    state.hpRolls,
  );

  const currentHp = Math.max(0, maxHp - state.damageTaken);

  const baseInitiative = calculateInitiative(
    modifiers.dex,
    0,
    false,
    proficiencyBonus,
  );

  // Resolve equipment data
  const equippedArmorData = state.equippedArmorId
    ? getItemById(state.equippedArmorId)
    : null;
  const equippedArmor: Parameters<typeof calculateArmorClass>[1] =
    equippedArmorData?.type === "armor" && equippedArmorData.armor_properties
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
    speed: 30
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
      equippedArmor?.armor_properties &&
      !nonSkillProficiencies.armor.has(equippedArmor.armor_properties.armorType)) ||
    (isWearingShield && !nonSkillProficiencies.armor.has("shield"));

  const baseArmorClass = calculateArmorClass(
    modifiers.dex,
    equippedArmor,
    isWearingShield,
  );

  // Apply trait-based stat modifiers
  let finalArmorClass = baseArmorClass;
  let finalSpeed = 30;
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
