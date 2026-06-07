import type { Meta, StoryObj } from "@storybook/react-vite";
import { InventoryBoardView } from "./InventoryBoardView";
import { INVENTORY_BOARD_FIXTURES } from "./InventoryBoard.fixtures";

const meta: Meta<typeof InventoryBoardView> = {
  title: "Boards/InventoryBoard",
  component: InventoryBoardView,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof InventoryBoardView>;

const baseCallbacks = {
  onToggleWeaponEquip: () => {},
  onToggleArmorEquip: () => {},
  onToggleAttunement: () => {},
  onDropInstance: () => {},
  onStackIncrement: () => {},
  onStackDecrement: () => {},
  onOpenAddItemModal: () => {},
};

export const Empty: Story = {
  args: {
    ...INVENTORY_BOARD_FIXTURES.empty,
    ...baseCallbacks,
  },
};

export const StandardLoadout: Story = {
  args: {
    ...INVENTORY_BOARD_FIXTURES.standardLoadout,
    ...baseCallbacks,
  },
};

export const FullyAttuned: Story = {
  args: {
    ...INVENTORY_BOARD_FIXTURES.fullyAttuned,
    ...baseCallbacks,
  },
};

export const Encumbered: Story = {
  args: {
    ...INVENTORY_BOARD_FIXTURES.encumbered,
    ...baseCallbacks,
  },
};

export const MissingReferences: Story = {
  args: {
    ...INVENTORY_BOARD_FIXTURES.missingReferences,
    ...baseCallbacks,
  },
};

export const Playground: Story = {
  args: {
    ...INVENTORY_BOARD_FIXTURES.playground,
    ...baseCallbacks,
  },
};
