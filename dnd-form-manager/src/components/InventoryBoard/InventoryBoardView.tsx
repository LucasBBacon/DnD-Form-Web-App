import type React from "react";
import "./InventoryBoard.css";
import { EncumbranceDisplay } from "./ui/EncumbranceDisplay";

// #region Interfaces

export interface InventoryBoardItemData {
  /** The name of the item */
  name: string;
  /** The type of the item (e.g., weapon, armor) */
  type: string;
  /** The weight of the item */
  weight: number;
  /** Lore information about the item */
  lore: {
    /** A short description of the item */
    shortDescription: string;
  };
  /** Armor properties of the item */
  armorProperties?: {
    /** The type of armor (e.g., light, medium, heavy) */
    armorType: string;
  };
  /** Magic item properties of the item */
  magicItemProperties?: {
    /** Indicates if the item requires attunement */
    requiresAttunement?: boolean;
  };
}

export interface InventoryBoardHydratedInstance {
  /** The unique identifier for this instance of the item */
  instanceId: string;
  /** The base item identifier */
  baseItemId: string;
  /** The data for this item instance */
  itemData: InventoryBoardItemData;
}

export interface InventoryBoardHydratedStack {
  /** The unique identifier for this stack of items */
  stackId: string;
  /** The base item identifier */
  baseItemId: string;
  /** The quantity of items in this stack */
  quantity: number;
  /** The data for this stack of items */
  itemData: InventoryBoardItemData;
}

export interface InventoryBoardViewProps {
  /** The view for displaying wealth */
  wealthView?: React.ReactNode;
  /** The encumbrance information */
  encumbrance: {
    /** The total weight of the inventory */
    totalWeight: number;
    /** The maximum carrying capacity */
    capacity: number;
    /** Indicates if the character is encumbered */
    isEncumbered: boolean;
  };
  /** The IDs of missing items */
  missingItemIds: string[];
  /** The instances of items in the inventory */
  instances: InventoryBoardHydratedInstance[];
  /** The stacks of items in the inventory */
  stacks: InventoryBoardHydratedStack[];
  /** The IDs of equipped weapon instances */
  equippedWeaponInstanceIds: string[];
  /** The ID of the equipped armor instance, if any */
  equippedArmorInstanceId: string | null;
  /** The ID of the equipped shield instance, if any */
  equippedShieldInstanceId: string | null;
  /** The IDs of attuned item instances */
  attunedInstanceIds: string[];

  /** Callback for toggling weapon equip state */
  onToggleWeaponEquip: (instanceId: string, isEquipped: boolean) => void;
  /** Callback for toggling armor equip state */
  onToggleArmorEquip: (
    instanceId: string,
    isEquipped: boolean,
    armorType: string,
  ) => void;
  /** Callback for toggling attunement state */
  onToggleAttunement: (instanceId: string, isAttuned: boolean) => void;
  /** Callback for dropping an item instance */
  onDropInstance: (instanceId: string) => void;
  /** Callback for incrementing a stack of items */
  onStackIncrement: (baseItemId: string) => void;
  /** Callback for decrementing a stack of items */
  onStackDecrement: (baseItemId: string) => void;
}

// #endregion

// #region View Component

export const InventoryBoardView: React.FC<InventoryBoardViewProps> = ({
  wealthView,
  encumbrance,
  missingItemIds,
  instances,
  stacks,
  equippedWeaponInstanceIds,
  equippedArmorInstanceId,
  equippedShieldInstanceId,
  attunedInstanceIds,
  onToggleWeaponEquip,
  onToggleArmorEquip,
  onToggleAttunement,
  onDropInstance,
  onStackIncrement,
  onStackDecrement,
}) => {
  return (
    <section className="inventory-board card">
      <div className="inventory-header">
        {wealthView}
        <EncumbranceDisplay
          totalWeight={encumbrance.totalWeight}
          capacity={encumbrance.capacity}
          isEncumbered={encumbrance.isEncumbered}
        />
      </div>

      <hr className="divider" />

      {missingItemIds.length > 0 && (
        <div className="encumbered-warning" style={{ marginBottom: "1rem" }}>
          {missingItemIds.map((itemId) => (
            <div key={`missing-item-${itemId}`}>
              Missing equipment reference: {itemId}
            </div>
          ))}
        </div>
      )}

      <div className="inventory-section">
        <h3 className="section-title">EQUIPMENT & ATTUNEMENT</h3>
        {instances.length === 0 ? (
          <p className="empty-state">No equipment.</p>
        ) : (
          <div className="item-list">
            {instances.map(({ instanceId, itemData }) => {
              const isWeapon = itemData.type === "weapon";
              const isArmor = itemData.type === "armor";
              const isShield =
                isArmor && itemData.armorProperties?.armorType === "shield";

              const isEquipped = isWeapon
                ? equippedWeaponInstanceIds.includes(instanceId)
                : isShield
                  ? equippedShieldInstanceId === instanceId
                  : isArmor
                    ? equippedArmorInstanceId === instanceId
                    : false;

              const requiresAttunement =
                itemData.magicItemProperties?.requiresAttunement;
              const isAttuned = attunedInstanceIds.includes(instanceId);

              return (
                <div
                  key={instanceId}
                  className={`item-row ${isEquipped ? "equipped" : ""}`}
                >
                  <div className="item-info">
                    <span className="item-name">{itemData.name}</span>
                    <span className="item-meta">
                      {itemData.type.replace("_", " ").toUpperCase()} •{" "}
                      {itemData.weight} lbs
                    </span>
                  </div>

                  <div className="item-actions">
                    {requiresAttunement && (
                      <button
                        className={`action-btn attune-btn ${isAttuned ? "active" : ""}`}
                        onClick={() =>
                          onToggleAttunement(instanceId, isAttuned)
                        }
                        disabled={!isAttuned && attunedInstanceIds.length >= 3}
                        title="Attunement (Max 3)"
                      >
                        {isAttuned ? "ATTUNED" : "Attune"}
                      </button>
                    )}

                    {(isWeapon || isArmor) && (
                      <button
                        className={`action-btn equip-btn ${isEquipped ? "active" : ""}`}
                        onClick={() =>
                          isWeapon
                            ? onToggleWeaponEquip(instanceId, isEquipped)
                            : onToggleArmorEquip(
                                instanceId,
                                isEquipped,
                                itemData.armorProperties?.armorType ?? "",
                              )
                        }
                      >
                        {isEquipped ? "EQUIPPED" : "Equip"}
                      </button>
                    )}

                    <button
                      className="action-btn drop-btn"
                      onClick={() => onDropInstance(instanceId)}
                      title="Remove from inventory"
                    >
                      Drop
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="inventory-section">
        <h3 className="section title">BACKPACK (GEAR & CONSUMABLES)</h3>
        {stacks.length === 0 ? (
          <p className="empty-state">Backpack is empty.</p>
        ) : (
          <div className="item-list">
            {stacks.map(({ stackId, baseItemId, quantity, itemData }) => (
              <div key={stackId} className="item-row stack-row">
                <div className="item-info">
                  <span className="item-name">{itemData.name}</span>
                  <span className="item-meta">
                    {itemData.lore.shortDescription}
                  </span>
                </div>

                <div className="stack-actions">
                  <span className="item-weight">
                    {itemData.weight * quantity} lbs total
                  </span>
                  <div className="quantity-control">
                    <button onClick={() => onStackDecrement(baseItemId)}>
                      -
                    </button>
                    <span className="quantity-display">{quantity}</span>
                    <button onClick={() => onStackIncrement(baseItemId)}>
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// #endregion
