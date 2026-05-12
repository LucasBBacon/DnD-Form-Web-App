import type { Meta, StoryObj } from "@storybook/react-vite";
import { HpDisplay } from "./HpDisplay";

const meta: Meta<typeof HpDisplay> = {
  title: "VitalsDashboard/HpDisplay",
  component: HpDisplay,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof HpDisplay>;

export const Healthy: Story = {
  args: { current: 45, max: 52, temp: 0 },
};

export const WithTempHp: Story = {
  args: { current: 45, max: 52, temp: 8 },
};

export const Bloodied: Story = {
  args: { current: 12, max: 52, temp: 0 },
};

export const AtZero: Story = {
  args: { current: 0, max: 52, temp: 0 },
};

export const AtMax: Story = {
  args: { current: 52, max: 52, temp: 0 },
};
