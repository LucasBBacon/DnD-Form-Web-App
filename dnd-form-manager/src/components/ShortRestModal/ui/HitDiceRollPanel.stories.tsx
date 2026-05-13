import type { Meta, StoryObj } from "@storybook/react-vite";
import { HitDiceRollPanel } from "./HitDiceRollPanel";
import { fn } from "storybook/test";

const meta: Meta<typeof HitDiceRollPanel> = {
  title: "ShortRestModal/HitDiceRollPanel",
  component: HitDiceRollPanel,
  tags: ["autodocs"],
  args: { onRoll: fn() },
};
export default meta;

type Story = StoryObj<typeof HitDiceRollPanel>;

export const Available: Story = {
  args: {
    availableDice: 3,
    hitDie: 8,
    conMod: 2,
    isFullyHealed: false,
  },
};

export const NoDiceRemaining: Story = {
  args: {
    availableDice: 0,
    hitDie: 8,
    conMod: 2,
    isFullyHealed: false,
  },
};

export const FullyHealed: Story = {
  args: {
    availableDice: 3,
    hitDie: 8,
    conMod: 2,
    isFullyHealed: true,
  },
};
