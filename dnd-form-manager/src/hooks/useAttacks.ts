import { getItemById } from "../data/staticDataApi";
import { useCharacterStore } from "../store/useCharacterStore";
import { aggregateNonSkillProficienciesMulticlass } from "../utils/proficiencyAggregator";
import { getAllCharacterTraits } from "../utils/traitUtils";
import { useCharacterStats } from "./useCharacterStats";

/**
 * Custom hook to calculate the character's attacks based on their equipped weapons,
 * proficiencies, and derived stats. It returns an array of attack objects containing
 * all necessary information for displaying and executing attacks in the UI.
 * @returns An object containing the array of attacks with details such as to-hit bonus, damage string, properties, range, and ammunition status.
 */
export const useAttacks = () => {
  // #region --- Get Character State and Derived Stats ---
  const state = useCharacterStore();
  const { abilities, combat, encumbrance } = useCharacterStats();
  const derivedStats = {
    totalScores: abilities.scores,
    modifiers: abilities.modifiers,
    proficiencyBonus: combat.proficiencyBonus,
    maxHp: combat.hp.max,
    currentHp: combat.hp.current,
    initiative: combat.initiative,
    armorClass: combat.armorClass,
    isArmorPenalized: combat.isArmorPenalized,
    totalWeight: encumbrance.totalWeight,
    isEncumbered: encumbrance.isEncumbered,
    speed: combat.speed,
  };
  // #endregion

  // #region --- Fetch All Traits ---

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

  // #region --- Aggregate Proficiencies ---

  const { weapons: activeWeaponProficiencies } =
    aggregateNonSkillProficienciesMulticlass({
      choicesByLevel: state.choicesByLevel,
      classTracks: state.classTracks,
      currentLevel: state.level,
      traits: allTraits,
      state,
      stats: derivedStats,
    });

  // #endregion

  // #region --- Calculate Attacks ---

  const attacks = state.equippedWeaponIds
    .map((weaponId) => {
      const weaponData = getItemById(weaponId);
      // If weapon data is missing, skip this weapon
      if (!weaponData || !weaponData.weaponProperties) return null;

      const props = weaponData.weaponProperties;

      // #region Determine governing stat (str vs dex)
      
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

      // Calculate the stat modifier for the attacking stat
      const statMod = derivedStats.modifiers[attackStat as "str" | "dex"] || 0;
      
      // #endregion

      // #region --- Proficiency Check ---
      // Ask if unified set if contains the broad category or weapon id
      const isProficient =
        (activeWeaponProficiencies.has("simple") &&
          props.category.includes("simple")) ||
        (activeWeaponProficiencies.has("martial") &&
          props.category.includes("martial")) ||
        activeWeaponProficiencies.has(weaponData.id);
      // #endregion

      // #region --- Calculate to-hit and damage ---
      const toHit =
        statMod + (isProficient ? derivedStats.proficiencyBonus : 0);
      const damageBonus = statMod;
      // #endregion

      // #region --- Ammunition check ---
      let ammoCount = null;
      let ammoName = null;
      let canAttack = true;

      if (props.properties.includes("ammunition") && props.ammoItemId) {
        // If the weapon uses ammunition, check the inventory for the ammo item and count
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

  // #endregion

  return { attacks };
};
