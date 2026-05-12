import type { Meta, StoryObj } from "@storybook/react-vite";
import { TraitActionsView } from "./TraitActionsView";
import type { ActionData } from "../types/action";

const meta = {
  title: "Components/TraitActionsView",
  component: TraitActionsView,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TraitActionsView>;

export default meta;
type Story = StoryObj<typeof meta>;

const breathWeapon: ActionData = {
  id: "action_breath_weapon_cold_cone",
  name: "Cold Breath",
  activation: {
    actionType: "action",
  },
  range: {
    type: "self",
  },
  areaOfEffect: {
    shape: "cone",
    size: 15,
  },
  savingThrow: {
    ability: "con",
    dcCalculation: {
      base: 8,
      modifierStat: "con",
    },
    onSave: "half_damage",
  },
  output: {
    damage: [{ type: "cold", roll: "2d6" }],
  },
  description: "You exhale a cone of freezing breath. Each creature in that area must make a CON save, taking 2d6 cold damage on a failed save, or half as much on a successful one.",
};

const layOnHands: ActionData = {
  id: "action_lay_on_hands",
  name: "Lay On Hands",
  activation: {
    actionType: "action",
  },
  range: {
    type: "touch",
  },
  output: {
    damage: [],
  },
  description: "You can touch a creature and restore a number of hit points equal to your paladin level.",
};

const smite: ActionData = {
  id: "action_divine_smite",
  name: "Divine Smite",
  activation: {
    actionType: "bonus_action",
    condition: "As a bonus action after hitting with a melee weapon attack",
  },
  range: {
    type: "self",
  },
  attackRoll: {
    ability: "str",
  },
  output: {
    damage: [{ type: "radiant", roll: "1d8" }],
  },
  description: "Immediately after you hit a creature with a melee weapon attack, you can spend sorcery points to deal radiant damage to the target.",
};

export const Empty: Story = {
  args: {
    actions: [],
  },
};

export const SingleAction: Story = {
  args: {
    actions: [breathWeapon],
  },
};

export const MultipleActions: Story = {
  args: {
    actions: [breathWeapon, layOnHands, smite],
  },
};

export const ActionWithoutDescription: Story = {
  args: {
    actions: [
      {
        ...breathWeapon,
        description: undefined,
      },
    ],
  },
};

export const TouchRangeAction: Story = {
  args: {
    actions: [layOnHands],
  },
};

export const ActionWithTrigger: Story = {
  args: {
    actions: [smite],
  },
};
