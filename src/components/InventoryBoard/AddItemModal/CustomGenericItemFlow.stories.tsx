import type { Meta, StoryObj } from "@storybook/react-vite";
import { ADD_ITEM_GENERIC_FLOW_SCENARIOS } from "./AddItemModal.fixtures";
import { createCustomGenericItemFlowArgs } from "./AddItemModal.story-adapter";
import { CustomGenericItemFlow } from "./CustomGenericItemFlow";
import "./AddItemModal.css";

const meta: Meta<typeof CustomGenericItemFlow> = {
  component: CustomGenericItemFlow,
  title: "Inventory/AddItemModal/CustomGenericItemFlow",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: createCustomGenericItemFlowArgs(
    ADD_ITEM_GENERIC_FLOW_SCENARIOS.emptyForm,
  ),
};

export default meta;
type Story = StoryObj<typeof CustomGenericItemFlow>;

export const EmptyForm: Story = {};

export const ReadyToSubmit: Story = {
  args: createCustomGenericItemFlowArgs(
    ADD_ITEM_GENERIC_FLOW_SCENARIOS.readyToSubmit,
  ),
};
