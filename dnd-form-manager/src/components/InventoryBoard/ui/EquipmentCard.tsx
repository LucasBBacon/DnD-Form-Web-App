import type { InventoryBoardItemData } from "../InventoryBoardView";
import "./EquipmentCard.css";

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
  return (
    <div
      key={instanceId}
      className={`item-row ${isEquipped ? "equipped" : ""}`}
    >
      <div className="item-info">
        <span className="item-name">{itemData.name}</span>
        <span className="item-meta">
          {itemData.type.replace("_", " ").toUpperCase()} • {itemData.weight}{" "}
          lbs • {formatItemCost(itemData.cpCost)}
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
};
