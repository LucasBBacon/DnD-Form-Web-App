import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { SaveLoad } from "./SaveLoad";

const meta = {
  title: "SaveLoad/SaveLoad",
  component: SaveLoad,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 220, display: "flex", alignItems: "flex-end" }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  args: {
    onSave: fn(),
    onLoadRequest: fn(),
    clearError: fn(),
    errorMessage: null,
  },
} satisfies Meta<typeof SaveLoad>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithErrorMessage: Story = {
  args: {
    errorMessage: "The selected file is not a valid character save.",
  },
};

export const Interactions: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const sealButton = canvas.getByRole("button", { name: "Save Options" });
    await userEvent.hover(sealButton);

    await userEvent.click(canvas.getByRole("button", { name: "Load Data" }));
    await expect(args.onLoadRequest).toHaveBeenCalledTimes(1);

    await userEvent.click(canvas.getByRole("button", { name: "Save Data" }));
    await expect(args.onSave).toHaveBeenCalledTimes(1);
  },
};

export const InteractionsWithError: Story = {
  args: {
    errorMessage: "Save parsing failed.",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Save Options" }));
    const clearErrorButton = canvasElement.querySelector(
      ".clear-error-btn",
    ) as HTMLButtonElement | null;
    expect(clearErrorButton).not.toBeNull();
    await userEvent.click(clearErrorButton as HTMLButtonElement);
    await expect(args.clearError).toHaveBeenCalledTimes(1);
  },
};
