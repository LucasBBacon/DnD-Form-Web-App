import type React from "react";

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
    <>
      <label className="inventory-modal-field-label" htmlFor="custom-armor-base-ac">
        Armor Base AC
      </label>
      <input
        id="custom-armor-base-ac"
        className="inventory-modal-input inventory-modal-input-short"
        type="number"
        inputMode="numeric"
        min={1}
        value={baseAcInput}
        onChange={(event) => onBaseAcChange(event.target.value)}
      />

      <label
        className="inventory-modal-field-label"
        htmlFor="custom-armor-strength-requirement"
      >
        Strength Requirement
      </label>
      <input
        id="custom-armor-strength-requirement"
        className="inventory-modal-input inventory-modal-input-short"
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        value={strengthRequirementInput}
        onChange={(event) => onStrengthRequirementChange(event.target.value)}
      />

      <label className="inventory-checkbox-option">
        <input
          type="checkbox"
          checked={stealthDisadvantage}
          onChange={(event) => onStealthDisadvantageChange(event.target.checked)}
        />
        <span>Stealth Disadvantage</span>
      </label>
    </>
  );
};
