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

    expect(screen.getByText("Standard Equipment")).toBeInTheDocument();
    expect(screen.getByText("Modify Base Item")).toBeInTheDocument();
    expect(screen.getByText("Custom Item")).toBeInTheDocument();
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

    await user.type(screen.getByPlaceholderText(/search the ledger/i), "long");
    await user.click(screen.getByRole("button", { name: /longsword/i }));
    await user.clear(screen.getByLabelText("Qty:"));
    await user.type(screen.getByLabelText("Qty:"), "3");

    await user.click(screen.getByRole("button", { name: /add to inventory/i }));

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
      screen.getByRole("button", { name: /add to inventory/i }),
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

    await user.click(screen.getByRole("button", { name: /longsword/i }));
    await user.type(screen.getByPlaceholderText("Custom Longsword"), "Longsword +1");
    await user.clear(screen.getByPlaceholderText("3 lb"));
    await user.type(screen.getByPlaceholderText("3 lb"), "4");
    await user.clear(screen.getByPlaceholderText("1500 cp"));
    await user.type(screen.getByPlaceholderText("1500 cp"), "2500");
    await user.clear(screen.getByPlaceholderText("Override short description..."));
    await user.type(
      screen.getByPlaceholderText("Override short description..."),
      "A reforged knightly blade.",
    );
    await user.clear(screen.getByPlaceholderText("Override detailed description..."));
    await user.type(
      screen.getByPlaceholderText("Override detailed description..."),
      "Rebalanced and etched with a personal crest.",
    );
    await user.clear(screen.getByPlaceholderText("e.g., 1d8"));
    await user.type(screen.getByPlaceholderText("e.g., 1d8"), "1d10");
    await user.clear(screen.getByPlaceholderText("e.g., 20/60 or 5ft"));
    await user.type(screen.getByPlaceholderText("e.g., 20/60 or 5ft"), "10 ft");
    await user.click(screen.getByRole("button", { name: "Finesse" }));

    await user.click(screen.getByRole("button", { name: /forge & add/i }));

    expect(onConfirmCustomFromBaseAdd).toHaveBeenCalledWith(
      {
        baseItemId: "item_longsword",
        quantity: 1,
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

    await user.click(screen.getByRole("button", { name: /chain mail/i }));
    await user.clear(screen.getByPlaceholderText("e.g., 13"));
    await user.type(screen.getByPlaceholderText("e.g., 13"), "15");
    await user.click(screen.getByRole("checkbox"));

    await user.click(screen.getByRole("button", { name: /forge & add/i }));

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
    await user.type(screen.getByLabelText("Brief Description"), "A grim keepsake from an ancient crypt.");
    await user.type(
      screen.getByLabelText("Full Description (Optional)"),
      "Etched with runes and wrapped in old bronze wire.",
    );
    await user.type(screen.getByLabelText("Weight (lbs)"), "2.5");
    await user.type(screen.getByLabelText("Value (in CP)"), "125");
    await user.clear(screen.getByLabelText("Qty:"));
    await user.type(screen.getByLabelText("Qty:"), "2");

    await user.click(screen.getByRole("button", { name: /create & add item/i }));

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
