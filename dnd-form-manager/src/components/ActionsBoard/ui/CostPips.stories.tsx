import type { Meta, StoryObj } from "@storybook/react-vite";
import { CostPips } from "./CostPips";

const meta: Meta<typeof CostPips> = {
  title: "ActionsBoard/CostPips",
  component: CostPips,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof CostPips>;

export const Full: Story = { args: { remaining: 3, total: 3 } };

export const Partial: Story = { args: { remaining: 1, total: 3 } };

export const Empty: Story = { args: { remaining: 0, total: 3 } };

export const Single: Story = { args: { remaining: 1, total: 1 } };
