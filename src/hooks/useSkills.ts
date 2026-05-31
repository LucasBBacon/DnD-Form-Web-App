import { useCharacterStore } from "../store/useCharacterStore";
import type { Ability, Skill } from "../types/common";
import { ABILITIES } from "../utils/abilityConstants";
import { SKILL_ABILITY_MAP } from "../utils/constants";
import { evaluateAllPredicates } from "../utils/predicateEngine";
import { aggregateSaveProficienciesMulticlass } from "../utils/proficiencyAggregator";
import { aggregateSkills } from "../utils/skillUtils";
import { getAllCharacterTraits } from "../utils/traitUtils";
import { useCharacterStats } from "./useCharacterStats";

/**
 * Custom hook to calculate the character's skill-related values based on their ability scores,
 * proficiencies, expertise, and trait effects.
 * @returns An object containing the character's skill totals, advantage/disadvantage sources,
 * saving throw totals, and passive scores.
 */
export const useSkills = () => {
  // #region --- Get Character State and Derived Stats ---

  // Source of truth for character selections and progression choices.
  const state = useCharacterStore();

  // Derived values from ability scores, equipment, and progression.
  const { abilities: abilityStats, combat, encumbrance } = useCharacterStats();
  const derivedStats = {
    totalScores: abilityStats.scores,
    modifiers: abilityStats.modifiers,
    proficiencyBonus: combat.proficiencyBonus,
    maxHp: combat.hp.max,
    currentHp: combat.hp.current,
    initiative: combat.initiative,
    armorClass: combat.armorClass,
    isArmorPenalized: combat.isArmorPenalized,
    armorStealthDisadvantage: combat.armorStealthDisadvantage,
    totalWeight: encumbrance.totalWeight,
    isEncumbered: encumbrance.isEncumbered,
    speed: combat.speed,
  };

  // #endregion

  // #region --- Trait Effects (predicate-driven modifiers) ---

  const allTraits = getAllCharacterTraits(
    state.level,
    state.raceId,
    state.subraceId,
    state.classId,
    state.subclassId,
    false,
    state.choicesByLevel,
    state.acquiredFeats,
    state.classTracks,
  );
  
  // #endregion

  // #region --- Skill Source Aggregation ---

  // Collect skill proficiencies/expertise granted by race, class, and user choices.
  const { proficiencies, expertise } = aggregateSkills(
    state.chosenRacialSkills,
    state.chosenBackgroundSkills,
    state.choicesByLevel,
    state.level,
    allTraits,
    state,
    derivedStats,
  );

  let addsHalfProfToUnproficient = false;

  allTraits.forEach((trait) => {
    trait.effects?.forEach((effect) => {
      // Does this trait grant half proficiency to all unproficient checks?
      if (
        effect.type === "half_proficiency" &&
        effect.target === "unproficient_checks"
      ) {
        // Run predicates here
        const isActive = evaluateAllPredicates(
          effect.predicates,
          state,
          derivedStats,
        );
        if (isActive) addsHalfProfToUnproficient = true;
      }
    });
  });

  // Calculate the actual bonus to apply (round down)
  const halfProfBonus = Math.floor(derivedStats.proficiencyBonus / 2);

  // #endregion

  // #region --- Skill Totals ---

  const skillList = Object.keys(SKILL_ABILITY_MAP) as Skill[];
  const calculatedSkills = {} as Record<
    Skill,
    {
      total: number;
      isProficient: boolean;
      isExpertise: boolean;
      stat: Ability;
      advantageSources: string[];
      disadvantageSources: string[];
    }
  >;

  skillList.forEach((skill) => {
    const governingStat = SKILL_ABILITY_MAP[skill];
    const baseMod = derivedStats.modifiers[governingStat] || 0;
    const isProficient = proficiencies.includes(skill);
    const isExpertise = expertise.includes(skill);

    let finalMod = baseMod;
    if (isExpertise) {
      finalMod += derivedStats.proficiencyBonus * 2;
    } else if (isProficient) {
      finalMod += derivedStats.proficiencyBonus;
    } else if (addsHalfProfToUnproficient) {
      finalMod += halfProfBonus;
    }

    const advantageSources: string[] = [];
    const disadvantageSources: string[] = [];

    // Apply trait effects that explicitly target this skill and whose predicates resolve true.
    allTraits.forEach((trait) => {
      trait.effects?.forEach((effect) => {
        // Skip effects that target other skills.
        if (effect.target !== skill) return;

        // Predicates gate conditional bonuses, e.g. class/race/equipment states.
        const isActive = evaluateAllPredicates(
          effect.predicates,
          state,
          derivedStats,
        );

        if (isActive) {
          // Apply the effect based on its type.
          if (
            effect.type === "stat_modifier" &&
            typeof effect.value === "number"
          ) {
            // If the effect is a stat modifier and has a numeric value, add it to the final modifier.
            finalMod += effect.value;
          }
          if (effect.type === "advantage") {
            // If the effect grants advantage, add the trait name to the advantage sources.
            advantageSources.push(trait.name);
          }
          if (effect.type === "disadvantage") {
            // If the effect grants disadvantage, add the trait name to the disadvantage sources.
            disadvantageSources.push(trait.name);
          }
        }
      });
    });

    // D&D 5e rule: Stealth checks have disadvantage when armor imposes stealth disadvantage.
    if (skill === "stealth" && derivedStats.armorStealthDisadvantage) {
      disadvantageSources.push("Armor Stealth Disadvantage");
    }

    calculatedSkills[skill] = {
      total: finalMod,
      isProficient,
      isExpertise,
      stat: governingStat,
      advantageSources,
      disadvantageSources,
    };
  });
  // #endregion

  // #region --- Saving Throws ---

  const saveProficiencies = aggregateSaveProficienciesMulticlass({
    classTracks: state.classTracks,
    currentLevel: state.level,
    traits: allTraits,
    state,
    stats: derivedStats,
  });
  const abilities = ABILITIES;
  const calculatedSaves: Record<
    Ability,
    { total: number; isProficient: boolean }
  > = {} as Record<Ability, { total: number; isProficient: boolean }>;

  abilities.forEach((ability) => {
    const isProficient = saveProficiencies.has(ability);

    let finalMod = derivedStats.modifiers[ability] || 0;
    if (isProficient) finalMod += derivedStats.proficiencyBonus;

    calculatedSaves[ability] = { total: finalMod, isProficient };
  });

  // #endregion

  // #region --- Passive Scores ---

  // Passive score formula: 10 + related skill total + flat bonuses.
  const flatPassiveBonus = 0;
  const passivePerception =
    10 + calculatedSkills.perception.total + flatPassiveBonus;
  const passiveInvestigation =
    10 + calculatedSkills.investigation.total + flatPassiveBonus;
  const passiveInsight = 
    10 + calculatedSkills.insight.total + flatPassiveBonus;

  // #endregion

  return {
    calculatedSkills,
    calculatedSaves,
    proficiencyBonus: derivedStats.proficiencyBonus,
    passives: {
      perception: passivePerception,
      investigation: passiveInvestigation,
      insight: passiveInsight,
    },
  };
};
