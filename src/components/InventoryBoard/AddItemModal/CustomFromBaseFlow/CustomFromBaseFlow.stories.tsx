import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ADD_ITEM_CUSTOM_FROM_BASE_SCENARIOS,
} from "../AddItemModal.fixtures";
import { createCustomFromBaseFlowArgs } from "../AddItemModal.story-adapter";
import { CustomFromBaseFlow } from "./CustomFromBaseFlow";
import "./AddItemModal.css";

const meta: Meta<typeof CustomFromBaseFlow> = {
  component: CustomFromBaseFlow,
  title: "Inventory/AddItemModal/CustomFromBaseFlow",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: createCustomFromBaseFlowArgs(
    ADD_ITEM_CUSTOM_FROM_BASE_SCENARIOS.noBaseSelected,
  ),
};

export default meta;
type Story = StoryObj<typeof CustomFromBaseFlow>;

export const NoBaseSelected: Story = {};

export const WeaponBaseSelected: Story = {
  args: createCustomFromBaseFlowArgs(
    ADD_ITEM_CUSTOM_FROM_BASE_SCENARIOS.weaponBaseSelected,
  ),
};

export const ArmorBaseSelected: Story = {
  args: createCustomFromBaseFlowArgs(
    ADD_ITEM_CUSTOM_FROM_BASE_SCENARIOS.armorBaseSelected,
  ),
};
