import {
  ENCUMBRANCE_FIXTURES,
  INVENTORY_FIXTURES,
} from "../../fixtures/boardFixtures";
import type { ArmorProperties } from "../../types/item";
import type {
  InventoryBoardItemData,
  InventoryBoardHydratedInstance,
  InventoryBoardHydratedStack,
} from "./InventoryBoardView";

// #region Interface

export interface InventoryBoardScenario {
  /** Encumbrance details for the inventory board scenario */
  encumbrance: {
    /** Total weight of items in the inventory */
    totalWeight: number;
    /** Maximum carrying capacity */
    capacity: number;
    /** Whether the inventory is encumbered */
    isEncumbered: boolean;
  };
  /** IDs of items that are missing from the inventory */
  missingItemIds: string[];
  /** Instances of items in the inventory */
  instances: InventoryBoardHydratedInstance[];
  /** Stacks of items in the inventory */
  stacks: InventoryBoardHydratedStack[];
  /** IDs of equipped weapon instances */
  equippedWeaponInstanceIds: string[];
  /** ID of the equipped armor instance */
  equippedArmorInstanceId: string | null;
  /** ID of the equipped shield instance */
  equippedShieldInstanceId: string | null;
  /** IDs of attuned item instances */
  attunedInstanceIds: string[];
}

// #endregion

// #region Helpers

const buildArmorProperties = (
  armorType: ArmorProperties["armorType"],
): ArmorProperties => {
  switch (armorType) {
    case "shield":
      return {
        acApplication: "bonus",
        armorType: "shield",
        baseAc: 2,
        dexModifier: { mode: "none" },
        stealthDisadvantage: false,
      };
    case "heavy":
      return {
        acApplication: "set",
        armorType: "heavy",
        baseAc: 16,
        dexModifier: { mode: "none" },
        stealthDisadvantage: true,
        strengthRequirement: 13,
      };
    case "medium":
      return {
        acApplication: "set",
        armorType: "medium",
        baseAc: 14,
        dexModifier: { mode: "capped", cap: 2 },
        stealthDisadvantage: false,
      };
    case "light":
    default:
      return {
        acApplication: "set",
        armorType: "light",
        baseAc: 11,
        dexModifier: { mode: "full" },
        stealthDisadvantage: false,
      };
  }
};

const toInstance = (
  instance: (typeof INVENTORY_FIXTURES)[keyof typeof INVENTORY_FIXTURES]["instances"][number],
  type: InventoryBoardItemData["type"],
  shortDescription: string,
  armorType?: ArmorProperties["armorType"],
  requiresAttunement?: boolean,
): InventoryBoardHydratedInstance => ({
  instanceId: instance.instanceId,
  baseItemId: instance.baseItemId,
  itemData: {
    name: instance.itemData?.name ?? instance.baseItemId,
    type,
    weight: instance.itemData?.weight ?? 0,
    cpCost: instance.itemData?.cpCost ?? 0,
    lore: {
      shortDescription,
    },
    ...(armorType
      ? { armorProperties: buildArmorProperties(armorType) }
      : {}),
    ...(requiresAttunement
      ? { magicItemProperties: { requiresAttunement: true } }
      : {}),
  },
});

const toStack = (
  stack: (typeof INVENTORY_FIXTURES)[keyof typeof INVENTORY_FIXTURES]["stacks"][number],
  shortDescription: string,
): InventoryBoardHydratedStack => ({
  stackId: stack.stackId,
  baseItemId: stack.baseItemId,
  quantity: stack.quantity,
  itemData: {
    name: stack.itemData?.name ?? stack.baseItemId,
    type: "gear",
    weight: stack.itemData?.weight ?? 0,
    cpCost: stack.itemData?.cpCost ?? 0,
    lore: {
      shortDescription,
    },
  },
});

// #endregion

// #region Fixtures

export const INVENTORY_BOARD_FIXTURES: Record<string, InventoryBoardScenario> =
  {
    empty: {
      encumbrance: {
        totalWeight: ENCUMBRANCE_FIXTURES.light.totalWeight,
        capacity: ENCUMBRANCE_FIXTURES.light.carryingCapacity,
        isEncumbered: ENCUMBRANCE_FIXTURES.light.isEncumbered,
      },
      missingItemIds: INVENTORY_FIXTURES.empty.missingItemIds,
      instances: [],
      stacks: [],
      equippedWeaponInstanceIds: [],
      equippedArmorInstanceId: null,
      equippedShieldInstanceId: null,
      attunedInstanceIds: [],
    },
    standardLoadout: {
      encumbrance: {
        totalWeight: ENCUMBRANCE_FIXTURES.heavy.totalWeight,
        capacity: ENCUMBRANCE_FIXTURES.heavy.carryingCapacity,
        isEncumbered: ENCUMBRANCE_FIXTURES.heavy.isEncumbered,
      },
      missingItemIds: INVENTORY_FIXTURES.adventuringKit.missingItemIds,
      instances: [
        toInstance(
          INVENTORY_FIXTURES.adventuringKit.instances[0],
          "weapon",
          "Versatile martial weapon",
        ),
        toInstance(
          INVENTORY_FIXTURES.adventuringKit.instances[1],
          "armor",
          "Heavy armor",
          "heavy",
        ),
        toInstance(
          INVENTORY_FIXTURES.adventuringKit.instances[2],
          "armor",
          "Shield",
          "shield",
        ),
      ],
      stacks: [
        toStack(
          INVENTORY_FIXTURES.adventuringKit.stacks[0],
          "One day of preserved food",
        ),
        toStack(
          INVENTORY_FIXTURES.adventuringKit.stacks[1],
          "Burns for 1 hour",
        ),
      ],
      equippedWeaponInstanceIds:
        INVENTORY_FIXTURES.adventuringKit.equippedWeaponInstanceIds,
      equippedArmorInstanceId:
        INVENTORY_FIXTURES.adventuringKit.equippedArmorInstanceId,
      equippedShieldInstanceId:
        INVENTORY_FIXTURES.adventuringKit.equippedShieldInstanceId,
      attunedInstanceIds: INVENTORY_FIXTURES.adventuringKit.attunedInstanceIds,
    },
    fullyAttuned: {
      encumbrance: {
        totalWeight: ENCUMBRANCE_FIXTURES.light.totalWeight,
        capacity: ENCUMBRANCE_FIXTURES.light.carryingCapacity,
        isEncumbered: ENCUMBRANCE_FIXTURES.light.isEncumbered,
      },
      missingItemIds: INVENTORY_FIXTURES.attunedMagicLoadout.missingItemIds,
      instances: [
        toInstance(
          INVENTORY_FIXTURES.attunedMagicLoadout.instances[0],
          "magic_item",
          "+1 bonus to spell attack rolls",
          undefined,
          true,
        ),
        toInstance(
          INVENTORY_FIXTURES.attunedMagicLoadout.instances[1],
          "magic_item",
          "+1 bonus to AC and saving throws",
          undefined,
          true,
        ),
        toInstance(
          INVENTORY_FIXTURES.attunedMagicLoadout.instances[2],
          "magic_item",
          "+1 bonus to AC and saving throws",
          undefined,
          true,
        ),
      ],
      stacks: [
        toStack(
          INVENTORY_FIXTURES.attunedMagicLoadout.stacks[0],
          "Regain 2d4+2 hit points",
        ),
      ],
      equippedWeaponInstanceIds: [],
      equippedArmorInstanceId: null,
      equippedShieldInstanceId: null,
      attunedInstanceIds:
        INVENTORY_FIXTURES.attunedMagicLoadout.attunedInstanceIds,
    },
    encumbered: {
      encumbrance: {
        totalWeight: ENCUMBRANCE_FIXTURES.encumbered.totalWeight,
        capacity: ENCUMBRANCE_FIXTURES.encumbered.carryingCapacity,
        isEncumbered: ENCUMBRANCE_FIXTURES.encumbered.isEncumbered,
      },
      missingItemIds: [],
      instances: [
        toInstance(
          INVENTORY_FIXTURES.adventuringKit.instances[1],
          "armor",
          "Heavy armor",
          "heavy",
        ),
      ],
      stacks: [
        toStack(
          INVENTORY_FIXTURES.adventuringKit.stacks[0],
          "One day of preserved food",
        ),
        toStack(
          INVENTORY_FIXTURES.adventuringKit.stacks[1],
          "Burns for 1 hour",
        ),
      ],
      equippedWeaponInstanceIds: [],
      equippedArmorInstanceId:
        INVENTORY_FIXTURES.adventuringKit.instances[1].instanceId,
      equippedShieldInstanceId: null,
      attunedInstanceIds: [],
    },
    missingReferences: {
      encumbrance: {
        totalWeight: ENCUMBRANCE_FIXTURES.light.totalWeight,
        capacity: ENCUMBRANCE_FIXTURES.light.carryingCapacity,
        isEncumbered: ENCUMBRANCE_FIXTURES.light.isEncumbered,
      },
      missingItemIds: INVENTORY_FIXTURES.withMissingReferences.missingItemIds,
      instances: [],
      stacks: [],
      equippedWeaponInstanceIds: [],
      equippedArmorInstanceId: null,
      equippedShieldInstanceId: null,
      attunedInstanceIds: [],
    },
    playground: {
      encumbrance: {
        totalWeight: ENCUMBRANCE_FIXTURES.heavy.totalWeight,
        capacity: ENCUMBRANCE_FIXTURES.heavy.carryingCapacity,
        isEncumbered: ENCUMBRANCE_FIXTURES.heavy.isEncumbered,
      },
      missingItemIds: [],
      instances: [
        toInstance(
          INVENTORY_FIXTURES.adventuringKit.instances[0],
          "weapon",
          "Versatile martial weapon",
        ),
        toInstance(
          INVENTORY_FIXTURES.adventuringKit.instances[2],
          "armor",
          "Shield",
          "shield",
        ),
        toInstance(
          INVENTORY_FIXTURES.attunedMagicLoadout.instances[0],
          "magic_item",
          "+1 bonus to spell attack rolls",
          undefined,
          true,
        ),
      ],
      stacks: [
        toStack(
          INVENTORY_FIXTURES.adventuringKit.stacks[0],
          "One day of preserved food",
        ),
        toStack(
          INVENTORY_FIXTURES.attunedMagicLoadout.stacks[0],
          "Regain 2d4+2 hit points",
        ),
      ],
      equippedWeaponInstanceIds: [
        INVENTORY_FIXTURES.adventuringKit.instances[0].instanceId,
      ],
      equippedArmorInstanceId: null,
      equippedShieldInstanceId:
        INVENTORY_FIXTURES.adventuringKit.instances[2].instanceId,
      attunedInstanceIds: [
        INVENTORY_FIXTURES.attunedMagicLoadout.instances[0].instanceId,
      ],
    },
  };

// #endregion
