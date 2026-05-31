import { getItemById } from "../data/staticDataApi";
import type { InventoryInstanceRecord } from "../store/useCharacterStore";
import type { UUID } from "../types/common";
import { resolveInstance } from "./inventoryUtils";

export interface TwoHandedEquipConflicts {
  shieldInstanceId: UUID | null;
  weaponInstanceIds: UUID[];
}

export interface TwoHandedEquipValidationResult {
  isTwoHandedWeapon: boolean;
  hasConflicts: boolean;
  conflicts: TwoHandedEquipConflicts;
}

interface CanEquipTwoHandedWeaponInput {
  targetWeaponInstanceId: UUID;
  inventoryInstances: InventoryInstanceRecord[];
  equippedWeaponInstanceIds: UUID[];
  equippedShieldInstanceId: UUID | null;
}

/**
 * Validates whether equipping a weapon instance creates two-handed conflicts.
 * Conflicts include an equipped shield or any other equipped weapon instance.
 */
export const canEquipTwoHandedWeapon = ({
  targetWeaponInstanceId,
  inventoryInstances,
  equippedWeaponInstanceIds,
  equippedShieldInstanceId,
}: CanEquipTwoHandedWeaponInput): TwoHandedEquipValidationResult => {
  const targetInstance = resolveInstance(targetWeaponInstanceId, inventoryInstances);
  const targetBaseItem = targetInstance
    ? getItemById(targetInstance.baseItemId)
    : null;

  const isTwoHandedWeapon = !!targetBaseItem?.weaponProperties?.rules.twoHanded;

  if (!isTwoHandedWeapon) {
    return {
      isTwoHandedWeapon: false,
      hasConflicts: false,
      conflicts: {
        shieldInstanceId: null,
        weaponInstanceIds: [],
      },
    };
  }

  const conflictingWeaponInstanceIds = equippedWeaponInstanceIds.filter(
    (instanceId) => instanceId !== targetWeaponInstanceId,
  );

  const shieldConflict = equippedShieldInstanceId ?? null;
  const hasConflicts =
    conflictingWeaponInstanceIds.length > 0 || shieldConflict !== null;

  return {
    isTwoHandedWeapon: true,
    hasConflicts,
    conflicts: {
      shieldInstanceId: shieldConflict,
      weaponInstanceIds: conflictingWeaponInstanceIds,
    },
  };
};
