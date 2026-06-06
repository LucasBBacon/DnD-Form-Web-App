import type React from "react";
import type { AddItemFlowType } from "./AddItemModal";

interface AddItemFlowSelectorProps {
  onSelectFlow: (flow: AddItemFlowType) => void;
}

export const AddItemFlowSelector: React.FC<AddItemFlowSelectorProps> = ({
  onSelectFlow,
}) => {
  return (
    <div className="inventory-modal-content">
      <p className="inventory-modal-copy">Choose how you want to add the item.</p>
      <div className="inventory-flow-options-grid">
        <button
          type="button"
          className="action-btn inventory-flow-option-btn"
          onClick={() => onSelectFlow("preset")}
        >
          Add Preset Item
        </button>
        <button
          type="button"
          className="action-btn inventory-flow-option-btn"
          onClick={() => onSelectFlow("custom_from_base")}
        >
          Custom From Base
        </button>
        <button
          type="button"
          className="action-btn inventory-flow-option-btn"
          onClick={() => onSelectFlow("custom_generic")}
        >
          Fully Custom Item
        </button>
      </div>
    </div>
  );
};
