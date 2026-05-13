import type { Meta, StoryObj } from "@storybook/react-vite";
import { WeaponPropertyBadges } from "./WeaponPropertyBadges";
import type { WeaponPropertyCatalogEntry } from "../../../types/item";

const meta: Meta<typeof WeaponPropertyBadges> = {
  title: "ActionsBoard/WeaponPropertyBadges",
  component: WeaponPropertyBadges,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof WeaponPropertyBadges>;

const mockProperties: WeaponPropertyCatalogEntry[] = [
  {
    id: "prop:finesse",
    name: "Finesse",
    lore: {
      shortDescription: "Can use DEX or STR modifier",
      fullText: "When making an attack with a finesse weapon, you use your choice of your Strength or Dexterity modifier for the attack and damage rolls.",
    },
  },
  {
    id: "prop:versatile",
    name: "Versatile",
    lore: {
      shortDescription: "1d8 one-handed or 1d10 two-handed",
      fullText: "This weapon can be used with one or two hands. A damage value in parentheses appears with the property—the damage when the weapon is used with two hands to make a melee attack.",
    },
  },
];

export const Empty: Story = {
  args: {
    properties: [],
  },
};

export const SingleProperty: Story = {
  args: {
    properties: [mockProperties[0]],
  },
};

export const MultipleProperties: Story = {
  args: {
    properties: mockProperties,
  },
};
