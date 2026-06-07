import type { Meta, StoryObj } from "@storybook/react-vite";
import { ADD_ITEM_ARMOR_EDITOR_SCENARIOS } from "../AddItemModal.fixtures";
import { createArmorPropertiesEditorArgs } from "../AddItemModal.story-adapter";
import { ArmorPropertiesEditor } from "./ArmorPropertiesEditor";
import "./AddItemModal.css";

const meta: Meta<typeof ArmorPropertiesEditor> = {
  component: ArmorPropertiesEditor,
  title: "Inventory/AddItemModal/ArmorPropertiesEditor",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: createArmorPropertiesEditorArgs(
    ADD_ITEM_ARMOR_EDITOR_SCENARIOS.heavyArmor,
  ),
};

export default meta;
type Story = StoryObj<typeof ArmorPropertiesEditor>;

export const HeavyArmor: Story = {};

export const NoStrengthReq: Story = {
  args: createArmorPropertiesEditorArgs(
    ADD_ITEM_ARMOR_EDITOR_SCENARIOS.noStrengthReq,
  ),
};
