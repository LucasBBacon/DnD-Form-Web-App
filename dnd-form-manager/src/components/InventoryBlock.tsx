import { useState } from "react";
import { useCharacterStats } from "../hooks/useCharacterStats";
import { useCharacterStore } from "../store/useCharacterStore";
import { getAllItems, getItemById } from "../data/staticDataApi";
import type { UUID } from "../types/common";

export const InventoryBlock = () => {
  const {
    inventoryStacks,
    inventoryInstances,
    equippedArmorInstanceId,
    equippedShieldInstanceId,
    equippedWeaponInstanceIds,
    addInventoryItem,
    removeInventoryItem,
    equipArmorInstance,
    equipShieldInstance,
    equipWeaponInstance,
    unequipWeaponInstance,
  } = useCharacterStore();

  const { encumbrance, combat } = useCharacterStats();
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  const handleArmorEquipToggle = (instanceId: UUID, armorType: string) => {
    if (armorType === "shield") {
      equippedShieldInstanceId === instanceId
        ? equipShieldInstance(null)
        : equipShieldInstance(instanceId);
    } else {
      equippedArmorInstanceId === instanceId
        ? equipArmorInstance(null)
        : equipArmorInstance(instanceId);
    }
  };

  const hasItems = inventoryStacks.length > 0 || inventoryInstances.length > 0;

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2>Inventory & Equipment</h2>
        <div className="inventory-stats">
          <span>
            <strong>Total Weight:</strong> {encumbrance.totalWeight} lbs
          </span>
          <span>
            <strong>Current AC:</strong> {combat.armorClass}
          </span>
        </div>
      </div>

      {/* --- Add item Dev Tool --- */}
      <div className="add-item-row">
        <select
          value={selectedItemId}
          onChange={(e) => setSelectedItemId(e.target.value)}
        >
          <option value="" disabled>
            Select item to add...
          </option>
          {getAllItems().map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            if (selectedItemId) addInventoryItem(selectedItemId, 1);
          }}
        >
          Add to backpack
        </button>
      </div>

      {/* --- Backpack list --- */}
      <div className="inventory-list">
        {!hasItems ? (
          <p>Your backpack is empty.</p>
        ) : (
          <>
            {/* Stacked items */}
            {inventoryStacks.map((stack) => {
              const itemData = getItemById(stack.baseItemId);
              if (!itemData) return null;

              return (
                <div key={stack.stackId} className="inventory-item">
                  <div className="item-details">
                    <strong>{itemData.name}</strong>
                    <span className="item-weight">
                      {itemData.weight} lbs (Total:{" "}
                      {itemData.weight * stack.quantity} lbs)
                    </span>
                    <p className="item-lore">{itemData.lore.shortDescription}</p>
                  </div>
                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button onClick={() => removeInventoryItem(stack.baseItemId, 1)}>
                        -
                      </button>
                      <span>{stack.quantity}</span>
                      <button onClick={() => addInventoryItem(stack.baseItemId, 1)}>
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Instance items */}
            {inventoryInstances.map((instance) => {
              const itemData = getItemById(instance.baseItemId);
              if (!itemData) return null;

              const isEquippedArmor = equippedArmorInstanceId === instance.instanceId;
              const isEquippedShield = equippedShieldInstanceId === instance.instanceId;
              const isEquippedWeapon = equippedWeaponInstanceIds.includes(instance.instanceId);
              const isEquipped = isEquippedArmor || isEquippedShield || isEquippedWeapon;

              return (
                <div
                  key={instance.instanceId}
                  className={`inventory-item ${isEquipped ? "equipped" : ""}`}
                >
                  <div className="item-details">
                    <strong>{instance.customName ?? itemData.name}</strong>
                    <span className="item-weight">{itemData.weight} lbs</span>
                    <p className="item-lore">{itemData.lore.shortDescription}</p>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => removeInventoryItem(instance.baseItemId, 1)}>
                      Drop
                    </button>

                    {/* Armor / shield equip toggle */}
                    {itemData.type === "armor" && itemData.armorProperties && (
                      <button
                        className={isEquipped ? "unequip-btn" : "equip-btn"}
                        onClick={() =>
                          handleArmorEquipToggle(
                            instance.instanceId,
                            itemData.armorProperties!.armorType,
                          )
                        }
                      >
                        {isEquipped ? "Unequip" : "Equip"}
                      </button>
                    )}

                    {/* Weapon equip toggle */}
                    {itemData.type === "weapon" && (
                      <button
                        className={isEquippedWeapon ? "unequip-btn" : "equip-btn"}
                        onClick={() =>
                          isEquippedWeapon
                            ? unequipWeaponInstance(instance.instanceId)
                            : equipWeaponInstance(instance.instanceId)
                        }
                      >
                        {isEquippedWeapon ? "Unequip" : "Equip"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
