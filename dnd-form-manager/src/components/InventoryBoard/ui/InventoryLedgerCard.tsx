import {
  ChevronDown,
  ChevronUp,
  Shield,
  Sparkles,
  Sword,
  Trash2,
} from "lucide-react";
import type { InventoryBoardItemData } from "../InventoryBoardView";
import "./InventoryLedgerCard.css";
import { useState } from "react";

export interface InventoryLedgerCardProps {
  entityId: string;
  itemData: InventoryBoardItemData;

  quantity?: number;
  onQuantityChange?: (entityId: string, delta: number) => void;

  isEquipped?: boolean;
  isAttuned?: boolean;
  attunedInstanceIds?: string[];

  onToggleAttunement?: (entityId: string, isAttuned: boolean) => void;
  onToggleEquip?: (
    entityId: string,
    isEquipped: boolean,
    armorType?: string,
  ) => void;
  onDropItem?: (entityId: string, dropQuantity: number) => void;
  formatItemCost?: (cpCost: number) => string;
}

export const InventoryLedgerCard: React.FC<InventoryLedgerCardProps> = ({
  entityId,
  itemData,
  quantity,
  onQuantityChange,
  isEquipped,
  isAttuned,
  attunedInstanceIds,
  onToggleAttunement,
  onToggleEquip,
  onDropItem,
  formatItemCost,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isWeapon = itemData.type === "weapon" && itemData.weaponProperties;
  const isArmor = itemData.type === "armor" && itemData.armorProperties;

  const handleEquipToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent expanding/collapsing when clicking button
    if (onToggleEquip) {
      if (isWeapon) {
        onToggleEquip(entityId, !isEquipped);
      } else if (isArmor && itemData.armorProperties) {
        onToggleEquip(
          entityId,
          !isEquipped,
          itemData.armorProperties.armorType,
        );
      }
    }
  };

  const handleAttuneToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleAttunement) {
      onToggleAttunement(entityId, !isAttuned);
    }
  };

  const handleQuantityClick = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    if (onQuantityChange) {
      if (quantity === 1 && delta === -1) {
        console.log(
          `[Stub] Modal: Are you sure you want to remove the last ${itemData.name}?`,
        );
      }
      onQuantityChange(entityId, delta);
    }
  };

  const handleDrop = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDropItem) {
      // TODO: add trigger confirmation here
      onDropItem(entityId, quantity ?? 1);
    }
  };

  return (
    <div
      key={entityId}
      className={`item-card-container ${isExpanded ? "expanded" : "collapsed"}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Collapsed Ledger Row */}
      <div className="item-header">
        <div className="item-title-group">
          {/* Custom Art Placeholder TODO: Add Illuminated Drop Cap */}
          <div className="item-icon-placeholder">
            <span className="drop-cap">{itemData.name.charAt(0)}</span>
          </div>
          <span className="item-name">{itemData.name}</span>
        </div>

        <div className="item-status-indicators">
          {isEquipped &&
            (isWeapon ? <Sword size={16} /> : <Shield size={16} />)}
          {isAttuned && <Sparkles size={16} className="attuned-glow" />}

          {/* Stack Controls */}
          {quantity !== undefined && (
            <div className="quantity-stepper">
              <button className="stepper-btn" onClick={(e) => handleQuantityClick(e, -1)} title="Decrease Quantity">-</button>
              <span className="quantity-display">
                <span className="quantity-x">X</span>{quantity}
              </span>
              <button className="stepper-btn" onClick={(e) => handleQuantityClick(e, 1)} title="Increase Quantity">+</button>
            </div>
          )}

          <span className="item-weight">{quantity !== undefined ? (itemData.weight * quantity).toFixed(1) : itemData.weight} lb</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded Folio Content */}
      {isExpanded && (
        <div className="item-details">
          <hr className="filigree-divider" />

          <p className="item-lore">{itemData.lore.shortDescription}</p>
          {/* TODO: Read more toggle for itemData.lore.fullText */}

          <div className="item-stats-grid">
            {/* Universal stats */}
            <div className="stat">
              <span className="stat-label">Value</span>
              <span className="stat-value">
                {formatItemCost ? formatItemCost(itemData.cpCost) : `${itemData.cpCost} cp`}
              </span>
            </div>

            {/* Weapon Stats */}
            {isWeapon && itemData.weaponProperties && (
              <>
                <div className="stat">
                  <span className="stat-label">Damage</span>
                  <span className="stat-value">
                    {itemData.weaponProperties.damageDice}{" "}
                    {itemData.weaponProperties.rules.versatile &&
                      itemData.weaponProperties.versatileDamageDice && (
                        <span className="versatile-text">
                          ({itemData.weaponProperties.versatileDamageDice})
                        </span>
                      )}
                    {itemData.weaponProperties.damageType}{" "}
                    {itemData.magicItemProperties?.bonusToDamage
                      ? ` (+${itemData.magicItemProperties.bonusToDamage})`
                      : ""}
                  </span>
                </div>
                <div className="stat">
                  {itemData.weaponProperties.rules.isRangedWeapon ||
                  itemData.weaponProperties.rules.thrownRange ? (
                    <>
                      <span className="stat-label">Range</span>
                      <span className="stat-value">
                        {itemData.weaponProperties.range}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="stat-label">Reach</span>
                      <span className="stat-value">
                        {itemData.weaponProperties.rules.meleeReachFeet}
                      </span>
                    </>
                  )}
                </div>
                {/* Weapon Properties as Tags */}
                {itemData.weaponProperties.properties.length > 0 && (
                  <div className="stat full-width">
                    <span className="stat-label">Properties</span>
                    <div className="property-tags">
                      {itemData.weaponProperties.properties.map((prop) => (
                        <div
                          key={prop.id}
                          className="property-tag with-tooltip"
                        >
                          {prop.name}

                          {/* Tooltip container */}
                          <div className="manuscript-tooltip">
                            <span className="tooltip-title">{prop.name}</span>
                            <span className="tooltip-body">
                              {prop.lore.shortDescription}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Armor Stats */}
            {isArmor && itemData.armorProperties && (
              <>
                <div className="stat">
                  <span className="stat-label">Armor Class</span>
                  <span className="stat-value">
                    {itemData.armorProperties.baseAc}
                    {itemData.armorProperties.dexModifier.mode === "full" &&
                      " + Dex"}
                    {itemData.armorProperties.dexModifier.mode === "capped" &&
                      ` + Dex (Max ${itemData.armorProperties.dexModifier.cap})`}
                    {itemData.magicItemProperties?.bonusToAc
                      ? ` (+${itemData.magicItemProperties.bonusToAc})`
                      : ""}
                  </span>
                </div>
                {(itemData.armorProperties.stealthDisadvantage ||
                  itemData.armorProperties.strengthRequirement) && (
                  <div className="stat">
                    <span className="stat-label">Requirements / Penalties</span>
                    <span className="stat-value warning-text">
                      {itemData.armorProperties.strengthRequirement &&
                        `Str ${itemData.armorProperties.strengthRequirement}`}
                      {itemData.armorProperties.strengthRequirement &&
                        itemData.armorProperties.stealthDisadvantage &&
                        ` | `}
                      {itemData.armorProperties.stealthDisadvantage &&
                        "Stealth Disadv."}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="item-actions">
            {(isWeapon || isArmor) && (
              <button
                className="action-btn equip-btn"
                onClick={handleEquipToggle}
              >
                {isEquipped ? "Unequip" : "Equip"}
              </button>
            )}

            {itemData.magicItemProperties?.requiresAttunement &&
              attunedInstanceIds && (
                <button
                  className={`action-btn attune-btn ${isAttuned ? "is-attuned" : ""}`}
                  onClick={handleAttuneToggle}
                  disabled={!isAttuned && attunedInstanceIds.length >= 3}
                  title={`Attunement Slots: ${attunedInstanceIds.length}/3`}
                >
                  {isAttuned ? "Break Attunement" : "Attune"}
                </button>
              )}

            <button className="action-btn drop-btn" onClick={handleDrop}>
              <Trash2 size={16} /> Drop
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
