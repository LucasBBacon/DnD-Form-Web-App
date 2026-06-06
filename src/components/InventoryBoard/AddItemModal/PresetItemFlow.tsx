import type React from "react";
import "./PresetItemFlow.css";
import type { AddItemPresetOption } from "./AddItemModal";
import { Package, Plus, Search } from "lucide-react";

interface PresetItemFlowProps {
  searchValue: string;
  selectedItemId: string;
  quantityInput: string;
  filteredItems: AddItemPresetOption[];
  onSearchChange: (value: string) => void;
  onSelectedItemChange: (value: string) => void;
  onQuantityInputChange: (value: string) => void;
  onSubmit: () => void;
  submitDisabled: boolean;
}

export const PresetItemFlow: React.FC<PresetItemFlowProps> = ({
  searchValue,
  selectedItemId,
  quantityInput,
  filteredItems,
  onSearchChange,
  onSelectedItemChange,
  onQuantityInputChange,
  onSubmit,
  submitDisabled,
}) => {
  return (
    <div className="preset-flow-container">
      {/* SEARCH BAR */}
      <div className="requisition-search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="manuscript-input full-width"
          placeholder="Search the ledger by name or type..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          autoFocus
        />
      </div>

      {/* SCROLLABLE ITEM LIST */}
      <div className="requisition-ledger-list custom-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="empty-state-text">
            No items found in archives matching this search.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isSelected = item.id === selectedItemId;
            return (
              <button
                key={item.id}
                className={`ledger-item-row ${isSelected ? "is-selected" : ""}`}
                onClick={() => onSelectedItemChange(item.id)}
              >
                <div className="row-primary">
                  <span className="item-name">{item.name}</span>
                  <span className="item-type">{item.type}</span>
                </div>
                <div className="row-secondary">
                  <span className="item-weight">{item.weight} lb</span>
                  <span className="item-divider">|</span>
                  <span className="item-cost">{item.cpCost}</span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* SELECTED ITEM LORE */}
      {selectedItemId && (
        <div className="selected-item-lore">
          <Package size={16} className="lore-icon" />
          <span className="lore-text">
            {filteredItems.find((i) => i.id === selectedItemId)?.lore
              .shortDescription || "A standard piece of equipment."}
          </span>
        </div>
      )}

      {/* QUANTITY AND SUBMIT */}
      <div className="requisition-footer">
        <div className="quantity-control">
          <label htmlFor="preset-quantity">Qty:</label>
          <input
            id="preset-quantity"
            type="number"
            className="manuscript-input quantity-input"
            value={quantityInput}
            onChange={(e) => onQuantityInputChange(e.target.value)}
            min="1"
          />
        </div>

        <button
          className="action-btn confirm-add-btn"
          onClick={onSubmit}
          disabled={submitDisabled}
        >
          <Plus size={16} /> Add to Inventory
        </button>
      </div>
    </div>
  );
};
