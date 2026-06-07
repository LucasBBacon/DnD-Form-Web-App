import type { Meta, StoryObj } from "@storybook/react-vite";
import { ADD_ITEM_PRESET_FLOW_SCENARIOS } from "../AddItemModal.fixtures";
import { createPresetItemFlowArgs } from "../AddItemModal.story-adapter";
import { PresetItemFlow } from "./PresetItemFlow";
import "./AddItemModal.css";

const meta: Meta<typeof PresetItemFlow> = {
  component: PresetItemFlow,
  title: "Inventory/AddItemModal/PresetItemFlow",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: createPresetItemFlowArgs(ADD_ITEM_PRESET_FLOW_SCENARIOS.emptySelection),
};

export default meta;
type Story = StoryObj<typeof PresetItemFlow>;

export const EmptySelection: Story = {};

export const WithSelection: Story = {
  args: createPresetItemFlowArgs(ADD_ITEM_PRESET_FLOW_SCENARIOS.withSelection),
};
