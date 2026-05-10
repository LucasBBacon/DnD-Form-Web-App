import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatBadge } from "./StatBadge";

const meta: Meta<typeof StatBadge> = {
  title: "VitalsDashboard/StatBadge",
  component: StatBadge,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof StatBadge>;

export const ArmorClass: Story = {
  args: {
    label: "ARMOR CLASS",
    value: 16,
    className: "shield",
    title: "Armor Class",
    warning: false,
  },
};

export const ArmorClassWithWarning: Story = {
  args: {
    label: "ARMOR CLASS",
    value: 14,
    className: "shield",
    title: "Stealth Disadvantage!",
    warning: true,
  },
};

export const Initiative: Story = {
  args: {
    label: "INITIATIVE",
    value: "+3",
  },
};

export const InitiativeNegative: Story = {
  args: {
    label: "INITIATIVE",
    value: "-1",
  },
};

export const Speed: Story = {
  args: {
    label: "SPEED",
    value: 30,
  },
};
