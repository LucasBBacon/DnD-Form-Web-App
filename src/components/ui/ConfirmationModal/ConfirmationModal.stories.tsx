import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ConfirmationModal } from "./ConfirmationModal";

const meta = {
  title: "ui/ConfirmationModal",
  component: ConfirmationModal,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    isOpen: true,
    title: "Overwrite Existing Save?",
    message:
      "Loading this file will replace your current character state. This cannot be undone.",
    onConfirm: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof ConfirmationModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const Closed: Story = {
  args: {
    isOpen: false,
  },
};

export const CustomCopy: Story = {
  args: {
    title: "Discard Unsaved Changes?",
    message:
      "You have unsaved edits on this character. Are you sure you want to discard them?",
  },
};

export const CancelInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
  },
};

export const ConfirmInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "Overwrite Save" }),
    );
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  },
};

export const EscapeCancels: Story = {
  play: async ({ args }) => {
    await userEvent.keyboard("{Escape}");
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
  },
};
