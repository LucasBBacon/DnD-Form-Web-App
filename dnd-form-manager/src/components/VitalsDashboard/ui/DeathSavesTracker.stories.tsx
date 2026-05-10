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
  args: { successes: 0, failures: 0 },
};

export const OneSuccess: Story = {
  args: { successes: 1, failures: 0 },
};

export const Critical: Story = {
  args: { successes: 1, failures: 2 },
};

export const Stabilized: Story = {
  args: { successes: 3, failures: 1 },
};

export const Dead: Story = {
  args: { successes: 0, failures: 3 },
};
