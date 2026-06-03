import type React from "react";
import { useCharacterStore } from "../../store/useCharacterStore.ts";
import { useCharacterStats } from "../../hooks/useCharacterStats.ts";
import { useMemo, useState } from "react";
import { getItemById } from "../../data/staticDataApi.ts";
import { TwoHandedWarningDialog } from "./ui/TwoHandedWarningDialog.tsx";
import { canEquipTwoHandedWeapon } from "../../utils/equipmentValidator.ts";
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
  const inventoryInstances = useCharacterStore((state) => state.inventoryInstances);
  const inventoryStacks = useCharacterStore((state) => state.inventoryStacks);
  const equippedWeaponInstanceIds = useCharacterStore(
    (state) => state.equippedWeaponInstanceIds,
  );
  const equippedArmorInstanceId = useCharacterStore(
    (state) => state.equippedArmorInstanceId,
  );
  const equippedShieldInstanceId = useCharacterStore(
    (state) => state.equippedShieldInstanceId,
  );
  const attunedInstanceIds = useCharacterStore((state) => state.attunedInstanceIds);

  const equipWeaponInstance = useCharacterStore((state) => state.equipWeaponInstance);
  const unequipWeaponInstance = useCharacterStore((state) => state.unequipWeaponInstance);
  const equipArmorInstance = useCharacterStore((state) => state.equipArmorInstance);
  const equipShieldInstance = useCharacterStore((state) => state.equipShieldInstance);
  const attuneInstance = useCharacterStore((state) => state.attuneInstance);
  const unattuneInstance = useCharacterStore((state) => state.unattuneInstance);
  const removeInventoryInstance = useCharacterStore(
    (state) => state.removeInventoryInstance,
  );
  const removeInventoryItem = useCharacterStore((state) => state.removeInventoryItem);
  const addInventoryItem = useCharacterStore((state) => state.addInventoryItem);

  const { encumbrance } = useCharacterStats();
  const [twoHandedWarningState, setTwoHandedWarningState] = useState<TwoHandedWarningState | null>(null);

  // #region Hydration

  // Hydrate instances
  const { hydratedInstances, missingInstanceItemIds } = useMemo(() => {
    const missingItemIds: string[] = [];
    const resolvedInstances: InventoryBoardHydratedInstance[] =
      inventoryInstances
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
  }, [inventoryInstances]);

  // Hydrate stacks
  const { hydratedStacks, missingStackItemIds } = useMemo(() => {
    const missingItemIds: string[] = [];
    const resolvedStacks: InventoryBoardHydratedStack[] = inventoryStacks
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
  }, [inventoryStacks]);

  const missingItemIds = useMemo(
    () =>
      Array.from(new Set([...missingInstanceItemIds, ...missingStackItemIds])),
    [missingInstanceItemIds, missingStackItemIds],
  );

  // #endregion

  // #region Action Handlers

  const getInstanceDisplayName = (instanceId: string | null): string | null => {
    if (!instanceId) return null;
    const instance = inventoryInstances.find(
      (entry) => entry.instanceId === instanceId,
    );
    if (!instance) return null;
    const baseItem = getItemById(instance.baseItemId);
    return instance.customName ?? baseItem?.name ?? null;
  };

  const toggleEquipWeapon = (instanceId: string, isEquipped: boolean) => {
    if (isEquipped) {
      unequipWeaponInstance(instanceId);
      return;
    }

    const validation = canEquipTwoHandedWeapon({
      targetWeaponInstanceId: instanceId,
      inventoryInstances,
      equippedWeaponInstanceIds,
      equippedShieldInstanceId,
    });

    if (!validation.isTwoHandedWeapon || !validation.hasConflicts) {
      equipWeaponInstance(instanceId);
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
      equipShieldInstance(null);
    }

    twoHandedWarningState.conflictingWeaponInstanceIds.forEach((instanceId) => {
      unequipWeaponInstance(instanceId);
    });

    equipWeaponInstance(twoHandedWarningState.targetWeaponInstanceId);
    setTwoHandedWarningState(null);
  };

  const toggleEquipArmor = (
    instanceId: string,
    isEquipped: boolean,
    armorType: string,
  ) => {
    if (armorType === "shield") {
      equipShieldInstance(isEquipped ? null : instanceId);
    } else {
      equipArmorInstance(isEquipped ? null : instanceId);
    }
  };

  const toggleAttunement = (instanceId: string, isAttuned: boolean) => {
    if (isAttuned) unattuneInstance(instanceId);
    else attuneInstance(instanceId);
  };

  const dropInstance = (instanceId: string) => {
    removeInventoryInstance(instanceId);
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
        equippedWeaponInstanceIds={equippedWeaponInstanceIds}
        equippedArmorInstanceId={equippedArmorInstanceId}
        equippedShieldInstanceId={equippedShieldInstanceId}
        attunedInstanceIds={attunedInstanceIds}
        onToggleWeaponEquip={toggleEquipWeapon}
        onToggleArmorEquip={toggleEquipArmor}
        onToggleAttunement={toggleAttunement}
        onDropInstance={dropInstance}
        onStackDecrement={(baseItemId: string) =>
          removeInventoryItem(baseItemId, 1)
        }
        onStackIncrement={(baseItemId: string) =>
          addInventoryItem(baseItemId, 1)
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
