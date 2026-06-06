import type React from "react";
import type { WeaponPropertyId } from "../../../types/item";
import type { AddItemPresetOption } from "./AddItemModal";
import { ArmorPropertiesEditor } from "./ArmorPropertiesEditor";
import { WeaponPropertiesEditor } from "./WeaponPropertiesEditor";

interface WeaponPropertyOption {
  id: WeaponPropertyId;
  name: string;
}

interface CustomFromBaseFlowProps {
  searchValue: string;
  selectedBaseItemId: string;
  filteredBaseItems: AddItemPresetOption[];
  selectedBaseItem: AddItemPresetOption | null;
  quantityInput: string;
  customNameInput: string;
  customWeightInput: string;
  customCpCostInput: string;
  customShortDescriptionInput: string;
  customFullDescriptionInput: string;
  customDamageDiceInput: string;
  customDamageTypeInput: string;
  customWeaponRangeInput: string;
  customWeaponPropertyIds: WeaponPropertyId[];
  customArmorBaseAcInput: string;
  customArmorStrengthRequirementInput: string;
  customArmorStealthDisadvantage: boolean;
  weaponPropertyCatalog: WeaponPropertyOption[];
  onSearchChange: (value: string) => void;
  onSelectBaseItem: (itemId: string) => void;
  onQuantityChange: (value: string) => void;
  onCustomNameChange: (value: string) => void;
  onCustomWeightChange: (value: string) => void;
  onCustomCpCostChange: (value: string) => void;
  onCustomShortDescriptionChange: (value: string) => void;
  onCustomFullDescriptionChange: (value: string) => void;
  onCustomDamageDiceChange: (value: string) => void;
  onCustomDamageTypeChange: (value: string) => void;
  onCustomWeaponRangeChange: (value: string) => void;
  onToggleWeaponProperty: (propertyId: WeaponPropertyId) => void;
  onCustomArmorBaseAcChange: (value: string) => void;
  onCustomArmorStrengthRequirementChange: (value: string) => void;
  onCustomArmorStealthDisadvantageChange: (value: boolean) => void;
  onSubmit: () => void;
  submitDisabled: boolean;
}

export const CustomFromBaseFlow: React.FC<CustomFromBaseFlowProps> = ({
  searchValue,
  selectedBaseItemId,
  filteredBaseItems,
  selectedBaseItem,
  quantityInput,
  customNameInput,
  customWeightInput,
  customCpCostInput,
  customShortDescriptionInput,
  customFullDescriptionInput,
  customDamageDiceInput,
  customDamageTypeInput,
  customWeaponRangeInput,
  customWeaponPropertyIds,
  customArmorBaseAcInput,
  customArmorStrengthRequirementInput,
  customArmorStealthDisadvantage,
  weaponPropertyCatalog,
  onSearchChange,
  onSelectBaseItem,
  onQuantityChange,
  onCustomNameChange,
  onCustomWeightChange,
  onCustomCpCostChange,
  onCustomShortDescriptionChange,
  onCustomFullDescriptionChange,
  onCustomDamageDiceChange,
  onCustomDamageTypeChange,
  onCustomWeaponRangeChange,
  onToggleWeaponProperty,
  onCustomArmorBaseAcChange,
  onCustomArmorStrengthRequirementChange,
  onCustomArmorStealthDisadvantageChange,
  onSubmit,
  submitDisabled,
}) => {
  return (
    <div className="inventory-preset-form">
      <label className="inventory-modal-field-label" htmlFor="custom-base-search">
        Search Base Items
      </label>
      <input
        id="custom-base-search"
        className="inventory-modal-input"
        type="text"
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search by base item name"
      />

      <label
        className="inventory-modal-field-label"
        htmlFor="custom-base-item-select"
      >
        Base Item
      </label>
      <select
        id="custom-base-item-select"
        className="inventory-modal-select"
        value={selectedBaseItemId}
        onChange={(event) => onSelectBaseItem(event.target.value)}
      >
        <option value="">Choose a base item...</option>
        {filteredBaseItems.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name} ({item.type})
          </option>
        ))}
      </select>

      <label className="inventory-modal-field-label" htmlFor="custom-item-name">
        Custom Name (Optional)
      </label>
      <input
        id="custom-item-name"
        className="inventory-modal-input"
        type="text"
        value={customNameInput}
        onChange={(event) => onCustomNameChange(event.target.value)}
        placeholder="Leave blank to use base item name"
      />

      <label className="inventory-modal-field-label" htmlFor="custom-item-quantity">
        Quantity
      </label>
      <input
        id="custom-item-quantity"
        className="inventory-modal-input inventory-modal-input-short"
        type="number"
        inputMode="numeric"
        min={1}
        value={quantityInput}
        onChange={(event) => onQuantityChange(event.target.value)}
      />

      <label className="inventory-modal-field-label" htmlFor="custom-item-weight">
        Weight Override (lb)
      </label>
      <input
        id="custom-item-weight"
        className="inventory-modal-input inventory-modal-input-short"
        type="number"
        inputMode="decimal"
        min={0}
        value={customWeightInput}
        onChange={(event) => onCustomWeightChange(event.target.value)}
      />

      <label className="inventory-modal-field-label" htmlFor="custom-item-cp-cost">
        Custom Value (cp)
      </label>
      <input
        id="custom-item-cp-cost"
        className="inventory-modal-input inventory-modal-input-short"
        type="number"
        inputMode="numeric"
        min={0}
        value={customCpCostInput}
        onChange={(event) => onCustomCpCostChange(event.target.value)}
      />

      <label
        className="inventory-modal-field-label"
        htmlFor="custom-item-short-description"
      >
        Custom Short Description
      </label>
      <input
        id="custom-item-short-description"
        className="inventory-modal-input"
        type="text"
        value={customShortDescriptionInput}
        onChange={(event) => onCustomShortDescriptionChange(event.target.value)}
      />

      <label
        className="inventory-modal-field-label"
        htmlFor="custom-item-full-description"
      >
        Custom Full Description
      </label>
      <textarea
        id="custom-item-full-description"
        className="inventory-modal-input inventory-modal-textarea"
        value={customFullDescriptionInput}
        onChange={(event) => onCustomFullDescriptionChange(event.target.value)}
      />

      {selectedBaseItem?.weaponProperties && (
        <WeaponPropertiesEditor
          damageDiceInput={customDamageDiceInput}
          damageTypeInput={customDamageTypeInput}
          rangeInput={customWeaponRangeInput}
          selectedPropertyIds={customWeaponPropertyIds}
          weaponPropertyCatalog={weaponPropertyCatalog}
          onDamageDiceChange={onCustomDamageDiceChange}
          onDamageTypeChange={onCustomDamageTypeChange}
          onRangeChange={onCustomWeaponRangeChange}
          onToggleProperty={onToggleWeaponProperty}
        />
      )}

      {selectedBaseItem?.armorProperties && (
        <ArmorPropertiesEditor
          baseAcInput={customArmorBaseAcInput}
          strengthRequirementInput={customArmorStrengthRequirementInput}
          stealthDisadvantage={customArmorStealthDisadvantage}
          onBaseAcChange={onCustomArmorBaseAcChange}
          onStrengthRequirementChange={onCustomArmorStrengthRequirementChange}
          onStealthDisadvantageChange={onCustomArmorStealthDisadvantageChange}
        />
      )}

      <button
        type="button"
        className="action-btn"
        disabled={submitDisabled}
        onClick={onSubmit}
      >
        Add Custom Item
      </button>
    </div>
  );
};
