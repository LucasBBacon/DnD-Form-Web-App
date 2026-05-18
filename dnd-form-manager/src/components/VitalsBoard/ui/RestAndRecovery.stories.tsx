import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { RestAndRecovery } from "./RestAndRecovery";

const meta: Meta<typeof RestAndRecovery> = {
  title: "VitalsBoard/RestAndRecovery",
  component: RestAndRecovery,
  tags: ["autodocs"],
  args: {
    hitDicePools: [
      {
        sides: 10,
        total: 5,
        expended: 2,
      },
    ],
    onSpendHitDie: fn(),
    onShortRest: fn(),
    onLongRest: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof RestAndRecovery>;

export const SinglePoolStandard: Story = {
  args: {
    hitDicePools: [
      {
        sides: 10,
        total: 5,
        expended: 2,
      },
    ],
  },
};

export const WizardD6Pool: Story = {
  args: {
    hitDicePools: [
      {
        sides: 6,
        total: 6,
        expended: 3,
      },
    ],
  },
};

export const BarbarianD12Pool: Story = {
  args: {
    hitDicePools: [
      {
        sides: 12,
        total: 9,
        expended: 4,
      },
    ],
  },
};

export const MulticlassD6D8D10: Story = {
  args: {
    hitDicePools: [
      {
        sides: 6,
        total: 3,
        expended: 1,
      },
      {
        sides: 8,
        total: 4,
        expended: 2,
      },
      {
        sides: 10,
        total: 5,
        expended: 4,
      },
    ],
  },
};

export const MulticlassD8D10D12: Story = {
  args: {
    hitDicePools: [
      {
        sides: 8,
        total: 3,
        expended: 0,
      },
      {
        sides: 10,
        total: 4,
        expended: 1,
      },
      {
        sides: 12,
        total: 2,
        expended: 1,
      },
    ],
  },
};

export const MostlyDepleted: Story = {
  args: {
    hitDicePools: [
      {
        sides: 8,
        total: 4,
        expended: 4,
      },
      {
        sides: 10,
        total: 6,
        expended: 5,
      },
    ],
  },
};

export const NoHitDiceAvailable: Story = {
  args: {
    hitDicePools: [
      {
        sides: 8,
        total: 4,
        expended: 4,
      },
      {
        sides: 10,
        total: 3,
        expended: 3,
      },
    ],
  },
};

export const IgnoresEmptyPools: Story = {
  args: {
    hitDicePools: [
      {
        sides: 6,
        total: 0,
        expended: 0,
      },
      {
        sides: 8,
        total: 4,
        expended: 2,
      },
      {
        sides: 12,
        total: 0,
        expended: 0,
      },
    ],
  },
};

export const CampOpened: Story = {
  args: {
    hitDicePools: [
      {
        sides: 8,
        total: 4,
        expended: 1,
      },
      {
        sides: 10,
        total: 6,
        expended: 2,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /rest & recovery/i }));
    await expect(canvas.getByText("Spend Hit Dice")).toBeInTheDocument();
  },
};

export const Playground: Story = {};
