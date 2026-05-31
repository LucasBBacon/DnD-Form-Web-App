import type { Meta, StoryObj } from "@storybook/react-vite";
import { TwoHandedWarningDialog } from "./TwoHandedWarningDialog";
import { fn } from "storybook/test";

const meta: Meta<typeof TwoHandedWarningDialog> = {
  title: "InventoryBoard/TwoHandedWarningDialog",
  component: TwoHandedWarningDialog,
  tags: ["autodocs"],
  args: {
    onCancel: fn(),
    onConfirm: fn(),
  },
};
export default meta;

type Story = StoryObj<typeof TwoHandedWarningDialog>;

export const ShieldConflictOnly: Story = {
  args: {
    weaponName: "Greatsword",
    conflictingShieldName: "Wooden Shield",
    conflictingWeaponNames: [],
  },
};

export const WeaponConflictsOnly: Story = {
  args: {
    weaponName: "Greatsword",
    conflictingShieldName: null,
    conflictingWeaponNames: ["Longsword", "Dagger"],
  },
};

export const MixedConflicts: Story = {
  args: {
    weaponName: "Greatsword",
    conflictingShieldName: "Wooden Shield",
    conflictingWeaponNames: ["Longsword", "Handaxe"],
  },
};

export const SingleWeaponConflict: Story = {
  args: {
    weaponName: "Pike",
    conflictingShieldName: null,
    conflictingWeaponNames: ["Spear"],
  },
};
