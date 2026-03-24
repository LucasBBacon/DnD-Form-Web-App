/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useState } from "react";
import { useCharacterStats } from "../hooks/useCharacterStats";
import { useCharacterStore } from "../store/useCharacterStore";
import { getAllItems, getItemById } from "../data/staticDataApi";

export const InventoryBlock = () => {
  // pull actions and state from zustand
  const {
    inventory,
    equippedArmorId,
    equippedShieldId,
    addInventoryItem,
    removeInventoryItem,
    equipArmor,
    equipShield,
  } = useCharacterStore();

  // Pull derived stats from hook
  const { totalWeight, armorClass } = useCharacterStats();

  // Local state for 'Add Item' dropdown
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  const handleEquipToggle = (itemId: string, armorType: string) => {
    if (armorType === "shield") {
      equippedShieldId === itemId ? equipShield(null) : equipShield(itemId);
    } else {
      equippedArmorId === itemId ? equipArmor(null) : equipArmor(itemId);
    }
  };

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2>Inventory & Equipment</h2>
        <div className="inventory-stats">
          <span>
            <strong>Total Weight:</strong> {totalWeight} lbs
          </span>
          <span>
            <strong>Current AC:</strong> {armorClass}
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
        {inventory.length === 0 ? (
          <p>Your backpack is empty.</p>
        ) : (
          inventory.map((record) => {
            const itemData = getItemById(record.itemId);
            if (!itemData) return null;

            const isEquippedArmor = equippedArmorId === record.itemId;
            const isEquippedShield = equippedShieldId === record.itemId;
            const isEquipped = isEquippedArmor || isEquippedShield;

            return (
              <div
                key={record.itemId}
                className={`inventory-item ${isEquipped ? "equipped" : ""}`}
              >
                <div className="item-details">
                  <strong>{itemData.name}</strong>
                  <span className="item-weight">
                    {itemData.weight} lbs (Total:{" "}
                    {itemData.weight * record.quantity} lbs)
                  </span>
                  <p className="item-lore">{itemData.lore.short_description}</p>
                </div>

                <div className="item-actions">
                  {/* Quantity Controls */}
                  <div className="quantity-controls">
                    <button
                      onClick={() => removeInventoryItem(record.itemId, 1)}
                    >
                      -
                    </button>
                    <span>{record.quantity}</span>
                    <button onClick={() => addInventoryItem(record.itemId, 1)}>
                      +
                    </button>
                  </div>

                  {/* Equip Button (only shows if item is sword/shield) */}
                  {itemData.type === "armor" && itemData.armor_properties && (
                    <button
                      className={isEquipped ? "unequip-btn" : "equip-btn"}
                      onClick={() =>
                        handleEquipToggle(
                          record.itemId,
                          itemData.armor_properties!.armorType,
                        )
                      }
                    >
                      {isEquipped ? "Unequip" : "Equip"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
