import type { Meta, StoryObj } from "@storybook/react-vite";
import { InventoryBoardView } from "./InventoryBoardView";
import { INVENTORY_BOARD_FIXTURES } from "./InventoryBoard.fixtures";
import { WealthTracker } from "./ui/WealthTracker";

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
};

export const Empty: Story = {
  args: {
    ...INVENTORY_BOARD_FIXTURES.empty,
    wealthView: <WealthTracker />,
    ...baseCallbacks,
  },
};

export const StandardLoadout: Story = {
  args: {
    ...INVENTORY_BOARD_FIXTURES.standardLoadout,
    wealthView: <WealthTracker />,
    ...baseCallbacks,
  },
};

export const FullyAttuned: Story = {
  args: {
    ...INVENTORY_BOARD_FIXTURES.fullyAttuned,
    wealthView: <WealthTracker />,
    ...baseCallbacks,
  },
};

export const Encumbered: Story = {
  args: {
    ...INVENTORY_BOARD_FIXTURES.encumbered,
    wealthView: <WealthTracker />,
    ...baseCallbacks,
  },
};

export const MissingReferences: Story = {
  args: {
    ...INVENTORY_BOARD_FIXTURES.missingReferences,
    wealthView: <WealthTracker />,
    ...baseCallbacks,
  },
};

export const Playground: Story = {
  args: {
    ...INVENTORY_BOARD_FIXTURES.playground,
    wealthView: <WealthTracker />,
    ...baseCallbacks,
  },
};
