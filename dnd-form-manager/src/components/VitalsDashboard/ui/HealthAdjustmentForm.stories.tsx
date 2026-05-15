import type { Meta, StoryObj } from "@storybook/react-vite";
import { HealthAdjustmentForm } from "./HealthAdjustmentForm";
import { fn } from "storybook/test";

const meta: Meta<typeof HealthAdjustmentForm> = {
  title: "VitalsDashboard/HealthAdjustmentForm",
  component: HealthAdjustmentForm,
  tags: ["autodocs"],
  args: {
    onInputChange: fn(),
    onSubmit: fn(),
    onModeSelect: fn(),
    onCancel: fn(),
  },
};
export default meta;

type Story = StoryObj<typeof HealthAdjustmentForm>;

export const Idle: Story = {
  args: { activeMode: null, inputValue: "" },
};

export const DamageMode: Story = {
  args: { activeMode: "damage", inputValue: 8 },
};

export const HealMode: Story = {
  args: { activeMode: "heal", inputValue: 5 },
};

export const TempHpMode: Story = {
  args: { activeMode: "temp", inputValue: "" },
};
