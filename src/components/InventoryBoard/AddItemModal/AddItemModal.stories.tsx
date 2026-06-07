import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ADD_ITEM_MODAL_SCENARIOS,
} from "./AddItemModal.fixtures";
import { createAddItemModalArgs } from "./AddItemModal.story-adapter";
import { AddItemModal } from "./AddItemModal";
import "./AddItemModal.css";

const meta: Meta<typeof AddItemModal> = {
  component: AddItemModal,
  title: "Inventory/AddItemModal/AddItemModal",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: createAddItemModalArgs(ADD_ITEM_MODAL_SCENARIOS.chooseFlow),
};

export default meta;
type Story = StoryObj<typeof AddItemModal>;

export const ChooseFlow: Story = {};

export const PresetFlowDetails: Story = {
  args: createAddItemModalArgs(ADD_ITEM_MODAL_SCENARIOS.presetFlowDetails),
};

export const CustomFromBaseFlowDetails: Story = {
  args: createAddItemModalArgs(
    ADD_ITEM_MODAL_SCENARIOS.customFromBaseFlowDetails,
  ),
};

export const CustomGenericFlowDetails: Story = {
  args: createAddItemModalArgs(ADD_ITEM_MODAL_SCENARIOS.customGenericFlowDetails),
};
