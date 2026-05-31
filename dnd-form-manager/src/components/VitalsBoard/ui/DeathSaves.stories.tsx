import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { DeathSaves } from "./DeathSaves";

const meta: Meta<typeof DeathSaves> = {
  title: "VitalsBoard/DeathSaves",
  component: DeathSaves,
  tags: ["autodocs"],
  args: {
    success: 0,
    failure: 0,
    onRecordSave: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof DeathSaves>;

export const Fresh: Story = {
  args: {
    success: 0,
    failure: 0,
  },
};

export const OneSuccess: Story = {
  args: {
    success: 1,
    failure: 0,
  },
};

export const OneFailure: Story = {
  args: {
    success: 0,
    failure: 1,
  },
};

export const TwoSuccesses: Story = {
  args: {
    success: 2,
    failure: 0,
  },
};

export const TwoFailures: Story = {
  args: {
    success: 0,
    failure: 2,
  },
};

export const CriticalCondition: Story = {
  args: {
    success: 1,
    failure: 2,
  },
};

export const MixedProgress: Story = {
  args: {
    success: 2,
    failure: 1,
  },
};

export const Stabilized: Story = {
  args: {
    success: 3,
    failure: 1,
  },
};

export const Deceased: Story = {
  args: {
    success: 1,
    failure: 3,
  },
};

export const AllFailures: Story = {
  args: {
    success: 0,
    failure: 3,
  },
};

export const SealClickInteraction: Story = {
  args: {
    success: 0,
    failure: 0,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const successSeals = canvas.getAllByRole("button");

    // Click the first success seal (first 3 buttons are successes)
    await userEvent.click(successSeals[0]);

    // Verify the callback was triggered
    await expect(args.onRecordSave).toHaveBeenCalledWith("success", 1);
  },
};

export const Playground: Story = {};
