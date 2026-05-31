import { getAllItemCategories, getItemById } from "../data/staticDataApi";
import { useCharacterStore } from "../store/useCharacterStore";
import type { UUID } from "../types/common";
import type { Attack } from "../types/action";
import type { ItemInstanceData, WeaponPropertyCatalogEntry } from "../types/item";
import { resolveInstance } from "../utils/inventoryUtils";
import {
  aggregateNonSkillProficienciesMulticlass,
  isWeaponProficient,
} from "../utils/proficiencyAggregator";
import { getAllCharacterTraits } from "../utils/traitUtils";
import { resolveSizeFromTraits } from "../utils/traitEffectResolvers";
import { useCharacterStats } from "./useCharacterStats";

/**
 * Custom hook to calculate the character's attacks based on their equipped weapons,
 * proficiencies, and derived stats. It returns an array of attack objects containing
 * all necessary information for displaying and executing attacks in the UI.
 * @returns An object containing the array of attacks with details such as to-hit bonus, damage string, properties, range, and ammunition status.
 */
export const useAttacks = (): { attacks: Attack[] } => {
  const formatRangeBand = (rangeBand?: { normal: number; long?: number }) => {
    if (!rangeBand) return null;
    return typeof rangeBand.long === "number"
      ? `${rangeBand.normal}/${rangeBand.long} ft`
      : `${rangeBand.normal} ft`;
  };

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

  // #region --- Resolve Character Size ---

  const characterSize = resolveSizeFromTraits(allTraits, state.level);

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

  const weaponCategoryMembershipByItemId = new Map<string, string[]>();
  getAllItemCategories().forEach((category) => {
    if (!category.id.startsWith("category_weapon_")) {
      return;
    }

    category.itemIds.forEach((itemId) => {
      const existing = weaponCategoryMembershipByItemId.get(itemId) ?? [];
      weaponCategoryMembershipByItemId.set(itemId, [...existing, category.id]);
    });
  });

  // #endregion

  // #region --- Calculate Attacks ---

  // Unified weapon source list from equipped instance IDs.
  type WeaponSource = {
    instanceId: UUID | null;
    baseItemId: string;
    instanceData: ItemInstanceData | null;
  };

  const weaponSources: WeaponSource[] = state.equippedWeaponInstanceIds.map(
    (instanceId) => {
      const instanceData = resolveInstance(
        instanceId,
        state.inventoryInstances,
      );
      return {
        instanceId,
        baseItemId: instanceData?.baseItemId ?? "",
        instanceData,
      };
    },
  );

  const getThrowableCountForItem = (itemId: string): number => {
    const stackCount = state.inventoryStacks.reduce(
      (total, stack) =>
        stack.baseItemId === itemId ? total + stack.quantity : total,
      0,
    );
    const instanceCount = state.inventoryInstances.reduce(
      (total, instance) =>
        instance.baseItemId === itemId ? total + 1 : total,
      0,
    );

    return stackCount + instanceCount;
  };

  const resolveAttackStatModifier = (
    attackAbility: "str" | "dex" | "choice",
  ): number => {
    if (attackAbility === "dex") {
      return derivedStats.modifiers.dex || 0;
    }

    if (attackAbility === "choice") {
      return Math.max(derivedStats.modifiers.dex, derivedStats.modifiers.str);
    }

    return derivedStats.modifiers.str || 0;
  };

  const equippedAttacks = weaponSources
    .flatMap(({ instanceId, baseItemId, instanceData }) => {
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
      const hasReachProperty = props.propertyIds.includes("property_reach");

      const statMod = resolveAttackStatModifier(props.rules.attackAbility);

      // #region --- Proficiency Check ---
      const categoryIds = weaponCategoryMembershipByItemId.get(baseItemId) ?? [];
      const isProficient = isWeaponProficient(
        {
          baseItemId,
          weaponCategory: props.category,
          categoryIds,
        },
        activeWeaponProficiencies.has,
      );
      // #endregion

      // #region --- Calculate to-hit and damage ---
      const toHit =
        statMod +
        (isProficient ? derivedStats.proficiencyBonus : 0) +
        magicAttackBonus;
      const damageBonus = statMod + magicDamageBonus;
      // #endregion

      // #region --- Ammunition check ---
      let ammoCount = null;
      let ammoName = null;
      let canAttack = true;

      if (props.rules.requiresAmmunition && props.ammoItemId) {
        // If the weapon uses ammunition, check the inventory stacks for the ammo item and count
        const ammoItem = getItemById(props.ammoItemId);
        const ammoStack = state.inventoryStacks.find(
          (stack) => stack.baseItemId === props.ammoItemId,
        );

        ammoCount = ammoStack?.quantity ?? 0;
        ammoName = ammoItem?.name || "Ammunition";

        if (ammoCount === 0) canAttack = false;
      }
      // #endregion

      const baseAttack = {
        instanceId,
        weaponId: baseItemId,
        name: effectiveName,
        toHit,
        damageString: `${props.damageDice} ${damageBonus >= 0 ? `+ ${damageBonus}` : `- ${Math.abs(damageBonus)}`} ${props.damageType}`,
        properties: props.properties as WeaponPropertyCatalogEntry[],
        range: props.range,
        rangeInfo: props.rules.range,
        meleeReachFeet: props.rules.meleeReachFeet,
        hasReachProperty,
        versatileDamageDice: props.versatileDamageDice ?? null,
        ammo: props.ammoItemId
          ? { id: props.ammoItemId, name: ammoName, count: ammoCount }
          : null,
        canAttack,
        heavyDisadvantage: props.rules.heavy && characterSize === "small",
        isThrown: false,
        versatileMode: instanceData?.versatileMode ?? "one-handed",
      };

      const hasThrownOption =
        !props.rules.isRangedWeapon &&
        typeof props.rules.thrownRange?.normal === "number";

      if (!hasThrownOption) {
        return [baseAttack];
      }

      const thrownRangeInfo = props.rules.thrownRange;
      const thrownRangeText = formatRangeBand(thrownRangeInfo) ?? props.range;
      const throwableCount = getThrowableCountForItem(baseItemId);

      const thrownAttack = {
        ...baseAttack,
        name: `${effectiveName} [Thrown]`,
        range: thrownRangeText,
        rangeInfo: thrownRangeInfo,
        hasReachProperty: false,
        isThrown: true,
        canAttack: canAttack && throwableCount > 0,
        throwableItemId: baseItemId,
        throwableCount,
      };

      return [baseAttack, thrownAttack];
    })
    .filter(Boolean); // Filter out any nulls

  const stackThrownAttacks = state.inventoryStacks
    .flatMap((stack) => {
      if (stack.quantity <= 0) return [];

      const baseItem = getItemById(stack.baseItemId);
      if (!baseItem?.weaponProperties) return [];

      const props = baseItem.weaponProperties;
      const hasThrownOption =
        !props.rules.isRangedWeapon &&
        typeof props.rules.thrownRange?.normal === "number";

      if (!hasThrownOption) {
        return [];
      }

      const categoryIds =
        weaponCategoryMembershipByItemId.get(stack.baseItemId) ?? [];
      const isProficient = isWeaponProficient(
        {
          baseItemId: stack.baseItemId,
          weaponCategory: props.category,
          categoryIds,
        },
        activeWeaponProficiencies.has,
      );

      const statMod = resolveAttackStatModifier(props.rules.attackAbility);
      const toHit =
        statMod +
        (isProficient ? derivedStats.proficiencyBonus : 0);
      const damageBonus = statMod;
      const thrownRangeInfo = props.rules.thrownRange;
      const thrownRangeText = formatRangeBand(thrownRangeInfo) ?? props.range;

      return [
        {
          instanceId: null,
          weaponId: stack.baseItemId,
          name: `${baseItem.name} [Thrown]`,
          toHit,
          damageString: `${props.damageDice} ${damageBonus >= 0 ? `+ ${damageBonus}` : `- ${Math.abs(damageBonus)}`} ${props.damageType}`,
          properties: props.properties as WeaponPropertyCatalogEntry[],
          range: thrownRangeText,
          rangeInfo: thrownRangeInfo,
          meleeReachFeet: props.rules.meleeReachFeet,
          hasReachProperty: false,
          versatileDamageDice: null,
          ammo: null,
          canAttack: stack.quantity > 0,
          heavyDisadvantage: props.rules.heavy && characterSize === "small",
          isThrown: true,
          versatileMode: "one-handed" as const,
          throwableItemId: stack.baseItemId,
          throwableCount: stack.quantity,
        },
      ];
    })
    .filter(Boolean);

  const attacks = [...equippedAttacks, ...stackThrownAttacks];

  // #endregion

  return { attacks };
};
