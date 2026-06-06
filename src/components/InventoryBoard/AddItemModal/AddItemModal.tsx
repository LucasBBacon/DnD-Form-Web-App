import type React from "react";
import { useMemo, useState } from "react";
import type {
  ArmorProperties,
  ItemInstanceOverrides,
  MagicItemProperties,
  WeaponProperties,
} from "../../../types/item";
import "./AddItemModal.css";

export type AddItemFlowType =
  | "preset"
  | "custom_from_base"
  | "custom_generic";

export type AddItemModalStep = "choose_flow" | "flow_details";

export interface AddItemPresetOption {
  id: string;
  name: string;
  type: string;
  weight: number;
  armorProperties?: ArmorProperties;
  weaponProperties?: WeaponProperties;
  magicItemProperties?: MagicItemProperties;
}

export interface AddCustomFromBasePayload {
  baseItemId: string;
  quantity: number;
  customName?: string;
  overrides?: ItemInstanceOverrides;
}

export interface AddCustomGenericPayload {
  name: string;
  shortDescription: string;
  fullDescription?: string;
  weight: number;
  cpCost: number;
  quantity: number;
}

export interface AddItemModalProps {
  isOpen: boolean;
  step: AddItemModalStep;
  selectedFlow: AddItemFlowType | null;
  presetItems: AddItemPresetOption[];
  onClose: () => void;
  onBack: () => void;
  onSelectFlow: (flow: AddItemFlowType) => void;
  onConfirmPresetAdd: (itemId: string, quantity: number) => void;
  onConfirmCustomFromBaseAdd: (payload: AddCustomFromBasePayload) => void;
  onConfirmCustomGenericAdd: (payload: AddCustomGenericPayload) => void;
}

const FLOW_TITLE: Record<AddItemFlowType, string> = {
  preset: "Add Preset Item",
  custom_from_base: "Create Custom Item From Base",
  custom_generic: "Create Fully Custom Item",
};

const FLOW_DESCRIPTION: Record<AddItemFlowType, string> = {
  preset:
    "Select an item from the 2014 PHB presets and add it to inventory with a quantity.",
  custom_from_base:
    "Select an existing base item, then customize name and supported stats for this specific item instance.",
  custom_generic:
    "Create a custom non-weapon/non-armor item with player-defined details like name, description, weight, and value.",
};

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  step,
  selectedFlow,
  presetItems,
  onClose,
  onBack,
  onSelectFlow,
  onConfirmPresetAdd,
  onConfirmCustomFromBaseAdd,
  onConfirmCustomGenericAdd,
}) => {
  const [presetSearch, setPresetSearch] = useState("");
  const [selectedPresetItemId, setSelectedPresetItemId] = useState("");
  const [presetQuantityInput, setPresetQuantityInput] = useState("1");
  const [customFromBaseSearch, setCustomFromBaseSearch] = useState("");
  const [selectedCustomBaseItemId, setSelectedCustomBaseItemId] = useState("");
  const [customFromBaseQuantityInput, setCustomFromBaseQuantityInput] =
    useState("1");
  const [customNameInput, setCustomNameInput] = useState("");
  const [customWeightInput, setCustomWeightInput] = useState("");
  const [customDamageDiceInput, setCustomDamageDiceInput] = useState("");
  const [customDamageTypeInput, setCustomDamageTypeInput] = useState("");
  const [customArmorBaseAcInput, setCustomArmorBaseAcInput] = useState("");
  const [genericNameInput, setGenericNameInput] = useState("");
  const [genericShortDescriptionInput, setGenericShortDescriptionInput] =
    useState("");
  const [genericFullDescriptionInput, setGenericFullDescriptionInput] =
    useState("");
  const [genericWeightInput, setGenericWeightInput] = useState("");
  const [genericCpCostInput, setGenericCpCostInput] = useState("");
  const [genericQuantityInput, setGenericQuantityInput] = useState("1");

  const filteredPresetItems = useMemo(() => {
    const normalizedSearch = presetSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return presetItems.slice(0, 60);
    }

    return presetItems
      .filter((item) => item.name.toLowerCase().includes(normalizedSearch))
      .slice(0, 60);
  }, [presetItems, presetSearch]);

  const normalizedPresetQuantity = Math.max(
    1,
    Math.floor(Number(presetQuantityInput) || 1),
  );

  const filteredCustomBaseItems = useMemo(() => {
    const normalizedSearch = customFromBaseSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return presetItems.slice(0, 60);
    }

    return presetItems
      .filter((item) => item.name.toLowerCase().includes(normalizedSearch))
      .slice(0, 60);
  }, [presetItems, customFromBaseSearch]);

  const selectedCustomBaseItem = useMemo(
    () =>
      presetItems.find((item) => item.id === selectedCustomBaseItemId) ?? null,
    [presetItems, selectedCustomBaseItemId],
  );

  const normalizedCustomFromBaseQuantity = Math.max(
    1,
    Math.floor(Number(customFromBaseQuantityInput) || 1),
  );

  const normalizedGenericQuantity = Math.max(
    1,
    Math.floor(Number(genericQuantityInput) || 1),
  );

  const handleCustomBaseItemSelection = (nextBaseItemId: string) => {
    setSelectedCustomBaseItemId(nextBaseItemId);

    const selectedBaseItem =
      presetItems.find((item) => item.id === nextBaseItemId) ?? null;

    if (!selectedBaseItem) {
      setCustomWeightInput("");
      setCustomDamageDiceInput("");
      setCustomDamageTypeInput("");
      setCustomArmorBaseAcInput("");
      return;
    }

    setCustomWeightInput(String(selectedBaseItem.weight));
    setCustomDamageDiceInput(selectedBaseItem.weaponProperties?.damageDice ?? "");
    setCustomDamageTypeInput(selectedBaseItem.weaponProperties?.damageType ?? "");
    setCustomArmorBaseAcInput(
      selectedBaseItem.armorProperties
        ? String(selectedBaseItem.armorProperties.baseAc)
        : "",
    );
  };

  const resetPresetForm = () => {
    setPresetSearch("");
    setSelectedPresetItemId("");
    setPresetQuantityInput("1");
  };

  const resetCustomFromBaseForm = () => {
    setCustomFromBaseSearch("");
    setSelectedCustomBaseItemId("");
    setCustomFromBaseQuantityInput("1");
    setCustomNameInput("");
    setCustomWeightInput("");
    setCustomDamageDiceInput("");
    setCustomDamageTypeInput("");
    setCustomArmorBaseAcInput("");
  };

  const resetCustomGenericForm = () => {
    setGenericNameInput("");
    setGenericShortDescriptionInput("");
    setGenericFullDescriptionInput("");
    setGenericWeightInput("");
    setGenericCpCostInput("");
    setGenericQuantityInput("1");
  };

  const resetForms = () => {
    resetPresetForm();
    resetCustomFromBaseForm();
    resetCustomGenericForm();
  };

  const handlePresetAdd = () => {
    if (!selectedPresetItemId) return;
    onConfirmPresetAdd(selectedPresetItemId, normalizedPresetQuantity);
    resetPresetForm();
  };

  const handleCustomFromBaseAdd = () => {
    if (!selectedCustomBaseItem) return;

    const trimmedCustomName = customNameInput.trim();
    const parsedWeight = Number(customWeightInput);
    const parsedArmorBaseAc = Number(customArmorBaseAcInput);

    const overrides: ItemInstanceOverrides = {};
    if (
      Number.isFinite(parsedWeight) &&
      parsedWeight > 0 &&
      parsedWeight !== selectedCustomBaseItem.weight
    ) {
      overrides.weight = parsedWeight;
    }

    if (selectedCustomBaseItem.weaponProperties) {
      const nextDamageDice = customDamageDiceInput.trim();
      const nextDamageType = customDamageTypeInput.trim();
      const shouldOverrideWeapon =
        nextDamageDice.length > 0 &&
        nextDamageType.length > 0 &&
        (nextDamageDice !== selectedCustomBaseItem.weaponProperties.damageDice ||
          nextDamageType !== selectedCustomBaseItem.weaponProperties.damageType);

      if (shouldOverrideWeapon) {
        overrides.weaponProperties = {
          ...selectedCustomBaseItem.weaponProperties,
          damageDice: nextDamageDice,
          damageType: nextDamageType,
        };
      }
    }

    if (selectedCustomBaseItem.armorProperties) {
      const shouldOverrideArmor =
        Number.isFinite(parsedArmorBaseAc) &&
        parsedArmorBaseAc > 0 &&
        parsedArmorBaseAc !== selectedCustomBaseItem.armorProperties.baseAc;

      if (shouldOverrideArmor) {
        overrides.armorProperties = {
          ...selectedCustomBaseItem.armorProperties,
          baseAc: Math.floor(parsedArmorBaseAc),
        };
      }
    }

    onConfirmCustomFromBaseAdd({
      baseItemId: selectedCustomBaseItem.id,
      quantity: normalizedCustomFromBaseQuantity,
      customName: trimmedCustomName || undefined,
      overrides:
        Object.keys(overrides).length > 0
          ? overrides
          : undefined,
    });

    resetCustomFromBaseForm();
  };

  const handleCustomGenericAdd = () => {
    const trimmedName = genericNameInput.trim();
    const trimmedShortDescription = genericShortDescriptionInput.trim();
    const trimmedFullDescription = genericFullDescriptionInput.trim();
    const parsedWeight = Number(genericWeightInput);
    const parsedCpCost = Number(genericCpCostInput);

    if (!trimmedName || !trimmedShortDescription) return;
    if (!Number.isFinite(parsedWeight) || parsedWeight < 0) return;
    if (!Number.isFinite(parsedCpCost) || parsedCpCost < 0) return;

    onConfirmCustomGenericAdd({
      name: trimmedName,
      shortDescription: trimmedShortDescription,
      fullDescription: trimmedFullDescription || undefined,
      weight: parsedWeight,
      cpCost: Math.floor(parsedCpCost),
      quantity: normalizedGenericQuantity,
    });

    resetCustomGenericForm();
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  const handleBack = () => {
    resetForms();
    onBack();
  };

  if (!isOpen) return null;

  return (
    <div className="inventory-modal-overlay" role="dialog" aria-modal="true">
      <div className="inventory-modal-shell">
        <div className="inventory-modal-header-row">
          <h3 className="inventory-modal-title">Add Inventory Item</h3>
          <button
            type="button"
            className="inventory-modal-close-btn"
            onClick={handleClose}
            aria-label="Close add item modal"
          >
            X
          </button>
        </div>

        <hr className="ornate-board-divider" />

        {step === "choose_flow" ? (
          <div className="inventory-modal-content">
            <p className="inventory-modal-copy">
              Choose how you want to add the item.
            </p>
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
        ) : (
          <div className="inventory-modal-content">
            <p className="inventory-modal-copy">
              {selectedFlow ? FLOW_TITLE[selectedFlow] : "Flow"}
            </p>
            <p className="inventory-modal-copy inventory-modal-copy-muted">
              {selectedFlow
                ? FLOW_DESCRIPTION[selectedFlow]
                : "Select a flow to continue."}
            </p>

            {selectedFlow === "preset" && (
              <div className="inventory-preset-form">
                <label
                  className="inventory-modal-field-label"
                  htmlFor="preset-search"
                >
                  Search Preset Items
                </label>
                <input
                  id="preset-search"
                  className="inventory-modal-input"
                  type="text"
                  value={presetSearch}
                  onChange={(event) => setPresetSearch(event.target.value)}
                  placeholder="Search by item name"
                />

                <label
                  className="inventory-modal-field-label"
                  htmlFor="preset-item-select"
                >
                  Select Item
                </label>
                <select
                  id="preset-item-select"
                  className="inventory-modal-select"
                  value={selectedPresetItemId}
                  onChange={(event) => setSelectedPresetItemId(event.target.value)}
                >
                  <option value="">Choose an item...</option>
                  {filteredPresetItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.type})
                    </option>
                  ))}
                </select>

                <label
                  className="inventory-modal-field-label"
                  htmlFor="preset-quantity"
                >
                  Quantity
                </label>
                <input
                  id="preset-quantity"
                  className="inventory-modal-input inventory-modal-input-short"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={presetQuantityInput}
                  onChange={(event) => setPresetQuantityInput(event.target.value)}
                />

                <button
                  type="button"
                  className="action-btn"
                  disabled={!selectedPresetItemId}
                  onClick={handlePresetAdd}
                >
                  Add Selected Item
                </button>
              </div>
            )}

            {selectedFlow === "custom_from_base" && (
              <div className="inventory-preset-form">
                <label
                  className="inventory-modal-field-label"
                  htmlFor="custom-base-search"
                >
                  Search Base Items
                </label>
                <input
                  id="custom-base-search"
                  className="inventory-modal-input"
                  type="text"
                  value={customFromBaseSearch}
                  onChange={(event) =>
                    setCustomFromBaseSearch(event.target.value)
                  }
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
                  value={selectedCustomBaseItemId}
                  onChange={(event) =>
                    handleCustomBaseItemSelection(event.target.value)
                  }
                >
                  <option value="">Choose a base item...</option>
                  {filteredCustomBaseItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.type})
                    </option>
                  ))}
                </select>

                <label
                  className="inventory-modal-field-label"
                  htmlFor="custom-item-name"
                >
                  Custom Name (Optional)
                </label>
                <input
                  id="custom-item-name"
                  className="inventory-modal-input"
                  type="text"
                  value={customNameInput}
                  onChange={(event) => setCustomNameInput(event.target.value)}
                  placeholder="Leave blank to use base item name"
                />

                <label
                  className="inventory-modal-field-label"
                  htmlFor="custom-item-quantity"
                >
                  Quantity
                </label>
                <input
                  id="custom-item-quantity"
                  className="inventory-modal-input inventory-modal-input-short"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={customFromBaseQuantityInput}
                  onChange={(event) =>
                    setCustomFromBaseQuantityInput(event.target.value)
                  }
                />

                <label
                  className="inventory-modal-field-label"
                  htmlFor="custom-item-weight"
                >
                  Weight Override (lb)
                </label>
                <input
                  id="custom-item-weight"
                  className="inventory-modal-input inventory-modal-input-short"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={customWeightInput}
                  onChange={(event) => setCustomWeightInput(event.target.value)}
                />

                {selectedCustomBaseItem?.weaponProperties && (
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
                      value={customDamageDiceInput}
                      onChange={(event) =>
                        setCustomDamageDiceInput(event.target.value)
                      }
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
                      value={customDamageTypeInput}
                      onChange={(event) =>
                        setCustomDamageTypeInput(event.target.value)
                      }
                    />
                  </>
                )}

                {selectedCustomBaseItem?.armorProperties && (
                  <>
                    <label
                      className="inventory-modal-field-label"
                      htmlFor="custom-armor-base-ac"
                    >
                      Armor Base AC
                    </label>
                    <input
                      id="custom-armor-base-ac"
                      className="inventory-modal-input inventory-modal-input-short"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={customArmorBaseAcInput}
                      onChange={(event) =>
                        setCustomArmorBaseAcInput(event.target.value)
                      }
                    />
                  </>
                )}

                <button
                  type="button"
                  className="action-btn"
                  disabled={!selectedCustomBaseItemId}
                  onClick={handleCustomFromBaseAdd}
                >
                  Add Custom Item
                </button>
              </div>
            )}

            {selectedFlow === "custom_generic" && (
              <div className="inventory-preset-form">
                <label
                  className="inventory-modal-field-label"
                  htmlFor="generic-item-name"
                >
                  Item Name
                </label>
                <input
                  id="generic-item-name"
                  className="inventory-modal-input"
                  type="text"
                  value={genericNameInput}
                  onChange={(event) => setGenericNameInput(event.target.value)}
                  placeholder="Custom item name"
                />

                <label
                  className="inventory-modal-field-label"
                  htmlFor="generic-item-short-description"
                >
                  Short Description
                </label>
                <input
                  id="generic-item-short-description"
                  className="inventory-modal-input"
                  type="text"
                  value={genericShortDescriptionInput}
                  onChange={(event) =>
                    setGenericShortDescriptionInput(event.target.value)
                  }
                  placeholder="One-line description"
                />

                <label
                  className="inventory-modal-field-label"
                  htmlFor="generic-item-full-description"
                >
                  Full Description (Optional)
                </label>
                <textarea
                  id="generic-item-full-description"
                  className="inventory-modal-input inventory-modal-textarea"
                  value={genericFullDescriptionInput}
                  onChange={(event) =>
                    setGenericFullDescriptionInput(event.target.value)
                  }
                  placeholder="Longer notes about this custom item"
                />

                <label
                  className="inventory-modal-field-label"
                  htmlFor="generic-item-weight"
                >
                  Weight (lb)
                </label>
                <input
                  id="generic-item-weight"
                  className="inventory-modal-input inventory-modal-input-short"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={genericWeightInput}
                  onChange={(event) => setGenericWeightInput(event.target.value)}
                />

                <label
                  className="inventory-modal-field-label"
                  htmlFor="generic-item-cp-cost"
                >
                  Value (cp)
                </label>
                <input
                  id="generic-item-cp-cost"
                  className="inventory-modal-input inventory-modal-input-short"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={genericCpCostInput}
                  onChange={(event) => setGenericCpCostInput(event.target.value)}
                />

                <label
                  className="inventory-modal-field-label"
                  htmlFor="generic-item-quantity"
                >
                  Quantity
                </label>
                <input
                  id="generic-item-quantity"
                  className="inventory-modal-input inventory-modal-input-short"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={genericQuantityInput}
                  onChange={(event) => setGenericQuantityInput(event.target.value)}
                />

                <button
                  type="button"
                  className="action-btn"
                  onClick={handleCustomGenericAdd}
                  disabled={
                    genericNameInput.trim().length === 0 ||
                    genericShortDescriptionInput.trim().length === 0
                  }
                >
                  Add Fully Custom Item
                </button>
              </div>
            )}
          </div>
        )}

        <div className="inventory-modal-actions">
          {step === "flow_details" && (
            <button type="button" className="action-btn" onClick={handleBack}>
              Back
            </button>
          )}
          <button type="button" className="action-btn" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
