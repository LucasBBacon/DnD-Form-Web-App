import type React from "react";
import "./AddItemModal.css";
import type { AddItemFlowType } from "../AddItemModal";
import { PackageSearch, PenTool, Sparkles } from "lucide-react";

interface AddItemFlowSelectorProps {
  onSelectFlow: (flow: AddItemFlowType) => void;
}

export const AddItemFlowSelector: React.FC<AddItemFlowSelectorProps> = ({
  onSelectFlow,
}) => {
  return (
    <div className="flow-selector-grid">
      <button
        type="button"
        className="flow-card"
        onClick={() => onSelectFlow("preset")}
      >
        <div className="flow-icon-wrapper">
          <PackageSearch size={24} />
        </div>
        <div className="flow-title">Standard Equipment</div>
        <span className="flow-description">
          Browse the official ledger of known items, weapons, and armor.
        </span>
      </button>

      <button
        type="button"
        className="flow-card"
        onClick={() => onSelectFlow("custom_from_base")}
      >
        <div className="flow-icon-wrapper">
          <PenTool size={24} />
        </div>
        <div className="flow-title">Modify Base Item</div>
        <span className="flow-description">
          Take a standard item and forge it anew with a custom name or
          properties.
        </span>
      </button>

      <button
        type="button"
        className="flow-card"
        onClick={() => onSelectFlow("custom_generic")}
      >
        <div className="flow-icon-wrapper">
          <Sparkles size={24} />
        </div>
        <div className="flow-title">Custom Item</div>
        <span className="flow-description">
          Draft an entirely new item from scratch for your campaign's unique
          lore.
        </span>
      </button>
    </div>
  );
};
