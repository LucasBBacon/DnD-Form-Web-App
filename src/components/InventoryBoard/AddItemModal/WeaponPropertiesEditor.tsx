import type React from "react";
import type { WeaponPropertyId } from "../../../types/item";

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
    <>
      <label
        className="inventory-modal-field-label"
        htmlFor="custom-weapon-damage-dice"
      >
        Weapon Damage Dice
      </label>
      <input
        id="custom-weapon-damage-dice"
        className="inventory-modal-input inventory-modal-input-short"
        type="text"
        value={damageDiceInput}
        onChange={(event) => onDamageDiceChange(event.target.value)}
      />

      <label
        className="inventory-modal-field-label"
        htmlFor="custom-weapon-damage-type"
      >
        Weapon Damage Type
      </label>
      <input
        id="custom-weapon-damage-type"
        className="inventory-modal-input"
        type="text"
        value={damageTypeInput}
        onChange={(event) => onDamageTypeChange(event.target.value)}
      />

      <label className="inventory-modal-field-label" htmlFor="custom-weapon-range">
        Weapon Range
      </label>
      <input
        id="custom-weapon-range"
        className="inventory-modal-input inventory-modal-input-short"
        type="text"
        value={rangeInput}
        onChange={(event) => onRangeChange(event.target.value)}
      />

      <span className="inventory-modal-field-label">Weapon Properties</span>
      <div className="inventory-weapon-property-grid">
        {weaponPropertyCatalog.map((property) => (
          <label key={property.id} className="inventory-checkbox-option">
            <input
              type="checkbox"
              checked={selectedPropertyIds.includes(property.id)}
              onChange={() => onToggleProperty(property.id)}
            />
            <span>{property.name}</span>
          </label>
        ))}
      </div>
    </>
  );
};
