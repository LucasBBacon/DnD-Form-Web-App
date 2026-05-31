import type React from "react";
import { useCharacterStore } from "../../store/useCharacterStore";
import { useCharacterStats } from "../../hooks/useCharacterStats";
import { useMemo, useState } from "react";
import { getItemById } from "../../data/staticDataApi";
import { TwoHandedWarningDialog } from "./ui/TwoHandedWarningDialog";
import { canEquipTwoHandedWeapon } from "../../utils/equipmentValidator";
import {
  InventoryBoardView,
  type InventoryBoardHydratedInstance,
  type InventoryBoardHydratedStack,
} from "./InventoryBoardView.tsx";

interface TwoHandedWarningState {
  targetWeaponInstanceId: string;
  targetWeaponName: string;
  conflictingShieldInstanceId: string | null;
  conflictingShieldName: string | null;
  conflictingWeaponInstanceIds: string[];
  conflictingWeaponNames: string[];
}

// #region Component

export const InventoryBoard: React.FC = () => {
  const store = useCharacterStore();
  const { encumbrance } = useCharacterStats();
  const [twoHandedWarningState, setTwoHandedWarningState] = useState<TwoHandedWarningState | null>(null);

  // #region Hydration

  // Hydrate instances
  const { hydratedInstances, missingInstanceItemIds } = useMemo(() => {
    const missingItemIds: string[] = [];
    const resolvedInstances: InventoryBoardHydratedInstance[] =
      store.inventoryInstances
        .map((instance) => {
          const itemData = getItemById(instance.baseItemId);
          if (!itemData) {
            missingItemIds.push(instance.baseItemId);
            return null;
          }

          return { ...instance, itemData };
        })
        .filter(
          (instance): instance is NonNullable<typeof instance> =>
            instance !== null,
        )
        .map((instance) => ({
          instanceId: instance.instanceId,
          baseItemId: instance.baseItemId,
          itemData: {
            name: instance.itemData.name,
            type: instance.itemData.type,
            weight: instance.itemData.weight,
            cpCost: instance.itemData.cpCost,
            stacking: instance.itemData.stacking,
            lore: {
              shortDescription: instance.itemData.lore.shortDescription,
              fullText: instance.itemData.lore.fullText,
            },
            armorProperties: instance.itemData.armorProperties,
            weaponProperties: instance.itemData.weaponProperties,
            magicItemProperties: instance.itemData.magicItemProperties,
          },
        }));

    return {
      hydratedInstances: resolvedInstances,
      missingInstanceItemIds: Array.from(new Set(missingItemIds)),
    };
  }, [store.inventoryInstances]);

  // Hydrate stacks
  const { hydratedStacks, missingStackItemIds } = useMemo(() => {
    const missingItemIds: string[] = [];
    const resolvedStacks: InventoryBoardHydratedStack[] = store.inventoryStacks
      .map((stack) => {
        const itemData = getItemById(stack.baseItemId);
        if (!itemData) {
          missingItemIds.push(stack.baseItemId);
          return null;
        }

        return { ...stack, itemData };
      })
      .filter((stack): stack is NonNullable<typeof stack> => stack !== null)
      .map((stack) => ({
        stackId: stack.stackId,
        baseItemId: stack.baseItemId,
        quantity: stack.quantity,
        itemData: {
          name: stack.itemData.name,
          type: stack.itemData.type,
          weight: stack.itemData.weight,
          cpCost: stack.itemData.cpCost,
          lore: {
            shortDescription: stack.itemData.lore.shortDescription,
          },
          armorProperties: stack.itemData.armorProperties,
          magicItemProperties: stack.itemData.magicItemProperties,
        },
      }));

    return {
      hydratedStacks: resolvedStacks,
      missingStackItemIds: Array.from(new Set(missingItemIds)),
    };
  }, [store.inventoryStacks]);

  const missingItemIds = useMemo(
    () =>
      Array.from(new Set([...missingInstanceItemIds, ...missingStackItemIds])),
    [missingInstanceItemIds, missingStackItemIds],
  );

  // #endregion

  // #region Action Handlers

  const getInstanceDisplayName = (instanceId: string | null): string | null => {
    if (!instanceId) return null;
    const instance = store.inventoryInstances.find(
      (entry) => entry.instanceId === instanceId,
    );
    if (!instance) return null;
    const baseItem = getItemById(instance.baseItemId);
    return instance.customName ?? baseItem?.name ?? null;
  };

  const toggleEquipWeapon = (instanceId: string, isEquipped: boolean) => {
    if (isEquipped) {
      store.unequipWeaponInstance(instanceId);
      return;
    }

    const validation = canEquipTwoHandedWeapon({
      targetWeaponInstanceId: instanceId,
      inventoryInstances: store.inventoryInstances,
      equippedWeaponInstanceIds: store.equippedWeaponInstanceIds,
      equippedShieldInstanceId: store.equippedShieldInstanceId,
    });

    if (!validation.isTwoHandedWeapon || !validation.hasConflicts) {
      store.equipWeaponInstance(instanceId);
      return;
    }

    setTwoHandedWarningState({
      targetWeaponInstanceId: instanceId,
      targetWeaponName:
        getInstanceDisplayName(instanceId) ?? "Two-Handed Weapon",
      conflictingShieldInstanceId: validation.conflicts.shieldInstanceId,
      conflictingShieldName: getInstanceDisplayName(
        validation.conflicts.shieldInstanceId,
      ),
      conflictingWeaponInstanceIds: validation.conflicts.weaponInstanceIds,
      conflictingWeaponNames: validation.conflicts.weaponInstanceIds.map(
        (conflictId) => getInstanceDisplayName(conflictId) ?? "Equipped Weapon",
      ),
    });
  };

  const confirmTwoHandedEquip = () => {
    if (!twoHandedWarningState) return;

    if (twoHandedWarningState.conflictingShieldInstanceId) {
      store.equipShieldInstance(null);
    }

    twoHandedWarningState.conflictingWeaponInstanceIds.forEach((instanceId) => {
      store.unequipWeaponInstance(instanceId);
    });

    store.equipWeaponInstance(twoHandedWarningState.targetWeaponInstanceId);
    setTwoHandedWarningState(null);
  };

  const toggleEquipArmor = (
    instanceId: string,
    isEquipped: boolean,
    armorType: string,
  ) => {
    if (armorType === "shield") {
      store.equipShieldInstance(isEquipped ? null : instanceId);
    } else {
      store.equipArmorInstance(isEquipped ? null : instanceId);
    }
  };

  const toggleAttunement = (instanceId: string, isAttuned: boolean) => {
    if (isAttuned) store.unattuneInstance(instanceId);
    else store.attuneInstance(instanceId);
  };

  const dropInstance = (instanceId: string) => {
    store.removeInventoryInstance(instanceId);
  };

  return (
    <>
      <InventoryBoardView
        encumbrance={{
          totalWeight: encumbrance.totalWeight,
          capacity: encumbrance.carryingCapacity,
          isEncumbered: encumbrance.isEncumbered,
        }}
        missingItemIds={missingItemIds}
        instances={hydratedInstances}
        stacks={hydratedStacks}
        equippedWeaponInstanceIds={store.equippedWeaponInstanceIds}
        equippedArmorInstanceId={store.equippedArmorInstanceId}
        equippedShieldInstanceId={store.equippedShieldInstanceId}
        attunedInstanceIds={store.attunedInstanceIds}
        onToggleWeaponEquip={toggleEquipWeapon}
        onToggleArmorEquip={toggleEquipArmor}
        onToggleAttunement={toggleAttunement}
        onDropInstance={dropInstance}
        onStackDecrement={(baseItemId: string) =>
          store.removeInventoryItem(baseItemId, 1)
        }
        onStackIncrement={(baseItemId: string) =>
          store.addInventoryItem(baseItemId, 1)
        }
      />

      {twoHandedWarningState && (
        <TwoHandedWarningDialog
          weaponName={twoHandedWarningState.targetWeaponName}
          conflictingShieldName={twoHandedWarningState.conflictingShieldName}
          conflictingWeaponNames={twoHandedWarningState.conflictingWeaponNames}
          onCancel={() => setTwoHandedWarningState(null)}
          onConfirm={confirmTwoHandedEquip}
        />
      )}
    </>
  );
};

// #endregion
