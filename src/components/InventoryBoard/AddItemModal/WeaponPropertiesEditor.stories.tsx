import type { Meta, StoryObj } from "@storybook/react-vite";
import { ADD_ITEM_WEAPON_EDITOR_SCENARIOS } from "./AddItemModal.fixtures";
import { createWeaponPropertiesEditorArgs } from "./AddItemModal.story-adapter";
import { WeaponPropertiesEditor } from "./WeaponPropertiesEditor";
import "./AddItemModal.css";

const meta: Meta<typeof WeaponPropertiesEditor> = {
  component: WeaponPropertiesEditor,
  title: "Inventory/AddItemModal/WeaponPropertiesEditor",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: createWeaponPropertiesEditorArgs(
    ADD_ITEM_WEAPON_EDITOR_SCENARIOS.meleeBaseline,
  ),
};

export default meta;
type Story = StoryObj<typeof WeaponPropertiesEditor>;

export const MeleeBaseline: Story = {};

export const ThrownVariant: Story = {
  args: createWeaponPropertiesEditorArgs(
    ADD_ITEM_WEAPON_EDITOR_SCENARIOS.thrownVariant,
  ),
};
