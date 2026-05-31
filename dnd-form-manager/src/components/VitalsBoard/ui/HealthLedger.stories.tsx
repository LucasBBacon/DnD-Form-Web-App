import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { HealthLedger } from "./HealthLedger";

const meta: Meta<typeof HealthLedger> = {
  title: "VitalsBoard/HealthLedger",
  component: HealthLedger,
  tags: ["autodocs"],
  args: {
    hp: {
      current: 38,
      max: 52,
    },
    tempHp: 0,
    onTakeDamage: fn(),
    onHeal: fn(),
    onSetTempHp: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof HealthLedger>;

export const Healthy: Story = {
  args: {
    hp: {
      current: 38,
      max: 52,
    },
    tempHp: 0,
  },
};

export const Bloodied: Story = {
  args: {
    hp: {
      current: 12,
      max: 52,
    },
    tempHp: 0,
  },
};

export const BloodiedWithTempWard: Story = {
  args: {
    hp: {
      current: 9,
      max: 52,
    },
    tempHp: 7,
  },
};

export const AtZero: Story = {
  args: {
    hp: {
      current: 0,
      max: 52,
    },
    tempHp: 0,
  },
};

export const FullyRecovered: Story = {
  args: {
    hp: {
      current: 52,
      max: 52,
    },
    tempHp: 0,
  },
};

export const TankBuild: Story = {
  args: {
    hp: {
      current: 121,
      max: 121,
    },
    tempHp: 18,
  },
};

export const DrawerOpened: Story = {
  args: {
    hp: {
      current: 26,
      max: 52,
    },
    tempHp: 4,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTitle("Click to adjust hit points"));
    await expect(canvas.getByPlaceholderText("Amount...")).toBeInTheDocument();
  },
};

export const Playground: Story = {};
