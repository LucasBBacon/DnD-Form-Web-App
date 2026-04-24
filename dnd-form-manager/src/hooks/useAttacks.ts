import { getItemById } from "../data/staticDataApi";
import { useCharacterStore } from "../store/useCharacterStore";
import type { UUID } from "../types/common";
import type { ItemInstanceData } from "../types/item";
import { resolveInstance } from "../utils/inventoryUtils";
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
    armorStealthDisadvantage: combat.armorStealthDisadvantage,
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

  // Normalize to a unified source list: instance-based when available, legacy template fallback.
  type WeaponSource = {
    instanceId: UUID | null;
    baseItemId: string;
    instanceData: ItemInstanceData | null;
  };

  const weaponSources: WeaponSource[] =
    state.equippedWeaponInstanceIds.length > 0
      ? state.equippedWeaponInstanceIds.map((instanceId) => {
          const instanceData = resolveInstance(instanceId, state.inventoryInstances);
          return {
            instanceId,
            baseItemId: instanceData?.baseItemId ?? "",
            instanceData,
          };
        })
      : state.equippedWeaponIds.map((weaponId) => ({
          instanceId: null,
          baseItemId: weaponId,
          instanceData: null,
        }));

  const attacks = weaponSources
    .map(({ instanceId, baseItemId, instanceData }) => {
      if (!baseItemId) return null;
      const baseItem = getItemById(baseItemId);
      // If weapon data is missing, skip this weapon
      if (!baseItem?.weaponProperties) return null;

      const effectiveProps =
        instanceData?.overrides?.weaponProperties ?? baseItem.weaponProperties;
      const effectiveName = instanceData?.customName ?? baseItem.name;

      // #region --- Attunement-gated magic bonuses ---
      let magicAttackBonus = 0;
      let magicDamageBonus = 0;
      if (instanceId) {
        const magicProps =
          instanceData?.overrides?.magicItemProperties ??
          baseItem.magicItemProperties ??
          null;
        if (magicProps) {
          const isAttuned = state.attunedInstanceIds.includes(instanceId);
          const bonusActive = !magicProps.requiresAttunement || isAttuned;
          magicAttackBonus = bonusActive ? (magicProps.bonusToAttack ?? 0) : 0;
          magicDamageBonus = bonusActive ? (magicProps.bonusToDamage ?? 0) : 0;
        }
      }
      // #endregion

      const props = effectiveProps;

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
      // Check the broad category or the specific base item catalog id
      const isProficient =
        (activeWeaponProficiencies.has("simple") &&
          props.category.includes("simple")) ||
        (activeWeaponProficiencies.has("martial") &&
          props.category.includes("martial")) ||
        activeWeaponProficiencies.has(baseItemId);
      // #endregion

      // #region --- Calculate to-hit and damage ---
      const toHit =
        statMod + (isProficient ? derivedStats.proficiencyBonus : 0) + magicAttackBonus;
      const damageBonus = statMod + magicDamageBonus;
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
        instanceId,
        weaponId: baseItemId,
        name: effectiveName,
        toHit,
        damageString: `${props.damageDice} ${damageBonus >= 0 ? `+ ${damageBonus}` : `- ${Math.abs(damageBonus)}`} ${props.damageType}`,
        properties: props.properties,
        range: props.range,
        versatileDamageDice: props.versatileDamageDice ?? null,
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
