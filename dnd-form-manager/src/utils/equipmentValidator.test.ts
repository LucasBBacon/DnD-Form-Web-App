import { describe, expect, it } from "vitest";
import type { InventoryInstanceRecord } from "../store/useCharacterStore";
import { canEquipTwoHandedWeapon } from "./equipmentValidator";

describe("equipmentValidator", () => {
  it("returns no conflicts for non-two-handed weapons", () => {
    const inventoryInstances: InventoryInstanceRecord[] = [
      {
        instanceId: "weapon-club-1",
        baseItemId: "item_weapon_club",
      },
    ];

    const result = canEquipTwoHandedWeapon({
      targetWeaponInstanceId: "weapon-club-1",
      inventoryInstances,
      equippedWeaponInstanceIds: ["weapon-club-1"],
      equippedShieldInstanceId: null,
    });

    expect(result.isTwoHandedWeapon).toBe(false);
    expect(result.hasConflicts).toBe(false);
    expect(result.conflicts.weaponInstanceIds).toEqual([]);
    expect(result.conflicts.shieldInstanceId).toBeNull();
  });

  it("returns no conflicts for two-handed weapons when no shield/off-hand is equipped", () => {
    const inventoryInstances: InventoryInstanceRecord[] = [
      {
        instanceId: "weapon-crossbow-1",
        baseItemId: "item_weapon_crossbow_light",
      },
    ];

    const result = canEquipTwoHandedWeapon({
      targetWeaponInstanceId: "weapon-crossbow-1",
      inventoryInstances,
      equippedWeaponInstanceIds: [],
      equippedShieldInstanceId: null,
    });

    expect(result.isTwoHandedWeapon).toBe(true);
    expect(result.hasConflicts).toBe(false);
    expect(result.conflicts.weaponInstanceIds).toEqual([]);
    expect(result.conflicts.shieldInstanceId).toBeNull();
  });

  it("detects shield and off-hand weapon conflicts for two-handed equip", () => {
    const inventoryInstances: InventoryInstanceRecord[] = [
      {
        instanceId: "weapon-crossbow-1",
        baseItemId: "item_weapon_crossbow_light",
      },
      {
        instanceId: "weapon-club-1",
        baseItemId: "item_weapon_club",
      },
      {
        instanceId: "weapon-club-2",
        baseItemId: "item_weapon_club",
      },
      {
        instanceId: "shield-1",
        baseItemId: "item_armor_shield",
      },
    ];

    const result = canEquipTwoHandedWeapon({
      targetWeaponInstanceId: "weapon-crossbow-1",
      inventoryInstances,
      equippedWeaponInstanceIds: ["weapon-club-1", "weapon-club-2"],
      equippedShieldInstanceId: "shield-1",
    });

    expect(result.isTwoHandedWeapon).toBe(true);
    expect(result.hasConflicts).toBe(true);
    expect(result.conflicts.weaponInstanceIds).toEqual([
      "weapon-club-1",
      "weapon-club-2",
    ]);
    expect(result.conflicts.shieldInstanceId).toBe("shield-1");
  });
});
