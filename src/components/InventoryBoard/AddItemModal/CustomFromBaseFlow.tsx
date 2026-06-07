import type React from "react";
import "./AddItemModal.css";
import type { WeaponPropertyId } from "../../../types/item";
import type { AddItemPresetOption } from "./AddItemModal";
import { ArmorPropertiesEditor } from "./ArmorPropertiesEditor";
import { WeaponPropertiesEditor } from "./WeaponPropertiesEditor";
import { ArrowLeft, Coins, PenTool, Scale, Search } from "lucide-react";

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
  if (!selectedBaseItem) {
    return (
      <div className="preset-flow-container">
        <div className="requisition-search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="manuscript-input full-width"
            placeholder="Search for a base item to modify..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            autoFocus
          />
        </div>

        <div className="requisition-ledger-list custom-scrollbar">
          {filteredBaseItems.map((item) => (
            <button
              key={item.id}
              className="ledger-item-row"
              onClick={() => onSelectBaseItem(item.id)}
            >
              <div className="row-primary">
                <span className="item-name">{item.name}</span>
                <span className="item-type">{item.type}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const isWeapon = !!selectedBaseItem.weaponProperties;
  const isArmor = !!selectedBaseItem.armorProperties;

  return (
    <div className="custom-from-base-container">
      {/* BASE ITEM HEADER (locked) */}
      <div className="base-item-locked-header">
        <div className="locked-info">
          <span className="locked-label">Forging from Base:</span>
          <span className="locked-name">{selectedBaseItem.name}</span>
        </div>
        <button
          className="action-btn cancel-btn"
          onClick={() => onSelectBaseItem("")}
        >
          <ArrowLeft size={14} /> Change Base
        </button>
      </div>

      {/* Scrollable Form Area */}
      <div className="generic-form-scroll-area custom-scrollbar">
        {/* Core overrides */}
        <div className="form-section">
          <label className="manuscript-label">Custom Name</label>
          <input
            type="text"
            className="manuscript-input pristine-input"
            placeholder={`Custom ${selectedBaseItem.name}`}
            value={customNameInput}
            onChange={(e) => onCustomNameChange(e.target.value)}
          />
        </div>

        <div className="form-row-grid">
          <div className="form-section">
            <label className="manuscript-label">
              <Scale size={14} /> Override Weight
            </label>
            <input
              type="number"
              className="manuscript-input"
              placeholder={`${selectedBaseItem.weight} lb`}
              value={customWeightInput}
              onChange={(e) => onCustomWeightChange(e.target.value)}
            />
          </div>

          <div className="form-section">
            <label className="manuscript-label">
              <Coins size={14} /> Override Cost (Cp)
            </label>
            <input
              type="number"
              className="manuscript-input"
              placeholder={`${selectedBaseItem.cpCost} cp`}
              value={customCpCostInput}
              onChange={(e) => onCustomCpCostChange(e.target.value)}
            />
          </div>
        </div>

        <hr className="filigree-divider subtle-divider" />

        {/* Conditional Editors */}
        {isWeapon && (
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

        {isArmor && (
          <ArmorPropertiesEditor
            baseAcInput={customArmorBaseAcInput}
            strengthRequirementInput={customArmorStrengthRequirementInput}
            stealthDisadvantage={customArmorStealthDisadvantage}
            onBaseAcChange={onCustomArmorBaseAcChange}
            onStrengthRequirementChange={onCustomArmorStrengthRequirementChange}
            onStealthDisadvantageChange={onCustomArmorStealthDisadvantageChange}
          />
        )}

        <hr className="filigree-divider subtle-divider" />

        {/* Lore Overrides */}
        <div className="form-section">
          <label className="manuscript-label">Custom Brief Lore</label>
          <input
            type="text"
            className="manuscript-input"
            placeholder="Override short description..."
            value={customShortDescriptionInput}
            onChange={(e) => onCustomShortDescriptionChange(e.target.value)}
          />
        </div>

        <div className="form-section">
          <label className="manuscript-label">Custom Full Lore</label>
          <textarea
            className="manuscript-textarea"
            placeholder="Override detailed description..."
            value={customFullDescriptionInput}
            onChange={(e) => onCustomFullDescriptionChange(e.target.value)}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="requisition-footer">
        <div className="quantity-control">
          <label>Qty:</label>
          <input
            type="number"
            className="manuscript-input quantity-input"
            value={quantityInput}
            onChange={(e) => onQuantityChange(e.target.value)}
            min="1"
          />
        </div>
        <button
          className="action-btn confirm-add-btn"
          onClick={onSubmit}
          disabled={submitDisabled}
        >
          <PenTool size={16} /> Forge & Add
        </button>
      </div>
    </div>
  );
};
