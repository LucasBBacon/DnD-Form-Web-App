import type React from "react";
import "./HealthAdjustmentForm.css";

// #region Type and Interfaces

export type HealthMode = "damage" | "heal" | "temp";

interface HealthAdjustmentFormProps {
  /** The currently active health mode */
  activeMode: HealthMode | null;
  /** The current value of the input field */
  inputValue: number | "";
  /** Callback for when the input value changes */
  onInputChange: (value: number | "") => void;

  /** Callback for when the form is submitted */
  onSubmit: (e: React.SubmitEvent) => void;
  /** Callback for when a health mode is selected */
  onModeSelect: (mode: HealthMode) => void;
  /** Callback for when the action is canceled */
  onCancel: () => void;
}

// #endregion

// #region Component

export const HealthAdjustmentForm: React.FC<HealthAdjustmentFormProps> = ({
  activeMode,
  inputValue,
  onInputChange,
  onSubmit,
  onModeSelect,
  onCancel,
}) => (
  <div className="health-actions">
    {activeMode ? (
      <form className="health-input-form" onSubmit={onSubmit}>
        <input
          type="number"
          autoFocus
          placeholder={`Enter ${activeMode} amount`}
          value={inputValue}
          onChange={(e) => onInputChange(parseInt(e.target.value) || "")}
        />
        <button type="submit" className={`confirm-btn ${activeMode}`}>
          Apply
        </button>
        <button type="button" className="cancel-btn" onClick={onCancel}>
          ✕
        </button>
      </form>
    ) : (
      <div className="health-buttons">
        <button className="btn-damage" onClick={() => onModeSelect("damage")}>
          Damage
        </button>
        <button className="btn-heal" onClick={() => onModeSelect("heal")}>
          Heal
        </button>
        <button className="btn-temp" onClick={() => onModeSelect("temp")}>
          Temp HP
        </button>
      </div>
    )}
  </div>
);

// #endregion
