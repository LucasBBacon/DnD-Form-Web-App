import type { Meta, StoryObj } from "@storybook/react-vite";
import { createAddItemFlowSelectorCallbacks } from "./AddItemModal.story-adapter";
import { AddItemFlowSelector } from "./AddItemFlowSelector";
import "./AddItemModal.css";

const meta: Meta<typeof AddItemFlowSelector> = {
  component: AddItemFlowSelector,
  title: "Inventory/AddItemModal/AddItemFlowSelector",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: createAddItemFlowSelectorCallbacks(),
};

export default meta;
type Story = StoryObj<typeof AddItemFlowSelector>;

export const Default: Story = {};
