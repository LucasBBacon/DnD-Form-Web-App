import type { Meta, StoryObj } from "@storybook/react-vite";
import { DeathSavesTracker } from "./DeathSavesTracker";
import { fn } from "@storybook/test";

const meta: Meta<typeof DeathSavesTracker> = {
  title: "VitalsDashboard/DeathSavesTracker",
  component: DeathSavesTracker,
  tags: ["autodocs"],
  args: { onToggle: fn() },
};
export default meta;

type Story = StoryObj<typeof DeathSavesTracker>;

export const Fresh: Story = {
  args: { success: 0, failure: 0 },
};

export const OneSuccess: Story = {
  args: { success: 1, failure: 0 },
};

export const Critical: Story = {
  args: { success: 1, failure: 2 },
};

export const Stabilized: Story = {
  args: { success: 3, failure: 1 },
};

export const Dead: Story = {
  args: { success: 0, failure: 3 },
};
