import type { Meta, StoryObj } from "@storybook/react-vite";
import { DiceRoller } from "./DiceRoller";

const meta: Meta<typeof DiceRoller> = {
  title: "ui/DiceRoller",
  component: DiceRoller,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    sides: {
      control: { type: "number", min: 2, max: 100, step: 1 },
    },
    count: {
      control: { type: "number", min: 1, max: 10, step: 1 },
    },
    size: {
      control: "radio",
      options: ["small", "medium", "large"],
    },
    hideTotal: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof DiceRoller>;

export const DefaultD20: Story = {
  args: {
    sides: 20,
    count: 1,
    size: "large",
    hideTotal: false,
    disabled: false,
  },
};

export const D6: Story = {
  args: {
    sides: 6,
    count: 1,
    size: "medium",
  },
};

export const MultipleDice: Story = {
  args: {
    sides: 8,
    count: 4,
    size: "large",
  },
};

export const Disabled: Story = {
  args: {
    sides: 20,
    count: 2,
    disabled: true,
  },
};

export const HideTotal: Story = {
  args: {
    sides: 10,
    count: 3,
    hideTotal: true,
  },
};

export const Playground: Story = {
  args: {
    sides: 12,
    count: 2,
    size: "medium",
  },
};