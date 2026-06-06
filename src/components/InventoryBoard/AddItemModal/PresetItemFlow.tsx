import type React from "react";
import type { AddItemPresetOption } from "./AddItemModal";

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
    <div className="inventory-preset-form">
      <label className="inventory-modal-field-label" htmlFor="preset-search">
        Search Preset Items
      </label>
      <input
        id="preset-search"
        className="inventory-modal-input"
        type="text"
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search by item name"
      />

      <label
        className="inventory-modal-field-label"
        htmlFor="preset-item-select"
      >
        Select Item
      </label>
      <select
        id="preset-item-select"
        className="inventory-modal-select"
        value={selectedItemId}
        onChange={(event) => onSelectedItemChange(event.target.value)}
      >
        <option value="">Choose an item...</option>
        {filteredItems.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name} ({item.type})
          </option>
        ))}
      </select>

      <label className="inventory-modal-field-label" htmlFor="preset-quantity">
        Quantity
      </label>
      <input
        id="preset-quantity"
        className="inventory-modal-input inventory-modal-input-short"
        type="number"
        inputMode="numeric"
        min={1}
        value={quantityInput}
        onChange={(event) => onQuantityInputChange(event.target.value)}
      />

      <button
        type="button"
        className="action-btn"
        disabled={submitDisabled}
        onClick={onSubmit}
      >
        Add Selected Item
      </button>
    </div>
  );
};
