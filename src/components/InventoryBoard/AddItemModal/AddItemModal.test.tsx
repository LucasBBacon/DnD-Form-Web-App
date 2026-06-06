import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddItemModal, type AddItemPresetOption } from "./AddItemModal";

const PRESET_ITEMS: AddItemPresetOption[] = [
  {
    id: "item_chain_mail",
    name: "Chain Mail",
    type: "armor",
    weight: 55,
    cpCost: 7500,
    lore: {
      shortDescription: "Heavy armor forged from interlocking steel rings.",
      fullText: "Favored by disciplined soldiers despite its bulk.",
    },
    armorProperties: {
      acApplication: "set",
      armorType: "heavy",
      baseAc: 16,
      dexModifier: { mode: "none" },
      stealthDisadvantage: true,
      strengthRequirement: 13,
    },
  },
  {
    id: "item_longsword",
    name: "Longsword",
    type: "weapon",
    weight: 3,
    cpCost: 1500,
    lore: {
      shortDescription: "A versatile martial weapon.",
      fullText: "Favored by knights and mercenaries alike.",
    },
    weaponProperties: {
      category: "martial_melee",
      damageDice: "1d8",
      versatileDamageDice: "1d10",
      damageType: "slashing",
      properties: [],
      propertyIds: [],
      range: "5 ft",
      rules: {
        attackAbility: "str",
        isRangedWeapon: false,
        meleeReachFeet: 5,
        requiresAmmunition: false,
        loading: false,
        light: false,
        heavy: false,
        twoHanded: false,
        special: false,
        finesse: false,
        versatile: true,
      },
    },
  },
  {
    id: "item_rations",
    name: "Rations",
    type: "gear",
    weight: 2,
    cpCost: 50,
    lore: { shortDescription: "Trail food." },
  },
];

describe("AddItemModal", () => {
  it("shows flow selection step", () => {
    render(
      <AddItemModal
        isOpen={true}
        step="choose_flow"
        selectedFlow={null}
        presetItems={PRESET_ITEMS}
        onClose={vi.fn()}
        onBack={vi.fn()}
        onSelectFlow={vi.fn()}
        onConfirmPresetAdd={vi.fn()}
        onConfirmCustomFromBaseAdd={vi.fn()}
        onConfirmCustomGenericAdd={vi.fn()}
      />,
    );

    expect(screen.getByText("Add Preset Item")).toBeInTheDocument();
    expect(screen.getByText("Custom From Base")).toBeInTheDocument();
    expect(screen.getByText("Fully Custom Item")).toBeInTheDocument();
  });

  it("submits preset add with selected item and quantity", async () => {
    const user = userEvent.setup();
    const onConfirmPresetAdd = vi.fn();

    render(
      <AddItemModal
        isOpen={true}
        step="flow_details"
        selectedFlow="preset"
        presetItems={PRESET_ITEMS}
        onClose={vi.fn()}
        onBack={vi.fn()}
        onSelectFlow={vi.fn()}
        onConfirmPresetAdd={onConfirmPresetAdd}
        onConfirmCustomFromBaseAdd={vi.fn()}
        onConfirmCustomGenericAdd={vi.fn()}
      />,
    );

    await user.type(
      screen.getByLabelText("Search Preset Items"),
      "long",
    );
    await user.selectOptions(
      screen.getByLabelText("Select Item"),
      "item_longsword",
    );
    await user.clear(screen.getByLabelText("Quantity"));
    await user.type(screen.getByLabelText("Quantity"), "3");

    await user.click(screen.getByRole("button", { name: "Add Selected Item" }));

    expect(onConfirmPresetAdd).toHaveBeenCalledWith("item_longsword", 3);
  });

  it("disables preset submit until an item is selected", () => {
    render(
      <AddItemModal
        isOpen={true}
        step="flow_details"
        selectedFlow="preset"
        presetItems={PRESET_ITEMS}
        onClose={vi.fn()}
        onBack={vi.fn()}
        onSelectFlow={vi.fn()}
        onConfirmPresetAdd={vi.fn()}
        onConfirmCustomFromBaseAdd={vi.fn()}
        onConfirmCustomGenericAdd={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Add Selected Item" }),
    ).toBeDisabled();
  });

  it("submits custom-from-base add with overrides", async () => {
    const user = userEvent.setup();
    const onConfirmCustomFromBaseAdd = vi.fn();

    render(
      <AddItemModal
        isOpen={true}
        step="flow_details"
        selectedFlow="custom_from_base"
        presetItems={PRESET_ITEMS}
        onClose={vi.fn()}
        onBack={vi.fn()}
        onSelectFlow={vi.fn()}
        onConfirmPresetAdd={vi.fn()}
        onConfirmCustomFromBaseAdd={onConfirmCustomFromBaseAdd}
        onConfirmCustomGenericAdd={vi.fn()}
      />,
    );

    await user.selectOptions(
      screen.getByLabelText("Base Item"),
      "item_longsword",
    );
    await user.type(screen.getByLabelText("Custom Name (Optional)"), "Longsword +1");
    await user.clear(screen.getByLabelText("Quantity"));
    await user.type(screen.getByLabelText("Quantity"), "2");
    await user.clear(screen.getByLabelText("Weight Override (lb)"));
    await user.type(screen.getByLabelText("Weight Override (lb)"), "4");
    await user.clear(screen.getByLabelText("Custom Value (cp)"));
    await user.type(screen.getByLabelText("Custom Value (cp)"), "2500");
    await user.clear(screen.getByLabelText("Custom Short Description"));
    await user.type(
      screen.getByLabelText("Custom Short Description"),
      "A reforged knightly blade.",
    );
    await user.clear(screen.getByLabelText("Custom Full Description"));
    await user.type(
      screen.getByLabelText("Custom Full Description"),
      "Rebalanced and etched with a personal crest.",
    );
    await user.clear(screen.getByLabelText("Weapon Damage Dice"));
    await user.type(screen.getByLabelText("Weapon Damage Dice"), "1d10");
    await user.clear(screen.getByLabelText("Weapon Range"));
    await user.type(screen.getByLabelText("Weapon Range"), "10 ft");
    await user.click(screen.getByLabelText("Finesse"));

    await user.click(screen.getByRole("button", { name: "Add Custom Item" }));

    expect(onConfirmCustomFromBaseAdd).toHaveBeenCalledWith(
      {
        baseItemId: "item_longsword",
        quantity: 2,
        customName: "Longsword +1",
        overrides: expect.objectContaining({
          weight: 4,
          cpCost: 2500,
          lore: {
            shortDescription: "A reforged knightly blade.",
            fullText: "Rebalanced and etched with a personal crest.",
          },
          weaponProperties: expect.objectContaining({
            damageDice: "1d10",
            range: "10 ft",
            propertyIds: expect.arrayContaining(["property_finesse"]),
          }),
        }),
      },
    );
  });

  it("submits armor custom-from-base overrides for strength and stealth", async () => {
    const user = userEvent.setup();
    const onConfirmCustomFromBaseAdd = vi.fn();

    render(
      <AddItemModal
        isOpen={true}
        step="flow_details"
        selectedFlow="custom_from_base"
        presetItems={PRESET_ITEMS}
        onClose={vi.fn()}
        onBack={vi.fn()}
        onSelectFlow={vi.fn()}
        onConfirmPresetAdd={vi.fn()}
        onConfirmCustomFromBaseAdd={onConfirmCustomFromBaseAdd}
        onConfirmCustomGenericAdd={vi.fn()}
      />,
    );

    await user.selectOptions(
      screen.getByLabelText("Base Item"),
      "item_chain_mail",
    );
    await user.clear(screen.getByLabelText("Strength Requirement"));
    await user.type(screen.getByLabelText("Strength Requirement"), "15");
    await user.click(screen.getByLabelText("Stealth Disadvantage"));

    await user.click(screen.getByRole("button", { name: "Add Custom Item" }));

    expect(onConfirmCustomFromBaseAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        baseItemId: "item_chain_mail",
        overrides: expect.objectContaining({
          armorProperties: expect.objectContaining({
            strengthRequirement: 15,
            stealthDisadvantage: false,
          }),
        }),
      }),
    );
  });

  it("submits fully custom generic item", async () => {
    const user = userEvent.setup();
    const onConfirmCustomGenericAdd = vi.fn();

    render(
      <AddItemModal
        isOpen={true}
        step="flow_details"
        selectedFlow="custom_generic"
        presetItems={PRESET_ITEMS}
        onClose={vi.fn()}
        onBack={vi.fn()}
        onSelectFlow={vi.fn()}
        onConfirmPresetAdd={vi.fn()}
        onConfirmCustomFromBaseAdd={vi.fn()}
        onConfirmCustomGenericAdd={onConfirmCustomGenericAdd}
      />,
    );

    await user.type(screen.getByLabelText("Item Name"), "Trophy Skull");
    await user.type(
      screen.getByLabelText("Short Description"),
      "A grim keepsake from an ancient crypt.",
    );
    await user.type(
      screen.getByLabelText("Full Description (Optional)"),
      "Etched with runes and wrapped in old bronze wire.",
    );
    await user.type(screen.getByLabelText("Weight (lb)"), "2.5");
    await user.type(screen.getByLabelText("Value (cp)"), "125");
    await user.clear(screen.getByLabelText("Quantity"));
    await user.type(screen.getByLabelText("Quantity"), "2");

    await user.click(screen.getByRole("button", { name: "Add Fully Custom Item" }));

    expect(onConfirmCustomGenericAdd).toHaveBeenCalledWith({
      name: "Trophy Skull",
      shortDescription: "A grim keepsake from an ancient crypt.",
      fullDescription: "Etched with runes and wrapped in old bronze wire.",
      weight: 2.5,
      cpCost: 125,
      quantity: 2,
    });
  });
});
