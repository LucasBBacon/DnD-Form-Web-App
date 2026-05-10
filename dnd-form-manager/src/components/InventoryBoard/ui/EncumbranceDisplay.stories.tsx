import type { Meta, StoryObj } from "@storybook/react-vite";
import { EncumbranceDisplay } from "./EncumbranceDisplay";

const meta: Meta<typeof EncumbranceDisplay> = {
  title: "InventoryBoard/EncumbranceDisplay",
  component: EncumbranceDisplay,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof EncumbranceDisplay>;

export const Unencumbered: Story = {
  args: { totalWeight: 45.5, capacity: 150, isEncumbered: false },
};

export const Encumbered: Story = {
  args: { totalWeight: 162.0, capacity: 150, isEncumbered: true },
};

export const Empty: Story = {
  args: { totalWeight: 0, capacity: 150, isEncumbered: false },
};
