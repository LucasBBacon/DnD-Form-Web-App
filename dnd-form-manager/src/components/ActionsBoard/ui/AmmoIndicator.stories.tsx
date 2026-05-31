import type { Meta, StoryObj } from "@storybook/react-vite";
import { AmmoIndicator } from "./AmmoIndicator";

const meta: Meta<typeof AmmoIndicator> = {
  title: "ActionsBoard/AmmoIndicator",
  component: AmmoIndicator,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof AmmoIndicator>;

export const WithAmmo: Story = {
  args: {
    ammo: { id: "ammo:arrows", name: "Arrows", count: 20 },
  },
};

export const LowAmmo: Story = {
  args: {
    ammo: { id: "ammo:arrows", name: "Arrows", count: 3 },
  },
};

export const NoAmmo: Story = {
  args: {
    ammo: { id: "ammo:arrows", name: "Arrows", count: 0 },
  },
};

export const UnknownAmmoName: Story = {
  args: {
    ammo: { id: "ammo:unknown", name: null, count: 15 },
  },
};

export const NullCount: Story = {
  args: {
    ammo: { id: "ammo:bolts", name: "Crossbow Bolts", count: null },
  },
};
