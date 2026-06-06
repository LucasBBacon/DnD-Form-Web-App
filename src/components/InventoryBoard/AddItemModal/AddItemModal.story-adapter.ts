import type { ComponentProps } from "react";
import { fn } from "storybook/test";
import type { AddItemModalProps } from "./AddItemModal";
import {
  ADD_ITEM_PRESET_OPTIONS,
  WEAPON_PROPERTY_OPTIONS,
  type AddItemModalScenario,
  type ArmorPropertiesEditorScenario,
  type CustomFromBaseFlowScenario,
  type CustomGenericItemFlowScenario,
  type PresetItemFlowScenario,
  type WeaponPropertiesEditorScenario,
} from "./AddItemModal.fixtures";
import { ArmorPropertiesEditor } from "./ArmorPropertiesEditor";
import { CustomFromBaseFlow } from "./CustomFromBaseFlow";
import { CustomGenericItemFlow } from "./CustomGenericItemFlow";
import { PresetItemFlow } from "./PresetItemFlow";
import { WeaponPropertiesEditor } from "./WeaponPropertiesEditor";

export const createAddItemFlowSelectorCallbacks = () => ({
  onSelectFlow: fn(),
});

export const createPresetItemFlowArgs = (
  scenario: PresetItemFlowScenario,
): ComponentProps<typeof PresetItemFlow> => ({
  ...scenario,
  onSearchChange: fn(),
  onSelectedItemChange: fn(),
  onQuantityInputChange: fn(),
  onSubmit: fn(),
});

export const createCustomGenericItemFlowArgs = (
  scenario: CustomGenericItemFlowScenario,
): ComponentProps<typeof CustomGenericItemFlow> => ({
  ...scenario,
  onNameChange: fn(),
  onShortDescriptionChange: fn(),
  onFullDescriptionChange: fn(),
  onWeightChange: fn(),
  onCpCostChange: fn(),
  onQuantityChange: fn(),
  onSubmit: fn(),
});

export const createWeaponPropertiesEditorArgs = (
  scenario: WeaponPropertiesEditorScenario,
): ComponentProps<typeof WeaponPropertiesEditor> => ({
  ...scenario,
  weaponPropertyCatalog: WEAPON_PROPERTY_OPTIONS,
  onDamageDiceChange: fn(),
  onDamageTypeChange: fn(),
  onRangeChange: fn(),
  onToggleProperty: fn(),
});

export const createArmorPropertiesEditorArgs = (
  scenario: ArmorPropertiesEditorScenario,
): ComponentProps<typeof ArmorPropertiesEditor> => ({
  ...scenario,
  onBaseAcChange: fn(),
  onStrengthRequirementChange: fn(),
  onStealthDisadvantageChange: fn(),
});

export const createCustomFromBaseFlowArgs = (
  scenario: CustomFromBaseFlowScenario,
): ComponentProps<typeof CustomFromBaseFlow> => ({
  ...scenario,
  weaponPropertyCatalog: WEAPON_PROPERTY_OPTIONS,
  onSearchChange: fn(),
  onSelectBaseItem: fn(),
  onQuantityChange: fn(),
  onCustomNameChange: fn(),
  onCustomWeightChange: fn(),
  onCustomCpCostChange: fn(),
  onCustomShortDescriptionChange: fn(),
  onCustomFullDescriptionChange: fn(),
  onCustomDamageDiceChange: fn(),
  onCustomDamageTypeChange: fn(),
  onCustomWeaponRangeChange: fn(),
  onToggleWeaponProperty: fn(),
  onCustomArmorBaseAcChange: fn(),
  onCustomArmorStrengthRequirementChange: fn(),
  onCustomArmorStealthDisadvantageChange: fn(),
  onSubmit: fn(),
});

export const createAddItemModalArgs = (
  scenario: AddItemModalScenario,
): AddItemModalProps => ({
  isOpen: scenario.isOpen,
  step: scenario.step,
  selectedFlow: scenario.selectedFlow,
  presetItems: scenario.presetItems,
  onClose: fn(),
  onBack: fn(),
  onSelectFlow: fn(),
  onConfirmPresetAdd: fn(),
  onConfirmCustomFromBaseAdd: fn(),
  onConfirmCustomGenericAdd: fn(),
});

export const createInventoryPresetItemsSubset = (
  searchText: string,
): AddItemModalProps["presetItems"] => {
  const normalizedSearch = searchText.trim().toLowerCase();
  if (!normalizedSearch) {
    return ADD_ITEM_PRESET_OPTIONS;
  }

  return ADD_ITEM_PRESET_OPTIONS.filter((item) =>
    item.name.toLowerCase().includes(normalizedSearch),
  );
};
