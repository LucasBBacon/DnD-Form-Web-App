import React, { useState } from "react";
import type { InventoryBoardItemData } from "../InventoryBoardView";
import "./EquipmentCard.css";
import {
  Sword,
  Shield,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Trash2,
} from "lucide-react";

interface EquipmentCardProps {
  /** Unique identifier for the equipment instance */
  instanceId: string;
  /** Indicates if the equipment is currently equipped */
  isEquipped: boolean;
  /** Data for the equipment item */
  itemData: InventoryBoardItemData;
  /** Indicates if the equipment requires attunement */
  requiresAttunement: boolean;
  /** Indicates if the equipment is currently attuned */
  isAttuned: boolean;
  /** Indicates if the equipment is a weapon */
  isWeapon: boolean;
  /** Indicates if the equipment is armor */
  isArmor: boolean;
  /** List of instance IDs that are currently attuned */
  attunedInstanceIds: string[];
  /** Callback for toggling attunement */
  onToggleAttunement: (instanceId: string, isAttuned: boolean) => void;
  /** Callback for toggling weapon equip state */
  onToggleWeaponEquip: (instanceId: string, isEquipped: boolean) => void;
  /** Callback for toggling armor equip state */
  onToggleArmorEquip: (
    instanceId: string,
    isEquipped: boolean,
    armorType: string,
  ) => void;
  /** Callback for dropping an equipment instance */
  onDropInstance: (instanceId: string) => void;
  /** Callback for formatting item cost */
  formatItemCost: (cpCost: number) => string;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  instanceId,
  isEquipped,
  itemData,
  requiresAttunement,
  isAttuned,
  isWeapon,
  isArmor,
  attunedInstanceIds,
  onToggleAttunement,
  onToggleWeaponEquip,
  onToggleArmorEquip,
  onDropInstance,
  formatItemCost,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleEquipToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent expanding/collapsing when clicking button
    if (isWeapon) {
      onToggleWeaponEquip(instanceId, !isEquipped);
    } else if (isArmor && itemData.armorProperties) {
      onToggleArmorEquip(
        instanceId,
        !isEquipped,
        itemData.armorProperties.armorType,
      );
    }
  };

  const handleAttuneToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleAttunement(instanceId, !isAttuned);
  };

  const handleDrop = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: add trigger confirmation here
    onDropInstance(instanceId);
  };

  return (
    <div
      key={instanceId}
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
          <span className="item-weight">{itemData.weight} lb</span>
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
                {formatItemCost(itemData.cpCost)}
              </span>
            </div>

            {/* Weapon Stats */}
            {isWeapon && itemData.weaponProperties && (
              <>
                <div className="stat">
                  <span className="stat-label">Damage</span>
                  <span className="stat-value">
                    {itemData.weaponProperties.damageDice}{" "}
                    {itemData.weaponProperties.rules.versatile && itemData.weaponProperties.versatileDamageDice && (<span className="versatile-text">({itemData.weaponProperties.versatileDamageDice})</span>)}
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
                        <div key={prop.id} className="property-tag with-tooltip">
                          {prop.name}

                          {/* Tooltip container */}
                          <div className="manuscript-tooltip">
                            <span className="tooltip-title">{prop.name}</span>
                            <span className="tooltip-body">{prop.lore.shortDescription}</span>
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
                  {itemData.armorProperties.dexModifier.mode === 'full' && ' + Dex'}
                  {itemData.armorProperties.dexModifier.mode === 'capped' && ` + Dex (Max ${itemData.armorProperties.dexModifier.cap})`}
                  {itemData.magicItemProperties?.bonusToAc ? ` (+${itemData.magicItemProperties.bonusToAc})` : ''}
                </span>
              </div>
              {(itemData.armorProperties.stealthDisadvantage || itemData.armorProperties.strengthRequirement) && (
                <div className="stat">
                  <span className="stat-label">Requirements / Penalties</span>
                  <span className="stat-value warning-text">
                    {itemData.armorProperties.strengthRequirement && `Str ${itemData.armorProperties.strengthRequirement}`}
                    {itemData.armorProperties.strengthRequirement && itemData.armorProperties.stealthDisadvantage && ` | `}
                    {itemData.armorProperties.stealthDisadvantage && 'Stealth Disadv.'}
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

            {requiresAttunement && (
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
