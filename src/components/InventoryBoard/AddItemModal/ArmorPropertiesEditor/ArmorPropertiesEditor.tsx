import type React from "react";
import "../AddItemModal.css";
import { EyeOff, Shield } from "lucide-react";

interface ArmorPropertiesEditorProps {
  baseAcInput: string;
  strengthRequirementInput: string;
  stealthDisadvantage: boolean;
  onBaseAcChange: (value: string) => void;
  onStrengthRequirementChange: (value: string) => void;
  onStealthDisadvantageChange: (value: boolean) => void;
}

export const ArmorPropertiesEditor: React.FC<ArmorPropertiesEditorProps> = ({
  baseAcInput,
  strengthRequirementInput,
  stealthDisadvantage,
  onBaseAcChange,
  onStrengthRequirementChange,
  onStealthDisadvantageChange,
}) => {
  return (
    <div className="properties-editor-panel">
      <div className="panel-header">
        <Shield size={16} className="panel-icon" />
        <span className="panel-title">Armor Properties</span>
      </div>

      <div className="form-row-grid">
        <div className="form-section">
          <label className="manuscript-label">Base AC</label>
          <input
            type="number"
            className="manuscript-input"
            placeholder="11"
            value={baseAcInput}
            onChange={(e) => onBaseAcChange(e.target.value)}
            min="1"
          />
        </div>

        <div className="form-section">
          <label className="manuscript-label">Strength Req.</label>
          <input
            type="number"
            className="manuscript-input"
            placeholder="e.g., 13"
            value={strengthRequirementInput}
            onChange={(e) => onStrengthRequirementChange(e.target.value)}
            min="0"
          />
        </div>
      </div>

      <div className="form-section checkbox-section">
        <label className="manuscript-checkbox-label">
          <input
            type="checkbox"
            checked={stealthDisadvantage}
            onChange={(e) => onStealthDisadvantageChange(e.target.checked)}
          />
          <EyeOff size={16} className="checkbox-icon" />
          Imposes Disadvantage on Stealth
        </label>
      </div>
    </div>
  );
};
