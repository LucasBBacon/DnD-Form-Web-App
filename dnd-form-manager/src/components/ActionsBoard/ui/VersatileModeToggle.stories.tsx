import type { Meta, StoryObj } from "@storybook/react-vite";
import { VersatileModeToggle } from "./VersatileModeToggle";
import { fn } from "storybook/test";

const meta: Meta<typeof VersatileModeToggle> = {
  title: "ActionsBoard/VersatileModeToggle",
  component: VersatileModeToggle,
  tags: ["autodocs"],
  args: { onChange: fn() },
};
export default meta;

type Story = StoryObj<typeof VersatileModeToggle>;

export const OneHandedSelected: Story = {
  args: {
    entryId: "longsword-1",
    baseDamageDice: "1d8",
    versatileDamageDice: "1d10",
    value: "one-handed",
  },
};

export const TwoHandedSelected: Story = {
  args: {
    entryId: "longsword-1",
    baseDamageDice: "1d8",
    versatileDamageDice: "1d10",
    value: "two-handed",
  },
};
