import type React from "react";

export type HealthMode = "damage" | "heal" | "temp";

interface HealthAdjustmentFormProps {
  activeMode: HealthMode | null;
  inputValue: number | "";
  onInputChange: (value: number | "") => void;
  onSubmit: (e: React.FormEvent) => void;
  onModeSelect: (mode: HealthMode) => void;
  onCancel: () => void;
}

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
