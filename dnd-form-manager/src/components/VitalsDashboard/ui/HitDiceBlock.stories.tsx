import type { Meta, StoryObj } from "@storybook/react-vite";
import { HitDiceBlock } from "./HitDiceBlock";
import { fn } from "@storybook/test";

const meta: Meta<typeof HitDiceBlock> = {
  title: "VitalsDashboard/HitDiceBlock",
  component: HitDiceBlock,
  tags: ["autodocs"],
  args: { onShortRest: fn(), onLongRest: fn() },
};
export default meta;

type Story = StoryObj<typeof HitDiceBlock>;

export const Full: Story = {
  args: { available: 5, total: 5 },
};

export const Partial: Story = {
  args: { available: 3, total: 5 },
};

export const Spent: Story = {
  args: { available: 0, total: 5 },
};
