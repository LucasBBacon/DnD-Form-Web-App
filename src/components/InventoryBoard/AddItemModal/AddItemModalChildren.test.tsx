import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddItemFlowSelector } from "./AddItemFlowSelector/AddItemFlowSelector";
import { PresetItemFlow } from "./PresetItemFlow/PresetItemFlow";
import { CustomGenericItemFlow } from "./CustomGenericItemFlow/CustomGenericItemFlow";
import { WeaponPropertiesEditor } from "./WeaponPropertiesEditor/WeaponPropertiesEditor";
import { ArmorPropertiesEditor } from "./ArmorPropertiesEditor/ArmorPropertiesEditor";
import { CustomFromBaseFlow } from "./CustomFromBaseFlow/CustomFromBaseFlow";
import {
  ADD_ITEM_ARMOR_EDITOR_SCENARIOS,
  ADD_ITEM_CUSTOM_FROM_BASE_SCENARIOS,
  ADD_ITEM_GENERIC_FLOW_SCENARIOS,
  ADD_ITEM_PRESET_FLOW_SCENARIOS,
  ADD_ITEM_PRESET_OPTIONS,
  ADD_ITEM_WEAPON_EDITOR_SCENARIOS,
  WEAPON_PROPERTY_OPTIONS,
} from "./AddItemModal.fixtures";

describe("AddItemModal extracted child components", () => {
  it("AddItemFlowSelector emits selected flow", async () => {
    const user = userEvent.setup();
    const onSelectFlow = vi.fn();

    render(<AddItemFlowSelector onSelectFlow={onSelectFlow} />);

    await user.click(screen.getByRole("button", { name: "Custom From Base" }));

    expect(onSelectFlow).toHaveBeenCalledWith("custom_from_base");
  });

  it("PresetItemFlow updates search and submits", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    const onSubmit = vi.fn();

    render(
      <PresetItemFlow
        {...ADD_ITEM_PRESET_FLOW_SCENARIOS.withSelection}
        onSearchChange={onSearchChange}
        onSelectedItemChange={vi.fn()}
        onQuantityInputChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText("Search Preset Items"), "s");
    await user.click(screen.getByRole("button", { name: "Add Selected Item" }));

    expect(onSearchChange).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("CustomGenericItemFlow uses disabled submit state", () => {
    render(
      <CustomGenericItemFlow
        {...ADD_ITEM_GENERIC_FLOW_SCENARIOS.emptyForm}
        onNameChange={vi.fn()}
        onShortDescriptionChange={vi.fn()}
        onFullDescriptionChange={vi.fn()}
        onWeightChange={vi.fn()}
        onCpCostChange={vi.fn()}
        onQuantityChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Add Fully Custom Item" }),
    ).toBeDisabled();
  });

  it("WeaponPropertiesEditor toggles weapon properties", async () => {
    const user = userEvent.setup();
    const onToggleProperty = vi.fn();

    render(
      <WeaponPropertiesEditor
        {...ADD_ITEM_WEAPON_EDITOR_SCENARIOS.meleeBaseline}
        weaponPropertyCatalog={WEAPON_PROPERTY_OPTIONS}
        onDamageDiceChange={vi.fn()}
        onDamageTypeChange={vi.fn()}
        onRangeChange={vi.fn()}
        onToggleProperty={onToggleProperty}
      />,
    );

    await user.click(screen.getByLabelText("Finesse"));

    expect(onToggleProperty).toHaveBeenCalledWith("property_finesse");
  });

  it("ArmorPropertiesEditor toggles stealth disadvantage", async () => {
    const user = userEvent.setup();
    const onStealthDisadvantageChange = vi.fn();

    render(
      <ArmorPropertiesEditor
        {...ADD_ITEM_ARMOR_EDITOR_SCENARIOS.heavyArmor}
        onBaseAcChange={vi.fn()}
        onStrengthRequirementChange={vi.fn()}
        onStealthDisadvantageChange={onStealthDisadvantageChange}
      />,
    );

    await user.click(screen.getByLabelText("Stealth Disadvantage"));

    expect(onStealthDisadvantageChange).toHaveBeenCalledWith(false);
  });

  it("CustomFromBaseFlow renders weapon editor fields for weapon base", () => {
    render(
      <CustomFromBaseFlow
        {...ADD_ITEM_CUSTOM_FROM_BASE_SCENARIOS.weaponBaseSelected}
        weaponPropertyCatalog={WEAPON_PROPERTY_OPTIONS}
        onSearchChange={vi.fn()}
        onSelectBaseItem={vi.fn()}
        onQuantityChange={vi.fn()}
        onCustomNameChange={vi.fn()}
        onCustomWeightChange={vi.fn()}
        onCustomCpCostChange={vi.fn()}
        onCustomShortDescriptionChange={vi.fn()}
        onCustomFullDescriptionChange={vi.fn()}
        onCustomDamageDiceChange={vi.fn()}
        onCustomDamageTypeChange={vi.fn()}
        onCustomWeaponRangeChange={vi.fn()}
        onToggleWeaponProperty={vi.fn()}
        onCustomArmorBaseAcChange={vi.fn()}
        onCustomArmorStrengthRequirementChange={vi.fn()}
        onCustomArmorStealthDisadvantageChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Weapon Damage Dice")).toBeInTheDocument();
    expect(screen.queryByLabelText("Armor Base AC")).not.toBeInTheDocument();
  });

  it("CustomFromBaseFlow renders armor editor fields for armor base", () => {
    render(
      <CustomFromBaseFlow
        {...ADD_ITEM_CUSTOM_FROM_BASE_SCENARIOS.armorBaseSelected}
        weaponPropertyCatalog={WEAPON_PROPERTY_OPTIONS}
        onSearchChange={vi.fn()}
        onSelectBaseItem={vi.fn()}
        onQuantityChange={vi.fn()}
        onCustomNameChange={vi.fn()}
        onCustomWeightChange={vi.fn()}
        onCustomCpCostChange={vi.fn()}
        onCustomShortDescriptionChange={vi.fn()}
        onCustomFullDescriptionChange={vi.fn()}
        onCustomDamageDiceChange={vi.fn()}
        onCustomDamageTypeChange={vi.fn()}
        onCustomWeaponRangeChange={vi.fn()}
        onToggleWeaponProperty={vi.fn()}
        onCustomArmorBaseAcChange={vi.fn()}
        onCustomArmorStrengthRequirementChange={vi.fn()}
        onCustomArmorStealthDisadvantageChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Armor Base AC")).toBeInTheDocument();
    expect(screen.queryByLabelText("Weapon Damage Dice")).not.toBeInTheDocument();
  });

  it("CustomFromBaseFlow emits base item selection change", async () => {
    const user = userEvent.setup();
    const onSelectBaseItem = vi.fn();

    render(
      <CustomFromBaseFlow
        {...ADD_ITEM_CUSTOM_FROM_BASE_SCENARIOS.noBaseSelected}
        filteredBaseItems={ADD_ITEM_PRESET_OPTIONS}
        weaponPropertyCatalog={WEAPON_PROPERTY_OPTIONS}
        onSearchChange={vi.fn()}
        onSelectBaseItem={onSelectBaseItem}
        onQuantityChange={vi.fn()}
        onCustomNameChange={vi.fn()}
        onCustomWeightChange={vi.fn()}
        onCustomCpCostChange={vi.fn()}
        onCustomShortDescriptionChange={vi.fn()}
        onCustomFullDescriptionChange={vi.fn()}
        onCustomDamageDiceChange={vi.fn()}
        onCustomDamageTypeChange={vi.fn()}
        onCustomWeaponRangeChange={vi.fn()}
        onToggleWeaponProperty={vi.fn()}
        onCustomArmorBaseAcChange={vi.fn()}
        onCustomArmorStrengthRequirementChange={vi.fn()}
        onCustomArmorStealthDisadvantageChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    await user.selectOptions(screen.getByLabelText("Base Item"), "item_longsword");

    expect(onSelectBaseItem).toHaveBeenCalledWith("item_longsword");
  });
});
