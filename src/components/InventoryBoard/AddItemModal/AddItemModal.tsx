import type React from "react";
import { useMemo, useState } from "react";
import { getAllWeaponProperties } from "../../../data/staticDataApi";
import { normalizeWeaponProperties } from "../../../data/weaponNormalizer";
import type {
  ArmorProperties,
  ItemInstanceOverrides,
  MagicItemProperties,
  WeaponProperties,
  WeaponPropertyId,
} from "../../../types/item";
import { AddItemFlowSelector } from "./AddItemFlowSelector";
import { CustomFromBaseFlow } from "./CustomFromBaseFlow";
import { CustomGenericItemFlow } from "./CustomGenericItemFlow";
import { PresetItemFlow } from "./PresetItemFlow";
import "./AddItemModal.css";
import { ChevronLeft, X } from "lucide-react";

export type AddItemFlowType = "preset" | "custom_from_base" | "custom_generic";

export type AddItemModalStep = "choose_flow" | "flow_details";

export interface AddItemPresetOption {
  id: string;
  name: string;
  type: string;
  weight: number;
  cpCost: number;
  lore: {
    shortDescription: string;
    fullText?: string;
  };
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
  const [customCpCostInput, setCustomCpCostInput] = useState("");
  const [customShortDescriptionInput, setCustomShortDescriptionInput] =
    useState("");
  const [customFullDescriptionInput, setCustomFullDescriptionInput] =
    useState("");
  const [customDamageDiceInput, setCustomDamageDiceInput] = useState("");
  const [customDamageTypeInput, setCustomDamageTypeInput] = useState("");
  const [customWeaponRangeInput, setCustomWeaponRangeInput] = useState("");
  const [customWeaponPropertyIds, setCustomWeaponPropertyIds] = useState<
    WeaponPropertyId[]
  >([]);
  const [customArmorBaseAcInput, setCustomArmorBaseAcInput] = useState("");
  const [
    customArmorStrengthRequirementInput,
    setCustomArmorStrengthRequirementInput,
  ] = useState("");
  const [customArmorStealthDisadvantage, setCustomArmorStealthDisadvantage] =
    useState(false);
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
  const weaponPropertyCatalog = useMemo(() => getAllWeaponProperties(), []);

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
    setCustomCpCostInput(String(selectedBaseItem.cpCost ?? 0));
    setCustomShortDescriptionInput(
      selectedBaseItem.lore?.shortDescription ?? "",
    );
    setCustomFullDescriptionInput(selectedBaseItem.lore?.fullText ?? "");
    setCustomDamageDiceInput(
      selectedBaseItem.weaponProperties?.damageDice ?? "",
    );
    setCustomDamageTypeInput(
      selectedBaseItem.weaponProperties?.damageType ?? "",
    );
    setCustomWeaponRangeInput(selectedBaseItem.weaponProperties?.range ?? "");
    setCustomWeaponPropertyIds(
      selectedBaseItem.weaponProperties?.propertyIds ?? [],
    );
    setCustomArmorBaseAcInput(
      selectedBaseItem.armorProperties
        ? String(selectedBaseItem.armorProperties.baseAc)
        : "",
    );
    setCustomArmorStrengthRequirementInput(
      selectedBaseItem.armorProperties?.strengthRequirement != null
        ? String(selectedBaseItem.armorProperties.strengthRequirement)
        : "",
    );
    setCustomArmorStealthDisadvantage(
      selectedBaseItem.armorProperties?.stealthDisadvantage ?? false,
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
    setCustomCpCostInput("");
    setCustomShortDescriptionInput("");
    setCustomFullDescriptionInput("");
    setCustomDamageDiceInput("");
    setCustomDamageTypeInput("");
    setCustomWeaponRangeInput("");
    setCustomWeaponPropertyIds([]);
    setCustomArmorBaseAcInput("");
    setCustomArmorStrengthRequirementInput("");
    setCustomArmorStealthDisadvantage(false);
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
    const parsedCpCost = Number(customCpCostInput);
    const trimmedShortDescription = customShortDescriptionInput.trim();
    const trimmedFullDescription = customFullDescriptionInput.trim();
    const parsedArmorBaseAc = Number(customArmorBaseAcInput);
    const parsedArmorStrengthRequirement = Number(
      customArmorStrengthRequirementInput,
    );

    const overrides: ItemInstanceOverrides = {};
    if (
      Number.isFinite(parsedWeight) &&
      parsedWeight > 0 &&
      parsedWeight !== selectedCustomBaseItem.weight
    ) {
      overrides.weight = parsedWeight;
    }

    if (
      Number.isFinite(parsedCpCost) &&
      parsedCpCost >= 0 &&
      parsedCpCost !== selectedCustomBaseItem.cpCost
    ) {
      overrides.cpCost = Math.floor(parsedCpCost);
    }

    const shouldOverrideLore =
      trimmedShortDescription.length > 0 &&
      (trimmedShortDescription !==
        selectedCustomBaseItem.lore.shortDescription ||
        trimmedFullDescription !==
          (selectedCustomBaseItem.lore.fullText ?? ""));

    if (shouldOverrideLore) {
      overrides.lore = {
        shortDescription: trimmedShortDescription,
        fullText: trimmedFullDescription || undefined,
      };
    }

    if (selectedCustomBaseItem.weaponProperties) {
      const nextDamageDice = customDamageDiceInput.trim();
      const nextDamageType = customDamageTypeInput.trim();
      const nextPropertyIds = weaponPropertyCatalog
        .filter((entry) => customWeaponPropertyIds.includes(entry.id))
        .map((entry) => entry.id);
      const currentPropertyIds =
        selectedCustomBaseItem.weaponProperties.propertyIds;
      const nextRange = customWeaponRangeInput.trim();
      const hasPropertyChange =
        nextPropertyIds.length !== currentPropertyIds.length ||
        nextPropertyIds.some(
          (propertyId, index) => propertyId !== currentPropertyIds[index],
        );
      const shouldOverrideWeapon =
        nextDamageDice.length > 0 &&
        nextDamageType.length > 0 &&
        (nextDamageDice !==
          selectedCustomBaseItem.weaponProperties.damageDice ||
          nextDamageType !==
            selectedCustomBaseItem.weaponProperties.damageType ||
          nextRange !== selectedCustomBaseItem.weaponProperties.range ||
          hasPropertyChange);

      if (shouldOverrideWeapon) {
        overrides.weaponProperties = normalizeWeaponProperties({
          category: selectedCustomBaseItem.weaponProperties.category,
          damageDice: nextDamageDice,
          versatileDamageDice:
            selectedCustomBaseItem.weaponProperties.versatileDamageDice,
          damageType: nextDamageType,
          properties: nextPropertyIds,
          range: nextRange,
          ammoItemId: selectedCustomBaseItem.weaponProperties.ammoItemId,
        });
      }
    }

    if (selectedCustomBaseItem.armorProperties) {
      const normalizedStrengthRequirement =
        customArmorStrengthRequirementInput.trim() === ""
          ? undefined
          : Number.isFinite(parsedArmorStrengthRequirement) &&
              parsedArmorStrengthRequirement >= 0
            ? Math.floor(parsedArmorStrengthRequirement)
            : selectedCustomBaseItem.armorProperties.strengthRequirement;
      const shouldOverrideArmor =
        Number.isFinite(parsedArmorBaseAc) &&
        parsedArmorBaseAc > 0 &&
        (parsedArmorBaseAc !== selectedCustomBaseItem.armorProperties.baseAc ||
          normalizedStrengthRequirement !==
            selectedCustomBaseItem.armorProperties.strengthRequirement ||
          customArmorStealthDisadvantage !==
            selectedCustomBaseItem.armorProperties.stealthDisadvantage);

      if (shouldOverrideArmor) {
        overrides.armorProperties = {
          ...selectedCustomBaseItem.armorProperties,
          baseAc: Math.floor(parsedArmorBaseAc),
          strengthRequirement: normalizedStrengthRequirement,
          stealthDisadvantage: customArmorStealthDisadvantage,
        };
      }
    }

    onConfirmCustomFromBaseAdd({
      baseItemId: selectedCustomBaseItem.id,
      quantity: normalizedCustomFromBaseQuantity,
      customName: trimmedCustomName || undefined,
      overrides: Object.keys(overrides).length > 0 ? overrides : undefined,
    });

    resetCustomFromBaseForm();
  };

  const toggleCustomWeaponProperty = (propertyId: WeaponPropertyId) => {
    setCustomWeaponPropertyIds((current) =>
      current.includes(propertyId)
        ? current.filter((entry) => entry !== propertyId)
        : [...current, propertyId],
    );
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

  const getModalTitle = () => {
    if (step === "choose_flow") return "Add Equipment";
    if (selectedFlow === "preset") return "Standard Ledger";
    if (selectedFlow === "custom_from_base") return "Forge Modified Item";
    if (selectedFlow === "custom_generic") return "Create New Item";
    return "Add Item";
  };

  return (
    <div className="modal-overlay fadeIn">
      <div
        className="modal-parchment inventory-modal"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          {step === "flow_details" ? (
            <button
              className="icon-btn back-btn"
              onClick={onBack}
              aria-label="Go Back"
            >
              <ChevronLeft size={20} />
            </button>
          ) : (
            <div className="header-spacer" />
          )}
          <h2 className="manuscript-section-title">{getModalTitle()}</h2>
          
          <button
            className="icon-btn close-btn"
            onClick={handleClose}
            aria-label="Close add item modal"
          >
            <X size={20}/>
          </button>
        </div>

        <hr className="ornate-board-divider" />

        {step === "choose_flow" ? (
          <AddItemFlowSelector onSelectFlow={onSelectFlow} />
        ) : (
          <div className="modal-content-area">
            <p className="inventory-modal-copy">
              {selectedFlow ? FLOW_TITLE[selectedFlow] : "Flow"}
            </p>
            <p className="inventory-modal-copy inventory-modal-copy-muted">
              {selectedFlow
                ? FLOW_DESCRIPTION[selectedFlow]
                : "Select a flow to continue."}
            </p>

            {selectedFlow === "preset" && (
              <PresetItemFlow
                searchValue={presetSearch}
                selectedItemId={selectedPresetItemId}
                quantityInput={presetQuantityInput}
                filteredItems={filteredPresetItems}
                onSearchChange={setPresetSearch}
                onSelectedItemChange={setSelectedPresetItemId}
                onQuantityInputChange={setPresetQuantityInput}
                onSubmit={handlePresetAdd}
                submitDisabled={!selectedPresetItemId}
              />
            )}

            {selectedFlow === "custom_from_base" && (
              <CustomFromBaseFlow
                searchValue={customFromBaseSearch}
                selectedBaseItemId={selectedCustomBaseItemId}
                filteredBaseItems={filteredCustomBaseItems}
                selectedBaseItem={selectedCustomBaseItem}
                quantityInput={customFromBaseQuantityInput}
                customNameInput={customNameInput}
                customWeightInput={customWeightInput}
                customCpCostInput={customCpCostInput}
                customShortDescriptionInput={customShortDescriptionInput}
                customFullDescriptionInput={customFullDescriptionInput}
                customDamageDiceInput={customDamageDiceInput}
                customDamageTypeInput={customDamageTypeInput}
                customWeaponRangeInput={customWeaponRangeInput}
                customWeaponPropertyIds={customWeaponPropertyIds}
                customArmorBaseAcInput={customArmorBaseAcInput}
                customArmorStrengthRequirementInput={
                  customArmorStrengthRequirementInput
                }
                customArmorStealthDisadvantage={customArmorStealthDisadvantage}
                weaponPropertyCatalog={weaponPropertyCatalog}
                onSearchChange={setCustomFromBaseSearch}
                onSelectBaseItem={handleCustomBaseItemSelection}
                onQuantityChange={setCustomFromBaseQuantityInput}
                onCustomNameChange={setCustomNameInput}
                onCustomWeightChange={setCustomWeightInput}
                onCustomCpCostChange={setCustomCpCostInput}
                onCustomShortDescriptionChange={setCustomShortDescriptionInput}
                onCustomFullDescriptionChange={setCustomFullDescriptionInput}
                onCustomDamageDiceChange={setCustomDamageDiceInput}
                onCustomDamageTypeChange={setCustomDamageTypeInput}
                onCustomWeaponRangeChange={setCustomWeaponRangeInput}
                onToggleWeaponProperty={toggleCustomWeaponProperty}
                onCustomArmorBaseAcChange={setCustomArmorBaseAcInput}
                onCustomArmorStrengthRequirementChange={
                  setCustomArmorStrengthRequirementInput
                }
                onCustomArmorStealthDisadvantageChange={
                  setCustomArmorStealthDisadvantage
                }
                onSubmit={handleCustomFromBaseAdd}
                submitDisabled={!selectedCustomBaseItemId}
              />
            )}

            {selectedFlow === "custom_generic" && (
              <CustomGenericItemFlow
                nameInput={genericNameInput}
                shortDescriptionInput={genericShortDescriptionInput}
                fullDescriptionInput={genericFullDescriptionInput}
                weightInput={genericWeightInput}
                cpCostInput={genericCpCostInput}
                quantityInput={genericQuantityInput}
                onNameChange={setGenericNameInput}
                onShortDescriptionChange={setGenericShortDescriptionInput}
                onFullDescriptionChange={setGenericFullDescriptionInput}
                onWeightChange={setGenericWeightInput}
                onCpCostChange={setGenericCpCostInput}
                onQuantityChange={setGenericQuantityInput}
                onSubmit={handleCustomGenericAdd}
                submitDisabled={
                  genericNameInput.trim().length === 0 ||
                  genericShortDescriptionInput.trim().length === 0
                }
              />
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
