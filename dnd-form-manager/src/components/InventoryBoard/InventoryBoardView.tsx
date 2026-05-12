import type React from "react";
import "./InventoryBoard.css";
import { EncumbranceDisplay } from "./ui/EncumbranceDisplay";

export interface InventoryBoardItemData {
  name: string;
  type: string;
  weight: number;
  lore: {
    shortDescription: string;
  };
  armorProperties?: {
    armorType: string;
  };
  magicItemProperties?: {
    requiresAttunement?: boolean;
  };
}

export interface InventoryBoardHydratedInstance {
  instanceId: string;
  baseItemId: string;
  itemData: InventoryBoardItemData;
}

export interface InventoryBoardHydratedStack {
  stackId: string;
  baseItemId: string;
  quantity: number;
  itemData: InventoryBoardItemData;
}

export interface InventoryBoardViewProps {
  wealthView?: React.ReactNode;
  encumbrance: {
    totalWeight: number;
    capacity: number;
    isEncumbered: boolean;
  };
  missingItemIds: string[];
  instances: InventoryBoardHydratedInstance[];
  stacks: InventoryBoardHydratedStack[];
  equippedWeaponInstanceIds: string[];
  equippedArmorInstanceId: string | null;
  equippedShieldInstanceId: string | null;
  attunedInstanceIds: string[];
  onToggleWeaponEquip: (instanceId: string, isEquipped: boolean) => void;
  onToggleArmorEquip: (
    instanceId: string,
    isEquipped: boolean,
    armorType: string,
  ) => void;
  onToggleAttunement: (instanceId: string, isAttuned: boolean) => void;
  onDropInstance: (instanceId: string) => void;
  onStackIncrement: (baseItemId: string) => void;
  onStackDecrement: (baseItemId: string) => void;
}

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
                        onClick={() => onToggleAttunement(instanceId, isAttuned)}
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
                  <span className="item-meta">{itemData.lore.shortDescription}</span>
                </div>

                <div className="stack-actions">
                  <span className="item-weight">
                    {itemData.weight * quantity} lbs total
                  </span>
                  <div className="quantity-control">
                    <button onClick={() => onStackDecrement(baseItemId)}>-</button>
                    <span className="quantity-display">{quantity}</span>
                    <button onClick={() => onStackIncrement(baseItemId)}>+</button>
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
