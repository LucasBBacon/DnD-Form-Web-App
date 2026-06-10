import type React from "react";
import "../AddItemModal.css";
import type { WeaponPropertyId } from "../../../../types/item";
import { Sword } from "lucide-react";

interface WeaponPropertyOption {
  id: WeaponPropertyId;
  name: string;
}

interface WeaponPropertiesEditorProps {
  damageDiceInput: string;
  damageTypeInput: string;
  rangeInput: string;
  selectedPropertyIds: WeaponPropertyId[];
  weaponPropertyCatalog: WeaponPropertyOption[];
  onDamageDiceChange: (value: string) => void;
  onDamageTypeChange: (value: string) => void;
  onRangeChange: (value: string) => void;
  onToggleProperty: (propertyId: WeaponPropertyId) => void;
}

export const WeaponPropertiesEditor: React.FC<WeaponPropertiesEditorProps> = ({
  damageDiceInput,
  damageTypeInput,
  rangeInput,
  selectedPropertyIds,
  weaponPropertyCatalog,
  onDamageDiceChange,
  onDamageTypeChange,
  onRangeChange,
  onToggleProperty,
}) => {
  return (
    <div className="properties-editor-panel">
      <div className="panel-header">
        <Sword size={16} className="panel-icon" />
        <span className="panel-title">Martial Properties</span>
      </div>

      <div className="form-row-grid">
        <div className="form-section">
          <label className="manuscript-label">Damage</label>
          <input
            type="text"
            className="manuscript-input"
            placeholder="e.g., 1d8"
            value={damageDiceInput}
            onChange={(e) => onDamageDiceChange(e.target.value)}
          />
        </div>

        <div className="form-section">
          <label className="manuscript-label">Type</label>
          <input
            type="text"
            className="manuscript-input"
            placeholder="e.g., Slashing"
            value={damageTypeInput}
            onChange={(e) => onDamageTypeChange(e.target.value)}
          />
        </div>

        <div className="form-section">
          <label className="manuscript-label">Range</label>
          <input
            type="text"
            className="manuscript-input"
            placeholder="e.g., 20/60 or 5ft"
            value={rangeInput}
            onChange={(e) => onRangeChange(e.target.value)}
          />
        </div>
      </div>

      <div className="form-section properties-toggle-section">
        <label className="manuscript-label">Weapon Traits</label>
        <div className="property-pills">
          {weaponPropertyCatalog.map((prop) => {
            const isActive = selectedPropertyIds.includes(prop.id);
            return (
              <button
                type="button"
                key={prop.id}
                className={`property-pill ${isActive ? "is-active" : ""}`}
                onClick={() => onToggleProperty(prop.id)}
              >
                {prop.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
