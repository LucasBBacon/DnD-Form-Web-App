import { getItemById } from "../data/staticDataApi";
import { useCharacterStore } from "../store/useCharacterStore";
import { getSelectedProficiencyChoices } from "../utils/choiceUtils";
import { evaluateAllPredicates } from "../utils/predicateEngine";
import { getAllCharacterTraits } from "../utils/traitUtils";
import { useCharacterStats } from "./useCharacterStats";

export const useAttacks = () => {
  const state = useCharacterStore();
  const derivedStats = useCharacterStats();

  const allTraits = getAllCharacterTraits(
    state.level,
    state.raceId,
    state.subraceId,
    state.classId,
    state.subclassId,
  );

  // #region Aggregate Proficiencies

  const activeProficiencies = new Set<string>();

  const selectedChoices = getSelectedProficiencyChoices(
    state.choicesByLevel,
    state.level,
  );
  selectedChoices.weaponChoices.forEach((weapon) =>
    activeProficiencies.add(weapon),
  );

  // Data driven proficiencies
  allTraits.forEach((trait) => {
    trait.effects?.forEach((effect) => {
      if (effect.type === "proficiency" && effect.target) {
        const isActive = evaluateAllPredicates(
          effect.predicates,
          state,
          derivedStats,
        );
        if (isActive) {
          activeProficiencies.add(effect.target);
        }
      }
    });
  });

  // #endregion

  // #region Calculate Attacks

  const attacks = state.equippedWeaponIds
    .map((weaponId) => {
      const weaponData = getItemById(weaponId);
      if (!weaponData || !weaponData.weaponProperties) return null;

      const props = weaponData.weaponProperties;

      // region Determine governing stat (str vs dex)
      let attackStat = "str";
      if (props.category.includes("ranged")) {
        attackStat = "dex";
      } else if (props.properties.includes("finesse")) {
        // finesse lets player choose the higher stat
        attackStat =
          derivedStats.modifiers.dex > derivedStats.modifiers.str
            ? "dex"
            : "str";
      }

      const statMod = derivedStats.modifiers[attackStat as "str" | "dex"] || 0;

      // #region Proficiency Check
      // Ask if unified set if contains the broad category or weapon id
      const isProficient =
        (activeProficiencies.has("simple") &&
          props.category.includes("simple")) ||
        (activeProficiencies.has("martial") &&
          props.category.includes("martial")) ||
        activeProficiencies.has(weaponData.id);
      // #endregion

      // #region Calculate to-hit and damage
      const toHit =
        statMod + (isProficient ? derivedStats.proficiencyBonus : 0);
      const damageBonus = statMod;
      // #endregion

      // #region Ammunition check
      let ammoCount = null;
      let ammoName = null;
      let canAttack = true;

      if (props.properties.includes("ammunition") && props.ammoItemId) {
        const ammoItem = getItemById(props.ammoItemId);
        const inventoryRecord = state.inventory.find(
          (i) => i.itemId === props.ammoItemId,
        );

        ammoCount = inventoryRecord?.quantity || 0;
        ammoName = ammoItem?.name || "Ammunition";

        if (ammoCount === 0) canAttack = false;
      }
      // #endregion

      return {
        weaponId: weaponData.id,
        name: weaponData.name,
        toHit,
        damageString: `${props.damageDice} ${damageBonus >= 0 ? `+ ${damageBonus}` : `- ${Math.abs(damageBonus)}`} ${props.damageType}`,
        properties: props.properties,
        range: props.range,
        ammo: props.ammoItemId
          ? { id: props.ammoItemId, name: ammoName, count: ammoCount }
          : null,
        canAttack,
      };
    })
    .filter(Boolean); // Filter out any nulls

  return { attacks };
};

// #endregion
