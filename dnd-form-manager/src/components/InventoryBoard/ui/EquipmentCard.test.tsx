import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { EquipmentCard } from "./EquipmentCard";
import type { InventoryBoardItemData } from "../InventoryBoardView";

const weaponItem: InventoryBoardItemData = {
  name: "Longsword",
  type: "weapon",
  weight: 3,
  cpCost: 1500,
  lore: {
    shortDescription: "A versatile martial weapon.",
  },
};

const armorItem: InventoryBoardItemData = {
  name: "Chain Shirt",
  type: "armor",
  weight: 20,
  cpCost: 5000,
  lore: {
    shortDescription: "Interlocking rings over fabric.",
  },
  armorProperties: {
    armorType: "medium",
  },
};

const magicItem: InventoryBoardItemData = {
  name: "Ring of Warmth",
  type: "wondrous_item",
  weight: 0,
  cpCost: 10000,
  lore: {
    shortDescription: "Protects against cold climates.",
  },
  magicItemProperties: {
    requiresAttunement: true,
  },
};

const createProps = (
  overrides: Partial<React.ComponentProps<typeof EquipmentCard>> = {},
): React.ComponentProps<typeof EquipmentCard> => ({
  instanceId: "inst-weapon-1",
  isEquipped: false,
  itemData: weaponItem,
  requiresAttunement: false,
  isAttuned: false,
  isWeapon: true,
  isArmor: false,
  attunedInstanceIds: [],
  onToggleAttunement: vi.fn(),
  onToggleWeaponEquip: vi.fn(),
  onToggleArmorEquip: vi.fn(),
  onDropInstance: vi.fn(),
  formatItemCost: (cpCost: number) => `${cpCost} CP`,
  ...overrides,
});

describe("EquipmentCard", () => {
  it("renders name and formatted metadata", () => {
    render(<EquipmentCard {...createProps()} />);

    expect(screen.getByText("Longsword")).toBeInTheDocument();
    expect(screen.getByText(/WEAPON/i)).toBeInTheDocument();
    expect(screen.getByText(/3 lbs/i)).toBeInTheDocument();
    expect(screen.getByText(/1500 CP/i)).toBeInTheDocument();
  });

  it("shows attunement button when required", () => {
    render(
      <EquipmentCard
        {...createProps({
          itemData: magicItem,
          isWeapon: false,
          requiresAttunement: true,
        })}
      />,
    );

    expect(screen.getByRole("button", { name: "Attune" })).toBeInTheDocument();
  });

  it("disables attune button when attunement slots are full", () => {
    render(
      <EquipmentCard
        {...createProps({
          itemData: magicItem,
          isWeapon: false,
          requiresAttunement: true,
          attunedInstanceIds: ["a", "b", "c"],
        })}
      />,
    );

    expect(screen.getByRole("button", { name: "Attune" })).toBeDisabled();
  });

  it("calls weapon equip toggle with instance and current equip state", async () => {
    const user = userEvent.setup();
    const props = createProps({ isEquipped: true });

    render(<EquipmentCard {...props} />);

    await user.click(screen.getByRole("button", { name: "EQUIPPED" }));

    expect(props.onToggleWeaponEquip).toHaveBeenCalledWith("inst-weapon-1", true);
  });

  it("calls armor equip toggle with armor type", async () => {
    const user = userEvent.setup();
    const props = createProps({
      instanceId: "inst-armor-1",
      itemData: armorItem,
      isWeapon: false,
      isArmor: true,
    });

    render(<EquipmentCard {...props} />);

    await user.click(screen.getByRole("button", { name: "Equip" }));

    expect(props.onToggleArmorEquip).toHaveBeenCalledWith(
      "inst-armor-1",
      false,
      "medium",
    );
  });

  it("calls attunement toggle and drop callbacks", async () => {
    const user = userEvent.setup();
    const props = createProps({
      instanceId: "inst-magic-1",
      itemData: magicItem,
      isWeapon: false,
      requiresAttunement: true,
      isAttuned: true,
    });

    render(<EquipmentCard {...props} />);

    await user.click(screen.getByRole("button", { name: "ATTUNED" }));
    await user.click(screen.getByRole("button", { name: "Drop" }));

    expect(props.onToggleAttunement).toHaveBeenCalledWith("inst-magic-1", true);
    expect(props.onDropInstance).toHaveBeenCalledWith("inst-magic-1");
  });

  it("applies equipped class when currently equipped", () => {
    const { container } = render(
      <EquipmentCard
        {...createProps({
          isEquipped: true,
        })}
      />,
    );

    const row = container.querySelector(".item-row");
    expect(row).toHaveClass("equipped");
  });
});