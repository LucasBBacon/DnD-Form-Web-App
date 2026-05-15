import type { Meta, StoryObj } from "@storybook/react-vite";
import { PolyDie } from "./PolyDie";

const meta = {
  title: "ui/PolyDie",
  component: PolyDie,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PolyDie>;

export default meta;
type Story = StoryObj<typeof meta>;

export const D4: Story = {
  args: {
    sides: 4,
    value: 3,
    isRolling: false,
  },
};

export const D6: Story = {
  args: {
    sides: 6,
    value: 4,
    isRolling: false,
  },
};

export const D8: Story = {
  args: {
    sides: 8,
    value: 7,
    isRolling: false,
  },
};

export const D10: Story = {
  args: {
    sides: 10,
    value: 9,
    isRolling: false,
  },
};

export const D12: Story = {
  args: {
    sides: 12,
    value: 11,
    isRolling: false,
  },
};

export const D20: Story = {
  args: {
    sides: 20,
    value: 15,
    isRolling: false,
  },
};

export const D20CritSuccess: Story = {
  args: {
    sides: 20,
    value: 20,
    isRolling: false,
  },
};

export const D20CritFail: Story = {
  args: {
    sides: 20,
    value: 1,
    isRolling: false,
  },
};

export const D100: Story = {
  args: {
    sides: 100,
    value: 50,
    isRolling: false,
  },
};

export const D100_Zero: Story = {
  args: {
    sides: 100,
    value: 10,
    isRolling: false,
  },
};

export const Rolling: Story = {
  args: {
    sides: 20,
    value: 12,
    isRolling: true,
  },
};

export const RollingD4: Story = {
  args: {
    sides: 4,
    value: 2,
    isRolling: true,
  },
};
