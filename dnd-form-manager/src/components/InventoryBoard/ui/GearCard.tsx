import type { InventoryBoardItemData } from "../InventoryBoardView";
import "./GearCard.css";

interface GearCardProps {
  /** Unique identifier for the gear stack */
  stackId: string;
  /** Data for the gear item */
  itemData: InventoryBoardItemData;
  /** Quantity of items in the stack */
  quantity: number;
  /** Base item ID for the gear */
  baseItemId: string;
  /** Callback for incrementing the stack quantity */
  onStackIncrement: (baseItemId: string) => void;
  /** Callback for decrementing the stack quantity */
  onStackDecrement: (baseItemId: string) => void;
  /** Callback for formatting item cost */
  formatItemCost: (cpCost: number) => string;
}

export const GearCard: React.FC<GearCardProps> = ({
  stackId,
  itemData,
  quantity,
  baseItemId,
  onStackIncrement,
  onStackDecrement,
  formatItemCost,
}) => {
  return (
    <div key={stackId} className="item-row stack-row">
      <div className="item-info">
        <span className="item-name">{itemData.name}</span>
        <span className="item-meta">
          {itemData.lore.shortDescription} • {formatItemCost(itemData.cpCost)}
        </span>
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
  );
};
