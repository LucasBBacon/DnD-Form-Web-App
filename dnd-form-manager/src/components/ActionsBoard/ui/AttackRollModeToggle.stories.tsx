import type { Meta, StoryObj } from "@storybook/react-vite";
import { AttackRollModeToggle } from "./AttackRollModeToggle";
import { fn } from "storybook/test";

const meta: Meta<typeof AttackRollModeToggle> = {
  title: "ActionsBoard/AttackRollModeToggle",
  component: AttackRollModeToggle,
  tags: ["autodocs"],
  args: { onChange: fn() },
};
export default meta;

type Story = StoryObj<typeof AttackRollModeToggle>;

export const Normal: Story = {
  args: { entryId: "attack-1", mode: "normal", label: "To-Hit Mode" },
};

export const Advantage: Story = {
  args: { entryId: "attack-1", mode: "advantage", label: "To-Hit Mode" },
};

export const Disadvantage: Story = {
  args: { entryId: "attack-1", mode: "disadvantage", label: "To-Hit Mode" },
};
