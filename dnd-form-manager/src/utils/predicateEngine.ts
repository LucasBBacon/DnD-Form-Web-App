import { getItemById } from "../data/staticDataApi";
import type { CharacterStatsContext } from "../hooks/useCharacterStats";
import type { useCharacterStore } from "../store/useCharacterStore";
import type { Ability } from "../types/common";
import type { WeaponProperty } from "../types/item";
import type { Predicate } from "../types/predicate";
import { getAllCharacterTraits } from "./traitUtils";

const hasCharacterTrait = (
  state: ReturnType<typeof useCharacterStore.getState>,
  traitId: string,
): boolean =>
  getAllCharacterTraits(
    state.level,
    state.raceId,
    state.subraceId,
    state.classId,
    state.subclassId,
    false,
    state.choicesByLevel ?? {},
    state.acquiredFeats ?? [],
    state.classTracks ?? [],
  ).some((trait) => trait.id === traitId);

const warnInvalidRequiresTraitPredicate = (predicate: Predicate): void => {
  if (import.meta.env.DEV) {
    console.warn(
      "Invalid requires_trait predicate: missing target trait id",
      predicate,
    );
  }
};

const hasEquippedWeaponProperty = (
  state: ReturnType<typeof useCharacterStore.getState>,
  propertyTarget: string,
): boolean =>
  state.equippedWeaponIds.some((weaponId) => {
    const weapon = getItemById(weaponId);
    if (!weapon?.weaponProperties) return false;
    if (propertyTarget === "ranged") {
      return weapon.weaponProperties.category.includes("ranged");
    }
    return weapon.weaponProperties.properties.includes(
      propertyTarget as WeaponProperty,
    );
  });

export const evaluatePredicate = (
  predicate: Predicate,
  state: ReturnType<typeof useCharacterStore.getState>,
  stats: CharacterStatsContext,
): boolean => {
  switch (predicate.type) {
    case "armor_required": {
      // if no armor equipped, fail
      if (!state.equippedArmorId) return false;

      const armor = getItemById(state.equippedArmorId);
      if (predicate.value === "any") return true;
      return armor?.armorProperties?.armorType === predicate.value;
    }

    case "armor_prohibited": {
      if (!state.equippedArmorId) return true;
      // 'any' means all armor categories are prohibited
      if (predicate.value === "any") return false;
      const armor = getItemById(state.equippedArmorId);
      // Return false if the equipped armor matches the prohibited category
      return armor?.armorProperties?.armorType !== predicate.value;
    }

    case "shield_prohibited": {
      const hasShield = !!state.equippedShieldId;
      // If predicate.value is true (shield IS prohibited), we return true if they DON'T have a shield
      return predicate.value === true ? !hasShield : hasShield;
    }

    case "stat_minimum": {
      if (!predicate.target || typeof predicate.value !== "number")
        return false;
      // Check the derived modifiers/totals
      const statTotal = stats.totalScores[predicate.target as Ability];
      return statTotal >= predicate.value;
    }

    case "requires_trait": {
      if (!predicate.target?.trim()) {
        warnInvalidRequiresTraitPredicate(predicate);
        return false;
      }

      return hasCharacterTrait(state, predicate.target);
    }

    case "weapon_property": {
      if (!predicate.target?.trim()) {
        if (import.meta.env.DEV) {
          console.warn(
            "Invalid weapon_property predicate: missing target property name",
            predicate,
          );
        }
        return false;
      }

      return hasEquippedWeaponProperty(state, predicate.target);
    }

    case "environment_condition": {
      // Environment-aware evaluation is not implemented !! return false !!
      // so the effect does not active rather than granting it unconditionally
      if (import.meta.env.DEV) {
        console.warn(
          "environment_condition predicate is not yet implemented",
          predicate,
        );
      }
      return false;
    }

    default:
      console.warn(`Unknown predicate type: ${predicate.type}`);
      return false;
  }
};

// Helper to evaluate an array of predicates (ALL must be true)
export const evaluateAllPredicates = (
  predicates: Predicate[] | undefined,
  state: ReturnType<typeof useCharacterStore.getState>,
  stats: CharacterStatsContext,
): boolean => {
  if (!predicates || predicates.length === 0) return true;
  return predicates.every((p) => evaluatePredicate(p, state, stats));
};
