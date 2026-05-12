import type React from "react";
import { useCharacterStore } from "../../store/useCharacterStore";
import { useCharacterStats } from "../../hooks/useCharacterStats";
import { useMemo } from "react";
import { getItemById } from "../../data/staticDataApi";
import { WealthTracker } from "./ui/WealthTracker";
import {
  InventoryBoardView,
  type InventoryBoardHydratedInstance,
  type InventoryBoardHydratedStack,
} from "./InventoryBoardView.tsx";

// #region Component

export const InventoryBoard: React.FC = () => {
  const store = useCharacterStore();
  const { encumbrance } = useCharacterStats();

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
            lore: {
              shortDescription: instance.itemData.lore.shortDescription,
            },
            armorProperties: instance.itemData.armorProperties,
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

  const toggleEquipWeapon = (instanceId: string, isEquipped: boolean) => {
    if (isEquipped) store.unequipWeaponInstance(instanceId);
    else store.equipWeaponInstance(instanceId);
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
    <InventoryBoardView
      wealthView={<WealthTracker />}
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
  );
};

// #endregion
