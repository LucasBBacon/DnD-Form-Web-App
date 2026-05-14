import type React from "react";
import "./InventoryBoard.css";
import { EncumbranceDisplay } from "./ui/EncumbranceDisplay";
import { formatCpAsMaxCoinValue } from "../../utils/currencyUtils";
import { InventoryLedgerCard } from "./ui/InventoryLedgerCard";
import type { ItemStackingRules, WeaponProperties } from "../../types/item";

// #region Interfaces

export interface InventoryBoardItemData {
  /** The name of the item */
  name: string;
  /** The type of the item (e.g., weapon, armor) */
  type: "gear" | "weapon" | "armor" | "tool" | "magic_item";
  /** The weight of the item */
  weight: number;
  /** Item cost in copper pieces */
  cpCost: number;

  /** Lore information about the item */
  lore: {
    /** A short description of the item */
    shortDescription: string;
    /** The main bod of text for the item */
    fullText?: string;
  };

  stacking?: ItemStackingRules;

  /** Armor properties of the item */
  armorProperties?: {
    acApplication: "set" | "bonus";
    /** The type of armor (e.g., light, medium, heavy) */
    armorType: string;
    baseAc: number;
    dexModifier: {
      mode: "full" | "capped" | "none";
      cap?: number;
    };
    stealthDisadvantage: boolean;
    strengthRequirement?: number;
  };

  weaponProperties?: WeaponProperties;

  /** Magic item properties of the item */
  magicItemProperties?: {
    bonusToAttack?: number;
    bonusToDamage?: number;
    bonusToAc?: number;
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
  const formatItemCost = (cpCost: number): string =>
    formatCpAsMaxCoinValue(cpCost);

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

              const isAttuned = attunedInstanceIds.includes(instanceId);

              return (
                <InventoryLedgerCard
                  key={instanceId}
                  entityId={instanceId}
                  itemData={itemData}
                  isEquipped={isEquipped}
                  isAttuned={isAttuned}
                  attunedInstanceIds={attunedInstanceIds}
                  onToggleAttunement={onToggleAttunement}
                  onToggleEquip={(id, equipped, armorType) => {
                    if (isWeapon) {
                      onToggleWeaponEquip(id, equipped);
                    } else if (isArmor && armorType) {
                      onToggleArmorEquip(id, equipped, armorType);
                    }
                  }}
                  onDropItem={(id) => onDropInstance(id)}
                  formatItemCost={formatItemCost}
                />
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
              <InventoryLedgerCard
                key={stackId}
                entityId={stackId}
                itemData={itemData}
                quantity={quantity}
                onQuantityChange={(_id, delta) => {
                  if (delta > 0) {
                    onStackIncrement(baseItemId);
                  } else {
                    onStackDecrement(baseItemId);
                  }
                }}
                formatItemCost={formatItemCost}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// #endregion
