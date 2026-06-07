import type React from "react";
import "./AddItemModal.css";
import { Coins, Scale, Sparkles } from "lucide-react";

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
    <div className="custom-generic-flow-container">
      <div className="generic-form-scroll-area custom-scrollbar">
        {/* IDENTITY SELECTION */}
        <div className="form-section">
          <label htmlFor="generic-name" className="manuscript-label">
            Item Name
          </label>
          <input
            id="generic-name"
            type="text"
            className="manuscript-input pristine-input"
            placeholder="e.g., Amulet of the Black Hound"
            value={nameInput}
            onChange={(e) => onNameChange(e.target.value)}
            autoFocus
          />
        </div>

        {/* PHYSICAL PROPERTIES GRID */}
        <div className="form-row-grid">
          <div className="form-section">
            <label htmlFor="generic-weight" className="manuscript-label">
              <Scale size={14} className="label-icon" /> Weight (lbs)
            </label>
            <input
              id="generic-weight"
              type="number"
              className="manuscript-input"
              placeholder="0.0"
              value={weightInput}
              onChange={(e) => onWeightChange(e.target.value)}
              min="0"
              step="0.1"
            />
          </div>

          <div className="form-section">
            {/* TODO: Allow player to specify coin type value */}
            <label htmlFor="generic-cost" className="manuscript-label">
              <Coins size={14} className="label-icon" /> Value (in CP)
            </label>
            <input
              id="generic-cost"
              type="number"
              className="manuscript-input"
              placeholder="e.g., 100 for 1gp"
              value={cpCostInput}
              onChange={(e) => onCpCostChange(e.target.value)}
              min="0"
            />
          </div>
        </div>

        <hr className="filigree-divider subtle-divider" />

        {/* LORE AND DESCRIPTIONS */}
        <div className="form-section">
          <label htmlFor="generic-short-desc" className="manuscript-label">
            Brief Description
          </label>
          <input
            id="generic-short-desc"
            type="text"
            className="manuscript-input"
            placeholder="A short summary for the inventory list..."
            value={shortDescriptionInput}
            onChange={(e) => onShortDescriptionChange(e.target.value)}
            maxLength={100}
          />
        </div>

        <div className="form-section">
          <label htmlFor="generic-full-desc" className="manuscript-label">
            Full Description (Optional)
          </label>
          <textarea
            id="generic-full-desc"
            className="manuscript-textarea"
            placeholder="Detailed lore, mechanical effects, or historical notes..."
            value={fullDescriptionInput}
            onChange={(e) => onFullDescriptionChange(e.target.value)}
            rows={4}
          />
        </div>

        {/* FOOTER */}
        <div className="requisition-footer">
          <div className="quantity-control">
            <label htmlFor="generic-quantity">Qty:</label>
            <input
              id="generic-quantity"
              type="number"
              className="manuscript-input quantity-input"
              value={quantityInput}
              onChange={(e) => onQuantityChange(e.target.value)}
              min="1"
            />
          </div>

          <button
            type="button"
            className="action-btn confirm-add-btn"
            onClick={onSubmit}
            disabled={submitDisabled}
          >
            <Sparkles size={16} /> Create & Add Item
          </button>
        </div>
      </div>
    </div>
  );
};
