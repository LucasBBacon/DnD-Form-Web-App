import type React from "react";

interface CustomGenericItemFlowProps {
  nameInput: string;
  shortDescriptionInput: string;
  fullDescriptionInput: string;
  weightInput: string;
  cpCostInput: string;
  quantityInput: string;
  onNameChange: (value: string) => void;
  onShortDescriptionChange: (value: string) => void;
  onFullDescriptionChange: (value: string) => void;
  onWeightChange: (value: string) => void;
  onCpCostChange: (value: string) => void;
  onQuantityChange: (value: string) => void;
  onSubmit: () => void;
  submitDisabled: boolean;
}

export const CustomGenericItemFlow: React.FC<CustomGenericItemFlowProps> = ({
  nameInput,
  shortDescriptionInput,
  fullDescriptionInput,
  weightInput,
  cpCostInput,
  quantityInput,
  onNameChange,
  onShortDescriptionChange,
  onFullDescriptionChange,
  onWeightChange,
  onCpCostChange,
  onQuantityChange,
  onSubmit,
  submitDisabled,
}) => {
  return (
    <div className="inventory-preset-form">
      <label className="inventory-modal-field-label" htmlFor="generic-item-name">
        Item Name
      </label>
      <input
        id="generic-item-name"
        className="inventory-modal-input"
        type="text"
        value={nameInput}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder="Custom item name"
      />

      <label
        className="inventory-modal-field-label"
        htmlFor="generic-item-short-description"
      >
        Short Description
      </label>
      <input
        id="generic-item-short-description"
        className="inventory-modal-input"
        type="text"
        value={shortDescriptionInput}
        onChange={(event) => onShortDescriptionChange(event.target.value)}
        placeholder="One-line description"
      />

      <label
        className="inventory-modal-field-label"
        htmlFor="generic-item-full-description"
      >
        Full Description (Optional)
      </label>
      <textarea
        id="generic-item-full-description"
        className="inventory-modal-input inventory-modal-textarea"
        value={fullDescriptionInput}
        onChange={(event) => onFullDescriptionChange(event.target.value)}
        placeholder="Longer notes about this custom item"
      />

      <label className="inventory-modal-field-label" htmlFor="generic-item-weight">
        Weight (lb)
      </label>
      <input
        id="generic-item-weight"
        className="inventory-modal-input inventory-modal-input-short"
        type="number"
        inputMode="decimal"
        min={0}
        value={weightInput}
        onChange={(event) => onWeightChange(event.target.value)}
      />

      <label className="inventory-modal-field-label" htmlFor="generic-item-cp-cost">
        Value (cp)
      </label>
      <input
        id="generic-item-cp-cost"
        className="inventory-modal-input inventory-modal-input-short"
        type="number"
        inputMode="numeric"
        min={0}
        value={cpCostInput}
        onChange={(event) => onCpCostChange(event.target.value)}
      />

      <label className="inventory-modal-field-label" htmlFor="generic-item-quantity">
        Quantity
      </label>
      <input
        id="generic-item-quantity"
        className="inventory-modal-input inventory-modal-input-short"
        type="number"
        inputMode="numeric"
        min={1}
        value={quantityInput}
        onChange={(event) => onQuantityChange(event.target.value)}
      />

      <button
        type="button"
        className="action-btn"
        onClick={onSubmit}
        disabled={submitDisabled}
      >
        Add Fully Custom Item
      </button>
    </div>
  );
};
